
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
      let query;
      
      if (userRole === "tenant") {
        // For tenants, fetch only their requests
        query = supabase
          .from("maintenance_requests")
          .select(`
            id, title, description, status, created_at,
            property_id
          `)
          .eq("tenant_id", user?.id)
          .order("created_at", { ascending: false });
      } else if (userRole === "service_provider") {
        // For service providers, fetch only requests assigned to them
        // Using direct query instead of joins to avoid RLS recursion
        query = supabase
          .from("maintenance_requests")
          .select(`
            id, title, description, status, created_at,
            property_id, tenant_id
          `)
          .eq("assigned_service_provider_id", user?.id)
          .order("created_at", { ascending: false });
      } else {
        // For owners, fetch all requests
        query = supabase
          .from("maintenance_requests")
          .select(`
            id, title, description, status, created_at,
            property_id, tenant_id, assigned_service_provider_id
          `)
          .order("created_at", { ascending: false });
      }

      console.log("Executing maintenance requests query for role:", userRole);
      const { data, error } = await query;

      if (error) throw error;

      console.log("Maintenance requests data:", data);
      
      // After getting the initial data, make separate queries to get the related information
      const enhancedRequests = await Promise.all((data || []).map(async (request) => {
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
