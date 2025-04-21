
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
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        role,
        first_name: firstName,
        last_name: lastName,
      },
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
