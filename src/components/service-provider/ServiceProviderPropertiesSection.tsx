
import { motion } from "framer-motion";
import { GradientCard } from "@/components/ui/gradient-card";
import { ErrorAlert } from "@/components/ui/alert-error";
import { Link } from "react-router-dom";
import { ServiceProviderPropertiesSkeleton } from "./ServiceProviderPropertiesSkeleton";
import type { Property } from "@/types/property";
import { Building, ArrowUpRight, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

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
    return (
      <div className="space-y-4">
        <ErrorAlert 
          message={error} 
          onRetry={onRetry} 
        />
        <div className="flex justify-center">
          <Button variant="outline" onClick={onRetry} className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (properties.length === 0) {
    return (
      <GradientCard gradient="blue" className="text-center py-8">
        <p className="text-gray-600">You haven't been assigned to any properties yet.</p>
        <Button variant="ghost" onClick={onRetry} className="mt-4 flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </GradientCard>
    );
  }

  return (
    <div className="space-y-4">
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
            <div className="group h-full rounded-xl bg-white shadow hover:shadow-md transition-all duration-300 overflow-hidden border border-gray-100">
              <div className="p-6 h-full flex flex-col">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 mr-3">
                      <Building className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900">{property.name}</h3>
                      <p className="text-sm text-gray-500">{property.address}</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-auto pt-4">
                  <Link 
                    to={`/service-provider/properties/${property.id}/maintenance`}
                    className="flex items-center justify-between w-full text-sm font-medium text-indigo-600 hover:text-indigo-700 group-hover:underline"
                  >
                    <span>View maintenance requests</span>
                    <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
      
      <div className="flex justify-center mt-4">
        <Button 
          variant="outline" 
          onClick={onRetry} 
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh Properties
        </Button>
      </div>
    </div>
  );
}
