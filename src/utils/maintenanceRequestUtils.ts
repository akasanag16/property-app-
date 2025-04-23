
import { supabase } from "@/integrations/supabase/client";
import { MaintenanceRequest } from "@/types/maintenance";

export async function getTenantRequests(tenantId: string): Promise<MaintenanceRequest[]> {
  try {
    // Directly fetch maintenance requests for the tenant
    const { data, error: requestError } = await supabase
      .from("maintenance_requests")
      .select("id, title, description, status, created_at, property_id")
      .eq("tenant_id", tenantId)
      .order("created_at", { ascending: false });
      
    if (requestError) throw requestError;
    
    const formattedRequests: MaintenanceRequest[] = [];
    
    for (const request of data || []) {
      // Get property information
      const { data: propertyData } = await supabase
        .from("properties")
        .select("name")
        .eq("id", request.property_id)
        .maybeSingle();
        
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

export async function getServiceProviderRequests(providerId: string): Promise<MaintenanceRequest[]> {
  try {
    // Directly query maintenance requests assigned to this provider
    const { data, error: requestError } = await supabase
      .from("maintenance_requests")
      .select("id, title, description, status, created_at, property_id, tenant_id")
      .eq("assigned_service_provider_id", providerId)
      .order("created_at", { ascending: false });
      
    if (requestError) throw requestError;
    
    const formattedRequests: MaintenanceRequest[] = [];
    
    for (const request of data || []) {
      // Get property information
      const { data: propertyData } = await supabase
        .from("properties")
        .select("name")
        .eq("id", request.property_id)
        .maybeSingle();
      
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

export async function getOwnerRequests(ownerId: string): Promise<MaintenanceRequest[]> {
  try {
    // First get properties owned by this user
    const { data: properties, error: propertiesError } = await supabase
      .from("properties")
      .select("id, name")
      .eq("owner_id", ownerId);
      
    if (propertiesError) throw propertiesError;
    
    if (!properties || properties.length === 0) {
      return [];
    }
    
    // Create a map for property names
    const propertyIdMap = properties.reduce((map, prop) => {
      map[prop.id] = prop.name;
      return map;
    }, {} as Record<string, string>);
    
    // Get property IDs
    const propertyIds = properties.map(p => p.id);
    
    // Get all maintenance requests for these properties
    const { data, error: requestError } = await supabase
      .from("maintenance_requests")
      .select("id, title, description, status, created_at, property_id, tenant_id, assigned_service_provider_id")
      .in("property_id", propertyIds)
      .order("created_at", { ascending: false });
      
    if (requestError) throw requestError;
    
    const formattedRequests: MaintenanceRequest[] = [];
    
    for (const request of data || []) {
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
      
      // Get service provider information if available
      let assigned_service_provider = null;
      if (request.assigned_service_provider_id) {
        const { data: providerData } = await supabase
          .from("profiles")
          .select("first_name, last_name")
          .eq("id", request.assigned_service_provider_id)
          .maybeSingle();
          
        if (providerData) {
          assigned_service_provider = providerData;
        }
      }
      
      formattedRequests.push({
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
      });
    }
    
    return formattedRequests;
  } catch (error) {
    console.error("Error in getOwnerRequests:", error);
    throw error;
  }
}
