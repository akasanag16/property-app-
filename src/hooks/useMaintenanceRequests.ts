
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
      // For owner role, we'll fetch all maintenance requests directly
      // For tenant/service_provider, we'll filter by their ID
      
      let query;
      
      if (userRole === "tenant") {
        // Tenants only see their own requests - simplified query to avoid recursion
        query = supabase
          .from("maintenance_requests")
          .select(`
            id, title, description, status, created_at,
            property_id:property_id(properties(name)),
            tenant_id:tenant_id(profiles(first_name, last_name)),
            assigned_service_provider_id:assigned_service_provider_id(profiles(first_name, last_name))
          `)
          .eq("tenant_id", user?.id)
          .order("created_at", { ascending: false });
      } else if (userRole === "service_provider") {
        // Service providers only see requests assigned to them - simplified query
        query = supabase
          .from("maintenance_requests")
          .select(`
            id, title, description, status, created_at,
            property:properties(name),
            tenant:profiles!maintenance_requests_tenant_id_fkey(first_name, last_name),
            assigned_service_provider:profiles!maintenance_requests_assigned_service_provider_id_fkey(first_name, last_name)
          `)
          .eq("assigned_service_provider_id", user?.id)
          .order("created_at", { ascending: false });
      } else {
        // Owner view - simplified to avoid recursion
        query = supabase
          .from("maintenance_requests")
          .select(`
            id, title, description, status, created_at,
            property:properties(name),
            tenant:profiles!maintenance_requests_tenant_id_fkey(first_name, last_name),
            assigned_service_provider:profiles!maintenance_requests_assigned_service_provider_id_fkey(first_name, last_name)
          `)
          .order("created_at", { ascending: false });
      }

      console.log("Executing maintenance requests query for role:", userRole);
      const { data, error } = await query;

      if (error) throw error;

      console.log("Maintenance requests data:", data);

      const typedData: MaintenanceRequest[] = (data || []).map(item => ({
        ...item,
        tenant: {
          first_name: item.tenant?.first_name || "Unknown",
          last_name: item.tenant?.last_name || "User",
        },
        property: {
          name: item.property?.name || "Unknown Property"
        },
        assigned_service_provider: item.assigned_service_provider ? {
          first_name: item.assigned_service_provider.first_name,
          last_name: item.assigned_service_provider.last_name
        } : null
      }));

      setRequests(typedData);
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
