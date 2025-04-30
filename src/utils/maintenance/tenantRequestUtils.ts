
import { supabase } from "@/integrations/supabase/client";
import { MaintenanceRequest } from "@/types/maintenance";

export async function getTenantRequests(tenantId: string): Promise<MaintenanceRequest[]> {
  try {
    console.log("Fetching maintenance requests for tenant:", tenantId);
    
    if (!tenantId) {
      console.warn("No tenant ID provided");
      return [];
    }
    
    // Get all maintenance requests for this tenant
    const { data: requestsData, error: requestsError } = await supabase
      .from("maintenance_requests")
      .select("*")
      .eq("tenant_id", tenantId)
      .order("created_at", { ascending: false });
    
    if (requestsError) {
      console.error("Error fetching maintenance requests:", requestsError);
      throw requestsError;
    }
    
    if (!requestsData || requestsData.length === 0) {
      console.log("No maintenance requests found for tenant");
      return [];
    }
    
    // Extract unique property IDs to fetch in a single query
    const propertyIds = requestsData.map(req => req.property_id).filter(Boolean);
    const uniquePropertyIds = [...new Set(propertyIds)];
    
    // Get property information (in a separate query to avoid recursion)
    let propertiesMap: Record<string, { id: string; name: string }> = {};
    
    if (uniquePropertyIds.length > 0) {
      const { data: propertiesData, error: propertiesError } = await supabase
        .rpc('get_property_name_by_ids', { property_ids: uniquePropertyIds });
      
      if (propertiesError) {
        console.error("Error fetching properties:", propertiesError);
      } else if (propertiesData) {
        // Create a map of property IDs to names
        for (const prop of propertiesData) {
          propertiesMap[prop.id] = { id: prop.id, name: prop.name || "Unknown property" };
        }
      }
    }
    
    // Format the requests
    const formattedRequests: MaintenanceRequest[] = requestsData.map(request => ({
      id: request.id,
      title: request.title,
      description: request.description,
      status: request.status,
      created_at: request.created_at,
      property: propertiesMap[request.property_id] || {
        id: request.property_id,
        name: "Unknown property"
      },
      tenant: null, // We don't need tenant info for tenant's own requests
      assigned_service_provider: null
    }));
    
    console.log("Formatted tenant requests:", formattedRequests.length);
    return formattedRequests;
  } catch (error) {
    console.error("Error in getTenantRequests:", error);
    throw error;
  }
}
