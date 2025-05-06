
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useTenantRequests } from "./maintenanceRequests/useTenantRequests";
import { useServiceProviderRequests } from "./maintenanceRequests/useServiceProviderRequests";
import { useOwnerRequests } from "./maintenanceRequests/useOwnerRequests";

export function useMaintenanceRequests(
  userRole: "owner" | "tenant" | "service_provider",
  refreshKey = 0
) {
  const [userId, setUserId] = useState<string | undefined>(undefined);
  const [error, setError] = useState<Error | null>(null);
  
  // Fetch the current user ID on mount
  useEffect(() => {
    async function fetchUserId() {
      try {
        setError(null);
        const { data, error } = await supabase.auth.getUser();
        if (error) {
          console.error("Error getting user:", error);
          setError(new Error("Failed to get current user"));
          return;
        }
        
        if (!data.user) {
          console.warn("No user found");
          setError(new Error("No authenticated user"));
          return;
        }
        
        console.log("Current user ID:", data.user.id);
        setUserId(data.user.id);
      } catch (err) {
        console.error("Unexpected error in fetchUserId:", err);
        setError(err instanceof Error ? err : new Error("Unknown error fetching user"));
      }
    }
    
    fetchUserId();
  }, [refreshKey]);

  // Use the appropriate hook based on user role
  const tenantHook = useTenantRequests(userRole === "tenant" ? userId : undefined, refreshKey);
  const serviceProviderHook = useServiceProviderRequests(
    userRole === "service_provider" ? userId : undefined,
    refreshKey
  );
  const ownerHook = useOwnerRequests(userRole === "owner" ? userId : undefined, refreshKey);

  // Select the appropriate hook based on user role
  const activeHook = 
    userRole === "tenant" ? tenantHook :
    userRole === "service_provider" ? serviceProviderHook :
    ownerHook;

  // Combine errors - first check the userId fetch error, then the specific role hook error
  const combinedError = error || activeHook.error;

  return {
    requests: activeHook.requests,
    loading: activeHook.loading || !userId,
    error: combinedError,
    refetch: activeHook.refetch
  };
}
