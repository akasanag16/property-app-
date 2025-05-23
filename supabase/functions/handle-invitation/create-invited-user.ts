
import { getSupabaseClient, corsHeaders, createErrorResponse, createSuccessResponse } from "./utils.ts";

export async function createInvitedUser(requestData: any) {
  const { token, email, propertyId, role, firstName, lastName, password } = requestData;
  
  if (!token || !email || !propertyId || !role) {
    const missingParams = [];
    if (!token) missingParams.push('token');
    if (!email) missingParams.push('email');
    if (!propertyId) missingParams.push('propertyId');
    if (!role) missingParams.push('role');
    
    console.error("Missing parameters:", missingParams);
    throw new Error(`Missing required parameters: ${missingParams.join(', ')}`);
  }

  console.log(`Processing invitation for: ${email} as ${role}`);
  console.log(`Property ID: ${propertyId}`);
  
  const supabaseClient = getSupabaseClient();
  
  // Normalize email to lowercase for consistency
  const normalizedEmail = email.toLowerCase().trim();

  // Check if user already exists by email in profiles table
  const { data: existingProfile, error: profileCheckError } = await supabaseClient
    .from('profiles')
    .select('id, email')
    .eq('email', normalizedEmail)
    .maybeSingle();
  
  if (profileCheckError) {
    console.error('Error checking existing profile:', profileCheckError);
    throw new Error('Failed to check existing user profile');
  }
  
  // If user already exists, return appropriate message
  if (existingProfile) {
    console.log(`User with email ${normalizedEmail} already exists - should use linking flow instead`);
    return createErrorResponse("This email has already been registered. Please use the existing account option.");
  }
  
  // Validate invitation token and get details
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

    if (!firstName || !lastName || !password) {
      throw new Error("Missing required parameters for creating a new user");
    }

    // Create new user account with normalized email
    const { data: authUser, error: userError } = await supabaseClient.auth.admin.createUser({
      email: normalizedEmail,
      password,
      user_metadata: {
        first_name: firstName,
        last_name: lastName,
        role,
        email_verified: true
      },
      email_confirm: true // Skip email confirmation
    });

    if (userError) {
      console.error('Error creating user:', userError);
      throw new Error(`Failed to create user account: ${userError.message}`);
    }

    if (!authUser || !authUser.user) {
      throw new Error("Failed to create user account - no user returned");
    }

    const userId = authUser.user.id;
    console.log(`New user created with ID: ${userId}`);
    
    // Ensure profile is created with normalized email
    const { error: profileError } = await supabaseClient
      .from('profiles')
      .upsert({ 
        id: userId,
        email: normalizedEmail,
        first_name: firstName,
        last_name: lastName,
        role: role
      }, { 
        onConflict: 'id' 
      });
      
    if (profileError) {
      console.error('Error creating/updating profile:', profileError);
      // Continue anyway as this might be handled by trigger
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
      
    console.log('User successfully created and linked to property');

    return createSuccessResponse({ 
      success: true, 
      userExists: false,
      userLinked: true,
      message: 'Account created successfully'
    });
  } catch (error: any) {
    console.error('Transaction error:', error);
    return createErrorResponse(error.message || 'Failed to create user account');
  }
}
