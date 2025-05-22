
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Property } from "@/types/property";
import { PropertyDetailsTab } from "./PropertyDetailsTab";
import { TenantsTab } from "./TenantsTab";
import { ServicesTab } from "./ServicesTab";
import { RentTab } from "./RentTab"; // Import the new RentTab

interface PropertyTabsContainerProps {
  property: Property | null;
  onInviteClick: () => void;
}

export function PropertyTabsContainer({ property, onInviteClick }: PropertyTabsContainerProps) {
  return (
    <Tabs defaultValue="details">
      <TabsList className="mb-4">
        <TabsTrigger value="details">Details</TabsTrigger>
        <TabsTrigger value="tenants">Tenants</TabsTrigger>
        <TabsTrigger value="services">Services</TabsTrigger>
        <TabsTrigger value="rent">Rent</TabsTrigger> {/* Add new tab trigger */}
      </TabsList>
      
      <TabsContent value="details">
        <PropertyDetailsTab property={property} />
      </TabsContent>
      
      <TabsContent value="tenants">
        <TenantsTab property={property} onInviteClick={onInviteClick} />
      </TabsContent>
      
      <TabsContent value="services">
        <ServicesTab property={property} onInviteClick={onInviteClick} />
      </TabsContent>
      
      <TabsContent value="rent">
        <RentTab property={property} /> {/* Add new tab content */}
      </TabsContent>
    </Tabs>
  );
}
