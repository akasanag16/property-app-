
import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
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

// Type for service providers
interface ServiceProvider {
  id: string;
  name: string;
  email?: string;
  properties: string[];
}

export default function OwnerServiceProviders() {
  const { user } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);
  const [serviceProviders, setServiceProviders] = useState<ServiceProvider[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch assigned service providers
  useEffect(() => {
    const fetchServiceProviders = async () => {
      if (!user?.id) return;
      
      try {
        setLoading(true);
        setError(null);
        console.log("Fetching service providers for owner:", user.id);
        
        // First get owner properties
        const { data: properties, error: propertiesError } = await supabase
          .rpc('safe_get_owner_properties', { owner_id_param: user.id });
          
        if (propertiesError) {
          console.error("Error fetching owner properties:", propertiesError);
          throw propertiesError;
        }
        
        if (!properties || properties.length === 0) {
          console.log("No properties found for owner");
          setServiceProviders([]);
          return;
        }
        
        const propertyIds = properties.map(p => p.id);
        console.log("Owner property IDs:", propertyIds);
        
        // Get service provider links for these properties
        const { data: links, error: linksError } = await supabase
          .from('service_provider_property_link')
          .select('service_provider_id, property_id')
          .in('property_id', propertyIds);
          
        if (linksError) {
          console.error("Error fetching service provider links:", linksError);
          throw linksError;
        }
        
        if (!links || links.length === 0) {
          console.log("No service providers assigned to properties");
          setServiceProviders([]);
          return;
        }
        
        // Get unique service provider IDs
        const providerIds = [...new Set(links.map(link => link.service_provider_id))];
        console.log("Service provider IDs:", providerIds);
        
        // Get profiles for these service providers
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, email')
          .in('id', providerIds);
          
        if (profilesError) {
          console.error("Error fetching service provider profiles:", profilesError);
          throw profilesError;
        }
        
        // Create mapping of property ID to name
        const propertyMap = new Map();
        properties.forEach(p => propertyMap.set(p.id, p.name));
        
        // Create service provider objects with their assigned properties
        const providers = profiles?.map(profile => {
          const providerLinks = links.filter(link => link.service_provider_id === profile.id);
          const providerProperties = providerLinks.map(link => 
            propertyMap.get(link.property_id) || "Unknown Property"
          );
          
          return {
            id: profile.id,
            name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || "Unknown Name",
            email: profile.email,
            properties: providerProperties
          };
        }) || [];
        
        console.log("Service providers with properties:", providers);
        setServiceProviders(providers);
        
      } catch (err: any) {
        console.error("Error in service provider fetching process:", err);
        setError(err.message || "Failed to load service providers");
      } finally {
        setLoading(false);
      }
    };
    
    fetchServiceProviders();
  }, [user?.id, refreshKey]);
  
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

        {/* Assigned Service Providers Section */}
        {(serviceProviders.length > 0 || loading) && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Assigned Service Providers</h2>
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {serviceProviders.map((provider) => (
                  <Card key={provider.id} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">{provider.name}</CardTitle>
                      <CardDescription>{provider.email || "No email available"}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm font-medium mb-1">Assigned Properties:</p>
                      <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                        {provider.properties.length > 0 ? 
                          provider.properties.map((property, index) => (
                            <li key={index}>{property}</li>
                          ))
                          : 
                          <li className="text-gray-500">No properties assigned</li>
                        }
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Available Service Types Section */}
        <h2 className="text-xl font-semibold mt-8 mb-4">Available Service Types</h2>
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
