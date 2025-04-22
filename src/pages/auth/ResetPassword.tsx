
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { UpdatePasswordForm } from "@/components/auth/forms/UpdatePasswordForm";
import { supabase } from "@/integrations/supabase/client";

export default function ResetPassword() {
  const [loading, setLoading] = useState(true);
  const [validSession, setValidSession] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if the user has an active recovery session
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      
      if (!data.session) {
        // No session, redirect to login
        navigate("/auth");
        return;
      }
      
      setValidSession(true);
      setLoading(false);
    };
    
    checkSession();
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#F5F3FF] via-[#EDE9FE] to-white py-12 px-4 sm:px-6 lg:px-8">
      <motion.div 
        className="w-full max-w-md space-y-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="w-full bg-white/70 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-8">
          {validSession ? (
            <UpdatePasswordForm />
          ) : (
            <div className="text-center">
              <h2 className="text-2xl font-bold">Invalid Reset Link</h2>
              <p className="text-sm text-gray-600 mt-2">
                This password reset link is invalid or has expired.
              </p>
              <button
                onClick={() => navigate("/auth")}
                className="mt-4 text-primary hover:underline"
              >
                Return to login
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
