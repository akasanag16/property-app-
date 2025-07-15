
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
      
      // First check if the role is already in the user metadata
      if (user?.user_metadata?.role) {
        setUserRole(user.user_metadata.role as UserRole);
        return;
      }
      
      // If not in metadata, try to get from profiles table using a simple, direct query
      const { data, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .maybeSingle(); // Use maybeSingle instead of single to handle case where profile might not exist yet

      if (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error("Error fetching profile:", error);
        }
        // Check for session storage fallback
        const storedRole = sessionStorage.getItem('userRole');
        if (storedRole) {
          setUserRole(storedRole as UserRole);
          return;
        }
        
        // Fall back to 'tenant' role if we can't determine the role
        setUserRole('tenant');
        return;
      }

      if (data?.role) {
        setUserRole(data.role as UserRole);
        // Store in session storage as a fallback
        try {
          sessionStorage.setItem('userRole', data.role);
        } catch (e) {
          if (process.env.NODE_ENV === 'development') {
            console.warn("Failed to store role in session storage:", e);
          }
        }
      } else {
        // Check for session storage fallback
        const storedRole = sessionStorage.getItem('userRole');
        if (storedRole) {
          setUserRole(storedRole as UserRole);
          return;
        }
        
        // Fall back to 'tenant' role if we can't determine the role
        setUserRole('tenant');
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Error fetching user role:", error);
      }
      // Check for session storage fallback
      const storedRole = sessionStorage.getItem('userRole');
      if (storedRole) {
        setUserRole(storedRole as UserRole);
      } else {
        // Fall back to 'tenant' role if we can't determine the role
        setUserRole('tenant');
      }
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchUserRole(user.id);
    } else {
      setUserRole(null);
      // Clear role from session storage when user is not available
      try {
        sessionStorage.removeItem('userRole');
      } catch (e) {
        if (process.env.NODE_ENV === 'development') {
          console.warn("Failed to clear role from session storage:", e);
        }
      }
    }
  }, [user?.id]);

  return { userRole, fetchUserRole, fetching };
};
