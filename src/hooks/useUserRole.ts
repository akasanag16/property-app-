
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
        const roleFromMetadata = user.user_metadata.role as UserRole;
        setUserRole(roleFromMetadata);
        // Store in session storage for future use
        try {
          sessionStorage.setItem('userRole', roleFromMetadata);
        } catch (e) {
          console.warn("Failed to store role in session storage:", e);
        }
        return;
      }
      
      // Check session storage first for cached role
      try {
        const storedRole = sessionStorage.getItem('userRole');
        if (storedRole && ['owner', 'tenant', 'service_provider'].includes(storedRole)) {
          console.log("Using role from session storage:", storedRole);
          setUserRole(storedRole as UserRole);
          return;
        }
      } catch (e) {
        console.warn("Failed to read from session storage:", e);
      }
      
      // Try to get from profiles table using a simple, direct query
      const { data, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .maybeSingle();

      if (error) {
        console.error("Error fetching profile:", error);
        
        // If it's a permission error, the user might not have a profile yet
        // Let's try to create one with a default role
        if (error.code === 'PGRST116' || error.message.includes('permission')) {
          console.log("Profile might not exist, trying to create with default role");
          
          // Try to insert a profile with default role 'owner'
          const { data: insertData, error: insertError } = await supabase
            .from("profiles")
            .insert({
              id: userId,
              role: 'owner' as UserRole,
              first_name: user?.user_metadata?.first_name || null,
              last_name: user?.user_metadata?.last_name || null,
              email: user?.email || null
            })
            .select("role")
            .single();
            
          if (!insertError && insertData?.role) {
            console.log("Created profile with default role:", insertData.role);
            setUserRole(insertData.role as UserRole);
            try {
              sessionStorage.setItem('userRole', insertData.role);
            } catch (e) {
              console.warn("Failed to store role in session storage:", e);
            }
            return;
          } else {
            console.error("Failed to create profile:", insertError);
          }
        }
        
        // Fall back to 'owner' role if we can't determine the role
        console.log("Falling back to default role: owner");
        setUserRole('owner');
        try {
          sessionStorage.setItem('userRole', 'owner');
        } catch (e) {
          console.warn("Failed to store fallback role:", e);
        }
        return;
      }

      if (data?.role) {
        console.log("User role fetched from profiles:", data.role);
        setUserRole(data.role as UserRole);
        // Store in session storage as a fallback
        try {
          sessionStorage.setItem('userRole', data.role);
        } catch (e) {
          console.warn("Failed to store role in session storage:", e);
        }
      } else {
        console.warn("No role found for user, using default:", userId);
        // Fall back to 'owner' role if profile exists but has no role
        setUserRole('owner');
        try {
          sessionStorage.setItem('userRole', 'owner');
        } catch (e) {
          console.warn("Failed to store default role:", e);
        }
      }
    } catch (error) {
      console.error("Unexpected error fetching user role:", error);
      // Fall back to 'owner' role in case of any unexpected error
      setUserRole('owner');
      try {
        sessionStorage.setItem('userRole', 'owner');
      } catch (e) {
        console.warn("Failed to store fallback role:", e);
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
        console.warn("Failed to clear role from session storage:", e);
      }
    }
  }, [user?.id]);

  return { userRole, fetchUserRole, fetching };
};
