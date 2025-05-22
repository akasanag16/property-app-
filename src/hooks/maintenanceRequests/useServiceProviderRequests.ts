
import { useState, useEffect } from "react";
import { MaintenanceRequest } from "@/types/maintenance";
import { getServiceProviderRequests, getPropertyMaintenanceRequestsForProvider } from "@/utils/maintenance/serviceProviderRequestUtils";
import { toast } from "sonner";

export function useServiceProviderRequests(
  userId: string | undefined, 
  refreshKey = 0,
  propertyId?: string
) {
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
      
      let data: MaintenanceRequest[];
      
      if (propertyId) {
        // Fetch requests for a specific property
        console.log(`Fetching maintenance requests for provider ${userId} and property ${propertyId}`);
        data = await getPropertyMaintenanceRequestsForProvider(userId, propertyId);
      } else {
        // Fetch all requests
        console.log(`Fetching all maintenance requests for provider ${userId}`);
        data = await getServiceProviderRequests(userId);
      }
      
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
  }, [userId, propertyId, refreshKey]);

  return { requests, loading, error, refetch: fetchRequests };
}
