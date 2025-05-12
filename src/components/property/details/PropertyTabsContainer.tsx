
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Home, Users, Wrench } from "lucide-react";
import { Property } from "@/types/property";
import { PropertyDetailsTab } from "./PropertyDetailsTab";
import { TenantsTab } from "./TenantsTab";
import { ServicesTab } from "./ServicesTab";

interface PropertyTabsContainerProps {
  property: Property | null;
  onInviteClick: () => void;
}

export function PropertyTabsContainer({ property, onInviteClick }: PropertyTabsContainerProps) {
  return (
    <Tabs defaultValue="details" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="details" className="flex items-center gap-2">
          <Home className="h-4 w-4" />
          <span>Property Details</span>
        </TabsTrigger>
        <TabsTrigger value="tenants" className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          <span>Tenants</span>
        </TabsTrigger>
        <TabsTrigger value="services" className="flex items-center gap-2">
          <Wrench className="h-4 w-4" />
          <span>Services</span>
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="details">
        <PropertyDetailsTab property={property} />
      </TabsContent>
      
      <TabsContent value="tenants">
        <TenantsTab onInviteClick={onInviteClick} />
      </TabsContent>
      
      <TabsContent value="services">
        <ServicesTab onInviteClick={onInviteClick} />
      </TabsContent>
    </Tabs>
  );
}
