
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { TenantDashboardStats } from "@/components/tenant/dashboard/TenantDashboardStats";
import { TenantPropertiesSection } from "@/components/tenant/dashboard/TenantPropertiesSection";
import { TenantMaintenanceSection } from "@/components/tenant/dashboard/TenantMaintenanceSection";

export type Property = {
  id: string;
  name: string;
  address: string;
};

export default function TenantDashboard() {
  const { user } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("my-properties");
  const [requestRefreshKey, setRequestRefreshKey] = useState(0);

  const fetchProperties = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const { data: propertyIds, error: idsError } = await supabase
        .rpc('get_tenant_properties', { tenant_id: user.id });
        
      if (idsError) throw idsError;
      
      if (!propertyIds || propertyIds.length === 0) {
        setProperties([]);
        setLoading(false);
        return;
      }
      
      const { data, error } = await supabase
        .from("properties")
        .select("id, name, address")
        .in("id", propertyIds);
        
      if (error) throw error;
      
      setProperties(data || []);
    } catch (error) {
      console.error("Error fetching properties:", error);
      setError("Failed to load properties. Please try again.");
      toast.error("Failed to load properties");
    } finally {
      setLoading(false);
    }
  };

  const handleRequestCreated = () => {
    setActiveTab("maintenance-requests");
    setRequestRefreshKey(prev => prev + 1);
  };

  const handleMaintenanceClick = () => {
    setActiveTab("maintenance-requests");
  };

  useEffect(() => {
    if (user?.id) {
      fetchProperties();

      const channel = supabase
        .channel('table-db-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'tenant_property_link',
            filter: `tenant_id=eq.${user?.id}`
          },
          () => {
            fetchProperties();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user?.id]);

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        <h1 className="text-2xl font-bold mb-6">Tenant Dashboard</h1>
        <p className="text-gray-600 mb-8">Welcome, {user?.email}</p>

        <TenantDashboardStats properties={properties} loading={loading} />

        <Tabs defaultValue="my-properties" className="w-full" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="my-properties">My Properties</TabsTrigger>
            <TabsTrigger value="maintenance-requests">Maintenance Requests</TabsTrigger>
          </TabsList>

          <TabsContent value="my-properties" className="mt-6">
            <TenantPropertiesSection
              properties={properties}
              loading={loading}
              error={error}
              onRetry={fetchProperties}
              onMaintenanceClick={handleMaintenanceClick}
            />
          </TabsContent>

          <TabsContent value="maintenance-requests" className="mt-6">
            <TenantMaintenanceSection
              properties={properties}
              onRequestCreated={handleRequestCreated}
              requestRefreshKey={requestRefreshKey}
              loading={loading}
            />
          </TabsContent>
        </Tabs>
      </motion.div>
    </DashboardLayout>
  );
}
