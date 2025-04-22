
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

      // Different query strategies based on user role
      if (userRole === "tenant") {
        // For tenants, get their requests directly (no join)
        const { data, error: requestError } = await supabase
          .from("maintenance_requests")
          .select("id, title, description, status, created_at, property_id")
          .eq("tenant_id", userId)
          .order("created_at", { ascending: false });
          
        if (requestError) throw requestError;
        
        // Format the requests with property names
        const formattedRequests: MaintenanceRequest[] = [];
        
        for (const request of data || []) {
          // Get property name using the database function
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
        
        setRequests(formattedRequests);
      } 
      else if (userRole === "service_provider") {
        // For service providers, get their assigned requests
        const { data, error: requestError } = await supabase
          .from("maintenance_requests")
          .select("id, title, description, status, created_at, property_id, tenant_id")
          .eq("assigned_service_provider_id", userId)
          .order("created_at", { ascending: false });
          
        if (requestError) throw requestError;
        
        // Format the requests with property and tenant info
        const formattedRequests: MaintenanceRequest[] = [];
        
        for (const request of data || []) {
          // Get property name
          const { data: propertyName } = await supabase
            .rpc('get_property_name', { property_id_param: request.property_id });
            
          // Get tenant info if available
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
        
        setRequests(formattedRequests);
      } 
      else if (userRole === "owner") {
        // For owners, first get their properties
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
        
        // Create property ID map for quick lookup
        const propertyIdMap = properties.reduce((map, prop) => {
          map[prop.id] = prop.name;
          return map;
        }, {} as Record<string, string>);
        
        const propertyIds = properties.map(p => p.id);
        
        // Get maintenance requests for owner's properties
        const { data, error: requestError } = await supabase
          .from("maintenance_requests")
          .select("id, title, description, status, created_at, property_id, tenant_id, assigned_service_provider_id")
          .in("property_id", propertyIds)
          .order("created_at", { ascending: false });
          
        if (requestError) throw requestError;
        
        // Format the requests with all needed info
        const formattedRequests: MaintenanceRequest[] = [];
        
        for (const request of data || []) {
          // Get tenant info if available
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
          
          // Get service provider info if assigned
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
        
        setRequests(formattedRequests);
      }
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
