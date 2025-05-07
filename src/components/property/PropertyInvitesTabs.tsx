
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InviteForm } from "@/components/invitations/InviteForm";
import { ServiceProviderInviteForm } from "@/components/invitations/ServiceProviderInviteForm";
import { InvitationsList } from "@/components/invitations/InvitationsList";

type PropertyInvitesTabsProps = {
  propertyId: string;
  onClose: () => void;
};

export function PropertyInvitesTabs({ propertyId, onClose }: PropertyInvitesTabsProps) {
  const [activeTab, setActiveTab] = useState("tenants");
  const [refreshTenantKey, setRefreshTenantKey] = useState(0);
  const [refreshServiceProviderKey, setRefreshServiceProviderKey] = useState(0);

  const handleTenantInviteSuccess = () => {
    setRefreshTenantKey(prev => prev + 1);
  };

  const handleServiceProviderInviteSuccess = () => {
    setRefreshServiceProviderKey(prev => prev + 1);
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-2 mb-6">
        <TabsTrigger value="tenants">Invite Tenants</TabsTrigger>
        <TabsTrigger value="service-providers">Invite Service Providers</TabsTrigger>
      </TabsList>
      
      <TabsContent value="tenants" className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Send Invitation</h3>
            <InviteForm 
              propertyId={propertyId}
              onInviteSuccess={handleTenantInviteSuccess}
            />
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Pending Invitations</h3>
            <InvitationsList 
              propertyId={propertyId}
              type="tenant"
              refreshKey={refreshTenantKey}
            />
          </div>
        </div>
      </TabsContent>
      
      <TabsContent value="service-providers" className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Send Service Provider Invitation</h3>
            <ServiceProviderInviteForm 
              propertyId={propertyId}
              onInviteSuccess={handleServiceProviderInviteSuccess}
            />
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Pending Service Provider Invitations</h3>
            <InvitationsList 
              propertyId={propertyId}
              type="service_provider"
              refreshKey={refreshServiceProviderKey}
            />
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
}
