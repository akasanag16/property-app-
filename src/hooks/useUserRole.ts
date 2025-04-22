
import { useState, useEffect } from 'react';
import { User } from "@supabase/supabase-js";
import { UserRole } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";

export const useUserRole = (user: User | null) => {
  const [userRole, setUserRole] = useState<UserRole | null>(null);

  const fetchUserRole = async (userId: string) => {
    try {
      console.log("Fetching user role for:", userId);
      
      if (user?.user_metadata?.role) {
        console.log("Using role from user metadata:", user.user_metadata.role);
        setUserRole(user.user_metadata.role as UserRole);
        return;
      }
      
      const { data, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .maybeSingle();

      if (error) {
        console.error("Error fetching profile:", error);
        return;
      }

      if (data) {
        console.log("User role fetched:", data.role);
        setUserRole(data.role as UserRole);
      } else {
        console.warn("No profile found for user:", userId);
      }
    } catch (error) {
      console.error("Error fetching user role:", error);
    }
  };

  useEffect(() => {
    if (user?.id) {
      setTimeout(() => {
        fetchUserRole(user.id);
      }, 0);
    } else {
      setUserRole(null);
    }
  }, [user?.id]);

  return { userRole, fetchUserRole };
};
