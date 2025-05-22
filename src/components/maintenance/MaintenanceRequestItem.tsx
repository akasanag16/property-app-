import React, { useState } from 'react';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MaintenanceStatusBadge } from './MaintenanceStatusBadge';
import { MaintenanceRequest } from '@/types/maintenance';
import { formatDistanceToNow } from 'date-fns';
import { ServiceProviderSelectionModal } from '../owner/maintenance/ServiceProviderSelectionModal';

type MaintenanceRequestItemProps = {
  request: MaintenanceRequest;
  userRole: "owner" | "tenant" | "service_provider";
  onUpdateStatus: (
    requestId: string, 
    newStatus: "accepted" | "completed",
    serviceProviderId?: string
  ) => void;
};

export function MaintenanceRequestItem({
  request,
  userRole,
  onUpdateStatus
}: MaintenanceRequestItemProps) {
  const [showServiceProviderModal, setShowServiceProviderModal] = useState(false);

  const timeAgo = formatDistanceToNow(new Date(request.created_at), {
    addSuffix: true,
    includeSeconds: true
  });

  const handleAcceptRequest = () => {
    if (userRole === "owner") {
      // For owner role, log the property ID and then open the service provider selection modal
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

  const renderActionButtons = () => {
    if (userRole === "tenant") {
      return null; // Tenants can't update status
    }

    return (
      <div className="flex justify-end gap-2 w-full">
        {request.status === "pending" && (
          <Button
            onClick={handleAcceptRequest}
            variant="outline"
            size="sm"
          >
            {userRole === "owner" ? "Mark In Progress" : "Accept Request"}
          </Button>
        )}
        
        {request.status === "accepted" && (
          <Button
            onClick={() => onUpdateStatus(request.id, "completed")}
            variant="outline" 
            size="sm"
          >
            Mark Completed
          </Button>
        )}
      </div>
    );
  };

  const renderOwnerView = () => {
    return (
      <>
        {request.tenant && (
          <div className="mb-3">
            <p className="text-sm font-medium">
              {request.tenant.first_name} {request.tenant.last_name}
            </p>
            {request.tenant.email && (
              <p className="text-xs text-gray-500">{request.tenant.email}</p>
            )}
          </div>
        )}
        
        <p className="text-sm">{request.description}</p>
        
        {/* Service provider info */}
        {request.assigned_service_provider ? (
          <div className="mt-3">
            <p className="text-sm font-medium">Service Provider:</p>
            <p className="text-sm">
              {request.assigned_service_provider.first_name} {request.assigned_service_provider.last_name}
            </p>
          </div>
        ) : (
          <p className="mt-3 text-sm text-gray-500">No service provider assigned yet</p>
        )}
      </>
    );
  };

  const renderTenantView = () => {
    return (
      <>
        <p className="text-sm">{request.description}</p>
        
        {request.assigned_service_provider && (
          <div className="mt-3">
            <p className="text-sm font-medium">Service Provider:</p>
            <p className="text-sm">
              {request.assigned_service_provider.first_name} {request.assigned_service_provider.last_name}
            </p>
          </div>
        )}
      </>
    );
  };

  const renderServiceProviderView = () => {
    return (
      <>
        {request.tenant && (
          <div className="mb-3">
            <p className="text-sm font-medium">Tenant:</p>
            <p className="text-sm">
              {request.tenant.first_name} {request.tenant.last_name}
            </p>
          </div>
        )}
        
        <p className="text-sm">{request.description}</p>
      </>
    );
  };

  const getContent = () => {
    switch (userRole) {
      case "owner": 
        return renderOwnerView();
      case "tenant": 
        return renderTenantView();
      case "service_provider": 
        return renderServiceProviderView();
      default:
        return <p className="text-sm">{request.description}</p>;
    }
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

        <div className="mb-4">
          {getContent()}
        </div>
      </CardContent>
      
      <CardFooter className="border-t bg-gray-50 p-3">
        <div className="flex justify-end gap-2 w-full">
          {request.status === "pending" && (
            <Button
              onClick={handleAcceptRequest}
              variant="outline"
              size="sm"
            >
              {userRole === "owner" ? "Mark In Progress" : "Accept Request"}
            </Button>
          )}
          
          {request.status === "accepted" && (
            <Button
              onClick={() => onUpdateStatus(request.id, "completed")}
              variant="outline" 
              size="sm"
            >
              Mark Completed
            </Button>
          )}
        </div>
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
