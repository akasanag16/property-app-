
import { AuthForm } from "@/components/auth/AuthForm";
import { motion } from "framer-motion";
import { Home as HomeIcon, User as TenantIcon, Wrench as ToolIcon } from "lucide-react";

export default function Auth() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 z-0">
        <motion.div 
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute -top-1/4 -right-1/4 w-96 h-96 bg-purple-200/30 rounded-full mix-blend-multiply filter blur-3xl"
        />
        <motion.div 
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [90, 0, 90],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute -bottom-1/4 -left-1/4 w-96 h-96 bg-blue-200/30 rounded-full mix-blend-multiply filter blur-3xl"
        />
      </div>

      <div className="w-full max-w-4xl space-y-8 relative z-10">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600">
            Property Maintenance
          </h1>
          <p className="mt-3 text-xl text-gray-600">Manage your properties efficiently</p>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex justify-center space-x-8 my-12"
        >
          <RoleCard 
            icon={<HomeIcon size={24} />} 
            title="Owners" 
            description="Manage properties and tenants" 
          />
          <RoleCard 
            icon={<TenantIcon size={24} />} 
            title="Tenants" 
            description="Access services" 
          />
          <RoleCard 
            icon={<ToolIcon size={24} />} 
            title="Providers" 
            description="Offer services" 
          />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mx-auto max-w-md"
        >
          <AuthForm />
        </motion.div>
      </div>
    </div>
  );
}

function RoleCard({ icon, title, description }: { 
  icon: React.ReactNode, 
  title: string, 
  description: string 
}) {
  return (
    <motion.div 
      className="flex flex-col items-center group cursor-pointer"
      whileHover={{ scale: 1.05 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <div className="p-4 bg-white/80 backdrop-blur rounded-xl shadow-lg border border-white/20 group-hover:bg-white/90 transition-all duration-300">
        {icon}
      </div>
      <h3 className="mt-3 font-medium text-gray-900">{title}</h3>
      <p className="text-sm text-gray-600 text-center mt-1">{description}</p>
    </motion.div>
  );
}
