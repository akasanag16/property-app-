
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

  // Check if user already exists
  const { data: existingUsers, error: existingUserError } = await supabaseClient
    .from('profiles')
    .select('id')
    .eq('id', email);
  
  if (existingUserError) {
    console.error('Error checking existing user:', existingUserError);
    throw existingUserError;
  }
  
  // If user already exists, return appropriate message
  if (existingUsers && existingUsers.length > 0) {
    console.log(`User with email ${email} already exists - should use linking flow instead`);
    return createErrorResponse("This email has already been registered. Please use the existing account option.");
  }
  
  // Begin transaction
  const tableName = role === 'tenant' ? 'tenant_invitations' : 'service_provider_invitations';
  const linkTableName = role === 'tenant' ? 'tenant_property_link' : 'service_provider_property_link';
  
  try {
    // If user doesn't exist, create new user account
    if (!firstName || !lastName || !password) {
      throw new Error("Missing required parameters for creating a new user");
    }

    const { data: authUser, error: userError } = await supabaseClient.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          role,
          email_verified: true
        }
      }
    });

    if (userError) {
      console.error('Error creating user:', userError);
      throw userError;
    }

    if (!authUser || !authUser.user) {
      throw new Error("Failed to create user account");
    }

    const userId = authUser.user.id;
    console.log(`New user created with ID: ${userId}`);
    
    // Make sure profile has the email set
    const { error: profileUpdateError } = await supabaseClient
      .from('profiles')
      .update({ email: email })
      .eq('id', userId);
      
    if (profileUpdateError) {
      console.error('Error updating profile with email:', profileUpdateError);
      // Continue anyway as this is not critical
    }

    // 2. Mark invitation as used
    const { error: inviteError } = await supabaseClient
      .from(tableName)
      .update({ 
        is_used: true,
        status: 'accepted',
        accepted_at: new Date().toISOString(),
        accepted_by_user_id: userId
      })
      .eq('link_token', token)
      .eq('email', email);

    if (inviteError) {
      console.error('Error updating invitation:', inviteError);
      throw inviteError;
    }

    // 3. Create property link
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
      throw linkError;
    }
      
    console.log('User successfully linked to property');

    return createSuccessResponse({ 
      success: true, 
      userExists: false,
      userLinked: true
    });
  } catch (error: any) {
    console.error('Transaction error:', error);
    
    return createErrorResponse(error);
  }
}
