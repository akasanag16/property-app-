import { AuthForm } from "@/components/auth/AuthForm";
import { motion } from "framer-motion";
import { Home, User, Wrench } from "lucide-react";
export default function Auth() {
  return <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-50 via-lavender-50 to-white py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Subtle background animations */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <motion.div animate={{
        scale: [1, 1.1, 1],
        rotate: [0, 5, -5, 0]
      }} transition={{
        duration: 15,
        repeat: Infinity,
        ease: "easeInOut"
      }} className="absolute -top-1/4 -right-1/4 w-[500px] h-[500px] bg-purple-100/30 rounded-full mix-blend-multiply blur-3xl" />
        <motion.div animate={{
        scale: [1.05, 0.95, 1.05],
        rotate: [-5, 5, -5]
      }} transition={{
        duration: 20,
        repeat: Infinity,
        ease: "easeInOut"
      }} className="absolute -bottom-1/4 -left-1/4 w-[400px] h-[400px] bg-lavender-100/30 rounded-full mix-blend-multiply blur-3xl" />
      </div>

      <div className="w-full max-w-4xl space-y-8 relative z-10">
        <motion.div className="text-center" initial={{
        opacity: 0,
        y: -20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.5
      }}>
          <h1 className="font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600 text-5xl">
            Property Maintenance
          </h1>
          <p className="mt-3 text-gray-600 font-light tracking-wide text-base">
            Streamline your property management experience
          </p>
        </motion.div>
        
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.5,
        delay: 0.2
      }} className="flex justify-center space-x-8 my-12">
          {[{
          icon: <Home size={32} className="text-purple-600" />,
          title: "Property Owners",
          description: "Manage properties and automate workflows"
        }, {
          icon: <User size={32} className="text-indigo-600" />,
          title: "Tenants",
          description: "Submit requests and track progress"
        }, {
          icon: <Wrench size={32} className="text-violet-600" />,
          title: "Service Providers",
          description: "Manage jobs and communicate effectively"
        }].map((role, index) => <motion.div key={role.title} className="flex flex-col items-center group" whileHover={{
          scale: 1.05
        }} transition={{
          type: "spring",
          stiffness: 300
        }}>
              <div className="p-4 bg-white/70 backdrop-blur-md rounded-xl shadow-lg border border-white/20 transition-all duration-300">
                {role.icon}
              </div>
              <h3 className="mt-3 font-medium text-gray-900">{role.title}</h3>
              <p className="text-sm text-gray-600 text-center mt-1">{role.description}</p>
            </motion.div>)}
        </motion.div>
        
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.5,
        delay: 0.4
      }} className="mx-auto max-w-md">
          <AuthForm />
        </motion.div>
      </div>
    </div>;
}