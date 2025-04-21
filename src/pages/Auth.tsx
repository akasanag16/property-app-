
import { AuthForm } from "@/components/auth/AuthForm";
import { motion } from "framer-motion";
import { Home as HomeIcon, User as TenantIcon, Wrench as ToolIcon } from "lucide-react";

export default function Auth() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Property Maintenance</h1>
          <p className="mt-2 text-gray-600">Manage your properties efficiently</p>
        </div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex justify-center space-x-8 my-8"
        >
          <RoleCard icon={<HomeIcon size={24} />} title="Owners" description="Manage properties and tenants" />
          <RoleCard icon={<TenantIcon size={24} />} title="Tenants" description="Access services" />
          <RoleCard icon={<ToolIcon size={24} />} title="Providers" description="Offer services" />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
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
    <div className="flex flex-col items-center">
      <div className="p-3 bg-white rounded-full shadow-md text-primary">
        {icon}
      </div>
      <h3 className="mt-2 font-medium text-sm">{title}</h3>
      <p className="text-xs text-gray-500">{description}</p>
    </div>
  );
}
