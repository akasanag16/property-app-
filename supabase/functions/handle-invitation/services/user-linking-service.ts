
import { getSupabaseClient } from "../utils.ts";
import { validateInvitation, markInvitationAsUsed } from "./invitation-service.ts";
import { createPropertyLink } from "./property-link-service.ts";

export async function linkUserToProperty(
  token: string, 
  email: string, 
  propertyId: string, 
  role: string, 
  userId: string
) {
  const supabaseClient = getSupabaseClient();
  const linkTableName = role === 'tenant' ? 'tenant_property_link' : 'service_provider_property_link';
  
  // Validate the invitation
  const { invitation, tableName } = await validateInvitation(token, email, role);
  
  // Verify user exists and email matches
  const { data: user, error: userError } = await supabaseClient.auth.admin.getUserById(userId);
  
  if (userError) {
    console.error('User not found:', userError);
    throw new Error('User account not found');
  }

  if (!user || !user.user) {
    console.error('User object is missing');
    throw new Error('Invalid user account');
  }

  // Check if emails match (normalized comparison)
  const userEmail = user.user.email?.toLowerCase().trim() || '';
  if (userEmail !== email) {
    console.error('Email mismatch:', { userEmail, invitationEmail: email });
    throw new Error('Email address does not match the invitation');
  }

  console.log(`Found existing user with ID: ${userId}`);

  // Check if user is already linked to this property
  const existingLinkField = role === 'tenant' ? 'tenant_id' : 'service_provider_id';
  const { data: existingLink, error: linkCheckError } = await supabaseClient
    .from(linkTableName)
    .select('*')
    .eq(existingLinkField, userId)
    .eq('property_id', propertyId)
    .maybeSingle();

  if (linkCheckError) {
    console.error('Error checking existing link:', linkCheckError);
    throw new Error('Failed to check existing property link');
  }

  if (!existingLink) {
    // Create property link only if it doesn't exist
    await createPropertyLink(propertyId, userId, role);
  }

  // Update profile to ensure email is normalized
  const { error: profileUpdateError } = await supabaseClient
    .from('profiles')
    .upsert({ 
      id: userId,
      email: email
    }, { 
      onConflict: 'id' 
    });
    
  if (profileUpdateError) {
    console.error('Error updating profile email:', profileUpdateError);
    // Continue anyway as this is not critical
  }

  // Mark invitation as used
  await markInvitationAsUsed(tableName, token, email, userId);
  
  console.log('User successfully linked to property');
  return { userExists: true, userLinked: true };
}
