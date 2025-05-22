
import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CircleDollarSign, Building, Calendar } from "lucide-react";
import { useRentReminderInstances } from "@/hooks/rent/useRentReminderInstances";
import { RentPaymentList } from "@/components/rent/RentPaymentList";
import { useRentReminders } from "@/hooks/rent/useRentReminders";
import { RentOverviewSection } from "@/components/rent/RentOverviewSection";
import { PropertyRentSetupSection } from "@/components/rent/PropertyRentSetupSection";

export default function OwnerRent() {
  const [activeTab, setActiveTab] = useState("overview");
  const { user } = useAuth();
  const { rentInstances, isLoading: isLoadingInstances } = useRentReminderInstances(user);
  const { rentReminders, isLoading: isLoadingReminders } = useRentReminders(user);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Rent Management</h1>
            <p className="text-muted-foreground">
              Manage rent payments and reminders for all your properties
            </p>
          </div>
        </div>

        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 md:grid-cols-3 w-full md:w-auto">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <CircleDollarSign className="h-4 w-4" />
              <span>Overview</span>
            </TabsTrigger>
            <TabsTrigger value="properties" className="flex items-center gap-2">
              <Building className="h-4 w-4" />
              <span>Properties</span>
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>Calendar</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <RentOverviewSection 
              rentInstances={rentInstances} 
              isLoading={isLoadingInstances}
            />
            <Card>
              <CardHeader>
                <CardTitle>All Rent Payments</CardTitle>
              </CardHeader>
              <CardContent>
                <RentPaymentList />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="properties" className="space-y-6">
            <PropertyRentSetupSection 
              rentReminders={rentReminders} 
              isLoading={isLoadingReminders}
            />
          </TabsContent>

          <TabsContent value="calendar" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Rent Calendar</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-center text-muted-foreground py-8">
                  Rent payment calendar view will be implemented soon.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
