
import React, { useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MaintenanceStatusBadge } from "@/components/maintenance/MaintenanceStatusBadge";
import { ServiceProviderSelectionModal } from "./ServiceProviderSelectionModal";
import { MaintenanceRequest } from "@/types/maintenance";
import { formatDistanceToNow } from "date-fns";
import { TenantInfo } from "@/components/maintenance/request-item/TenantInfo";
import { ServiceProviderInfo } from "@/components/maintenance/request-item/ServiceProviderInfo";

type MaintenanceRequestCardProps = {
  request: MaintenanceRequest;
  userRole: "owner" | "tenant" | "service_provider";
  onUpdateStatus: (
    requestId: string, 
    newStatus: "accepted" | "completed", 
    serviceProviderId?: string
  ) => void;
  disabled?: boolean;
};

export function MaintenanceRequestCard({
  request,
  userRole,
  onUpdateStatus,
  disabled = false,
}: MaintenanceRequestCardProps) {
  const [showServiceProviderModal, setShowServiceProviderModal] = useState(false);

  const timeAgo = formatDistanceToNow(new Date(request.created_at), {
    addSuffix: true,
    includeSeconds: true,
  });

  const handleAcceptRequest = () => {
    // For owner role, we need to open the service provider selection modal first
    if (userRole === "owner") {
      setShowServiceProviderModal(true);
    } else {
      // For service provider role, we can directly update the status
      onUpdateStatus(request.id, "accepted");
    }
  };

  const handleServiceProviderSelect = (serviceProviderId: string) => {
    onUpdateStatus(request.id, "accepted", serviceProviderId);
    setShowServiceProviderModal(false);
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="font-semibold text-lg">{request.title}</h3>
            <p className="text-sm text-gray-500">
              {request.property.name} • {timeAgo}
            </p>
          </div>
          <MaintenanceStatusBadge status={request.status} />
        </div>

        {/* Content */}
        <div className="mb-4">
          {userRole === "owner" && <TenantInfo tenant={request.tenant} />}
          <p className="text-sm">{request.description}</p>
          
          {/* Show Service Provider info for owner view */}
          {userRole === "owner" && <ServiceProviderInfo serviceProvider={request.assigned_service_provider} />}
        </div>
      </CardContent>
      
      <CardFooter className="border-t bg-gray-50 p-3">
        <div className="flex justify-end gap-2 w-full">
          {request.status === "pending" && (
            <Button
              onClick={handleAcceptRequest}
              variant="outline"
              size="sm"
              disabled={disabled}
            >
              Mark In Progress
            </Button>
          )}
          
          {request.status === "accepted" && (
            <Button
              onClick={() => onUpdateStatus(request.id, "completed")}
              variant="outline" 
              size="sm"
              disabled={disabled}
            >
              Mark Completed
            </Button>
          )}
        </div>
      </CardFooter>

      {showServiceProviderModal && (
        <ServiceProviderSelectionModal
          isOpen={showServiceProviderModal}
          onClose={() => setShowServiceProviderModal(false)}
          onSelect={handleServiceProviderSelect}
          propertyId={request.property.id}
        />
      )}
    </Card>
  );
}
