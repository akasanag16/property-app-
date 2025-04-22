
import { motion } from "framer-motion";
import { GradientCard } from "@/components/ui/gradient-card";
import { MaintenanceRequestForm } from "@/components/maintenance/MaintenanceRequestForm";
import { MaintenanceRequestsList } from "@/components/maintenance/MaintenanceRequestsList";
import type { Property } from "@/hooks/useProperties";
import { TenantMaintenanceSkeleton } from "./TenantDashboardSkeleton";

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
            onRequestCreated={onRequestCreated}
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
  );
}
