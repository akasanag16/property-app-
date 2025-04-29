
import { supabase } from "@/integrations/supabase/client";
import { MaintenanceRequest } from "@/types/maintenance";

export async function getTenantRequests(tenantId: string): Promise<MaintenanceRequest[]> {
  try {
    console.log("Fetching maintenance requests for tenant:", tenantId);
    
    // Directly fetch maintenance requests for the tenant
    const { data, error: requestError } = await supabase
      .from("maintenance_requests")
      .select("id, title, description, status, created_at, property_id")
      .eq("tenant_id", tenantId)
      .order("created_at", { ascending: false });
      
    if (requestError) {
      console.error("Error fetching tenant requests:", requestError);
      throw requestError;
    }
    
    const formattedRequests: MaintenanceRequest[] = [];
    
    for (const request of data || []) {
      // Get property name using the secure function to avoid recursion
      const { data: propertyData, error: propertyError } = await supabase
        .from("properties")
        .select("name")
        .eq("id", request.property_id)
        .maybeSingle();
        
      if (propertyError) {
        console.error("Error fetching property name:", propertyError);
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
        tenant: null,
        assigned_service_provider: null
      });
    }
    
    return formattedRequests;
  } catch (error) {
    console.error("Error in getTenantRequests:", error);
    throw error;
  }
}
