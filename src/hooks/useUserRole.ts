
import { useState, useEffect } from 'react';
import { User } from "@supabase/supabase-js";
import { UserRole } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";

export const useUserRole = (user: User | null) => {
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [fetching, setFetching] = useState(false);

  const fetchUserRole = async (userId: string) => {
    try {
      setFetching(true);
      console.log("Fetching user role for:", userId);
      
      // First check if the role is already in the user metadata
      if (user?.user_metadata?.role) {
        console.log("Using role from user metadata:", user.user_metadata.role);
        setUserRole(user.user_metadata.role as UserRole);
        return;
      }
      
      // If not in metadata, try to get from profiles table using a simple, direct query
      const { data, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
        return;
      }

      if (data) {
        console.log("User role fetched from profiles:", data.role);
        setUserRole(data.role as UserRole);
      } else {
        console.warn("No profile found for user:", userId);
      }
    } catch (error) {
      console.error("Error fetching user role:", error);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchUserRole(user.id);
    } else {
      setUserRole(null);
    }
  }, [user?.id]);

  return { userRole, fetchUserRole, fetching };
};
