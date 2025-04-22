
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { MaintenanceRequestsListProps } from "@/types/maintenance";
import { MaintenanceRequestItem } from "./MaintenanceRequestItem";
import { useMaintenanceRequests } from "@/hooks/useMaintenanceRequests";
import { useState, useEffect } from "react";
import { ErrorAlert } from "@/components/ui/alert-error";

export function MaintenanceRequestsList({ 
  userRole, 
  refreshKey = 0,
  onRefreshNeeded 
}: MaintenanceRequestsListProps & { onRefreshNeeded?: () => void }) {
  const [localRefreshKey, setLocalRefreshKey] = useState(refreshKey);
  const { requests, loading, error, refetch } = useMaintenanceRequests(userRole, localRefreshKey);

  // Update local refresh key when parent refresh key changes
  useEffect(() => {
    setLocalRefreshKey(refreshKey);
  }, [refreshKey]);

  const handleRetry = () => {
    console.log("Retrying maintenance requests fetch...");
    refetch();
    if (onRefreshNeeded) onRefreshNeeded();
  };

  const updateStatus = async (requestId: string, newStatus: "accepted" | "completed") => {
    try {
      console.log(`Updating request ${requestId} status to ${newStatus}`);
      
      const { error } = await supabase
        .from("maintenance_requests")
        .update({ status: newStatus })
        .eq("id", requestId);

      if (error) {
        console.error("Error updating request status:", error);
        throw error;
      }
      
      toast.success(`Request marked as ${newStatus}`);
      setLocalRefreshKey(prev => prev + 1); // Trigger a refresh
      if (onRefreshNeeded) onRefreshNeeded(); // Notify parent if needed
    } catch (error: any) {
      console.error("Error updating request status:", error);
      toast.error(`Failed to update request status: ${error.message || "Unknown error"}`);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorAlert 
        message={`Error loading maintenance requests: ${error.message}`} 
        onRetry={handleRetry} 
      />
    );
  }

  if (requests.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-lg border">
        <p className="text-gray-500">No maintenance requests found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {requests.map((request) => (
        <MaintenanceRequestItem
          key={request.id}
          request={request}
          userRole={userRole}
          onUpdateStatus={updateStatus}
        />
      ))}
    </div>
  );
}
