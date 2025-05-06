
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

  // Safely extract values with fallbacks to prevent null/undefined errors
  const title = request.title || "Untitled Request";
  const status = request.status || "pending";
  const propertyName = request.property?.name || "Unknown Property";
  const description = request.description || "No description provided.";
  const createdDate = request.created_at ? formatDate(request.created_at) : "Unknown Date";

  return (
    <div className="bg-white rounded-lg border p-4 shadow-sm">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-medium text-lg">{title}</h3>
        <MaintenanceStatusBadge status={status} />
      </div>
      
      <div className="text-sm text-gray-500 mb-2">
        <span>Property: {propertyName}</span>
        <span className="mx-2">•</span>
        <span>Reported: {createdDate}</span>
      </div>
      
      {userRole === "owner" && request.tenant && (
        <div className="text-sm text-gray-500 mb-3">
          <span>Tenant: {request.tenant.first_name || "Unknown"} {request.tenant.last_name || "Tenant"}</span>
        </div>
      )}
      
      <p className="text-gray-700 mb-4">{description}</p>
      
      {request.assigned_service_provider && (
        <div className="text-sm text-gray-600 mb-3">
          <span className="font-medium">Assigned to: </span>
          {request.assigned_service_provider.first_name || "Unknown"} {request.assigned_service_provider.last_name || "Provider"}
        </div>
      )}
      
      {userRole === "service_provider" && status === "pending" && (
        <Button 
          onClick={() => onUpdateStatus(request.id, "accepted")}
          size="sm"
          className="mr-2"
        >
          <Clock className="h-4 w-4 mr-1" />
          Accept Request
        </Button>
      )}
      
      {userRole === "service_provider" && status === "accepted" && (
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
