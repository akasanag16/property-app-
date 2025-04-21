
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
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function OwnerDashboard() {
  const { user } = useAuth();
  const { properties, loading, handleRefresh } = useProperties(user?.id);
  const [showAddPropertyForm, setShowAddPropertyForm] = useState(false);

  // Count properties that likely have tenants (using details.type as a proxy)
  const occupiedPropertiesCount = properties.filter(p => 
    p.details?.type === 'apartment' || p.details?.type === 'house'
  ).length;

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

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <DashboardHeader 
          email={user?.email}
          onRefresh={handleRefresh}
          onAddProperty={() => setShowAddPropertyForm(true)}
        />

        <DashboardStats 
          properties={properties} 
          occupiedCount={occupiedPropertiesCount} 
        />

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
