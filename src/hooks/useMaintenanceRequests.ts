
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { MaintenanceRequest } from "@/types/maintenance";
import { toast } from "sonner";

export function useMaintenanceRequests(
  userRole: "owner" | "tenant" | "service_provider",
  refreshKey = 0
) {
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refetch = () => {
    fetchRequests();
  };

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;

      if (!userId) {
        setRequests([]);
        setLoading(false);
        return;
      }

      let requestsData: any[] = [];
      
      // Different fetching strategies based on user role
      if (userRole === "tenant") {
        // Direct query for tenant's requests - avoiding joins that might cause recursion
        const { data, error: requestError } = await supabase
          .from("maintenance_requests")
          .select("id, title, description, status, created_at, property_id")
          .eq("tenant_id", userId)
          .order("created_at", { ascending: false });
          
        if (requestError) throw requestError;
        requestsData = data || [];
        
        // Now fetch property names separately to avoid recursion
        if (requestsData.length > 0) {
          for (let i = 0; i < requestsData.length; i++) {
            const request = requestsData[i];
            // Use the dedicated function to get property name
            const { data: propertyData, error: propertyError } = await supabase
              .rpc('get_property_name', { property_id_param: request.property_id });
              
            if (propertyError) {
              console.error("Error fetching property name:", propertyError);
              request.property = { name: "Unknown property", id: request.property_id };
            } else {
              request.property = { name: propertyData || "Unnamed property", id: request.property_id };
            }
          }
        }
      } else if (userRole === "service_provider") {
        // Direct query for service provider's assigned requests
        const { data, error: requestError } = await supabase
          .from("maintenance_requests")
          .select("id, title, description, status, created_at, property_id, tenant_id")
          .eq("assigned_service_provider_id", userId)
          .order("created_at", { ascending: false });
          
        if (requestError) throw requestError;
        requestsData = data || [];
        
        // Fetch property names and tenant details separately
        if (requestsData.length > 0) {
          for (let i = 0; i < requestsData.length; i++) {
            const request = requestsData[i];
            
            // Get property name
            const { data: propertyData, error: propertyError } = await supabase
              .rpc('get_property_name', { property_id_param: request.property_id });
              
            if (propertyError) {
              console.error("Error fetching property name:", propertyError);
              request.property = { name: "Unknown property", id: request.property_id };
            } else {
              request.property = { name: propertyData || "Unnamed property", id: request.property_id };
            }
            
            // Get tenant details
            if (request.tenant_id) {
              const { data: tenantData, error: tenantError } = await supabase
                .from("profiles")
                .select("first_name, last_name")
                .eq("id", request.tenant_id)
                .single();
                
              if (tenantError) {
                console.error("Error fetching tenant details:", tenantError);
                request.tenant = { first_name: "Unknown", last_name: "Tenant" };
              } else {
                request.tenant = tenantData;
              }
            } else {
              request.tenant = { first_name: "Unknown", last_name: "Tenant" };
            }
          }
        }
      } else if (userRole === "owner") {
        // First get the properties owned by this user
        const { data: properties, error: propertiesError } = await supabase
          .from("properties")
          .select("id, name")
          .eq("owner_id", userId);
          
        if (propertiesError) throw propertiesError;
        
        if (!properties || properties.length === 0) {
          setRequests([]);
          setLoading(false);
          return;
        }
        
        // Get property IDs
        const propertyIds = properties.map(p => p.id);
        
        // Create a map for quick property name lookup
        const propertyMap = properties.reduce((map, prop) => {
          map[prop.id] = prop.name;
          return map;
        }, {} as Record<string, string>);
        
        // Get maintenance requests for these properties
        const { data, error: requestError } = await supabase
          .from("maintenance_requests")
          .select("id, title, description, status, created_at, property_id, tenant_id, assigned_service_provider_id")
          .in("property_id", propertyIds)
          .order("created_at", { ascending: false });
          
        if (requestError) throw requestError;
        requestsData = data || [];
        
        // Add property names from our map and fetch tenant/service provider details
        if (requestsData.length > 0) {
          for (let i = 0; i < requestsData.length; i++) {
            const request = requestsData[i];
            request.property = {
              id: request.property_id,
              name: propertyMap[request.property_id] || "Unnamed property"
            };
            
            // Get tenant details
            if (request.tenant_id) {
              const { data: tenantData, error: tenantError } = await supabase
                .from("profiles")
                .select("first_name, last_name")
                .eq("id", request.tenant_id)
                .single();
                
              if (tenantError) {
                console.error("Error fetching tenant details:", tenantError);
                request.tenant = { first_name: "Unknown", last_name: "Tenant" };
              } else {
                request.tenant = tenantData;
              }
            } else {
              request.tenant = { first_name: "Unknown", last_name: "Tenant" };
            }
            
            // Get service provider details if assigned
            if (request.assigned_service_provider_id) {
              const { data: providerData, error: providerError } = await supabase
                .from("profiles")
                .select("first_name, last_name")
                .eq("id", request.assigned_service_provider_id)
                .single();
                
              if (providerError) {
                console.error("Error fetching service provider details:", providerError);
                request.assigned_service_provider = null;
              } else {
                request.assigned_service_provider = providerData;
              }
            } else {
              request.assigned_service_provider = null;
            }
          }
        }
      }

      // Format requests to match expected structure
      const formattedRequests: MaintenanceRequest[] = requestsData.map(request => ({
        id: request.id,
        title: request.title,
        description: request.description,
        status: request.status,
        created_at: request.created_at,
        property: request.property,
        tenant: request.tenant || null,
        assigned_service_provider: request.assigned_service_provider || null
      }));

      setRequests(formattedRequests);
    } catch (err: any) {
      console.error("Error fetching maintenance requests:", err);
      setError(err);
      toast.error("Failed to load maintenance requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [userRole, refreshKey]);

  return { requests, loading, error, refetch };
}
