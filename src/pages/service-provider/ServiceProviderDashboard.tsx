
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MaintenanceRequestsList } from "@/components/maintenance/MaintenanceRequestsList";
import { ErrorAlert } from "@/components/ui/alert-error";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Building, Wrench, Clock } from "lucide-react";
import { GradientCard } from "@/components/ui/gradient-card";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import type { Property, PropertyDetails } from "@/types/property";
import { ServiceProviderStats } from "@/components/service-provider/ServiceProviderStats";
import { ServiceProviderPropertiesSection } from "@/components/service-provider/ServiceProviderPropertiesSection";

export default function ServiceProviderDashboard() {
  const { user } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("assigned-properties");
  const [refreshKey, setRefreshKey] = useState(0);
  const [requestsCount, setRequestsCount] = useState(0);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);

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

      // Fetch maintenance request counts - use direct query instead of RPC
      const { data: allRequests, error: requestError } = await supabase
        .from('maintenance_requests')
        .select('id')
        .eq('assigned_service_provider_id', user.id);

      if (!requestError && allRequests) {
        setRequestsCount(allRequests.length);
      } else if (requestError) {
        console.error("Error fetching request count:", requestError);
      }

      // Fetch pending maintenance request counts - use direct query instead of RPC
      const { data: pendingRequests, error: pendingError } = await supabase
        .from('maintenance_requests')
        .select('id')
        .eq('assigned_service_provider_id', user.id)
        .in('status', ['pending', 'accepted']);

      if (!pendingError && pendingRequests) {
        setPendingRequestsCount(pendingRequests.length);
      } else if (pendingError) {
        console.error("Error fetching pending request count:", pendingError);
      }
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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        <h1 className="text-2xl font-bold mb-6">Service Provider Dashboard</h1>
        <p className="text-gray-600 mb-8">Welcome, {user?.email}</p>
        
        <ServiceProviderStats 
          properties={properties.length} 
          requests={requestsCount} 
          pendingRequests={pendingRequestsCount}
          loading={loading}
        />
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="assigned-properties">Assigned Properties</TabsTrigger>
            <TabsTrigger value="maintenance-requests">Maintenance Requests</TabsTrigger>
          </TabsList>
          
          <TabsContent value="assigned-properties" className="pt-6">
            <ServiceProviderPropertiesSection
              properties={properties}
              loading={loading}
              error={error}
              onRetry={handleRefresh}
            />
          </TabsContent>
          
          <TabsContent value="maintenance-requests" className="pt-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">All Maintenance Requests</h2>
              <MaintenanceRequestsList 
                userRole="service_provider" 
                refreshKey={refreshKey} 
                onRefreshNeeded={handleRefresh} 
              />
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </DashboardLayout>
  );
}
