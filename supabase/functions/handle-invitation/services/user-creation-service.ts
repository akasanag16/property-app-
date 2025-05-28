
import { getSupabaseClient } from "../utils.ts";

export async function checkExistingUser(email: string) {
  const supabase = getSupabaseClient();
  
  console.log(`Checking if user exists: ${email}`);
  
  const { data: existingUser, error } = await supabase.auth.admin.getUserByEmail(email);
  
  if (error && !error.message.includes('User not found')) {
    console.error("Error checking user existence:", error);
    throw new Error("Failed to verify user account status");
  }
  
  if (existingUser?.user) {
    console.log(`User with email ${email} already exists - should use linking flow instead`);
    throw new Error("This email has already been registered. Please use the existing account option.");
  }
  
  console.log(`User ${email} does not exist, can proceed with creation`);
}

export async function createAuthUser(email: string, password: string, firstName: string, lastName: string, role: string) {
  const supabase = getSupabaseClient();
  
  console.log(`Creating auth user for: ${email}`);
  
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    user_metadata: {
      first_name: firstName,
      last_name: lastName,
      role: role
    },
    email_confirm: true // Auto-confirm email for invited users
  });

  if (error) {
    console.error("Error creating user:", error);
    throw new Error(`Failed to create user account: ${error.message}`);
  }

  if (!data.user) {
    throw new Error("Failed to create user account");
  }

  console.log(`Auth user created successfully: ${data.user.id}`);
  return data.user.id;
}

export async function createUserProfile(userId: string, email: string, firstName: string, lastName: string, role: string) {
  const supabase = getSupabaseClient();
  
  console.log(`Creating user profile for: ${userId}`);
  
  const { error } = await supabase.from('profiles').insert({
    id: userId,
    email: email,
    first_name: firstName,
    last_name: lastName,
    role: role
  });

  if (error) {
    console.error("Error creating user profile:", error);
    throw new Error(`Failed to create user profile: ${error.message}`);
  }

  console.log(`User profile created successfully for: ${userId}`);
}
