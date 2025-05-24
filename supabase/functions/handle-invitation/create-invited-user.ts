
import { getSupabaseClient, corsHeaders, createErrorResponse, createSuccessResponse } from "./utils.ts";

export async function createInvitedUser(requestData: any) {
  const { token, email, propertyId, role, firstName, lastName, password } = requestData;
  
  console.log("Create invited user request data:", { 
    token: token ? "present" : "missing",
    email,
    propertyId,
    role,
    firstName,
    lastName,
    password: password ? "present" : "missing"
  });
  
  if (!token || !email || !propertyId || !role) {
    const missingParams = [];
    if (!token) missingParams.push('token');
    if (!email) missingParams.push('email');
    if (!propertyId) missingParams.push('propertyId');
    if (!role) missingParams.push('role');
    
    console.error("Missing required parameters:", missingParams);
    return createErrorResponse(`Missing required parameters: ${missingParams.join(', ')}`, 400);
  }

  if (!firstName || !lastName || !password) {
    console.error("Missing user creation parameters:", { firstName: !!firstName, lastName: !!lastName, password: !!password });
    return createErrorResponse("First name, last name, and password are required for creating a new user", 400);
  }

  // Validate names don't contain email patterns
  const emailPattern = /\S+@\S+\.\S+/;
  if (emailPattern.test(firstName) || emailPattern.test(lastName)) {
    console.error("Invalid name fields - contains email pattern:", { firstName, lastName });
    return createErrorResponse("First name and last name cannot contain email addresses", 400);
  }

  // Normalize and validate email
  const normalizedEmail = email.toLowerCase().trim();
  if (!emailPattern.test(normalizedEmail)) {
    console.error("Invalid email format:", normalizedEmail);
    return createErrorResponse("Invalid email format", 400);
  }

  console.log(`Processing invitation for: ${normalizedEmail} as ${role}`);
  console.log(`Property ID: ${propertyId}`);
  
  const supabaseClient = getSupabaseClient();

  try {
    // Check if user already exists by email in profiles table
    const { data: existingProfile, error: profileCheckError } = await supabaseClient
      .from('profiles')
      .select('id, email')
      .eq('email', normalizedEmail)
      .maybeSingle();
    
    if (profileCheckError) {
      console.error('Error checking existing profile:', profileCheckError);
      return createErrorResponse('Failed to check existing user profile', 500);
    }
    
    // If user already exists, return appropriate message
    if (existingProfile) {
      console.log(`User with email ${normalizedEmail} already exists - should use linking flow instead`);
      return createErrorResponse("This email has already been registered. Please use the existing account option.", 400);
    }
    
    // Validate invitation token and get details
    const tableName = role === 'tenant' ? 'tenant_invitations' : 'service_provider_invitations';
    const linkTableName = role === 'tenant' ? 'tenant_property_link' : 'service_provider_property_link';
    
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
      return createErrorResponse('Failed to validate invitation', 500);
    }

    if (!invitation) {
      console.error('Invalid or expired invitation');
      return createErrorResponse('Invalid or expired invitation. Please request a new invitation.', 400);
    }

    console.log("Creating new user account with email:", normalizedEmail);

    // Validate password strength
    if (password.length < 6) {
      console.error('Password too short');
      return createErrorResponse('Password must be at least 6 characters long', 400);
    }

    try {
      // Create new user account with normalized email
      const { data: authUser, error: userError } = await supabaseClient.auth.admin.createUser({
        email: normalizedEmail,
        password,
        user_metadata: {
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          role,
          email_verified: true
        },
        email_confirm: true // Skip email confirmation
      });

      if (userError) {
        console.error('Error creating user:', userError);
        
        // Handle specific Supabase auth errors
        if (userError.message?.includes('User already registered')) {
          return createErrorResponse('An account with this email already exists. Please use the existing account option.', 400);
        }
        
        return createErrorResponse(`Failed to create user account: ${userError.message}`, 400);
      }

      if (!authUser || !authUser.user) {
        console.error('No user returned from auth creation');
        return createErrorResponse("Failed to create user account - no user returned", 500);
      }

      const userId = authUser.user.id;
      console.log(`New user created with ID: ${userId}`);
      
      // Ensure profile is created with normalized email
      const { error: profileError } = await supabaseClient
        .from('profiles')
        .upsert({ 
          id: userId,
          email: normalizedEmail,
          first_name: firstName.trim(),
          last_name: lastName.trim(),
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
        return createErrorResponse('Failed to mark invitation as used', 500);
      }

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
        
      console.log('User successfully created and linked to property');

      return createSuccessResponse({ 
        success: true, 
        userExists: false,
        userLinked: true,
        userId: userId,
        message: 'Account created successfully'
      });
    } catch (transactionError: any) {
      console.error('Transaction error during user creation:', transactionError);
      return createErrorResponse(`Failed to complete account creation: ${transactionError.message}`, 500);
    }
  } catch (error: any) {
    console.error('Unexpected error in createInvitedUser:', error);
    return createErrorResponse(`An unexpected error occurred: ${error.message}`, 500);
  }
}
