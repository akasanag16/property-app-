
import { useState } from "react";
import { toast } from "sonner";
import { useOwnerRequests } from "@/hooks/maintenanceRequests/useOwnerRequests";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export function useOwnerMaintenanceRequests() {
  const { user } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Use the existing hook to fetch owner requests
  const { 
    requests, 
    loading, 
    error, 
    refetch 
  } = useOwnerRequests(user?.id, refreshKey);
  
  // Filter requests by status
  const pendingRequests = requests.filter(req => req.status === "pending");
  const inProgressRequests = requests.filter(req => req.status === "accepted");
  const completedRequests = requests.filter(req => req.status === "completed");
  
  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    toast.success("Maintenance requests refreshed");
  };

  const updateStatus = async (
    requestId: string, 
    newStatus: "accepted" | "completed", 
    serviceProviderId?: string
  ) => {
    try {
      setIsUpdating(true);
      console.log(`Updating request ${requestId} to ${newStatus}${serviceProviderId ? ` with provider ${serviceProviderId}` : ''}`);
      
      if (!user?.id) {
        throw new Error("User not authenticated");
      }

      // Use our safe_update_maintenance_request function to update the request
      // This avoids the infinite recursion issues with RLS policies
      const { data: updateResult, error: updateError } = await supabase
        .rpc('safe_update_maintenance_request', {
          request_id_param: requestId,
          owner_id_param: user.id,
          status_param: newStatus,
          service_provider_id_param: serviceProviderId || null
        });
        
      if (updateError) {
        console.error("Error updating request:", updateError);
        throw new Error(`Failed to update request: ${updateError.message}`);
      }
      
      if (!updateResult) {
        throw new Error("Failed to update request: Operation returned false");
      }
      
      // Refresh the requests list
      refetch();
      
      const message = newStatus === "accepted" 
        ? "Request marked as in progress" + (serviceProviderId ? " and assigned to service provider" : "")
        : "Request marked as completed";
      
      toast.success(message);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      console.error("Error updating request status:", error);
      toast.error(`Failed to update request status: ${errorMessage}`);
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    requests,
    pendingRequests,
    inProgressRequests,
    completedRequests,
    loading,
    error,
    isUpdating,
    handleRefresh,
    updateStatus
  };
}
