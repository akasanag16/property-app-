
import { motion } from "framer-motion";
import { Building, MessageCircle, Clock } from "lucide-react";
import { GradientCard } from "@/components/ui/gradient-card";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import type { Property } from "@/types/property";
import { TenantStatsSkeleton } from "./TenantDashboardSkeleton";
import { useMaintenanceRequests } from "@/hooks/useMaintenanceRequests";

type TenantDashboardStatsProps = {
  properties: Property[];
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

export function TenantDashboardStats({ properties, loading }: TenantDashboardStatsProps) {
  // Use the maintenance requests hook to get active request count
  const { requests } = useMaintenanceRequests("tenant");
  
  // Count active (non-completed) requests
  const activeRequestsCount = requests.filter(r => r.status !== "completed").length;
  
  if (loading) {
    return <TenantStatsSkeleton />;
  }

  return (
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
            <AnimatedCounter value={properties.length} from={0} />
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
            <AnimatedCounter value={activeRequestsCount} from={0} />
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
            <AnimatedCounter value={8} from={0} />
          </h3>
          <p className="text-sm text-gray-600">Days Until Next Payment</p>
        </GradientCard>
      </motion.div>
    </motion.div>
  );
}
