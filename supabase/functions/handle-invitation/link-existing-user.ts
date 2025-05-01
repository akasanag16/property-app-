
import { getSupabaseClient, corsHeaders, createSuccessResponse, createErrorResponse } from "./utils.ts";

export async function linkExistingUser(requestData: any) {
  const { token, email, propertyId, role, userId } = requestData;
  
  if (!token || !email || !propertyId || !role) {
    const missingParams = [];
    if (!token) missingParams.push('token');
    if (!email) missingParams.push('email');
    if (!propertyId) missingParams.push('propertyId');
    if (!role) missingParams.push('role');
    
    console.error("Missing parameters:", missingParams);
    throw new Error(`Missing required parameters: ${missingParams.join(', ')}`);
  }
  
  console.log(`Linking existing user with email ${email} to property ${propertyId} as ${role}`);
  
  try {
    const supabaseClient = getSupabaseClient();
    
    // Get user ID from the auth session if not provided
    let userIdToUse = userId;
    
    if (!userIdToUse) {
      // Find the user by email
      const { data: userByEmail, error: userByEmailError } = await supabaseClient
        .from('profiles')
        .select('id')
        .eq('email', email)
        .maybeSingle();
      
      if (userByEmailError || !userByEmail) {
        console.error('Error finding user by email:', userByEmailError || "User not found");
        
        // If user not found by email, try querying auth.users directly through auth.admin
        const { data, error } = await supabaseClient.auth.admin.listUsers();
        const foundUser = data?.users.find(user => user.email === email);
        
        if (error || !foundUser) {
          console.error('Error finding user through admin API:', error || "User not found");
          return createErrorResponse("Unable to find user account with this email", 400);
        }
        
        userIdToUse = foundUser.id;
        
        // Make sure profile exists and has the email set
        const { error: profileCheckError } = await supabaseClient
          .from('profiles')
          .select('id')
          .eq('id', userIdToUse)
          .maybeSingle();
          
        if (profileCheckError) {
          // If profile doesn't exist, create it
          const { error: profileCreateError } = await supabaseClient
            .from('profiles')
            .insert({
              id: userIdToUse,
              email: email,
              role: role
            });
            
          if (profileCreateError) {
            console.error('Error creating profile:', profileCreateError);
            // Continue anyway as we might have a race condition
          }
        } else {
          // Update the profile with the email
          const { error: profileUpdateError } = await supabaseClient
            .from('profiles')
            .update({ email: email })
            .eq('id', userIdToUse);
            
          if (profileUpdateError) {
            console.error('Error updating profile email:', profileUpdateError);
            // Continue anyway as this is not critical
          }
        }
      } else {
        userIdToUse = userByEmail.id;
      }
    }
    
    console.log(`Found existing user with ID: ${userIdToUse}`);
    
    // Begin transaction
    const tableName = role === 'tenant' ? 'tenant_invitations' : 'service_provider_invitations';
    const linkTableName = role === 'tenant' ? 'tenant_property_link' : 'service_provider_property_link';
    
    // 1. Mark invitation as used
    const { error: inviteError } = await supabaseClient
      .from(tableName)
      .update({ 
        is_used: true,
        status: 'accepted',
        accepted_at: new Date().toISOString(),
        accepted_by_user_id: userIdToUse
      })
      .eq('link_token', token)
      .eq('email', email);

    if (inviteError) {
      console.error('Error updating invitation:', inviteError);
      throw inviteError;
    }
    
    // 2. Create property link if it doesn't exist
    const linkData = {
      property_id: propertyId,
    };
    
    if (role === 'tenant') {
      linkData.tenant_id = userIdToUse;
    } else {
      linkData.service_provider_id = userIdToUse;
    }
    
    // First check if link already exists
    const { data: existingLink, error: existingLinkError } = await supabaseClient
      .from(linkTableName)
      .select('id')
      .eq('property_id', propertyId)
      .eq(role === 'tenant' ? 'tenant_id' : 'service_provider_id', userIdToUse)
      .maybeSingle();
      
    if (existingLinkError) {
      console.error('Error checking existing property link:', existingLinkError);
      throw existingLinkError;
    }
    
    // Only create the link if it doesn't already exist
    if (!existingLink) {
      const { error: linkError } = await supabaseClient
        .from(linkTableName)
        .insert(linkData);

      if (linkError) {
        console.error('Error creating property link:', linkError);
        throw linkError;
      }
      console.log('User successfully linked to property');
    } else {
      console.log('User was already linked to this property');
    }

    return createSuccessResponse({ 
      success: true,
      userLinked: true, 
      userId: userIdToUse,
      role
    });
  } catch (error: any) {
    console.error('Error linking existing user:', error);
    return createErrorResponse(error);
  }
}
