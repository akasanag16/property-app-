
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { InviteForm } from "@/components/invitations/InviteForm";
import { InvitationsList } from "@/components/invitations/InvitationsList";

type PropertyCardProps = {
  id: string;
  name: string;
  address: string;
};

export function PropertyCard({ id, name, address }: PropertyCardProps) {
  const [inviteRefreshKey, setInviteRefreshKey] = useState(0);
  const [activeTab, setActiveTab] = useState("invite");

  const handleInviteSuccess = () => {
    // Force refresh invitations list when new invite is created
    setInviteRefreshKey(prev => prev + 1);
    
    // Switch to the appropriate tab based on the last invite type
    const inviteForm = document.querySelector('form') as HTMLFormElement;
    const inviteTypeSelect = inviteForm?.querySelector('[id^="radix-"][role="combobox"]') as HTMLElement;
    const selectedValue = inviteTypeSelect?.getAttribute('data-value') || 'tenant';
    
    if (selectedValue === 'tenant') {
      setActiveTab('tenants');
    } else {
      setActiveTab('service-providers');
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{name}</CardTitle>
        <CardDescription>{address}</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="invite">Invite</TabsTrigger>
            <TabsTrigger value="tenants">Tenants</TabsTrigger>
            <TabsTrigger value="service-providers">Service Providers</TabsTrigger>
          </TabsList>
          
          <TabsContent value="invite" className="pt-4">
            <InviteForm 
              propertyId={id} 
              onInviteSuccess={handleInviteSuccess}
            />
          </TabsContent>
          
          <TabsContent value="tenants" className="pt-4">
            <InvitationsList 
              key={`tenant-${inviteRefreshKey}`}
              propertyId={id} 
              type="tenant" 
            />
          </TabsContent>
          
          <TabsContent value="service-providers" className="pt-4">
            <InvitationsList 
              key={`sp-${inviteRefreshKey}`}
              propertyId={id} 
              type="service_provider" 
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
