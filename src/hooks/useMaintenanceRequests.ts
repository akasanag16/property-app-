
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { MaintenanceRequest } from "@/types/maintenance";
import { useAuth } from "@/contexts/AuthContext";

export function useMaintenanceRequests(userRole: "owner" | "tenant" | "service_provider", refreshKey: number = 0) {
  const { user } = useAuth();
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchRequests = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      let requestsData: any[] = [];
      
      if (userRole === "tenant") {
        // For tenants, fetch only their requests directly
        const { data, error } = await supabase
          .from("maintenance_requests")
          .select(`
            id, title, description, status, created_at,
            property_id
          `)
          .eq("tenant_id", user.id)
          .order("created_at", { ascending: false });
          
        if (error) throw error;
        requestsData = data || [];

        // Now enhance with property names and other details without recursion
        const enhancedRequests = await Promise.all(requestsData.map(async (request) => {
          // Use RPC for property name to avoid recursion
          const { data: propertyData, error: propertyError } = await supabase
            .rpc('get_property_name', { property_id_param: request.property_id });
          
          return {
            ...request,
            property: {
              name: propertyError ? "Unknown Property" : (propertyData || "Unknown Property")
            },
            tenant: {
              first_name: user?.user_metadata?.first_name || "Unknown", 
              last_name: user?.user_metadata?.last_name || "User"
            }
          } as MaintenanceRequest;
        }));
        
        setRequests(enhancedRequests);
        
      } else if (userRole === "service_provider") {
        // For service providers, use the secure function to get their maintenance request IDs
        const { data: ids, error: idsError } = await supabase
          .rpc('get_service_provider_maintenance_requests', { provider_id: user.id });
          
        if (idsError) throw idsError;
        
        // If no requests are assigned, return empty array
        if (!ids || ids.length === 0) {
          setRequests([]);
          setLoading(false);
          return;
        }
        
        // Now fetch the actual maintenance requests using the IDs
        const { data, error } = await supabase
          .from("maintenance_requests")
          .select(`
            id, title, description, status, created_at,
            property_id, tenant_id
          `)
          .in("id", ids)
          .order("created_at", { ascending: false });
          
        if (error) throw error;
        requestsData = data || [];

        // Process the same way as before
        const enhancedRequests = await Promise.all(requestsData.map(async (request) => {
          const { data: propertyData } = await supabase
            .rpc('get_property_name', { property_id_param: request.property_id });
          
          const { data: tenantData } = await supabase
            .from("profiles")
            .select("first_name, last_name")
            .eq("id", request.tenant_id)
            .maybeSingle();
          
          return {
            ...request,
            property: {
              name: propertyData || "Unknown Property"
            },
            tenant: {
              first_name: tenantData?.first_name || "Unknown",
              last_name: tenantData?.last_name || "User"
            },
            assigned_service_provider: {
              first_name: user?.user_metadata?.first_name || "Unknown",
              last_name: user?.user_metadata?.last_name || "Provider"
            }
          } as MaintenanceRequest;
        }));
        
        setRequests(enhancedRequests);
      } else {
        // For owners, same approach but with their properties
        // Implementation for owner would be similar
        setRequests([]);
      }
    } catch (error) {
      console.error("Error fetching maintenance requests:", error);
      setError(error as Error);
      toast.error("Failed to load maintenance requests");
    } finally {
      setLoading(false);
    }
  };

  // Set up real-time subscription
  useEffect(() => {
    if (user?.id) {
      fetchRequests();

      const channel = supabase
        .channel('table-db-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'maintenance_requests',
          },
          () => {
            fetchRequests();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [userRole, user?.id, refreshKey]);

  return { requests, loading, error, refetch: fetchRequests };
}
