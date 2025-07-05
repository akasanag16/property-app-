
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Building, Users, Wrench } from "lucide-react";
import { useEffect } from "react";

const Index = () => {
  const navigate = useNavigate();

  // Check for password reset code and redirect appropriately
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const type = urlParams.get('type');
    
    // If there's a code parameter, it's likely a password reset
    if (code) {
      console.log("Found code parameter, redirecting to reset password page");
      // Redirect to reset password page with the code
      navigate(`/auth/reset-password?code=${code}${type ? `&type=${type}` : ''}`);
    }
  }, [navigate]);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-50 via-white to-blue-50 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="relative z-10 text-center space-y-12 px-4"
      >
        <div className="space-y-4">
          <motion.h1 
            variants={item}
            className="text-5xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600"
          >
            Property Maintenance
          </motion.h1>
          <motion.p 
            variants={item}
            className="text-xl md:text-2xl text-gray-600"
          >
            Manage your properties efficiently
          </motion.p>
        </div>

        <motion.div 
          variants={container}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto"
        >
          <motion.div
            variants={item}
            whileHover={{ scale: 1.05 }}
            className="group relative bg-white/50 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-white/20 transition-all duration-300"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <Building className="h-12 w-12 mb-4 text-purple-600 mx-auto" />
            <h3 className="text-xl font-semibold mb-2">Owners</h3>
            <p className="text-gray-600">Manage properties and tenants</p>
          </motion.div>

          <motion.div
            variants={item}
            whileHover={{ scale: 1.05 }}
            className="group relative bg-white/50 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-white/20 transition-all duration-300"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-green-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <Users className="h-12 w-12 mb-4 text-blue-600 mx-auto" />
            <h3 className="text-xl font-semibold mb-2">Tenants</h3>
            <p className="text-gray-600">Access services</p>
          </motion.div>

          <motion.div
            variants={item}
            whileHover={{ scale: 1.05 }}
            className="group relative bg-white/50 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-white/20 transition-all duration-300"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-yellow-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <Wrench className="h-12 w-12 mb-4 text-green-600 mx-auto" />
            <h3 className="text-xl font-semibold mb-2">Providers</h3>
            <p className="text-gray-600">Offer services</p>
          </motion.div>
        </motion.div>

        <motion.div variants={item}>
          <Button 
            onClick={() => navigate("/auth")} 
            size="lg"
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-3 rounded-full hover:shadow-lg transition-all duration-300 hover:scale-105"
          >
            Get Started
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Index;
