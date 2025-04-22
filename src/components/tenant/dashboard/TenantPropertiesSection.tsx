
import { motion } from "framer-motion";
import { GradientCard } from "@/components/ui/gradient-card";
import { ErrorAlert } from "@/components/ui/alert-error";
import type { Property } from "@/hooks/useProperties";
import { TenantPropertiesSkeleton } from "./TenantDashboardSkeleton";

type TenantPropertiesSectionProps = {
  properties: Property[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  onMaintenanceClick: () => void;
};

// Animation constants
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

export function TenantPropertiesSection({ 
  properties, 
  loading, 
  error, 
  onRetry,
  onMaintenanceClick 
}: TenantPropertiesSectionProps) {
  if (loading) {
    return <TenantPropertiesSkeleton />;
  }

  if (error) {
    return <ErrorAlert message={error} onRetry={onRetry} />;
  }

  if (properties.length === 0) {
    return (
      <GradientCard gradient="purple" className="text-center py-8">
        <p className="text-gray-600">You haven't been linked to any properties yet.</p>
      </GradientCard>
    );
  }

  return (
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
              onClick={onMaintenanceClick}
              className="text-primary hover:text-primary/80 text-sm font-medium"
            >
              Submit a maintenance request
            </button>
          </GradientCard>
        </motion.div>
      ))}
    </motion.div>
  );
}
