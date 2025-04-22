
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { MaintenanceRequest } from "@/types/maintenance";
import { useAuth } from "@/contexts/AuthContext";

export function useMaintenanceRequests(userRole: "owner" | "tenant" | "service_provider", refreshKey: number = 0) {
  const { user } = useAuth();
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      let requestIds: string[] = [];
      let requestsData: any[] = [];
      
      if (userRole === "tenant") {
        // For tenants, fetch only their requests directly
        const { data, error } = await supabase
          .from("maintenance_requests")
          .select(`
            id, title, description, status, created_at,
            property_id
          `)
          .eq("tenant_id", user?.id)
          .order("created_at", { ascending: false });
          
        if (error) throw error;
        requestsData = data || [];
      } else if (userRole === "service_provider") {
        // For service providers, use the secure function to get their maintenance request IDs
        const { data: ids, error: idsError } = await supabase
          .rpc('get_service_provider_maintenance_requests', { provider_id: user?.id });
          
        if (idsError) throw idsError;
        
        // If no requests are assigned, return empty array
        if (!ids || ids.length === 0) {
          setRequests([]);
          setLoading(false);
          return;
        }
        
        requestIds = ids;
        
        // Now fetch the actual maintenance requests using the IDs
        const { data, error } = await supabase
          .from("maintenance_requests")
          .select(`
            id, title, description, status, created_at,
            property_id, tenant_id
          `)
          .in("id", requestIds)
          .order("created_at", { ascending: false });
          
        if (error) throw error;
        requestsData = data || [];
      } else {
        // For owners, fetch all requests
        const { data, error } = await supabase
          .from("maintenance_requests")
          .select(`
            id, title, description, status, created_at,
            property_id, tenant_id, assigned_service_provider_id
          `)
          .order("created_at", { ascending: false });
          
        if (error) throw error;
        requestsData = data || [];
      }

      console.log("Maintenance requests data:", requestsData);
      
      // After getting the initial data, make separate queries to get the related information
      const enhancedRequests = await Promise.all(requestsData.map(async (request) => {
        // Get property info
        const { data: propertyData } = await supabase
          .from("properties")
          .select("name")
          .eq("id", request.property_id)
          .single();
        
        // Get tenant info
        const { data: tenantData } = await supabase
          .from("profiles")
          .select("first_name, last_name")
          .eq("id", request.tenant_id)
          .single();
        
        // Get service provider info if assigned
        let serviceProviderData = null;
        if (request.assigned_service_provider_id) {
          const { data: spData } = await supabase
            .from("profiles")
            .select("first_name, last_name")
            .eq("id", request.assigned_service_provider_id)
            .single();
          serviceProviderData = spData;
        }
        
        return {
          ...request,
          property: {
            name: propertyData?.name || "Unknown Property"
          },
          tenant: {
            first_name: tenantData?.first_name || "Unknown",
            last_name: tenantData?.last_name || "User"
          },
          assigned_service_provider: serviceProviderData ? {
            first_name: serviceProviderData.first_name,
            last_name: serviceProviderData.last_name
          } : null
        } as MaintenanceRequest;
      }));
      
      setRequests(enhancedRequests);
    } catch (error) {
      console.error("Error fetching maintenance requests:", error);
      toast.error("Failed to load maintenance requests");
    } finally {
      setLoading(false);
    }
  };

  // Set up real-time subscription
  useEffect(() => {
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
  }, [userRole, user?.id, refreshKey]);

  return { requests, loading };
}
