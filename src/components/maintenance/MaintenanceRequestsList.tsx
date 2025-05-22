import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { MaintenanceRequestsListProps } from "@/types/maintenance";
import { useState, useEffect } from "react";
import { ErrorAlert } from "@/components/ui/alert-error";
import { Button } from "../ui/button";
import { RefreshCw, ArrowDownAZ, Calendar, AlertTriangle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { MaintenanceRequestCard } from "./MaintenanceRequestCard";
import { useMaintenanceRequests } from "@/hooks/useMaintenanceRequests";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

type ExtendedMaintenanceRequestsListProps = MaintenanceRequestsListProps & { 
  onRefreshNeeded?: () => void;
  onError?: (message: string) => void;
  propertyId?: string;
};

export function MaintenanceRequestsList({ 
  userRole, 
  refreshKey = 0,
  onRefreshNeeded,
  onError,
  propertyId
}: ExtendedMaintenanceRequestsListProps) {
  const [localRefreshKey, setLocalRefreshKey] = useState(refreshKey);
  const [isUpdating, setIsUpdating] = useState(false);
  const { requests: originalRequests, loading, error, refetch } = useMaintenanceRequests(userRole, localRefreshKey, propertyId);
  const [sortBy, setSortBy] = useState<"date-desc" | "date-asc" | "status" | "priority">("date-desc");
  const [requests, setRequests] = useState(originalRequests);
  const { user } = useAuth();

  // Update local refresh key when parent refresh key changes
  useEffect(() => {
    setLocalRefreshKey(refreshKey);
  }, [refreshKey]);

  // Apply sorting when requests or sort method changes
  useEffect(() => {
    if (!originalRequests) return;

    let sortedRequests = [...originalRequests];

    switch (sortBy) {
      case "date-desc":
        sortedRequests.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case "date-asc":
        sortedRequests.sort((a, b) => 
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        break;
      case "status":
        // Sort by priority: pending first, then accepted, then completed
        sortedRequests.sort((a, b) => {
          const statusWeight = { pending: 0, accepted: 1, completed: 2 };
          return statusWeight[a.status as keyof typeof statusWeight] - 
                 statusWeight[b.status as keyof typeof statusWeight];
        });
        break;
      case "priority":
        // Sort by property name - FIX: Access property name through the property object
        sortedRequests.sort((a, b) => 
          a.property.name.localeCompare(b.property.name));
        break;
    }

    setRequests(sortedRequests);
  }, [originalRequests, sortBy]);

  // Report errors up to parent component if needed
  useEffect(() => {
    if (error && onError) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : "Unknown error loading maintenance requests";
      onError(errorMessage);
    }
  }, [error, onError]);

  const handleRetry = () => {
    console.log("Retrying maintenance requests fetch...");
    refetch();
    if (onRefreshNeeded) onRefreshNeeded();
  };

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
      setLocalRefreshKey(prev => prev + 1); // Trigger a refresh
      if (onRefreshNeeded) onRefreshNeeded(); // Notify parent if needed
    } catch (error: any) {
      console.error("Error updating request status:", error);
      toast.error(`Failed to update request status: ${error.message || "Unknown error"}`);
    } finally {
      setIsUpdating(false);
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
    console.error("Error in MaintenanceRequestsList:", error);
    const errorMessage = error instanceof Error 
      ? error.message 
      : "Unknown error loading maintenance requests";
    
    return (
      <div className="space-y-4">
        <ErrorAlert 
          message={`Error loading maintenance requests: ${errorMessage}`} 
          onRetry={handleRetry} 
        />
        <div className="flex justify-center">
          <Button variant="outline" onClick={handleRetry} className="flex items-center">
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!requests || requests.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-lg border">
        <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-2" />
        <p className="text-gray-500">No maintenance requests found</p>
        <Button variant="ghost" onClick={handleRetry} className="mt-2">
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <p className="text-sm text-gray-500">{requests.length} requests</p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">Sort by:</span>
          <Select
            value={sortBy}
            onValueChange={(value) => setSortBy(value as any)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date-desc" className="flex items-center">
                <Calendar className="mr-2 h-4 w-4" /> Newest first
              </SelectItem>
              <SelectItem value="date-asc">
                <Calendar className="mr-2 h-4 w-4" /> Oldest first
              </SelectItem>
              <SelectItem value="status">By status</SelectItem>
              <SelectItem value="priority">
                <ArrowDownAZ className="mr-2 h-4 w-4" /> Property name
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <Separator />

      {requests.map((request) => (
        <MaintenanceRequestCard
          key={request.id}
          request={request}
          userRole={userRole}
          onUpdateStatus={updateStatus}
          isUpdating={isUpdating}
        />
      ))}
      
      <div className="flex justify-center mt-4">
        <Button 
          variant="outline" 
          onClick={handleRetry} 
          className="flex items-center gap-2 px-6 py-2 rounded-full shadow-sm transition-all hover:shadow"
          disabled={isUpdating}
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>
    </div>
  );
}
