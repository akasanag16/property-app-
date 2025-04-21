
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Home, DollarSign, Bed, Bath, SquareDot, MapPin } from "lucide-react";
import type { Property } from "@/hooks/useProperties";
import { InvitationsList } from "@/components/invitations/InvitationsList";
import { InviteForm } from "@/components/invitations/InviteForm";
import { useState } from "react";

type PropertyDetailsModalProps = {
  property: Property;
  onClose: () => void;
};

export function PropertyDetailsModal({ property, onClose }: PropertyDetailsModalProps) {
  const [activeTab, setActiveTab] = useState("details");
  const [inviteRefreshKey, setInviteRefreshKey] = useState(0);

  const handleInviteSuccess = () => {
    // Force refresh invitations list when new invite is created
    setInviteRefreshKey(prev => prev + 1);
    
    // Switch to the appropriate tab based on the last invite type
    const inviteForm = document.querySelector('form') as HTMLFormElement;
    const inviteTypeSelect = inviteForm?.querySelector('[id="inviteType"]') as HTMLElement;
    const selectedValue = inviteTypeSelect?.getAttribute('data-value') || 'tenant';
    
    if (selectedValue === 'tenant') {
      setActiveTab('tenants');
    } else {
      setActiveTab('service-providers');
    }
  };

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-purple-800">{property.name}</DialogTitle>
          <DialogDescription className="text-gray-600 flex items-center">
            <MapPin className="h-4 w-4 mr-1" />
            {property.address}
          </DialogDescription>
        </DialogHeader>

        <div>
          <div className="mb-6">
            {property.image_url ? (
              <img 
                src={property.image_url} 
                alt={property.name} 
                className="w-full h-60 object-cover rounded-md"
              />
            ) : (
              <div className="w-full h-60 bg-gray-200 flex items-center justify-center rounded-md">
                <Home className="h-16 w-16 text-gray-400" />
              </div>
            )}
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-purple-50">
              <TabsTrigger value="details" className="data-[state=active]:bg-white data-[state=active]:text-purple-700">
                Property Details
              </TabsTrigger>
              <TabsTrigger value="tenants" className="data-[state=active]:bg-white data-[state=active]:text-purple-700">
                Tenants
              </TabsTrigger>
              <TabsTrigger value="service-providers" className="data-[state=active]:bg-white data-[state=active]:text-purple-700">
                Service Providers
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="details" className="pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {property.details?.type && (
                  <div className="flex items-center p-3 border rounded-md">
                    <Home className="h-5 w-5 mr-3 text-purple-600" />
                    <div>
                      <p className="text-sm text-gray-500">Property Type</p>
                      <p className="font-medium capitalize">{property.details.type}</p>
                    </div>
                  </div>
                )}
                
                {property.details?.rent !== undefined && (
                  <div className="flex items-center p-3 border rounded-md">
                    <DollarSign className="h-5 w-5 mr-3 text-purple-600" />
                    <div>
                      <p className="text-sm text-gray-500">Monthly Rent</p>
                      <p className="font-medium">${property.details.rent}/month</p>
                    </div>
                  </div>
                )}
                
                {property.details?.bedrooms !== undefined && (
                  <div className="flex items-center p-3 border rounded-md">
                    <Bed className="h-5 w-5 mr-3 text-purple-600" />
                    <div>
                      <p className="text-sm text-gray-500">Bedrooms</p>
                      <p className="font-medium">{property.details.bedrooms}</p>
                    </div>
                  </div>
                )}
                
                {property.details?.bathrooms !== undefined && (
                  <div className="flex items-center p-3 border rounded-md">
                    <Bath className="h-5 w-5 mr-3 text-purple-600" />
                    <div>
                      <p className="text-sm text-gray-500">Bathrooms</p>
                      <p className="font-medium">{property.details.bathrooms}</p>
                    </div>
                  </div>
                )}
                
                {property.details?.area !== undefined && (
                  <div className="flex items-center p-3 border rounded-md">
                    <SquareDot className="h-5 w-5 mr-3 text-purple-600" />
                    <div>
                      <p className="text-sm text-gray-500">Area</p>
                      <p className="font-medium">{property.details.area} sq ft</p>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="tenants" className="pt-4 space-y-4">
              <h3 className="text-lg font-medium mb-2">Invite Tenant</h3>
              <InviteForm 
                propertyId={property.id} 
                onInviteSuccess={handleInviteSuccess}
              />
              
              <h3 className="text-lg font-medium mb-2 mt-6">Tenant Invitations</h3>
              <InvitationsList 
                key={`tenant-${inviteRefreshKey}`}
                propertyId={property.id} 
                type="tenant"
              />
            </TabsContent>
            
            <TabsContent value="service-providers" className="pt-4 space-y-4">
              <h3 className="text-lg font-medium mb-2">Invite Service Provider</h3>
              <InviteForm 
                propertyId={property.id} 
                onInviteSuccess={handleInviteSuccess}
              />
              
              <h3 className="text-lg font-medium mb-2 mt-6">Service Provider Invitations</h3>
              <InvitationsList 
                key={`sp-${inviteRefreshKey}`}
                propertyId={property.id} 
                type="service_provider"
              />
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
