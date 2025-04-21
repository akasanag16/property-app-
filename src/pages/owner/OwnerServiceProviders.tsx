
import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Wrench,
  HomeIcon,
  Shirt,
  RefreshCw
} from "lucide-react";

// Sample service types
const serviceTypes = [
  {
    id: "1",
    name: "Home Cleaning",
    description: "Professional cleaning services for your properties",
    icon: HomeIcon,
    color: "text-blue-500",
    providers: 8
  },
  {
    id: "2",
    name: "Laundry Services",
    description: "Pickup and delivery laundry services for tenants",
    icon: Shirt,
    color: "text-green-500",
    providers: 5
  },
  {
    id: "3",
    name: "Plumbing",
    description: "Professional plumbing repair and maintenance",
    icon: Wrench,
    color: "text-orange-500",
    providers: 12
  },
  {
    id: "4",
    name: "Electrical",
    description: "Licensed electricians for all electrical needs",
    icon: Wrench,
    color: "text-yellow-500",
    providers: 9
  },
  {
    id: "5",
    name: "HVAC",
    description: "Heating, ventilation, and air conditioning services",
    icon: Wrench,
    color: "text-purple-500",
    providers: 7
  },
  {
    id: "6",
    name: "Gardening & Landscaping",
    description: "Lawn care and landscape maintenance",
    icon: HomeIcon,
    color: "text-green-600",
    providers: 6
  },
  {
    id: "7",
    name: "Furniture Assembly",
    description: "Professional furniture assembly services",
    icon: HomeIcon,
    color: "text-indigo-500",
    providers: 4
  },
  {
    id: "8",
    name: "Locksmith",
    description: "Emergency locksmith and security services",
    icon: HomeIcon,
    color: "text-gray-600",
    providers: 3
  }
];

export default function OwnerServiceProviders() {
  const [refreshKey, setRefreshKey] = useState(0);
  
  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    toast.success("Service provider list refreshed");
  };

  const handleViewProviders = (serviceName: string) => {
    toast.info(`Viewing ${serviceName} providers`);
    // In a real app, this would navigate to a detailed list of providers for this service
  };

  const handleAddToProperty = (serviceName: string) => {
    toast.success(`${serviceName} added to your properties`);
    // In a real app, this would open a modal to select which properties to add this service to
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Service Providers</h1>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
        
        <p className="text-gray-600">
          Browse and manage service providers for your properties. These services can be offered to your tenants.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {serviceTypes.map((service) => (
            <Card key={service.id} className="overflow-hidden transition-all duration-300 hover:shadow-md">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <service.icon className={`h-8 w-8 ${service.color}`} />
                  <span className="text-sm text-gray-500">{service.providers} providers</span>
                </div>
                <CardTitle className="mt-2">{service.name}</CardTitle>
                <CardDescription>{service.description}</CardDescription>
              </CardHeader>
              
              <CardContent className="text-sm text-gray-600">
                <ul className="list-disc list-inside space-y-1">
                  <li>Available for all your properties</li>
                  <li>Licensed and insured professionals</li>
                  <li>Tenant scheduling available</li>
                </ul>
              </CardContent>
              
              <CardFooter className="flex justify-between pt-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleViewProviders(service.name)}
                >
                  View Providers
                </Button>
                <Button 
                  size="sm"
                  onClick={() => handleAddToProperty(service.name)}
                >
                  Add to Property
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
