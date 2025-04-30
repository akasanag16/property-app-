
import { motion } from "framer-motion";
import { GradientCard } from "@/components/ui/gradient-card";
import { MaintenanceRequestForm } from "@/components/maintenance/MaintenanceRequestForm";
import { MaintenanceRequestsList } from "@/components/maintenance/MaintenanceRequestsList";
import type { Property } from "@/types/property";
import { TenantMaintenanceSkeleton } from "./TenantDashboardSkeleton";
import { useState, useEffect } from "react";
import { ErrorAlert } from "@/components/ui/alert-error";

type TenantMaintenanceSectionProps = {
  properties: Property[];
  onRequestCreated: () => void;
  requestRefreshKey: number;
  loading?: boolean;
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

export function TenantMaintenanceSection({ 
  properties, 
  onRequestCreated,
  requestRefreshKey,
  loading
}: TenantMaintenanceSectionProps) {
  const [localRefreshKey, setLocalRefreshKey] = useState(requestRefreshKey);
  const [error, setError] = useState<string | null>(null);

  // Update local refresh key when parent refresh key changes
  useEffect(() => {
    setLocalRefreshKey(requestRefreshKey);
  }, [requestRefreshKey]);

  // Handle request update from child components
  const handleRequestUpdate = () => {
    setLocalRefreshKey(prev => prev + 1);
    setError(null); // Clear any previous errors
    onRequestCreated();
  };

  // Handle errors from child components
  const handleError = (errorMessage: string) => {
    setError(errorMessage);
  };

  if (loading) {
    return <TenantMaintenanceSkeleton />;
  }

  return (
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
            onRequestCreated={handleRequestUpdate}
          />
        </GradientCard>
      </motion.div>

      <motion.div variants={item}>
        <GradientCard gradient="blue">
          <h2 className="text-xl font-semibold mb-4">My Requests</h2>
          {error ? (
            <ErrorAlert message={error} onRetry={handleRequestUpdate} />
          ) : (
            <MaintenanceRequestsList 
              userRole="tenant"
              refreshKey={localRefreshKey}
              onRefreshNeeded={handleRequestUpdate}
              onError={handleError}
            />
          )}
        </GradientCard>
      </motion.div>
    </motion.div>
  );
}
