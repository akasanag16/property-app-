
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
        return;
      }

      let query;

      // Use different query strategies based on user role
      if (userRole === "tenant") {
        // For tenants, fetch requests they created
        query = supabase
          .from("maintenance_requests")
          .select(`
            id,
            title,
            description,
            status,
            created_at,
            property_id,
            property:property_id (
              id, 
              name
            ),
            assigned_service_provider:assigned_service_provider_id (
              id,
              first_name,
              last_name
            )
          `)
          .eq("tenant_id", userId)
          .order("created_at", { ascending: false });
      } else if (userRole === "service_provider") {
        // For service providers, fetch assigned requests
        query = supabase
          .from("maintenance_requests")
          .select(`
            id,
            title,
            description,
            status,
            created_at,
            property_id,
            property:property_id (
              id, 
              name
            ),
            tenant:tenant_id (
              id,
              first_name,
              last_name
            )
          `)
          .eq("assigned_service_provider_id", userId)
          .order("created_at", { ascending: false });
      } else if (userRole === "owner") {
        // For owners, fetch requests for properties they own
        // Use a function to get properties to avoid recursion
        const { data: propertyIds, error: propertyError } = await supabase
          .from("properties")
          .select("id")
          .eq("owner_id", userId);
          
        if (propertyError) throw propertyError;
        
        if (!propertyIds || propertyIds.length === 0) {
          setRequests([]);
          setLoading(false);
          return;
        }
        
        // Get ids only
        const ids = propertyIds.map(p => p.id);
        
        query = supabase
          .from("maintenance_requests")
          .select(`
            id,
            title,
            description,
            status,
            created_at,
            property_id,
            property:property_id (
              id, 
              name
            ),
            tenant:tenant_id (
              id,
              first_name,
              last_name
            ),
            assigned_service_provider:assigned_service_provider_id (
              id,
              first_name,
              last_name
            )
          `)
          .in("property_id", ids)
          .order("created_at", { ascending: false });
      }

      const { data, error: requestError } = await query;

      if (requestError) throw requestError;

      // Format the returned data
      const formattedRequests = data.map((request: any) => ({
        id: request.id,
        title: request.title,
        description: request.description,
        status: request.status,
        created_at: request.created_at,
        property: {
          id: request.property.id,
          name: request.property.name
        },
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
