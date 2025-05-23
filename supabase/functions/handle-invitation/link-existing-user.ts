
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
    return createErrorResponse(`Missing required parameters: ${missingParams.join(', ')}`, 400);
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

    if (invitationError) {
      console.error('Error checking invitation:', invitationError);
      return createErrorResponse('Error validating invitation', 500);
    }
    
    if (!invitation) {
      console.error('Invalid or expired invitation');
      return createErrorResponse('Invalid or expired invitation. Please request a new invitation.', 400);
    }

    // Verify user exists and email matches
    const { data: user, error: userError } = await supabaseClient.auth.admin.getUserById(userId);
    
    if (userError) {
      console.error('User not found:', userError);
      return createErrorResponse('User account not found', 404);
    }

    if (!user || !user.user) {
      console.error('User object is missing');
      return createErrorResponse('Invalid user account', 400);
    }

    // Check if emails match (normalized comparison)
    const userEmail = user.user.email?.toLowerCase().trim() || '';
    if (userEmail !== normalizedEmail) {
      console.error('Email mismatch:', { userEmail, invitationEmail: normalizedEmail });
      return createErrorResponse('Email address does not match the invitation', 400);
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
      return createErrorResponse('Failed to check existing property link', 500);
    }

    if (existingLink) {
      console.log('User is already linked to this property');
      // Still mark invitation as used and return success
    } else {
      // Create property link
      const linkData: any = {
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
        return createErrorResponse('Failed to link user to property', 500);
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
      return createErrorResponse('Failed to mark invitation as used', 500);
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
    return createErrorResponse(error.message || 'Failed to link user to property', 500);
  }
}
