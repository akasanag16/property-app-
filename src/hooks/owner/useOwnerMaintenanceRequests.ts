
import { useState } from "react";
import { toast } from "sonner";
import { useOwnerRequests } from "@/hooks/maintenanceRequests/useOwnerRequests";
import { useAuth } from "@/contexts/AuthContext";

export function useOwnerMaintenanceRequests() {
  const { user } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);
  
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

  const updateStatus = async (requestId: string, newStatus: "accepted" | "completed") => {
    try {
      // In a real implementation, this would update the database
      // For demo purposes, update the state directly
      const updatedRequests = requests.map(req => 
        req.id === requestId ? { ...req, status: newStatus } : req
      );

      // Trigger a refetch to get fresh data from the server
      refetch();
      
      toast.success(`Request marked as ${newStatus}`);
    } catch (error) {
      console.error("Error updating request status:", error);
      toast.error("Failed to update request status");
    }
  };

  return {
    requests,
    pendingRequests,
    inProgressRequests,
    completedRequests,
    loading,
    error,
    handleRefresh,
    updateStatus
  };
}
