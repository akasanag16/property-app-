
import { supabase } from "@/integrations/supabase/client";
import { type Database } from "@/integrations/supabase/types";

export type UserRole = Database["public"]["Enums"]["user_role"];

export async function signUp({
  email,
  password,
  role,
  firstName,
  lastName,
}: {
  email: string;
  password: string;
  role: UserRole;
  firstName: string;
  lastName: string;
}) {
  // First check if the user already exists
  const { data: existingUser } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', email)
    .maybeSingle();

  if (existingUser) {
    throw new Error("An account with this email already exists. Please sign in instead.");
  }

  // Set the current origin for the email redirect
  const redirectTo = `${window.location.origin}/auth/email-confirm`;
  console.log("Email redirect set to:", redirectTo);

  const { data, error } = await supabase.auth.signUp({
    email: email.trim(),
    password,
    options: {
      data: {
        role,
        first_name: firstName,
        last_name: lastName,
      },
      emailRedirectTo: redirectTo,
    },
  });
  
  if (error) {
    console.error("Signup error:", error);
    throw error;
  }
  
  console.log("Signup response:", data);
  return data;
}

export async function signIn({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  console.log("Attempting to sign in with:", { email });
  
  try {
    // Use the persistSession option to make sure the session is stored properly
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    
    if (error) {
      console.error("Sign in error:", error);
      throw error;
    }
    
    console.log("Sign in successful:", data);
    return data;
  } catch (error) {
    console.error("Unexpected error during sign in:", error);
    throw error;
  }
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error("Sign out error:", error);
    throw error;
  }
}
