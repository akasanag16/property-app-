
import { supabase } from "@/integrations/supabase/client";
import { MaintenanceRequest } from "@/types/maintenance";

export async function getOwnerRequests(ownerId: string): Promise<MaintenanceRequest[]> {
  try {
    console.log("Fetching maintenance requests for owner:", ownerId);
    
    if (!ownerId) {
      console.warn("No owner ID provided");
      return [];
    }
    
    // First get properties owned by this user - without any joins to avoid recursion
    const { data: properties, error: propertiesError } = await supabase
      .from("properties")
      .select("id, name")
      .eq("owner_id", ownerId);
      
    if (propertiesError) {
      console.error("Error fetching owner properties:", propertiesError);
      throw propertiesError;
    }
    
    if (!properties || properties.length === 0) {
      console.log("No properties found for owner");
      return [];
    }
    
    // Create a map for property names
    const propertyIdMap = properties.reduce((map, prop) => {
      map[prop.id] = prop.name;
      return map;
    }, {} as Record<string, string>);
    
    // Get property IDs
    const propertyIds = properties.map(p => p.id);
    
    // Get all maintenance requests for these properties - without joins
    const { data: requests, error: requestError } = await supabase
      .from("maintenance_requests")
      .select(`
        id, 
        title, 
        description, 
        status, 
        created_at, 
        property_id, 
        tenant_id, 
        assigned_service_provider_id
      `)
      .in("property_id", propertyIds)
      .order("created_at", { ascending: false });
      
    if (requestError) {
      console.error("Error fetching owner requests:", requestError);
      throw requestError;
    }
    
    if (!requests || requests.length === 0) {
      console.log("No maintenance requests found for owner properties");
      return [];
    }

    // Get unique tenant IDs from the requests
    const tenantIds = requests
      .map(req => req.tenant_id)
      .filter(Boolean)
      .filter((id, index, self) => self.indexOf(id) === index);
      
    // Get unique service provider IDs from the requests
    const providerIds = requests
      .map(req => req.assigned_service_provider_id)
      .filter(Boolean)
      .filter((id, index, self) => self.indexOf(id) === index);
    
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
    
    // Get service provider information in a single query
    let providersMap: Record<string, { first_name: string | null; last_name: string | null }> = {};
    
    if (providerIds.length > 0) {
      const { data: providers, error: providersError } = await supabase
        .from("profiles")
        .select("id, first_name, last_name")
        .in("id", providerIds);
        
      if (providersError) {
        console.error("Error fetching service provider profiles:", providersError);
      } else if (providers) {
        providersMap = providers.reduce((map: any, provider) => {
          map[provider.id] = { 
            first_name: provider.first_name, 
            last_name: provider.last_name 
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
      
      // Get service provider information
      let assigned_service_provider = null;
      if (request.assigned_service_provider_id && providersMap[request.assigned_service_provider_id]) {
        assigned_service_provider = providersMap[request.assigned_service_provider_id];
      }
      
      return {
        id: request.id,
        title: request.title,
        description: request.description,
        status: request.status,
        created_at: request.created_at,
        property: {
          name: propertyIdMap[request.property_id] || "Unknown property",
          id: request.property_id
        },
        tenant,
        assigned_service_provider
      };
    });
    
    return formattedRequests;
  } catch (error) {
    console.error("Error in getOwnerRequests:", error);
    throw error;
  }
}
