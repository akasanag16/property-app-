import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PropertyCard } from "@/components/property/PropertyCard";
import { PropertyForm } from "@/components/property/PropertyForm";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { EmptyPropertyState } from "@/components/property/EmptyPropertyState";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { useProperties } from "@/hooks/useProperties";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { GradientCard } from "@/components/ui/gradient-card";
import { Building, Home, Users, Wrench } from "lucide-react";
import { AnimatedCounter } from "@/components/ui/animated-counter";

export default function OwnerDashboard() {
  const { user } = useAuth();
  const { properties, loading, handleRefresh } = useProperties(user?.id);
  const [showAddPropertyForm, setShowAddPropertyForm] = useState(false);

  const handleOpenPropertyForm = () => {
    setShowAddPropertyForm(true);
  };

  const handleClosePropertyForm = () => {
    setShowAddPropertyForm(false);
  };

  const handlePropertyFormSuccess = () => {
    handleRefresh();
    handleClosePropertyForm();
    toast.success("Property added successfully");
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
      <div className="space-y-8">
        <DashboardHeader 
          email={user?.email}
          onRefresh={handleRefresh}
          onAddProperty={handleOpenPropertyForm}
        />

        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <motion.div variants={item}>
            <GradientCard gradient="purple" className="relative overflow-hidden">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <Building className="h-6 w-6 text-purple-600" />
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-1">
                <AnimatedCounter from={0} to={properties.length} />
              </h3>
              <p className="text-sm text-gray-600">Total Properties</p>
            </GradientCard>
          </motion.div>

          <motion.div variants={item}>
            <GradientCard gradient="blue" className="relative overflow-hidden">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Home className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-1">
                <AnimatedCounter from={0} to={properties.filter(p => p.status === 'occupied').length} />
              </h3>
              <p className="text-sm text-gray-600">Occupied Properties</p>
            </GradientCard>
          </motion.div>

          <motion.div variants={item}>
            <GradientCard gradient="green" className="relative overflow-hidden">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-1">
                <AnimatedCounter from={0} to={12} />
              </h3>
              <p className="text-sm text-gray-600">Active Tenants</p>
            </GradientCard>
          </motion.div>

          <motion.div variants={item}>
            <GradientCard gradient="orange" className="relative overflow-hidden">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-orange-500/20 rounded-lg">
                  <Wrench className="h-6 w-6 text-orange-600" />
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-1">
                <AnimatedCounter from={0} to={5} />
              </h3>
              <p className="text-sm text-gray-600">Pending Maintenance</p>
            </GradientCard>
          </motion.div>
        </motion.div>

        {loading ? (
          <LoadingSpinner />
        ) : properties.length === 0 ? (
          <EmptyPropertyState onAddProperty={handleOpenPropertyForm} />
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
          onClose={handleClosePropertyForm}
          onSuccess={handlePropertyFormSuccess}
        />
      )}
    </DashboardLayout>
  );
}
