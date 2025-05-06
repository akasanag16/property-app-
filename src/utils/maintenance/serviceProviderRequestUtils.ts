
import { supabase } from "@/integrations/supabase/client";
import { MaintenanceRequest } from "@/types/maintenance";

export async function getServiceProviderRequests(providerId: string): Promise<MaintenanceRequest[]> {
  try {
    console.log("Fetching maintenance requests for provider:", providerId);
    
    if (!providerId) {
      console.warn("No provider ID provided");
      return [];
    }
    
    // Use our new security definer function to avoid infinite recursion
    const { data: requestsData, error: requestsError } = await supabase
      .rpc('safe_get_service_provider_maintenance_requests', { provider_id_param: providerId });
    
    if (requestsError) {
      console.error("Error fetching maintenance requests:", requestsError);
      throw requestsError;
    }
    
    if (!requestsData || requestsData.length === 0) {
      console.log("No maintenance requests found for service provider");
      return [];
    }
    
    // Format the requests
    const formattedRequests: MaintenanceRequest[] = requestsData.map(request => {
      // Get tenant information
      const tenant = request.tenant_id ? {
        first_name: request.tenant_first_name,
        last_name: request.tenant_last_name
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
        assigned_service_provider: null // Service provider doesn't need their own info
      };
    });
    
    console.log("Formatted service provider requests:", formattedRequests.length);
    return formattedRequests;
  } catch (error) {
    console.error("Error in getServiceProviderRequests:", error);
    throw error;
  }
}
