
import { supabase } from "@/integrations/supabase/client";
import { MaintenanceRequest } from "@/types/maintenance";

export async function getOwnerRequests(ownerId: string): Promise<MaintenanceRequest[]> {
  try {
    console.log("Fetching maintenance requests for owner:", ownerId);
    
    if (!ownerId) {
      console.warn("No owner ID provided");
      return [];
    }
    
    // Use our new security definer function to avoid infinite recursion
    const { data: requestsData, error: requestsError } = await supabase
      .rpc('safe_get_owner_maintenance_requests', { owner_id_param: ownerId });
      
    if (requestsError) {
      console.error("Error fetching owner maintenance requests:", requestsError);
      throw requestsError;
    }
    
    if (!requestsData || requestsData.length === 0) {
      console.log("No maintenance requests found for owner");
      return [];
    }
    
    // Format the requests
    const formattedRequests: MaintenanceRequest[] = requestsData.map(request => {
      // Get tenant information
      const tenant = request.tenant_id ? {
        first_name: request.tenant_first_name,
        last_name: request.tenant_last_name
      } : null;
      
      // Get service provider information
      const serviceProvider = request.assigned_service_provider_id ? {
        first_name: request.provider_first_name,
        last_name: request.provider_last_name
      } : null;
      
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
        tenant,
        assigned_service_provider: serviceProvider
      };
    });
    
    console.log("Formatted owner requests:", formattedRequests.length);
    return formattedRequests;
  } catch (error) {
    console.error("Error in getOwnerRequests:", error);
    throw error;
  }
}
