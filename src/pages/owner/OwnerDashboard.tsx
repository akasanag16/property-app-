
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PropertyCard } from "@/components/property/PropertyCard";
import { PropertyForm } from "@/components/property/PropertyForm";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { EmptyPropertyState } from "@/components/property/EmptyPropertyState";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { useProperties } from "@/hooks/useProperties";
import { useTenantData } from "@/hooks/tenant/useTenantData";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function OwnerDashboard() {
  const { user } = useAuth();
  const { properties, loading, handleRefresh, error } = useProperties(user?.id);
  const [showAddPropertyForm, setShowAddPropertyForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  
  // Get tenant data for the dashboard
  const { tenants, loading: tenantsLoading } = useTenantData(user, refreshKey);
  
  // Calculate total income from tenant payments
  const totalIncome = tenants.reduce((sum, tenant) => {
    if (tenant.last_payment?.amount) {
      return sum + tenant.last_payment.amount;
    }
    return sum;
  }, 0);

  // Notify user when realtime is active
  useEffect(() => {
    const timer = setTimeout(() => {
      toast.info("Real-time updates active", {
        description: "Property changes will appear automatically",
        duration: 4000,
      });
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

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

  const handleMainRefresh = () => {
    handleRefresh();
    setRefreshKey(prev => prev + 1);
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <DashboardHeader 
          email={user?.email}
          onRefresh={handleMainRefresh}
          onAddProperty={() => setShowAddPropertyForm(true)}
        />

        <DashboardStats 
          properties={properties} 
          loading={loading || tenantsLoading}
          tenantCount={tenants.length} 
          totalIncome={totalIncome}
        />

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error loading properties</AlertTitle>
            <AlertDescription>
              {error}
              <div className="mt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleRefresh}
                  className="mt-2"
                >
                  <RefreshCw className="h-3 w-3 mr-2" />
                  Try Again
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {loading ? (
          <LoadingSpinner />
        ) : properties.length === 0 ? (
          <EmptyPropertyState onAddProperty={() => setShowAddPropertyForm(true)} />
        ) : (
          <motion.div 
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
          >
            {properties.map((property, index) => (
              <motion.div
                key={property.id}
                variants={item}
                transition={{ delay: index * 0.1 }}
                className="hover:scale-105 transition-transform duration-300"
              >
                <PropertyCard
                  id={property.id}
                  name={property.name}
                  address={property.address}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {showAddPropertyForm && (
        <PropertyForm
          isOpen={showAddPropertyForm}
          onClose={() => setShowAddPropertyForm(false)}
          onSuccess={handleRefresh}
        />
      )}
    </DashboardLayout>
  );
}
