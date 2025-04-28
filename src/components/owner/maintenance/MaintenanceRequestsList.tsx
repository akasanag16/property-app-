
import { MaintenanceRequestCard } from "./MaintenanceRequestCard";

type MaintenanceRequest = {
  id: string;
  title: string;
  description: string;
  status: string;
  created_at: string;
  tenant: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
  };
  property: {
    id: string;
    name: string;
    address: string;
  };
  assigned_service_provider: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
  } | null;
};

type MaintenanceRequestsListProps = {
  requests: MaintenanceRequest[];
  onUpdateStatus: (requestId: string, newStatus: "accepted" | "completed") => void;
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
          onUpdateStatus={onUpdateStatus} 
        />
      ))}
    </div>
  );
}
