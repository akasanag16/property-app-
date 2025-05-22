
import React, { useState } from 'react';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { ServiceProviderSelectionModal } from '../owner/maintenance/ServiceProviderSelectionModal';
import { MaintenanceRequest } from '@/types/maintenance';
import { toast } from "sonner";
import { RequestHeader } from './request-item/RequestHeader';
import { RequestContent } from './request-item/RequestContent';
import { ActionButtons } from './request-item/ActionButtons';

type MaintenanceRequestItemProps = {
  request: MaintenanceRequest;
  userRole: "owner" | "tenant" | "service_provider";
  onUpdateStatus: (
    requestId: string, 
    newStatus: "accepted" | "completed",
    serviceProviderId?: string
  ) => void;
  isUpdating?: boolean;
};

export function MaintenanceRequestItem({
  request,
  userRole,
  onUpdateStatus,
  isUpdating = false
}: MaintenanceRequestItemProps) {
  const [showServiceProviderModal, setShowServiceProviderModal] = useState(false);

  const handleAcceptRequest = () => {
    if (userRole === "owner") {
      // For owner role, verify we have a valid property ID before opening the modal
      if (!request.property?.id) {
        console.error("Missing property ID for request:", request.id);
        toast.error("Cannot process request: missing property information");
        return;
      }
      console.log("Opening service provider modal for property:", request.property.id);
      setShowServiceProviderModal(true);
    } else {
      onUpdateStatus(request.id, "accepted");
    }
  };

  const handleServiceProviderSelect = (serviceProviderId: string) => {
    console.log(`Selected service provider ${serviceProviderId} for request ${request.id}`);
    onUpdateStatus(request.id, "accepted", serviceProviderId);
    setShowServiceProviderModal(false);
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <RequestHeader 
          title={request.title}
          propertyName={request.property?.name || ""}
          createdAt={request.created_at}
          status={request.status}
        />

        <div className="mb-4">
          <RequestContent
            userRole={userRole}
            description={request.description}
            tenant={request.tenant}
            serviceProvider={request.assigned_service_provider}
          />
        </div>
      </CardContent>
      
      <CardFooter className="border-t bg-gray-50 p-3">
        <ActionButtons
          status={request.status}
          userRole={userRole}
          onAccept={handleAcceptRequest}
          onComplete={() => onUpdateStatus(request.id, "completed")}
          disabled={isUpdating}
        />
      </CardFooter>

      {showServiceProviderModal && request.property && (
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
