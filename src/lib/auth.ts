
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

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        role,
        first_name: firstName,
        last_name: lastName,
      },
      // Restore email confirmation redirect
      emailRedirectTo: `${window.location.origin}/auth/confirm`,
    },
  });
  
  if (error) throw error;
  return data;
}

export async function signIn({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  // Clear any existing sessions before signing in to prevent conflicts
  try {
    await supabase.auth.signOut();
  } catch (error) {
    console.log("Error clearing existing session:", error);
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}
