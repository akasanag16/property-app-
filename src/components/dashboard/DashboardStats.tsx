
import { Building, Home, Users, Wrench } from "lucide-react";
import { Property } from "@/hooks/useProperties";
import { GradientCard } from "@/components/ui/gradient-card";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { motion } from "framer-motion";

interface DashboardStatsProps {
  properties: Property[];
  occupiedCount: number;
}

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

export function DashboardStats({ properties, occupiedCount }: DashboardStatsProps) {
  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
    >
      <motion.div variants={item}>
        <GradientCard gradient="purple">
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
        <GradientCard gradient="blue">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Home className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <h3 className="text-2xl font-bold mb-1">
            <AnimatedCounter from={0} to={occupiedCount} />
          </h3>
          <p className="text-sm text-gray-600">Occupied Properties</p>
        </GradientCard>
      </motion.div>

      <motion.div variants={item}>
        <GradientCard gradient="green">
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
        <GradientCard gradient="orange">
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
  );
}
