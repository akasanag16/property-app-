
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

      // First, verify that the current user owns the property associated with this request
      // by using our security definer function
      const { data: requestData, error: requestError } = await supabase
        .from('maintenance_requests')
        .select('property_id')
        .eq('id', requestId)
        .single();
        
      if (requestError) {
        console.error("Error fetching request data:", requestError);
        throw new Error(`Failed to verify request ownership: ${requestError.message}`);
      }
      
      if (!requestData || !requestData.property_id) {
        throw new Error("Invalid request data");
      }
      
      const propertyId = requestData.property_id;
      
      // Check if the user is the owner of this property using our security definer function
      const { data: ownershipCheck, error: ownershipError } = await supabase
        .rpc('safe_is_owner_of_property', { 
          user_id_param: user.id, 
          property_id_param: propertyId 
        });
      
      if (ownershipError) {
        console.error("Error checking ownership:", ownershipError);
        throw new Error(`Failed to verify property ownership: ${ownershipError.message}`);
      }
      
      if (!ownershipCheck) {
        throw new Error("You don't have permission to update this request");
      }
      
      // Prepare the update data
      const updateData: { 
        status: "accepted" | "completed"; 
        assigned_service_provider_id?: string;
      } = { 
        status: newStatus 
      };
      
      // If assigning a service provider (when status becomes "accepted")
      if (newStatus === "accepted" && serviceProviderId) {
        updateData.assigned_service_provider_id = serviceProviderId;
      }
      
      // Update the request in the database using a direct update
      // This update will now work because we've verified ownership separately
      const { error: updateError } = await supabase
        .from('maintenance_requests')
        .update(updateData)
        .eq('id', requestId);
        
      if (updateError) {
        console.error("Error updating request:", updateError);
        throw new Error(`Failed to update request: ${updateError.message}`);
      }
      
      // Create notification for the assigned service provider if applicable
      if (newStatus === "accepted" && serviceProviderId) {
        const requestDetails = requests.find(req => req.id === requestId);
        if (requestDetails) {
          try {
            // Create notification for service provider
            await supabase.rpc('create_notification', {
              user_id_param: serviceProviderId,
              title_param: "New Maintenance Request Assigned",
              message_param: `You have been assigned to a maintenance request: ${requestDetails.title}`,
              type_param: "maintenance_assignment",
              related_entity_id_param: requestId,
              related_entity_type_param: "maintenance_request"
            });
          } catch (notifError) {
            console.error("Error creating notification:", notifError);
            // Continue even if notification creation fails
          }
        }
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
