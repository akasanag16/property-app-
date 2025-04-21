
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
import { AlertCircle } from "lucide-react";
import { toast } from "sonner";

type PropertyCardProps = {
  id: string;
  name: string;
  address: string;
};

export function PropertyCard({ id, name, address }: PropertyCardProps) {
  const [inviteRefreshKey, setInviteRefreshKey] = useState(0);
  const [activeTab, setActiveTab] = useState("invite");
  const [error, setError] = useState(false);

  const handleInviteSuccess = () => {
    // Force refresh invitations list when new invite is created
    setInviteRefreshKey(prev => prev + 1);
    toast.success("Invitation sent successfully!");
    
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

  const handleError = () => {
    setError(true);
    toast.error("Error loading invitations. Please try again later.");
  };

  return (
    <Card className="w-full shadow-lg border-purple-100 hover:border-purple-200 transition-all duration-300">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-fuchsia-50 rounded-t-lg">
        <CardTitle>{name}</CardTitle>
        <CardDescription>{address}</CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-purple-50">
            <TabsTrigger value="invite" className="data-[state=active]:bg-white data-[state=active]:text-purple-700">Invite</TabsTrigger>
            <TabsTrigger value="tenants" className="data-[state=active]:bg-white data-[state=active]:text-purple-700">Tenants</TabsTrigger>
            <TabsTrigger value="service-providers" className="data-[state=active]:bg-white data-[state=active]:text-purple-700">Service Providers</TabsTrigger>
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
              onError={handleError}
            />
          </TabsContent>
          
          <TabsContent value="service-providers" className="pt-4">
            <InvitationsList 
              key={`sp-${inviteRefreshKey}`}
              propertyId={id} 
              type="service_provider"
              onError={handleError}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
