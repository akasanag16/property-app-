
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { TenantDashboardStats } from "@/components/tenant/dashboard/TenantDashboardStats";
import { TenantPropertiesSection } from "@/components/tenant/dashboard/TenantPropertiesSection";
import { TenantMaintenanceSection } from "@/components/tenant/dashboard/TenantMaintenanceSection";
import { TenantRentSection } from "@/components/tenant/dashboard/TenantRentSection";
import { useProperties } from "@/hooks/useProperties";
import { useLocation } from "react-router-dom";

export default function TenantDashboard() {
  const { user } = useAuth();
  const location = useLocation();
  const [requestRefreshKey, setRequestRefreshKey] = useState(0);
  
  // Set default tab based on the current path
  const getInitialTab = useCallback(() => {
    if (location.pathname.includes("/tenant/maintenance")) {
      return "maintenance-requests";
    } else if (location.pathname.includes("/tenant/rent")) {
      return "rent-payments";
    }
    return "my-properties";
  }, [location.pathname]);
  
  const [activeTab, setActiveTab] = useState(() => getInitialTab());
  
  // Use the properties hook to fetch properties
  const { properties, loading, handleRefresh, error } = useProperties(user?.id);

  const handleRequestCreated = () => {
    setActiveTab("maintenance-requests");
    setRequestRefreshKey(prev => prev + 1);
    toast.success("Maintenance request created successfully");
  };

  const handleMaintenanceClick = () => {
    setActiveTab("maintenance-requests");
  };

  const handleRentClick = () => {
    setActiveTab("rent-payments");
  };

  // Update active tab when the route changes
  useEffect(() => {
    setActiveTab(getInitialTab());
  }, [location.pathname, getInitialTab]);

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        <h1 className="text-2xl font-bold mb-6">Tenant Dashboard</h1>
        <p className="text-gray-600 mb-8">Welcome, {user?.email}</p>

        <TenantDashboardStats 
          properties={properties} 
          loading={loading}
          onRentClick={handleRentClick} 
        />

        <Tabs defaultValue={activeTab} className="w-full" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="my-properties">My Properties</TabsTrigger>
            <TabsTrigger value="maintenance-requests">Maintenance Requests</TabsTrigger>
            <TabsTrigger value="rent-payments">Rent Payments</TabsTrigger>
          </TabsList>

          <TabsContent value="my-properties" className="mt-6">
            <TenantPropertiesSection
              properties={properties}
              loading={loading}
              error={error}
              onRetry={handleRefresh}
              onMaintenanceClick={handleMaintenanceClick}
              onRentClick={handleRentClick}
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
          
          <TabsContent value="rent-payments" className="mt-6">
            <TenantRentSection user={user} />
          </TabsContent>
        </Tabs>
      </motion.div>
    </DashboardLayout>
  );
}
