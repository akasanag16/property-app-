
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { ReactNode } from "react";

interface GradientCardProps {
  children: ReactNode;
  className?: string;
  gradient?: "purple" | "blue" | "green" | "orange";
}

export function GradientCard({ children, className, gradient = "purple" }: GradientCardProps) {
  const gradientStyles = {
    purple: "from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30",
    blue: "from-blue-500/20 to-cyan-500/20 hover:from-blue-500/30 hover:to-cyan-500/30",
    green: "from-green-500/20 to-emerald-500/20 hover:from-green-500/30 hover:to-emerald-500/30",
    orange: "from-orange-500/20 to-amber-500/20 hover:from-orange-500/30 hover:to-amber-500/30",
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={cn(
        "relative rounded-xl bg-gradient-to-br backdrop-blur-xl border border-white/20",
        gradientStyles[gradient],
        "p-6 shadow-xl transition-colors duration-300",
        className
      )}
    >
      {children}
    </motion.div>
  );
}
