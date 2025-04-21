
import { AuthForm } from "@/components/auth/AuthForm";
import { motion } from "framer-motion";
import { Home as HomeIcon, User as TenantIcon, Wrench as ToolIcon } from "lucide-react";

export default function Auth() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob" />
        <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000" />
        <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000" />
      </div>

      <div className="w-full max-w-md space-y-8 relative z-10">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Property Maintenance</h1>
          <p className="mt-2 text-lg text-gray-600">Manage your properties efficiently</p>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex justify-center space-x-8 my-12"
        >
          <RoleCard icon={<HomeIcon size={24} />} title="Owners" description="Manage properties and tenants" />
          <RoleCard icon={<TenantIcon size={24} />} title="Tenants" description="Access services" />
          <RoleCard icon={<ToolIcon size={24} />} title="Providers" description="Offer services" />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="backdrop-blur-lg bg-white/60 rounded-2xl shadow-xl border border-white/20 p-6"
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
      className="flex flex-col items-center group"
      whileHover={{ scale: 1.05 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <div className="p-4 bg-white/80 backdrop-blur rounded-xl shadow-lg text-primary border border-white/20 group-hover:bg-white/90 transition-all duration-300">
        {icon}
      </div>
      <h3 className="mt-3 font-medium text-sm text-gray-900">{title}</h3>
      <p className="text-xs text-gray-600 text-center mt-1">{description}</p>
    </motion.div>
  );
}
