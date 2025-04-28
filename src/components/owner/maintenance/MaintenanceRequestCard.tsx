
import { formatDate } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Clock } from "lucide-react";
import { MaintenanceStatusBadge } from "@/components/maintenance/MaintenanceStatusBadge";

type MaintenanceRequestCardProps = {
  request: {
    id: string;
    title: string;
    description: string;
    status: string;
    created_at: string;
    property: {
      name: string;
      address: string;
    };
    tenant: {
      first_name: string;
      last_name: string;
      email: string;
      phone: string;
    };
    assigned_service_provider: {
      first_name: string;
      last_name: string;
      email: string;
      phone: string;
    } | null;
  };
  onUpdateStatus: (requestId: string, newStatus: "accepted" | "completed") => void;
};

export function MaintenanceRequestCard({ request, onUpdateStatus }: MaintenanceRequestCardProps) {
  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{request.title}</CardTitle>
            <CardDescription>
              {request.property.name} • Reported: {formatDate(request.created_at)}
            </CardDescription>
          </div>
          <MaintenanceStatusBadge status={request.status} />
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-700 mb-4">{request.description}</p>
        
        <div className="bg-gray-50 p-3 rounded-md mb-4">
          <h4 className="font-medium text-sm mb-2">Tenant Information</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-gray-500">Name: </span>
              <span>{request.tenant.first_name} {request.tenant.last_name}</span>
            </div>
            <div>
              <span className="text-gray-500">Email: </span>
              <span>{request.tenant.email}</span>
            </div>
            <div>
              <span className="text-gray-500">Phone: </span>
              <span>{request.tenant.phone}</span>
            </div>
          </div>
        </div>
        
        {request.assigned_service_provider ? (
          <div className="bg-blue-50 p-3 rounded-md mb-4">
            <h4 className="font-medium text-sm mb-2">Assigned Service Provider</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-gray-500">Name: </span>
                <span>
                  {request.assigned_service_provider.first_name} {request.assigned_service_provider.last_name}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Contact: </span>
                <span>{request.assigned_service_provider.phone}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-sm text-amber-700 mb-4">
            No service provider assigned yet.
          </div>
        )}
        
        <div className="flex justify-end space-x-2">
          {request.status === "pending" && (
            <Button 
              onClick={() => onUpdateStatus(request.id, "accepted")}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Clock className="h-4 w-4 mr-1" />
              Mark In Progress
            </Button>
          )}
          
          {request.status === "accepted" && (
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
