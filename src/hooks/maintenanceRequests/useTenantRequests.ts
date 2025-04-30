
import { useState, useEffect, useCallback } from "react";
import { MaintenanceRequest } from "@/types/maintenance";
import { getTenantRequests } from "@/utils/maintenance/tenantRequestUtils";
import { toast } from "sonner";

export function useTenantRequests(userId: string | undefined, refreshKey = 0) {
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchRequests = useCallback(async () => {
    if (!userId) {
      setRequests([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log("Fetching tenant requests for user ID:", userId);
      const data = await getTenantRequests(userId);
      setRequests(data);
    } catch (err: any) {
      console.error("Error fetching tenant maintenance requests:", err);
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(new Error(errorMessage));
      toast.error("Failed to load maintenance requests");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests, refreshKey]);

  return { requests, loading, error, refetch: fetchRequests };
}
