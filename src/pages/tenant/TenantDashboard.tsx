import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MaintenanceRequestForm } from "@/components/maintenance/MaintenanceRequestForm";
import { MaintenanceRequestsList } from "@/components/maintenance/MaintenanceRequestsList";
import { motion } from "framer-motion";
import { GradientCard } from "@/components/ui/gradient-card";
import { Building, MessageCircle, Clock } from "lucide-react";
import { AnimatedCounter } from "@/components/ui/animated-counter";

type Property = {
  id: string;
  name: string;
  address: string;
};

export default function TenantDashboard() {
  const { user } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("my-properties");
  const [requestRefreshKey, setRequestRefreshKey] = useState(0);

  const fetchProperties = async () => {
    try {
      const { data, error } = await supabase
        .from("tenant_property_link")
        .select(`
          property:properties(id, name, address)
        `)
        .eq("tenant_id", user?.id);

      if (error) throw error;
      
      const formattedProperties = data?.map(item => ({
        id: item.property.id,
        name: item.property.name,
        address: item.property.address,
      })) || [];
      
      setProperties(formattedProperties);
    } catch (error) {
      console.error("Error fetching properties:", error);
      toast.error("Failed to load properties");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
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
        (payload) => {
          fetchProperties();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  const handleRequestCreated = () => {
    setActiveTab("maintenance-requests");
    setRequestRefreshKey(prev => prev + 1);
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
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

        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <motion.div variants={item}>
            <GradientCard gradient="purple">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <Building className="h-6 w-6 text-purple-600" />
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-1">
                <AnimatedCounter from={0} to={properties.length} />
              </h3>
              <p className="text-sm text-gray-600">Rented Properties</p>
            </GradientCard>
          </motion.div>

          <motion.div variants={item}>
            <GradientCard gradient="blue">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <MessageCircle className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-1">
                <AnimatedCounter from={0} to={3} />
              </h3>
              <p className="text-sm text-gray-600">Active Requests</p>
            </GradientCard>
          </motion.div>

          <motion.div variants={item}>
            <GradientCard gradient="green">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <Clock className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-1">
                <AnimatedCounter from={0} to={8} />
              </h3>
              <p className="text-sm text-gray-600">Days Until Next Payment</p>
            </GradientCard>
          </motion.div>
        </motion.div>

        <Tabs defaultValue="my-properties" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="my-properties">My Properties</TabsTrigger>
            <TabsTrigger value="maintenance-requests">Maintenance Requests</TabsTrigger>
          </TabsList>

          <TabsContent value="my-properties" className="mt-6">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
              </div>
            ) : properties.length === 0 ? (
              <GradientCard gradient="purple" className="text-center py-8">
                <p className="text-gray-600">You haven't been linked to any properties yet.</p>
              </GradientCard>
            ) : (
              <motion.div 
                variants={container}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                {properties.map((property, index) => (
                  <motion.div
                    key={property.id}
                    variants={item}
                    transition={{ delay: index * 0.1 }}
                  >
                    <GradientCard gradient="blue">
                      <h2 className="text-xl font-semibold mb-2">{property.name}</h2>
                      <p className="text-gray-600 mb-4">{property.address}</p>
                      <button 
                        onClick={() => setActiveTab("maintenance-requests")}
                        className="text-primary hover:text-primary/80 text-sm font-medium"
                      >
                        Submit a maintenance request
                      </button>
                    </GradientCard>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </TabsContent>

          <TabsContent value="maintenance-requests" className="mt-6">
            <motion.div 
              variants={container}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              <motion.div variants={item}>
                <GradientCard gradient="purple">
                  <h2 className="text-xl font-semibold mb-4">Submit a Request</h2>
                  <MaintenanceRequestForm 
                    properties={properties}
                    onRequestCreated={handleRequestCreated}
                  />
                </GradientCard>
              </motion.div>

              <motion.div variants={item}>
                <GradientCard gradient="blue">
                  <h2 className="text-xl font-semibold mb-4">My Requests</h2>
                  <MaintenanceRequestsList 
                    userRole="tenant"
                    refreshKey={requestRefreshKey}
                  />
                </GradientCard>
              </motion.div>
            </motion.div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </DashboardLayout>
  );
}
