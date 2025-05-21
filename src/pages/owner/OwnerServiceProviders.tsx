
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
  RefreshCw,
  AlertCircle
} from "lucide-react";
import { ErrorAlert } from "@/components/ui/alert-error";

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
      if (!user?.id) {
        console.log("No user ID available, skipping service provider fetch");
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        console.log("Fetching service providers for owner:", user.id);
        
        // First get owner properties
        const { data: properties, error: propertiesError } = await supabase
          .rpc('safe_get_owner_properties', { owner_id_param: user.id });
          
        if (propertiesError) {
          console.error("Error fetching owner properties:", propertiesError);
          setError("Failed to fetch your properties. Please try again.");
          return;
        }
        
        if (!properties || properties.length === 0) {
          console.log("No properties found for owner");
          setServiceProviders([]);
          return;
        }
        
        const propertyIds = properties.map((p: any) => p.id);
        console.log(`Owner has ${propertyIds.length} properties:`, propertyIds);
        
        // Get service provider links - using direct query
        const { data: links, error: linksError } = await supabase
          .from('service_provider_property_link')
          .select('service_provider_id, property_id')
          .in('property_id', propertyIds);
          
        if (linksError) {
          console.error("Error fetching service provider links:", linksError);
          setError("Failed to fetch service provider associations. Please try again.");
          return;
        }
        
        if (!links || links.length === 0) {
          console.log("No service providers assigned to properties");
          setServiceProviders([]);
          return;
        }
        
        console.log(`Found ${links.length} service provider links`);
        
        // Get unique service provider IDs
        const providerIds = [...new Set(links.map(link => link.service_provider_id))];
        console.log(`Found ${providerIds.length} unique service providers:`, providerIds);
        
        // Get profiles for these service providers
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, email')
          .in('id', providerIds);
          
        if (profilesError) {
          console.error("Error fetching service provider profiles:", profilesError);
          setError("Failed to fetch service provider details. Please try again.");
          return;
        }
        
        if (!profiles || profiles.length === 0) {
          console.log("No service provider profiles found for IDs:", providerIds);
          // Check if these users exist in auth but not in profiles
          // We'll use a direct query instead of the RPC function since it's not recognized
          const { data: authCheck, error: authError } = await supabase.from('auth')
            .select('id, exists_in_auth')
            .then(({ data, error }) => {
              // Handle response
              if (error) {
                console.error("Error checking for users in auth:", error);
                return { data: null, error };
              }
              
              if (data && Array.isArray(data) && data.length > 0) {
                console.log("Found users in auth but not in profiles:", data);
                toast.warning("Some service providers have incomplete profiles");
              }
              
              return { data, error };
            });
          
          setServiceProviders([]);
          return;
        }
        
        console.log(`Found ${profiles.length} service provider profiles`);
        
        // Create mapping of property ID to name
        const propertyMap = new Map<string, string>();
        properties.forEach((p: any) => propertyMap.set(p.id, p.name));
        
        // Create service provider objects with their assigned properties
        const providers = profiles.map(profile => {
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
        });
        
        console.log(`Successfully processed ${providers.length} service providers`);
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
    toast.success("Refreshing service provider list...");
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
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
        
        <p className="text-gray-600">
          Browse and manage service providers for your properties. These services can be offered to your tenants.
        </p>

        {error && (
          <ErrorAlert message={error} onRetry={handleRefresh} />
        )}

        {/* Assigned Service Providers Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Assigned Service Providers</h2>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
          ) : serviceProviders.length > 0 ? (
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
          ) : (
            <div className="text-center p-6 bg-gray-50 rounded-lg border">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-700">No Service Providers Assigned</h3>
              <p className="text-gray-500 mt-1">
                You haven't assigned any service providers to your properties yet.
              </p>
            </div>
          )}
        </div>

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
