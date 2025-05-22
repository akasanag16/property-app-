
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

export function useMaintenanceStatusUpdate(
  userRole: "owner" | "tenant" | "service_provider",
  onRefreshNeeded?: () => void
) {
  const [isUpdating, setIsUpdating] = useState(false);
  const { user } = useAuth();

  const updateStatus = async (
    requestId: string, 
    newStatus: "accepted" | "completed",
    serviceProviderId?: string
  ) => {
    try {
      setIsUpdating(true);
      console.log(`Updating request ${requestId} status to ${newStatus}${serviceProviderId ? ` with provider ${serviceProviderId}` : ''}`);
      
      if (!user?.id) {
        throw new Error("User not authenticated");
      }

      let updateResult;
      let error;

      // Use the appropriate function based on user role
      if (userRole === "service_provider") {
        console.log("Using service provider update function");
        // Service providers can only mark as completed
        if (newStatus !== "completed") {
          throw new Error("Service providers can only mark requests as completed");
        }
        
        // Call the secure function for service providers
        const result = await supabase.rpc('safe_service_provider_update_request', {
          request_id_param: requestId,
          service_provider_id_param: user.id,
          status_param: newStatus
        });
        
        updateResult = result.data;
        error = result.error;
      } else if (userRole === "owner") {
        console.log("Using owner update function");
        // Use the owner's secure function
        const result = await supabase.rpc('safe_update_maintenance_request', {
          request_id_param: requestId,
          owner_id_param: user.id,
          status_param: newStatus,
          service_provider_id_param: serviceProviderId || null
        });
        
        updateResult = result.data;
        error = result.error;
      } else {
        // Tenants cannot update requests
        throw new Error("You don't have permission to update maintenance requests");
      }

      if (error) {
        console.error("Error updating request status:", error);
        throw error;
      }
      
      if (!updateResult) {
        throw new Error("Failed to update request: Operation returned false");
      }
      
      toast.success(`Request marked as ${newStatus}`);
      if (onRefreshNeeded) onRefreshNeeded(); // Notify parent if needed
    } catch (error: any) {
      console.error("Error updating request status:", error);
      toast.error(`Failed to update request status: ${error.message || "Unknown error"}`);
    } finally {
      setIsUpdating(false);
    }
  };

  return { updateStatus, isUpdating };
}
