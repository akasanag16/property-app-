
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
      let query = supabase
        .from("maintenance_requests")
        .select(`
          *,
          property:properties(name),
          tenant:profiles!maintenance_requests_tenant_id_fkey(first_name, last_name),
          assigned_service_provider:profiles!maintenance_requests_assigned_service_provider_id_fkey(first_name, last_name)
        `)
        .order("created_at", { ascending: false });

      if (userRole === "tenant") {
        query = query.eq("tenant_id", user?.id);
      } else if (userRole === "service_provider") {
        query = query.eq("assigned_service_provider_id", user?.id);
      }

      const { data, error } = await query;

      if (error) throw error;

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
