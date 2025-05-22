
import { motion } from "framer-motion";
import { Building, Wrench, Clock } from "lucide-react";
import { GradientCard } from "@/components/ui/gradient-card";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { ServiceProviderStatsSkeleton } from "./ServiceProviderStatsSkeleton";

type ServiceProviderStatsProps = {
  properties: number;
  requests: number;
  pendingRequests: number;
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

export function ServiceProviderStats({ 
  properties, 
  requests, 
  pendingRequests, 
  loading = false 
}: ServiceProviderStatsProps) {
  if (loading) {
    return <ServiceProviderStatsSkeleton />;
  }

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
    >
      <motion.div variants={item}>
        <GradientCard gradient="blue">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Building className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <h3 className="text-2xl font-bold mb-1">
            <AnimatedCounter value={properties} from={0} />
          </h3>
          <p className="text-sm text-gray-600">Assigned Properties</p>
        </GradientCard>
      </motion.div>

      <motion.div variants={item}>
        <GradientCard gradient="purple">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Wrench className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <h3 className="text-2xl font-bold mb-1">
            <AnimatedCounter value={requests} from={0} />
          </h3>
          <p className="text-sm text-gray-600">Total Requests</p>
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
            <AnimatedCounter value={pendingRequests} from={0} />
          </h3>
          <p className="text-sm text-gray-600">Pending Requests</p>
        </GradientCard>
      </motion.div>
    </motion.div>
  );
}
