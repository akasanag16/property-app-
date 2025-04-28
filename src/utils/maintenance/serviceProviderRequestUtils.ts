
import { supabase } from "@/integrations/supabase/client";
import { MaintenanceRequest } from "@/types/maintenance";

export async function getServiceProviderRequests(providerId: string): Promise<MaintenanceRequest[]> {
  try {
    console.log("Fetching maintenance requests for provider:", providerId);
    
    // Get request IDs using secure function
    const { data: requestIds, error: idsError } = await supabase
      .rpc("get_service_provider_maintenance_requests", { provider_id: providerId });
      
    if (idsError) {
      console.error("Error fetching service provider request IDs:", idsError);
      throw idsError;
    }
    
    if (!requestIds || requestIds.length === 0) {
      return [];
    }
    
    // Fetch full request data using the IDs
    const { data, error: requestError } = await supabase
      .from("maintenance_requests")
      .select("id, title, description, status, created_at, property_id, tenant_id")
      .in("id", requestIds)
      .order("created_at", { ascending: false });
      
    if (requestError) {
      console.error("Error fetching service provider requests:", requestError);
      throw requestError;
    }
    
    const formattedRequests: MaintenanceRequest[] = [];
    
    for (const request of data || []) {
      // Get property name using the secure function
      const { data: propertyName, error: propertyError } = await supabase
        .rpc("get_property_name", { property_id_param: request.property_id });
        
      if (propertyError) {
        console.error("Error fetching property name:", propertyError);
      }
      
      // Get tenant information if available
      let tenant = { first_name: null, last_name: null };
      if (request.tenant_id) {
        const { data: tenantData } = await supabase
          .from("profiles")
          .select("first_name, last_name")
          .eq("id", request.tenant_id)
          .maybeSingle();
          
        if (tenantData) {
          tenant = tenantData;
        }
      }
      
      formattedRequests.push({
        id: request.id,
        title: request.title,
        description: request.description,
        status: request.status,
        created_at: request.created_at,
        property: {
          name: propertyName || "Unknown property",
          id: request.property_id
        },
        tenant,
        assigned_service_provider: null
      });
    }
    
    return formattedRequests;
  } catch (error) {
    console.error("Error in getServiceProviderRequests:", error);
    throw error;
  }
}
