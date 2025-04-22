
import { supabase } from "@/integrations/supabase/client";
import { MaintenanceRequest } from "@/types/maintenance";

export async function getTenantRequests(tenantId: string): Promise<MaintenanceRequest[]> {
  const { data, error: requestError } = await supabase
    .from("maintenance_requests")
    .select("id, title, description, status, created_at, property_id")
    .eq("tenant_id", tenantId)
    .order("created_at", { ascending: false });
    
  if (requestError) throw requestError;
  
  const formattedRequests: MaintenanceRequest[] = [];
  
  for (const request of data || []) {
    const { data: propertyName } = await supabase
      .rpc('get_property_name', { property_id_param: request.property_id });
      
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
}

export async function getServiceProviderRequests(providerId: string): Promise<MaintenanceRequest[]> {
  const { data, error: requestError } = await supabase
    .from("maintenance_requests")
    .select("id, title, description, status, created_at, property_id, tenant_id")
    .eq("assigned_service_provider_id", providerId)
    .order("created_at", { ascending: false });
    
  if (requestError) throw requestError;
  
  const formattedRequests: MaintenanceRequest[] = [];
  
  for (const request of data || []) {
    const { data: propertyName } = await supabase
      .rpc('get_property_name', { property_id_param: request.property_id });
      
    let tenant = { first_name: null, last_name: null };
    if (request.tenant_id) {
      const { data: tenantData } = await supabase
        .from("profiles")
        .select("first_name, last_name")
        .eq("id", request.tenant_id)
        .single();
        
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
}

export async function getOwnerRequests(ownerId: string): Promise<MaintenanceRequest[]> {
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
        .single();
        
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
        .single();
        
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
}

