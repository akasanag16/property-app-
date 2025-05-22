
import { useState, useEffect } from "react";
import { MaintenanceRequestsListProps } from "@/types/maintenance";
import { Separator } from "@/components/ui/separator";
import { MaintenanceRequestCard } from "./MaintenanceRequestCard";
import { useMaintenanceRequests } from "@/hooks/useMaintenanceRequests";
import { useMaintenanceStatusUpdate } from "@/hooks/maintenance/useMaintenanceStatusUpdate";
import { useMaintenanceRequestSorting } from "@/hooks/maintenance/useMaintenanceRequestSorting";
import { MaintenanceListHeader } from "./list/MaintenanceListHeader";
import { MaintenanceLoadingState } from "./list/MaintenanceLoadingState";
import { MaintenanceErrorState } from "./list/MaintenanceErrorState";
import { MaintenanceEmptyState } from "./list/MaintenanceEmptyState";
import { MaintenanceListFooter } from "./list/MaintenanceListFooter";

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
  const { requests: originalRequests, loading, error, refetch } = useMaintenanceRequests(
    userRole, 
    localRefreshKey, 
    propertyId
  );
  
  const { sortedRequests, sortBy, setSortBy } = useMaintenanceRequestSorting(originalRequests);
  const { updateStatus, isUpdating } = useMaintenanceStatusUpdate(userRole, onRefreshNeeded);

  // Update local refresh key when parent refresh key changes
  useEffect(() => {
    setLocalRefreshKey(refreshKey);
  }, [refreshKey]);

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

  if (loading) {
    return <MaintenanceLoadingState />;
  }

  if (error) {
    console.error("Error in MaintenanceRequestsList:", error);
    return <MaintenanceErrorState error={error} onRetry={handleRetry} />;
  }

  if (!sortedRequests || sortedRequests.length === 0) {
    return <MaintenanceEmptyState onRefresh={handleRetry} />;
  }

  return (
    <div className="space-y-6">
      <MaintenanceListHeader 
        requestCount={sortedRequests.length} 
        sortBy={sortBy} 
        onSortChange={setSortBy}
      />
      
      <Separator />

      {sortedRequests.map((request) => (
        <MaintenanceRequestCard
          key={request.id}
          request={request}
          userRole={userRole}
          onUpdateStatus={updateStatus}
          isUpdating={isUpdating}
        />
      ))}
      
      <MaintenanceListFooter onRefresh={handleRetry} isUpdating={isUpdating} />
    </div>
  );
}
