
import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { MaintenanceRequest } from '@/types/maintenance';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { ServiceProviderSelectionModal } from '../owner/maintenance/ServiceProviderSelectionModal';

type MaintenanceRequestCardProps = {
  request: MaintenanceRequest;
  userRole: "owner" | "tenant" | "service_provider";
  onUpdateStatus: (
    requestId: string,
    newStatus: "accepted" | "completed",
    serviceProviderId?: string
  ) => void;
  isUpdating?: boolean;
};

export function MaintenanceRequestCard({
  request,
  userRole,
  onUpdateStatus,
  isUpdating = false
}: MaintenanceRequestCardProps) {
  const [showServiceProviderModal, setShowServiceProviderModal] = React.useState(false);

  const handleAcceptRequest = () => {
    if (userRole === "owner") {
      if (!request.property?.id) {
        console.error("Missing property ID for request:", request.id);
        return;
      }
      setShowServiceProviderModal(true);
    } else {
      onUpdateStatus(request.id, "accepted");
    }
  };

  const handleServiceProviderSelect = (serviceProviderId: string) => {
    onUpdateStatus(request.id, "accepted", serviceProviderId);
    setShowServiceProviderModal(false);
  };

  const getTimeAgo = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (error) {
      return "Unknown time";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="overflow-hidden hover:shadow-md transition-shadow duration-300">
        <div className="p-6 space-y-4">
          {/* Header */}
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold">{request.title}</h3>
              <div className="flex items-center gap-1 text-sm text-gray-500">
                {request.tenant && (
                  <span>{request.tenant.first_name || ''} {request.tenant.last_name || ''} • </span>
                )}
                <span>{getTimeAgo(request.created_at)}</span>
              </div>
            </div>
            
            <div className={`px-3 py-1 text-xs rounded-full ${
              request.status === 'completed' ? 'bg-green-100 text-green-800' : 
              request.status === 'accepted' ? 'bg-blue-100 text-blue-800' : 
              'bg-yellow-100 text-yellow-800'
            }`}>
              {request.status === 'completed' ? 'Completed' : 
               request.status === 'accepted' ? 'In Progress' : 'Pending'}
            </div>
          </div>
          
          {/* Property */}
          <div className="text-sm font-medium">
            {request.property.name}
          </div>
          
          {/* Description */}
          <div className="text-gray-600 py-2 border-t border-b">
            {request.description}
          </div>
          
          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-2">
            {request.status === 'pending' && userRole === 'service_provider' && (
              <Button 
                variant="outline" 
                onClick={handleAcceptRequest} 
                disabled={isUpdating}
                className="text-blue-600 border-blue-200 hover:bg-blue-50"
              >
                <Clock className="mr-2 h-4 w-4" />
                Accept Request
              </Button>
            )}
            
            {request.status === 'pending' && userRole === 'owner' && (
              <Button 
                variant="outline" 
                onClick={handleAcceptRequest} 
                disabled={isUpdating}
                className="text-blue-600 border-blue-200 hover:bg-blue-50"
              >
                Assign Provider
              </Button>
            )}
            
            {request.status === 'accepted' && (userRole === 'owner' || userRole === 'service_provider') && (
              <Button 
                variant="outline" 
                onClick={() => onUpdateStatus(request.id, "completed")}
                disabled={isUpdating}
                className="text-green-600 border-green-200 hover:bg-green-50"
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Mark as Completed
              </Button>
            )}
          </div>
        </div>
      </Card>
      
      {showServiceProviderModal && request.property && (
        <ServiceProviderSelectionModal
          isOpen={showServiceProviderModal}
          onClose={() => setShowServiceProviderModal(false)}
          onSelect={handleServiceProviderSelect}
          propertyId={request.property.id}
        />
      )}
    </motion.div>
  );
}
