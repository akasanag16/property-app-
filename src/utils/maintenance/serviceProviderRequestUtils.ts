
import { supabase } from "@/integrations/supabase/client";
import { MaintenanceRequest } from "@/types/maintenance";

export async function getServiceProviderRequests(providerId: string): Promise<MaintenanceRequest[]> {
  try {
    console.log("Fetching maintenance requests for provider:", providerId);
    
    if (!providerId) {
      console.warn("No provider ID provided");
      return [];
    }
    
    // Get requests assigned to this service provider - without joins to avoid recursion
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
      .eq("assigned_service_provider_id", providerId)
      .order("created_at", { ascending: false });
      
    if (requestError) {
      console.error("Error fetching service provider requests:", requestError);
      throw requestError;
    }
    
    if (!requests || requests.length === 0) {
      console.log("No maintenance requests found for service provider");
      return [];
    }
    
    // Get unique property IDs from the requests
    const propertyIds = requests
      .map(req => req.property_id)
      .filter(Boolean)
      .filter((id, index, self) => self.indexOf(id) === index);
      
    // Get unique tenant IDs from the requests
    const tenantIds = requests
      .map(req => req.tenant_id)
      .filter(Boolean)
      .filter((id, index, self) => self.indexOf(id) === index);
    
    // Get property information in a single query
    let propertiesMap: Record<string, string> = {};
    
    if (propertyIds.length > 0) {
      const { data: properties, error: propertiesError } = await supabase
        .from("properties")
        .select("id, name")
        .in("id", propertyIds);
        
      if (propertiesError) {
        console.error("Error fetching property names:", propertiesError);
      } else if (properties) {
        propertiesMap = properties.reduce((map: Record<string, string>, property) => {
          map[property.id] = property.name;
          return map;
        }, {});
      }
    }
    
    // Get tenant information in a single query
    let tenantsMap: Record<string, { first_name: string | null; last_name: string | null }> = {};
    
    if (tenantIds.length > 0) {
      const { data: tenants, error: tenantsError } = await supabase
        .from("profiles")
        .select("id, first_name, last_name")
        .in("id", tenantIds);
        
      if (tenantsError) {
        console.error("Error fetching tenant profiles:", tenantsError);
      } else if (tenants) {
        tenantsMap = tenants.reduce((map: any, tenant) => {
          map[tenant.id] = { 
            first_name: tenant.first_name, 
            last_name: tenant.last_name 
          };
          return map;
        }, {});
      }
    }
    
    // Format the results
    const formattedRequests: MaintenanceRequest[] = requests.map(request => {
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
        property: {
          name: propertiesMap[request.property_id] || "Unknown property",
          id: request.property_id
        },
        tenant,
        assigned_service_provider: null // Service provider doesn't need their own info
      };
    });
    
    return formattedRequests;
  } catch (error) {
    console.error("Error in getServiceProviderRequests:", error);
    throw error;
  }
}
