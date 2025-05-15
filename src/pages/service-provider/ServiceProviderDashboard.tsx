
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MaintenanceRequestsList } from "@/components/maintenance/MaintenanceRequestsList";
import { ErrorAlert } from "@/components/ui/alert-error";
import type { Property, PropertyDetails } from "@/types/property";

export default function ServiceProviderDashboard() {
  const { user } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("assigned-properties");
  const [refreshKey, setRefreshKey] = useState(0);

  // Fetch service provider's properties using the secure function pattern
  const fetchProperties = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!user) {
        setError("User not authenticated");
        return;
      }

      console.log("Fetching properties for service provider:", user.id);

      // Use our secure function pattern to avoid infinite recursion
      const { data: propertiesData, error: propertiesError } = await supabase
        .rpc('safe_get_service_provider_properties', { provider_id_param: user.id });
        
      if (propertiesError) {
        console.error("Error fetching properties:", propertiesError);
        setError(propertiesError.message);
        throw propertiesError;
      }
      
      console.log("Properties fetched:", propertiesData);
      
      // Convert the raw data to the expected Property type
      const typedProperties: Property[] = (propertiesData || []).map(prop => ({
        id: prop.id,
        name: prop.name,
        address: prop.address,
        details: prop.details as PropertyDetails || {}
      }));
      
      setProperties(typedProperties);
    } catch (error: any) {
      console.error("Error in fetch properties flow:", error);
      toast.error("Failed to load properties");
      setError(error.message || "Failed to load properties");
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

  // Function to handle refresh trigger
  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    fetchProperties();
  };

  // Set up real-time subscription and initial fetch
  useEffect(() => {
    fetchProperties();

    // Subscribe to real-time changes
    const channel = supabase
      .channel('table-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'service_provider_property_link',
          filter: `service_provider_id=eq.${user?.id}`
        },
        () => {
          // Refresh properties when links change
          fetchProperties();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, refreshKey]);

  if (error) {
    return (
      <DashboardLayout>
        <h1 className="text-2xl font-bold mb-6">Service Provider Dashboard</h1>
        <ErrorAlert 
          message={`Error loading dashboard: ${error}`} 
          onRetry={handleRefresh} 
        />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold mb-6">Service Provider Dashboard</h1>
      <p className="text-gray-600 mb-8">Welcome, {user?.email}</p>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="assigned-properties">Assigned Properties</TabsTrigger>
          <TabsTrigger value="maintenance-requests">Maintenance Requests</TabsTrigger>
        </TabsList>
        
        <TabsContent value="assigned-properties" className="pt-6">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
          ) : properties.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg border">
              <p className="text-gray-500">You haven't been assigned to any properties yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {properties.map((property) => (
                <div key={property.id} className="bg-white p-6 rounded-lg shadow">
                  <h2 className="text-xl font-semibold mb-2">{property.name}</h2>
                  <p className="text-gray-500 mb-4">{property.address}</p>
                  <button 
                    onClick={() => setActiveTab("maintenance-requests")}
                    className="text-primary hover:text-primary/80 text-sm font-medium"
                  >
                    View maintenance requests
                  </button>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="maintenance-requests" className="pt-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Assigned Maintenance Requests</h2>
            <MaintenanceRequestsList 
              userRole="service_provider" 
              refreshKey={refreshKey} 
              onRefreshNeeded={handleRefresh} 
            />
          </div>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
