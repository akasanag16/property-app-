
import { supabase } from "@/integrations/supabase/client";
import { MaintenanceRequest } from "@/types/maintenance";

export async function getServiceProviderRequests(providerId: string): Promise<MaintenanceRequest[]> {
  try {
    console.log("Fetching maintenance requests for provider:", providerId);
    
    if (!providerId) {
      console.warn("No provider ID provided");
      return [];
    }
    
    // Get all maintenance requests assigned to this service provider directly
    const { data: requestsData, error: requestsError } = await supabase
      .from("maintenance_requests")
      .select("*")
      .eq("assigned_service_provider_id", providerId)
      .order("created_at", { ascending: false });
    
    if (requestsError) {
      console.error("Error fetching maintenance requests:", requestsError);
      throw requestsError;
    }
    
    if (!requestsData || requestsData.length === 0) {
      console.log("No maintenance requests found for service provider");
      return [];
    }
    
    // Extract unique property IDs and tenant IDs to fetch in bulk
    const propertyIds = requestsData.map(req => req.property_id).filter(Boolean);
    const tenantIds = requestsData.map(req => req.tenant_id).filter(Boolean);
    const uniquePropertyIds = [...new Set(propertyIds)];
    const uniqueTenantIds = [...new Set(tenantIds)];
    
    // Get property information directly without using RPC functions
    let propertiesMap: Record<string, { id: string; name: string }> = {};
    
    if (uniquePropertyIds.length > 0) {
      // Direct query to properties table
      const { data: propertiesData, error: propertiesError } = await supabase
        .from('properties')
        .select('id, name')
        .in('id', uniquePropertyIds);
      
      if (propertiesError) {
        console.error("Error fetching properties:", propertiesError);
      } else if (propertiesData) {
        // Create a map of property IDs to names
        for (const prop of propertiesData) {
          propertiesMap[prop.id] = { id: prop.id, name: prop.name || "Unknown property" };
        }
      }
    }
    
    // Get tenant information directly
    let tenantsMap: Record<string, { first_name: string | null; last_name: string | null }> = {};
    
    if (uniqueTenantIds.length > 0) {
      const { data: tenantsData, error: tenantsError } = await supabase
        .from("profiles")
        .select("id, first_name, last_name")
        .in("id", uniqueTenantIds);
        
      if (tenantsError) {
        console.error("Error fetching tenant profiles:", tenantsError);
      } else if (tenantsData) {
        tenantsMap = tenantsData.reduce((map: any, tenant) => {
          map[tenant.id] = { 
            first_name: tenant.first_name, 
            last_name: tenant.last_name 
          };
          return map;
        }, {});
      }
    }
    
    // Format the requests
    const formattedRequests: MaintenanceRequest[] = requestsData.map(request => {
      // Get tenant information
      let tenant = null;
      if (request.tenant_id && tenantsMap[request.tenant_id]) {
        tenant = tenantsMap[request.tenant_id];
      }
      
      return {
        id: request.id,
        title: request.title,
        description: request.description,
        status: request.status,
        created_at: request.created_at,
        property: propertiesMap[request.property_id] || {
          id: request.property_id,
          name: "Unknown property"
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
