
import { supabase } from "@/integrations/supabase/client";
import { MaintenanceRequest } from "@/types/maintenance";

export async function getTenantRequests(tenantId: string): Promise<MaintenanceRequest[]> {
  try {
    console.log("Fetching maintenance requests for tenant:", tenantId);
    
    if (!tenantId) {
      console.warn("No tenant ID provided");
      return [];
    }
    
    // Directly fetch maintenance requests for the tenant without joining
    const { data: requests, error: requestError } = await supabase
      .from("maintenance_requests")
      .select(`
        id, 
        title, 
        description, 
        status, 
        created_at, 
        property_id,
        tenant_id
      `)
      .eq("tenant_id", tenantId)
      .order("created_at", { ascending: false });
      
    if (requestError) {
      console.error("Error fetching tenant requests:", requestError);
      throw requestError;
    }

    if (!requests || requests.length === 0) {
      console.log("No maintenance requests found for tenant");
      return [];
    }

    console.log("Fetched raw tenant requests:", requests);
    
    // Extract unique property IDs to fetch in a single query
    const propertyIds = requests.map(req => req.property_id).filter(Boolean);
    const uniquePropertyIds = [...new Set(propertyIds)];
    
    // If we have property IDs, fetch their names in a single query
    let propertyMap: Record<string, string> = {};
    
    if (uniquePropertyIds.length > 0) {
      const { data: propertiesData, error: propertiesError } = await supabase
        .from("properties")
        .select("id, name")
        .in("id", uniquePropertyIds);
        
      if (propertiesError) {
        console.error("Error fetching property names:", propertiesError);
      } else if (propertiesData) {
        // Create a map of property IDs to names
        propertyMap = propertiesData.reduce((map: Record<string, string>, property) => {
          map[property.id] = property.name;
          return map;
        }, {});
      }
    }
    
    // Format the requests with the property names
    const formattedRequests: MaintenanceRequest[] = requests.map(request => ({
      id: request.id,
      title: request.title,
      description: request.description,
      status: request.status,
      created_at: request.created_at,
      property: {
        name: propertyMap[request.property_id] || "Unknown property",
        id: request.property_id
      },
      tenant: null, // We don't need tenant info for tenant's own requests
      assigned_service_provider: null // We'll fetch this separately if needed
    }));
    
    console.log("Formatted tenant requests:", formattedRequests);
    return formattedRequests;
  } catch (error) {
    console.error("Error in getTenantRequests:", error);
    throw error;
  }
}
