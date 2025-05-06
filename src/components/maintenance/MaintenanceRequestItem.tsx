
import { Button } from "@/components/ui/button";
import { Check, Clock } from "lucide-react";
import { MaintenanceStatusBadge } from "./MaintenanceStatusBadge";
import { MaintenanceRequest } from "@/types/maintenance";
import { formatDate } from "@/lib/utils";

type MaintenanceRequestItemProps = {
  request: MaintenanceRequest;
  userRole: "owner" | "tenant" | "service_provider";
  onUpdateStatus: (requestId: string, newStatus: "accepted" | "completed") => void;
};

export function MaintenanceRequestItem({ request, userRole, onUpdateStatus }: MaintenanceRequestItemProps) {
  if (!request) {
    console.error("Null request object passed to MaintenanceRequestItem");
    return null;
  }

  return (
    <div className="bg-white rounded-lg border p-4 shadow-sm">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-medium text-lg">{request.title || "Untitled Request"}</h3>
        <MaintenanceStatusBadge status={request.status || "pending"} />
      </div>
      
      <div className="text-sm text-gray-500 mb-2">
        <span>Property: {request.property?.name || "Unknown Property"}</span>
        <span className="mx-2">•</span>
        <span>Reported: {request.created_at ? formatDate(request.created_at) : "Unknown Date"}</span>
      </div>
      
      {userRole === "owner" && request.tenant && (
        <div className="text-sm text-gray-500 mb-3">
          <span>Tenant: {request.tenant.first_name || "Unknown"} {request.tenant.last_name || "Tenant"}</span>
        </div>
      )}
      
      <p className="text-gray-700 mb-4">{request.description || "No description provided."}</p>
      
      {request.assigned_service_provider && (
        <div className="text-sm text-gray-600 mb-3">
          <span className="font-medium">Assigned to: </span>
          {request.assigned_service_provider.first_name || "Unknown"} {request.assigned_service_provider.last_name || "Provider"}
        </div>
      )}
      
      {userRole === "service_provider" && request.status === "pending" && (
        <Button 
          onClick={() => onUpdateStatus(request.id, "accepted")}
          size="sm"
          className="mr-2"
        >
          <Clock className="h-4 w-4 mr-1" />
          Accept Request
        </Button>
      )}
      
      {userRole === "service_provider" && request.status === "accepted" && (
        <Button 
          onClick={() => onUpdateStatus(request.id, "completed")}
          size="sm"
          className="mr-2"
        >
          <Check className="h-4 w-4 mr-1" />
          Mark as Completed
        </Button>
      )}
    </div>
  );
}
