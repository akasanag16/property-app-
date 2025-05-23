
import { getSupabaseClient, corsHeaders, createErrorResponse, createSuccessResponse } from "./utils.ts";

export async function linkExistingUser(requestData: any) {
  const { token, email, propertyId, role, userId } = requestData;
  
  if (!token || !email || !propertyId || !role || !userId) {
    const missingParams = [];
    if (!token) missingParams.push('token');
    if (!email) missingParams.push('email');
    if (!propertyId) missingParams.push('propertyId');
    if (!role) missingParams.push('role');
    if (!userId) missingParams.push('userId');
    
    console.error("Missing parameters:", missingParams);
    throw new Error(`Missing required parameters: ${missingParams.join(', ')}`);
  }

  // Normalize email to lowercase for consistency
  const normalizedEmail = email.toLowerCase().trim();
  
  console.log(`Linking existing user with email ${normalizedEmail} to property ${propertyId} as ${role}`);
  
  const supabaseClient = getSupabaseClient();
  const tableName = role === 'tenant' ? 'tenant_invitations' : 'service_provider_invitations';
  const linkTableName = role === 'tenant' ? 'tenant_property_link' : 'service_provider_property_link';
  
  try {
    // Verify the invitation exists and is valid
    const { data: invitation, error: invitationError } = await supabaseClient
      .from(tableName)
      .select('*')
      .eq('link_token', token)
      .eq('email', normalizedEmail)
      .eq('is_used', false)
      .gt('expires_at', new Date().toISOString())
      .maybeSingle();

    if (invitationError || !invitation) {
      console.error('Invalid or expired invitation:', invitationError);
      throw new Error('Invalid or expired invitation');
    }

    // Verify user exists and email matches
    const { data: user, error: userError } = await supabaseClient.auth.admin.getUserById(userId);
    
    if (userError || !user) {
      console.error('User not found:', userError);
      throw new Error('User account not found');
    }

    // Check if emails match (normalized comparison)
    if (user.user.email?.toLowerCase().trim() !== normalizedEmail) {
      console.error('Email mismatch:', { userEmail: user.user.email, invitationEmail: normalizedEmail });
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

    if (existingLink) {
      console.log('User is already linked to this property');
      // Still mark invitation as used and return success
    } else {
      // Create property link
      const linkData = {
        property_id: propertyId,
      };
      
      if (role === 'tenant') {
        linkData.tenant_id = userId;
      } else {
        linkData.service_provider_id = userId;
      }
        
      const { error: linkError } = await supabaseClient
        .from(linkTableName)
        .insert(linkData);

      if (linkError) {
        console.error('Error creating property link:', linkError);
        throw new Error('Failed to link user to property');
      }
    }

    // Update profile to ensure email is normalized
    const { error: profileUpdateError } = await supabaseClient
      .from('profiles')
      .upsert({ 
        id: userId,
        email: normalizedEmail
      }, { 
        onConflict: 'id' 
      });
      
    if (profileUpdateError) {
      console.error('Error updating profile email:', profileUpdateError);
      // Continue anyway as this is not critical
    }

    // Mark invitation as used
    const { error: inviteError } = await supabaseClient
      .from(tableName)
      .update({ 
        is_used: true,
        status: 'accepted',
        accepted_at: new Date().toISOString(),
        accepted_by_user_id: userId
      })
      .eq('link_token', token)
      .eq('email', normalizedEmail);

    if (inviteError) {
      console.error('Error updating invitation:', inviteError);
      throw new Error('Failed to mark invitation as used');
    }
      
    console.log('User successfully linked to property');

    return createSuccessResponse({ 
      success: true, 
      userExists: true,
      userLinked: true,
      message: 'Successfully linked to property'
    });
  } catch (error: any) {
    console.error('Error linking existing user:', error);
    return createErrorResponse(error.message || 'Failed to link user to property');
  }
}
