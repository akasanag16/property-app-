
import { useState } from "react";
import { usePropertyServiceProviders } from "@/hooks/services/usePropertyServiceProviders";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ServiceProvider } from "@/hooks/services/useOwnerServiceProviders";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ErrorAlert } from "@/components/ui/alert-error";

type ServiceProviderSelectionModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (serviceProviderId: string) => void;
  propertyId: string;
};

export function ServiceProviderSelectionModal({
  isOpen,
  onClose,
  onSelect,
  propertyId
}: ServiceProviderSelectionModalProps) {
  const { serviceProviders, loading, error } = usePropertyServiceProviders(propertyId);
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);

  const handleSelect = () => {
    if (selectedProvider) {
      console.log("Selected service provider:", selectedProvider);
      onSelect(selectedProvider);
    }
  };

  // Debug log
  console.log("Modal property ID:", propertyId);
  console.log("Service providers:", serviceProviders);
  console.log("Loading state:", loading);
  console.log("Error state:", error);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Assign Service Provider</DialogTitle>
        </DialogHeader>
        
        {loading && <LoadingSpinner />}
        
        {error && <ErrorAlert message={error} />}
        
        {!loading && !error && (
          serviceProviders.length === 0 ? (
            <div className="py-4">
              <p className="text-center text-gray-500">
                No service providers available for this property.
              </p>
              <p className="text-center text-sm mt-2">
                Please assign service providers to this property first.
              </p>
            </div>
          ) : (
            <div className="py-4 space-y-4">
              <p className="text-sm text-gray-500">
                Select a service provider to assign to this maintenance request:
              </p>
              <div className="space-y-2">
                {serviceProviders.map((provider) => (
                  <div 
                    key={provider.id}
                    className={`p-3 border rounded-md cursor-pointer hover:bg-gray-50 ${
                      selectedProvider === provider.id ? 'border-primary bg-primary/5' : ''
                    }`}
                    onClick={() => setSelectedProvider(provider.id)}
                  >
                    <div className="font-medium">{provider.name}</div>
                    {provider.email && <div className="text-sm text-gray-500">{provider.email}</div>}
                  </div>
                ))}
              </div>
            </div>
          )
        )}
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button 
            onClick={handleSelect} 
            disabled={!selectedProvider || loading}
          >
            Assign Provider
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
