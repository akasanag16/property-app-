
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { UpdatePasswordForm } from "@/components/auth/forms/UpdatePasswordForm";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function ResetPassword() {
  const [loading, setLoading] = useState(true);
  const [validSession, setValidSession] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const processResetToken = async () => {
      try {
        console.log("Reset password page loaded");
        console.log("Current URL:", window.location.href);
        console.log("Hash:", window.location.hash);
        console.log("Search:", window.location.search);
        
        // Parse URL parameters
        const url = new URL(window.location.href);
        const hash = url.hash.substring(1); // Remove the # character
        const searchParams = new URLSearchParams(url.search);
        
        console.log("Parsed hash:", hash);
        console.log("Search params:", Object.fromEntries(searchParams));
        
        let accessToken = null;
        let refreshToken = null;
        let type = null;
        
        // Check hash fragment first (modern Supabase auth flow)
        if (hash) {
          const hashParams = new URLSearchParams(hash);
          accessToken = hashParams.get('access_token');
          refreshToken = hashParams.get('refresh_token');
          type = hashParams.get('type');
          
          console.log("From hash - Access token:", accessToken ? "present" : "missing");
          console.log("From hash - Refresh token:", refreshToken ? "present" : "missing");
          console.log("From hash - Type:", type);
        }
        
        // Check query parameters as fallback
        if (!accessToken || !refreshToken) {
          accessToken = searchParams.get('access_token');
          refreshToken = searchParams.get('refresh_token');
          type = searchParams.get('type');
          
          console.log("From query - Access token:", accessToken ? "present" : "missing");
          console.log("From query - Refresh token:", refreshToken ? "present" : "missing");
          console.log("From query - Type:", type);
        }
        
        // Validate that this is a recovery flow
        if (type !== 'recovery') {
          console.log("Not a recovery flow, type:", type);
          throw new Error("Invalid reset link - not a recovery type");
        }
        
        if (!accessToken || !refreshToken) {
          console.log("Missing required tokens");
          throw new Error("Invalid reset link - missing authentication tokens");
        }
        
        console.log("Setting session with tokens...");
        
        // Set the session with the tokens
        const { data, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken
        });
        
        if (error) {
          console.error("Error setting session:", error);
          throw new Error(`Failed to authenticate: ${error.message}`);
        }
        
        if (!data.session) {
          console.error("No session created");
          throw new Error("Failed to create authentication session");
        }
        
        console.log("Session created successfully for user:", data.session.user.email);
        setValidSession(true);
        
        // Clean up the URL by removing the hash/query parameters
        const cleanUrl = `${window.location.origin}${window.location.pathname}`;
        window.history.replaceState({}, document.title, cleanUrl);
        
      } catch (error) {
        console.error("Error processing reset token:", error);
        const errorMessage = error instanceof Error ? error.message : "Invalid or expired reset link";
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    
    processResetToken();
  }, []);

  const handleReturnToLogin = () => {
    navigate("/auth");
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-[#F5F3FF] via-[#EDE9FE] to-white">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-gray-600">Verifying your reset link...</p>
        <p className="mt-2 text-xs text-gray-500">This may take a moment</p>
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
            <div className="text-center space-y-4">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
              <h2 className="text-2xl font-bold text-gray-900">Reset Link Issue</h2>
              
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2 text-sm text-gray-600">
                <p>This password reset link appears to be invalid or has expired.</p>
                <p>Common causes:</p>
                <ul className="text-left list-disc pl-4 space-y-1">
                  <li>The link has already been used</li>
                  <li>The link has expired (links expire after a certain time)</li>
                  <li>The link was not copied completely</li>
                  <li>The link format is incorrect</li>
                </ul>
              </div>
              
              <div className="space-y-3">
                <Button
                  onClick={handleReturnToLogin}
                  className="w-full"
                >
                  Return to Login
                </Button>
                
                <p className="text-xs text-gray-500">
                  You can request a new password reset link from the login page
                </p>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
