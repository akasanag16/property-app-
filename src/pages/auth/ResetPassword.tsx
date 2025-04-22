
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { UpdatePasswordForm } from "@/components/auth/forms/UpdatePasswordForm";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button"; // Added Button import

export default function ResetPassword() {
  const [loading, setLoading] = useState(true);
  const [validSession, setValidSession] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if the user has an active recovery session
    const checkSession = async () => {
      try {
        // Log the current URL for debugging
        console.log("Reset password page loaded with URL:", window.location.href);
        
        // First check if we have a hash or query params with the recovery token
        const url = new URL(window.location.href);
        const hash = url.hash;
        const queryParams = new URLSearchParams(url.search);
        
        // Check for recovery tokens in hash or query params
        const hasRecoveryToken = (
          hash.includes('type=recovery') || 
          queryParams.get('type') === 'recovery'
        );
        
        console.log("Has recovery token:", hasRecoveryToken);
        
        if (hasRecoveryToken) {
          // Try to exchange the token for a session
          console.log("Attempting to process recovery token");
          
          try {
            // Process tokens from hash fragment
            if (hash && hash.includes('access_token')) {
              const hashParams = new URLSearchParams(hash.substring(1));
              const accessToken = hashParams.get('access_token');
              const refreshToken = hashParams.get('refresh_token');
              
              if (accessToken && refreshToken) {
                console.log("Found tokens in hash, setting session");
                const { data, error } = await supabase.auth.setSession({
                  access_token: accessToken,
                  refresh_token: refreshToken
                });
                
                if (error) throw error;
                
                if (data?.session) {
                  console.log("Session set successfully from hash");
                  setValidSession(true);
                  setLoading(false);
                  return;
                }
              }
            }
            
            // Process tokens from query parameters
            const accessToken = queryParams.get('access_token');
            const refreshToken = queryParams.get('refresh_token');
            
            if (accessToken && refreshToken) {
              console.log("Found tokens in query params, setting session");
              const { data, error } = await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken
              });
              
              if (error) throw error;
              
              if (data?.session) {
                console.log("Session set successfully from query params");
                setValidSession(true);
                setLoading(false);
                return;
              }
            }
          } catch (error) {
            console.error("Error processing recovery token:", error);
            toast.error("Invalid or expired recovery token");
          }
        }
        
        // If we don't have a recovery token, check for an existing session
        const { data } = await supabase.auth.getSession();
        console.log("Current session status:", data.session ? "Active" : "None");
        
        if (data.session) {
          console.log("Using existing session");
          setValidSession(true);
        } else {
          console.log("No valid session found, redirecting to login");
          toast.error("Your password reset link has expired or is invalid");
          // Short delay to allow the toast to be seen
          setTimeout(() => navigate("/auth"), 2000);
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Error checking session:", error);
        toast.error("An error occurred while verifying your session");
        setLoading(false);
        // Short delay to allow the toast to be seen
        setTimeout(() => navigate("/auth"), 2000);
      }
    };
    
    checkSession();
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-[#F5F3FF] via-[#EDE9FE] to-white">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-gray-600">Verifying your reset link...</p>
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
              <Button
                onClick={() => navigate("/auth")}
                className="mt-4 text-primary hover:underline"
              >
                Return to login
              </Button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
