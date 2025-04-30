
import { supabase } from "@/integrations/supabase/client";
import { MaintenanceRequest } from "@/types/maintenance";

export async function getOwnerRequests(ownerId: string): Promise<MaintenanceRequest[]> {
  try {
    console.log("Fetching maintenance requests for owner:", ownerId);
    
    if (!ownerId) {
      console.warn("No owner ID provided");
      return [];
    }
    
    // 1. First, get properties owned by this owner
    const { data: propertyIds, error: propertiesError } = await supabase
      .rpc('get_owner_properties', { owner_id_param: ownerId });
      
    if (propertiesError) {
      console.error("Error fetching owner properties:", propertiesError);
      throw propertiesError;
    }
    
    if (!propertyIds || propertyIds.length === 0) {
      console.log("No properties found for owner");
      return [];
    }

    // 2. Get maintenance requests for these properties
    const { data: requestsData, error: requestsError } = await supabase
      .from("maintenance_requests")
      .select("*")
      .in("property_id", propertyIds)
      .order("created_at", { ascending: false });
      
    if (requestsError) {
      console.error("Error fetching maintenance requests:", requestsError);
      throw requestsError;
    }
    
    if (!requestsData || requestsData.length === 0) {
      console.log("No maintenance requests found for properties");
      return [];
    }
    
    // 3. Get property names
    let propertiesMap: Record<string, { id: string; name: string }> = {};
    
    const { data: propertiesData, error: propertyNamesError } = await supabase
      .rpc('get_property_name_by_ids', { property_ids: propertyIds });
    
    if (propertyNamesError) {
      console.error("Error fetching property names:", propertyNamesError);
    } else if (propertiesData) {
      // Create a map of property IDs to names
      for (const prop of propertiesData) {
        propertiesMap[prop.id] = { id: prop.id, name: prop.name || "Unknown property" };
      }
    }
    
    // 4. Get tenant information
    const tenantIds = requestsData.map(req => req.tenant_id).filter(Boolean);
    const uniqueTenantIds = [...new Set(tenantIds)];
    
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
    
    // 5. Get service provider information
    const serviceProviderIds = requestsData
      .map(req => req.assigned_service_provider_id)
      .filter(Boolean);
    
    const uniqueServiceProviderIds = [...new Set(serviceProviderIds)];
    
    let serviceProvidersMap: Record<string, { first_name: string | null; last_name: string | null }> = {};
    
    if (uniqueServiceProviderIds.length > 0) {
      const { data: providersData, error: providersError } = await supabase
        .from("profiles")
        .select("id, first_name, last_name")
        .in("id", uniqueServiceProviderIds);
        
      if (providersError) {
        console.error("Error fetching service provider profiles:", providersError);
      } else if (providersData) {
        serviceProvidersMap = providersData.reduce((map: any, provider) => {
          map[provider.id] = { 
            first_name: provider.first_name, 
            last_name: provider.last_name 
          };
          return map;
        }, {});
      }
    }
    
    // 6. Format the requests
    const formattedRequests: MaintenanceRequest[] = requestsData.map(request => {
      // Get tenant information
      let tenant = null;
      if (request.tenant_id && tenantsMap[request.tenant_id]) {
        tenant = tenantsMap[request.tenant_id];
      }
      
      // Get service provider information
      let serviceProvider = null;
      if (request.assigned_service_provider_id && serviceProvidersMap[request.assigned_service_provider_id]) {
        serviceProvider = serviceProvidersMap[request.assigned_service_provider_id];
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
