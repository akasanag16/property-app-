
import { supabase } from "@/integrations/supabase/client";
import { MaintenanceRequest } from "@/types/maintenance";

export async function getTenantRequests(tenantId: string): Promise<MaintenanceRequest[]> {
  try {
    console.log("Fetching maintenance requests for tenant:", tenantId);
    
    // Directly fetch maintenance requests for the tenant
    const { data: requests, error: requestError } = await supabase
      .from("maintenance_requests")
      .select(`
        id, 
        title, 
        description, 
        status, 
        created_at, 
        property_id
      `)
      .eq("tenant_id", tenantId)
      .order("created_at", { ascending: false });
      
    if (requestError) {
      console.error("Error fetching tenant requests:", requestError);
      throw requestError;
    }

    console.log("Fetched raw tenant requests:", requests);
    
    // Prepare for property name lookups
    const propertyIds = requests?.map(req => req.property_id) || [];
    const uniquePropertyIds = [...new Set(propertyIds)];
    
    // Get all property names in a single query
    const { data: propertiesData, error: propertiesError } = await supabase
      .from("properties")
      .select("id, name")
      .in("id", uniquePropertyIds);
      
    if (propertiesError) {
      console.error("Error fetching property names:", propertiesError);
    }
    
    // Create a map of property IDs to names
    const propertyMap = new Map();
    propertiesData?.forEach(property => {
      propertyMap.set(property.id, property.name);
    });
    
    // Format the requests with the property names
    const formattedRequests: MaintenanceRequest[] = (requests || []).map(request => ({
      id: request.id,
      title: request.title,
      description: request.description,
      status: request.status,
      created_at: request.created_at,
      property: {
        name: propertyMap.get(request.property_id) || "Unknown property",
        id: request.property_id
      },
      tenant: null,
      assigned_service_provider: null
    }));
    
    console.log("Formatted tenant requests:", formattedRequests);
    return formattedRequests;
  } catch (error) {
    console.error("Error in getTenantRequests:", error);
    throw error;
  }
}
