
import { getSupabaseClient } from "../utils.ts";

export async function checkExistingUser(email: string) {
  const supabaseClient = getSupabaseClient();
  
  // Check if user already exists by email in profiles table
  const { data: existingProfile, error: profileCheckError } = await supabaseClient
    .from('profiles')
    .select('id, email')
    .eq('email', email)
    .maybeSingle();
  
  if (profileCheckError) {
    console.error('Error checking existing profile:', profileCheckError);
    throw new Error('Failed to check existing user profile');
  }
  
  // If user already exists, return appropriate message
  if (existingProfile) {
    console.log(`User with email ${email} already exists - should use linking flow instead`);
    throw new Error("This email has already been registered. Please use the existing account option.");
  }
}

export async function createAuthUser(email: string, password: string, firstName: string, lastName: string, role: string) {
  const supabaseClient = getSupabaseClient();
  
  console.log("Creating new user account with email:", email);

  try {
    // Create new user account with normalized email and trimmed names
    const { data: authUser, error: userError } = await supabaseClient.auth.admin.createUser({
      email: email,
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
      
      // Handle specific Supabase auth errors
      if (userError.message?.includes('User already registered')) {
        throw new Error('An account with this email already exists. Please use the existing account option.');
      }
      
      throw new Error(`Failed to create user account: ${userError.message}`);
    }

    if (!authUser || !authUser.user) {
      console.error('No user returned from auth creation');
      throw new Error("Failed to create user account - no user returned");
    }

    const userId = authUser.user.id;
    console.log(`New user created with ID: ${userId}`);
    
    return userId;
  } catch (transactionError: any) {
    console.error('Transaction error during user creation:', transactionError);
    throw new Error(`Failed to complete account creation: ${transactionError.message}`);
  }
}

export async function createUserProfile(userId: string, email: string, firstName: string, lastName: string, role: string) {
  const supabaseClient = getSupabaseClient();
  
  // Ensure profile is created with normalized email and trimmed names
  const { error: profileError } = await supabaseClient
    .from('profiles')
    .upsert({ 
      id: userId,
      email: email,
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
}
