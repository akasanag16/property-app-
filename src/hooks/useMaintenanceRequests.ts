
import { supabase } from "@/integrations/supabase/client";
import { useTenantRequests } from "./maintenanceRequests/useTenantRequests";
import { useServiceProviderRequests } from "./maintenanceRequests/useServiceProviderRequests";
import { useOwnerRequests } from "./maintenanceRequests/useOwnerRequests";
import { toast } from "sonner";

export function useMaintenanceRequests(
  userRole: "owner" | "tenant" | "service_provider",
  refreshKey = 0
) {
  const { data: userData } = supabase.auth.getUser();
  const userId = userData.user?.id;

  const tenantHook = useTenantRequests(userRole === "tenant" ? userId : undefined, refreshKey);
  const serviceProviderHook = useServiceProviderRequests(
    userRole === "service_provider" ? userId : undefined,
    refreshKey
  );
  const ownerHook = useOwnerRequests(userRole === "owner" ? userId : undefined, refreshKey);

  const activeHook = 
    userRole === "tenant" ? tenantHook :
    userRole === "service_provider" ? serviceProviderHook :
    ownerHook;

  return {
    requests: activeHook.requests,
    loading: activeHook.loading,
    error: activeHook.error,
    refetch: activeHook.refetch
  };
}

