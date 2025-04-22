
import { supabase } from "@/integrations/supabase/client";
import { MaintenanceRequest } from "@/types/maintenance";

export async function getTenantRequests(tenantId: string): Promise<MaintenanceRequest[]> {
  try {
    const { data, error: requestError } = await supabase
      .from("maintenance_requests")
      .select("id, title, description, status, created_at, property_id")
      .eq("tenant_id", tenantId)
      .order("created_at", { ascending: false });
      
    if (requestError) throw requestError;
    
    const formattedRequests: MaintenanceRequest[] = [];
    
    for (const request of data || []) {
      // Get property name using our safe function
      const { data: propertyName, error: nameError } = await supabase
        .rpc('get_property_name', { property_id_param: request.property_id });
        
      if (nameError) {
        console.error("Error getting property name:", nameError);
        // Continue with unknown property name
      }
        
      formattedRequests.push({
        id: request.id,
        title: request.title,
        description: request.description,
        status: request.status,
        created_at: request.created_at,
        property: {
          name: propertyName || "Unknown property",
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
    // Get maintenance request IDs assigned to this provider
    const { data: requestIds, error: idsError } = await supabase
      .rpc('get_service_provider_maintenance_requests', { provider_id: providerId });
      
    if (idsError) {
      console.error("Error getting service provider maintenance request IDs:", idsError);
      throw idsError;
    }
    
    if (!requestIds || requestIds.length === 0) {
      return [];
    }
    
    // Get the actual maintenance request data
    const { data, error: requestError } = await supabase
      .from("maintenance_requests")
      .select("id, title, description, status, created_at, property_id, tenant_id")
      .in("id", requestIds)
      .order("created_at", { ascending: false });
      
    if (requestError) throw requestError;
    
    const formattedRequests: MaintenanceRequest[] = [];
    
    for (const request of data || []) {
      // Get property name using our safe function
      const { data: propertyName, error: nameError } = await supabase
        .rpc('get_property_name', { property_id_param: request.property_id });
        
      if (nameError) {
        console.error("Error getting property name:", nameError);
        // Continue with unknown property name
      }
        
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
          name: propertyName || "Unknown property",
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
    // Get properties owned by this owner using a secure query approach
    const { data: properties, error: propertiesError } = await supabase
      .from("properties")
      .select("id, name")
      .eq("owner_id", ownerId);
      
    if (propertiesError) throw propertiesError;
    
    if (!properties || properties.length === 0) {
      return [];
    }
    
    const propertyIdMap = properties.reduce((map, prop) => {
      map[prop.id] = prop.name;
      return map;
    }, {} as Record<string, string>);
    
    const propertyIds = properties.map(p => p.id);
    
    const { data, error: requestError } = await supabase
      .from("maintenance_requests")
      .select("id, title, description, status, created_at, property_id, tenant_id, assigned_service_provider_id")
      .in("property_id", propertyIds)
      .order("created_at", { ascending: false });
      
    if (requestError) throw requestError;
    
    const formattedRequests: MaintenanceRequest[] = [];
    
    for (const request of data || []) {
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
