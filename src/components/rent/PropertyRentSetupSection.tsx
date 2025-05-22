
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { RentReminder } from "@/types/rent";
import { useProperties } from "@/hooks/useProperties";
import { useAuth } from "@/contexts/AuthContext";
import { Property } from "@/types/property";
import { Input } from "@/components/ui/input";
import { RentReminderForm } from "@/components/rent/RentReminderForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface PropertyRentSetupSectionProps {
  rentReminders: RentReminder[] | undefined;
  isLoading: boolean;
}

export function PropertyRentSetupSection({ rentReminders, isLoading }: PropertyRentSetupSectionProps) {
  const { user } = useAuth();
  const { properties, loading: propertiesLoading } = useProperties(user?.id);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Get a map of properties with reminders
  const propertiesWithReminders = new Map<string, RentReminder>();
  rentReminders?.forEach(reminder => {
    propertiesWithReminders.set(reminder.property_id, reminder);
  });
  
  // Filter properties by search term
  const filteredProperties = properties?.filter(property => 
    property.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    property.address.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const handleSetupRent = (property: Property) => {
    setSelectedPropertyId(property.id);
    setIsModalOpen(true);
  };
  
  const handleModalClose = () => {
    setIsModalOpen(false);
  };
  
  if (isLoading || propertiesLoading) {
    return (
      <div className="flex justify-center p-8">
        <LoadingSpinner className="h-8 w-8" />
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Property Rent Settings</h2>
        <Input
          className="max-w-xs"
          placeholder="Search properties..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        {filteredProperties?.map((property) => {
          const hasRentSetup = propertiesWithReminders.has(property.id);
          const rentReminder = propertiesWithReminders.get(property.id);
          
          return (
            <Card key={property.id} className={hasRentSetup ? "border-green-100" : ""}>
              <CardHeader className="flex flex-row items-start gap-4 pb-2">
                <div className="bg-blue-100 p-2 rounded-md">
                  <Building className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-lg">{property.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{property.address}</p>
                </div>
              </CardHeader>
              
              <CardContent>
                {hasRentSetup ? (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Monthly rent:</span>
                      <span className="font-medium">${rentReminder?.amount}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Due date:</span>
                      <span className="font-medium">Day {rentReminder?.reminder_day} of each month</span>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="w-full mt-2"
                      onClick={() => handleSetupRent(property)}
                    >
                      Edit rent settings
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-muted-foreground mb-3">No rent settings configured</p>
                    <Button 
                      variant="outline" 
                      className="flex items-center gap-1"
                      onClick={() => handleSetupRent(property)}
                    >
                      <Plus className="h-4 w-4" />
                      Setup rent reminder
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      {/* Rent setup modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {selectedPropertyId && propertiesWithReminders.has(selectedPropertyId)
                ? "Edit Rent Settings"
                : "Setup Rent Reminder"
              }
            </DialogTitle>
          </DialogHeader>
          
          {selectedPropertyId && (
            <RentReminderForm
              propertyId={selectedPropertyId}
              propertyName={properties?.find(p => p.id === selectedPropertyId)?.name || ""}
              onSuccess={handleModalClose}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
