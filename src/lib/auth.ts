
import { supabase } from "@/integrations/supabase/client";
import { type Database } from "@/integrations/supabase/types";
import { validateEmail, addSecurityDelay, checkRateLimit } from "@/utils/securityUtils";

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
  // Input validation
  if (!validateEmail(email)) {
    throw new Error("Please enter a valid email address.");
  }

  if (!password || password.length < 6) {
    throw new Error("Password must be at least 6 characters long.");
  }

  if (!firstName?.trim() || !lastName?.trim()) {
    throw new Error("First name and last name are required.");
  }

  // Rate limiting
  if (!checkRateLimit(`signup_${email}`, 3, 300000)) {
    throw new Error("Too many signup attempts. Please try again in a few minutes.");
  }

  // First check if the user already exists
  const { data: existingUser } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', email.trim().toLowerCase())
    .maybeSingle();

  if (existingUser) {
    await addSecurityDelay(); // Prevent timing attacks
    throw new Error("An account with this email already exists. Please sign in instead.");
  }

  // Set the current origin for the email redirect
  const redirectTo = `${window.location.origin}/auth/email-confirm`;
  if (process.env.NODE_ENV === 'development') {
    console.log("Email redirect set to:", redirectTo);
  }

  const { data, error } = await supabase.auth.signUp({
    email: email.trim().toLowerCase(),
    password,
    options: {
      data: {
        role,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
      },
      emailRedirectTo: redirectTo,
    },
  });
  
  if (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error("Signup error:", error);
    }
    throw error;
  }
  
  if (process.env.NODE_ENV === 'development') {
    console.log("Signup response:", data);
  }
  return data;
}

export async function signIn({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  // Input validation
  if (!validateEmail(email)) {
    await addSecurityDelay(); // Prevent timing attacks
    throw new Error("Invalid email or password.");
  }

  if (!password) {
    await addSecurityDelay(); // Prevent timing attacks
    throw new Error("Invalid email or password.");
  }

  // Rate limiting
  if (!checkRateLimit(`signin_${email}`, 5, 900000)) {
    throw new Error("Too many login attempts. Please try again in 15 minutes.");
  }

  if (process.env.NODE_ENV === 'development') {
    console.log("Attempting to sign in with:", { email });
  }
  
  try {
    // Use the persistSession option to make sure the session is stored properly
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });
    
    if (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Sign in error:", error);
      }
      await addSecurityDelay(); // Prevent timing attacks
      throw new Error("Invalid email or password.");
    }
    
    if (process.env.NODE_ENV === 'development') {
      console.log("Sign in successful:", data);
    }
    return data;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error("Unexpected error during sign in:", error);
    }
    await addSecurityDelay(); // Prevent timing attacks
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
