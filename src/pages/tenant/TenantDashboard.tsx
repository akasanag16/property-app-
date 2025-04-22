
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
import { useProperties } from "@/hooks/useProperties";

export type Property = {
  id: string;
  name: string;
  address: string;
};

export default function TenantDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("my-properties");
  const [requestRefreshKey, setRequestRefreshKey] = useState(0);
  
  // Use the fixed useProperties hook to fetch properties
  const { properties, loading, handleRefresh } = useProperties(user?.id);

  const handleRequestCreated = () => {
    setActiveTab("maintenance-requests");
    setRequestRefreshKey(prev => prev + 1);
  };

  const handleMaintenanceClick = () => {
    setActiveTab("maintenance-requests");
  };

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
              error={null}
              onRetry={handleRefresh}
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
