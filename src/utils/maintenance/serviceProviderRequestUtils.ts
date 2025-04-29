
import { supabase } from "@/integrations/supabase/client";
import { MaintenanceRequest } from "@/types/maintenance";

export async function getServiceProviderRequests(providerId: string): Promise<MaintenanceRequest[]> {
  try {
    console.log("Fetching maintenance requests for provider:", providerId);
    
    // Get requests assigned to this service provider
    const { data, error: requestError } = await supabase
      .from("maintenance_requests")
      .select("id, title, description, status, created_at, property_id, tenant_id")
      .eq("assigned_service_provider_id", providerId)
      .order("created_at", { ascending: false });
      
    if (requestError) {
      console.error("Error fetching service provider requests:", requestError);
      throw requestError;
    }
    
    const formattedRequests: MaintenanceRequest[] = [];
    
    for (const request of data || []) {
      // Get property name
      const { data: propertyData, error: propertyError } = await supabase
        .from("properties")
        .select("name")
        .eq("id", request.property_id)
        .maybeSingle();
        
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
          name: propertyData?.name || "Unknown property",
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
