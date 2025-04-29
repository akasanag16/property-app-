
import { formatDate } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Clock } from "lucide-react";
import { MaintenanceStatusBadge } from "@/components/maintenance/MaintenanceStatusBadge";
import { MaintenanceRequest } from "@/types/maintenance";

type MaintenanceRequestCardProps = {
  request: MaintenanceRequest;
  userRole: "owner" | "tenant" | "service_provider";
  onUpdateStatus: (requestId: string, newStatus: "accepted" | "completed") => void;
};

export function MaintenanceRequestCard({ request, userRole, onUpdateStatus }: MaintenanceRequestCardProps) {
  // Determine what information to display based on user role
  const showTenantInfo = userRole === "owner" && request.tenant;
  const showServiceProviderInfo = request.assigned_service_provider;
  
  // Determine which action buttons to show based on role and status
  const canMarkInProgress = userRole === "owner" && request.status === "pending";
  const canMarkCompleted = userRole === "owner" && request.status === "accepted";
  const canServiceProviderAccept = userRole === "service_provider" && request.status === "pending";
  const canServiceProviderComplete = userRole === "service_provider" && request.status === "accepted";

  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{request.title}</CardTitle>
            <CardDescription>
              {request.property?.name || "Unknown property"} • Reported: {formatDate(request.created_at)}
            </CardDescription>
          </div>
          <MaintenanceStatusBadge status={request.status} />
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-700 mb-4">{request.description}</p>
        
        {showTenantInfo && (
          <div className="bg-gray-50 p-3 rounded-md mb-4">
            <h4 className="font-medium text-sm mb-2">Tenant Information</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-gray-500">Name: </span>
                <span>{request.tenant?.first_name} {request.tenant?.last_name}</span>
              </div>
              {request.tenant?.email && (
                <div>
                  <span className="text-gray-500">Email: </span>
                  <span>{request.tenant.email}</span>
                </div>
              )}
              {request.tenant?.phone && (
                <div>
                  <span className="text-gray-500">Phone: </span>
                  <span>{request.tenant.phone}</span>
                </div>
              )}
            </div>
          </div>
        )}
        
        {showServiceProviderInfo && (
          <div className="bg-blue-50 p-3 rounded-md mb-4">
            <h4 className="font-medium text-sm mb-2">Assigned Service Provider</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-gray-500">Name: </span>
                <span>
                  {request.assigned_service_provider?.first_name} {request.assigned_service_provider?.last_name}
                </span>
              </div>
              {request.assigned_service_provider?.phone && (
                <div>
                  <span className="text-gray-500">Contact: </span>
                  <span>{request.assigned_service_provider.phone}</span>
                </div>
              )}
            </div>
          </div>
        )}
        
        {!showServiceProviderInfo && userRole === "owner" && (
          <div className="text-sm text-amber-700 mb-4">
            No service provider assigned yet.
          </div>
        )}
        
        <div className="flex justify-end space-x-2">
          {canMarkInProgress && (
            <Button 
              onClick={() => onUpdateStatus(request.id, "accepted")}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Clock className="h-4 w-4 mr-1" />
              Mark In Progress
            </Button>
          )}
          
          {canMarkCompleted && (
            <Button 
              onClick={() => onUpdateStatus(request.id, "completed")}
              size="sm"
              className="bg-green-600 hover:bg-green-700"
            >
              <Check className="h-4 w-4 mr-1" />
              Mark as Completed
            </Button>
          )}
          
          {canServiceProviderAccept && (
            <Button 
              onClick={() => onUpdateStatus(request.id, "accepted")}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Clock className="h-4 w-4 mr-1" />
              Accept Request
            </Button>
          )}
          
          {canServiceProviderComplete && (
            <Button 
              onClick={() => onUpdateStatus(request.id, "completed")}
              size="sm"
              className="bg-green-600 hover:bg-green-700"
            >
              <Check className="h-4 w-4 mr-1" />
              Mark as Completed
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
