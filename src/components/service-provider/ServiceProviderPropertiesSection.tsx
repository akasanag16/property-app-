
import { motion } from "framer-motion";
import { GradientCard } from "@/components/ui/gradient-card";
import { ErrorAlert } from "@/components/ui/alert-error";
import { Link } from "react-router-dom";
import { ServiceProviderPropertiesSkeleton } from "./ServiceProviderStatsSkeleton";
import type { Property } from "@/types/property";

type ServiceProviderPropertiesSectionProps = {
  properties: Property[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
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

export function ServiceProviderPropertiesSection({ 
  properties, 
  loading, 
  error, 
  onRetry 
}: ServiceProviderPropertiesSectionProps) {
  if (loading) {
    return <ServiceProviderPropertiesSkeleton />;
  }

  if (error) {
    return <ErrorAlert message={error} onRetry={onRetry} />;
  }

  if (properties.length === 0) {
    return (
      <GradientCard gradient="blue" className="text-center py-8">
        <p className="text-gray-600">You haven't been assigned to any properties yet.</p>
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
          <GradientCard gradient="purple" className="h-full">
            <h2 className="text-xl font-semibold mb-2">{property.name}</h2>
            <p className="text-gray-600 mb-4">{property.address}</p>
            <Link 
              to={`/service-provider/property/${property.id}/maintenance`}
              className="text-primary hover:text-primary/80 text-sm font-medium flex items-center gap-1"
            >
              View maintenance requests
            </Link>
          </GradientCard>
        </motion.div>
      ))}
    </motion.div>
  );
}
