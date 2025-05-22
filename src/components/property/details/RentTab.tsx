
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RentReminderForm } from "@/components/rent/RentReminderForm";
import { RentPaymentList } from "@/components/rent/RentPaymentList";
import { RentStatus } from "@/components/rent/RentStatus";
import { Property } from "@/types/property";

interface RentTabProps {
  property: Property | null;
}

export function RentTab({ property }: RentTabProps) {
  if (!property) return null;
  
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Rent Management</h3>
      
      <RentStatus propertyId={property.id} />
      
      <Tabs defaultValue="payments">
        <TabsList>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="payments" className="mt-4">
          <RentPaymentList propertyId={property.id} />
        </TabsContent>
        
        <TabsContent value="settings" className="mt-4">
          <RentReminderForm 
            propertyId={property.id} 
            propertyName={property.name} 
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
