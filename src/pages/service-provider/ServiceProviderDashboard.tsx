
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MaintenanceRequestsList } from "@/components/maintenance/MaintenanceRequestsList";

type Property = {
  id: string;
  name: string;
  address: string;
};

export default function ServiceProviderDashboard() {
  const { user } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("assigned-properties");
  const [refreshKey, setRefreshKey] = useState(0);

  // Fetch service provider's properties using the secure function pattern
  const fetchProperties = async () => {
    try {
      setLoading(true);

      if (!user) return;

      // Get property IDs via the secure function pattern in RLS
      const { data: propertyIds, error: propertyIdsError } = await supabase
        .rpc('get_service_provider_properties', { provider_id: user.id });

      if (propertyIdsError) {
        console.error("Error fetching property IDs:", propertyIdsError);
        throw propertyIdsError;
      }
      
      if (!propertyIds || propertyIds.length === 0) {
        setProperties([]);
        setLoading(false);
        return;
      }

      // Fetch the property details for these IDs
      const { data: propertiesData, error: propertiesError } = await supabase
        .from("properties")
        .select("id, name, address")
        .in("id", propertyIds);

      if (propertiesError) {
        console.error("Error fetching properties data:", propertiesError);
        throw propertiesError;
      }
      
      setProperties(propertiesData || []);
    } catch (error) {
      console.error("Error in fetch properties flow:", error);
      toast.error("Failed to load properties");
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

  // Function to handle refresh trigger
  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
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
