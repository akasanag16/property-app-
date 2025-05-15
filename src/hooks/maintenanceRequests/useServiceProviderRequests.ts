
import { useState, useEffect } from "react";
import { MaintenanceRequest } from "@/types/maintenance";
import { getServiceProviderRequests } from "@/utils/maintenance/serviceProviderRequestUtils";
import { toast } from "sonner";

export function useServiceProviderRequests(userId: string | undefined, refreshKey = 0) {
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchRequests = async () => {
    if (!userId) {
      setRequests([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await getServiceProviderRequests(userId);
      setRequests(data);
    } catch (err: any) {
      console.error("Error fetching service provider maintenance requests:", err);
      setError(err);
      toast.error("Failed to load maintenance requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [userId, refreshKey]);

  return { requests, loading, error, refetch: fetchRequests };
}
