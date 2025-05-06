
import { supabase } from "@/integrations/supabase/client";
import { MaintenanceRequest } from "@/types/maintenance";

export async function getTenantRequests(tenantId: string): Promise<MaintenanceRequest[]> {
  try {
    console.log("Fetching maintenance requests for tenant:", tenantId);
    
    if (!tenantId) {
      console.warn("No tenant ID provided");
      return [];
    }
    
    // Use our new security definer function to avoid infinite recursion
    const { data: requestsData, error: requestsError } = await supabase
      .rpc('safe_get_tenant_maintenance_requests', { tenant_id_param: tenantId });
    
    if (requestsError) {
      console.error("Error fetching maintenance requests:", requestsError);
      throw requestsError;
    }
    
    if (!requestsData || requestsData.length === 0) {
      console.log("No maintenance requests found for tenant");
      return [];
    }
    
    // Format the requests
    const formattedRequests: MaintenanceRequest[] = requestsData.map(request => {
      return {
        id: request.id,
        title: request.title || "Untitled Request",
        description: request.description || "",
        status: request.status as "pending" | "accepted" | "completed",
        created_at: request.created_at,
        property: {
          id: request.property_id,
          name: request.property_name || "Unknown property"
        },
        tenant: null, // We don't need tenant info for tenant's own requests
        assigned_service_provider: null
      };
    });
    
    console.log("Formatted tenant requests:", formattedRequests.length);
    return formattedRequests;
  } catch (error) {
    console.error("Error in getTenantRequests:", error);
    throw error;
  }
}
