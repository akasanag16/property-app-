
import { MaintenanceRequestCard } from "./MaintenanceRequestCard";
import { MaintenanceRequest } from "@/types/maintenance";

type MaintenanceRequestsListProps = {
  requests: MaintenanceRequest[];
  onUpdateStatus: (
    requestId: string, 
    newStatus: "accepted" | "completed", 
    serviceProviderId?: string
  ) => void;
};

export function MaintenanceRequestsList({ requests, onUpdateStatus }: MaintenanceRequestsListProps) {
  if (requests.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border">
        <p className="text-gray-500">No maintenance requests found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {requests.map((request) => (
        <MaintenanceRequestCard 
          key={request.id} 
          request={request} 
          userRole="owner"
          onUpdateStatus={onUpdateStatus} 
        />
      ))}
    </div>
  );
}
