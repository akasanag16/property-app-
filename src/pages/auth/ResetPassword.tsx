
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { UpdatePasswordForm } from "@/components/auth/forms/UpdatePasswordForm";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, AlertCircle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { processAuthTokens, cleanupURL, validateResetSession, handleResetTokenError } from "@/utils/resetUtils";
import { getPasswordResetConfig } from "@/utils/authUtils";
import type { Session } from "@supabase/supabase-js";

export default function ResetPassword() {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [processingTokens, setProcessingTokens] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    console.log("ResetPassword component mounted");
    console.log("Password reset config:", getPasswordResetConfig());
    
    let mounted = true;

    const initializeReset = async () => {
      try {
        // First, check if we have tokens in the URL to process
        const url = new URL(window.location.href);
        const hasCode = url.searchParams.get('code');
        const hasHashTokens = url.hash.includes('access_token') && url.hash.includes('type=recovery');
        
        console.log("URL analysis:", { hasCode: !!hasCode, hasHashTokens, fullUrl: url.href });
        
        if (hasCode || hasHashTokens) {
          console.log("Found auth tokens in URL, processing...");
          setProcessingTokens(true);
          
          const result = await processAuthTokens();
          
          if (result.success && result.session && mounted) {
            console.log("Tokens processed successfully, session established");
            setSession(result.session);
            cleanupURL();
            toast.success("Password reset link verified successfully");
          } else if (mounted) {
            console.error("Token processing failed:", result.error);
            const errorMessage = handleResetTokenError(result.error);
            setError(errorMessage);
            toast.error(errorMessage);
          }
          
          setProcessingTokens(false);
        } else {
          // No tokens in URL, check for existing session
          console.log("No tokens in URL, checking for existing session");
          const isValidSession = await validateResetSession();
          
          if (isValidSession && mounted) {
            const { data: { session: currentSession } } = await supabase.auth.getSession();
            setSession(currentSession);
            console.log("Using existing valid session");
          } else if (mounted) {
            setError("Invalid or expired reset link. Please request a new password reset.");
            console.log("No valid session found");
          }
        }
      } catch (error) {
        console.error("Reset initialization error:", error);
        if (mounted) {
          const errorMessage = handleResetTokenError(error);
          setError(errorMessage);
          toast.error(errorMessage);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state change in ResetPassword:", event, session ? "session exists" : "no session");
      
      if (event === 'PASSWORD_RECOVERY' && session && mounted) {
        console.log("Password recovery event detected");
        setSession(session);
        setError(null);
        setLoading(false);
        toast.success("Ready to reset your password");
      }
    });

    // Initialize the reset process
    initializeReset();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleRetryProcessing = () => {
    console.log("Retrying password reset processing");
    setLoading(true);
    setError(null);
    window.location.reload();
  };

  const handleReturnToLogin = () => {
    console.log("Returning to login page");
    navigate("/auth");
  };

  const handleGoHome = () => {
    console.log("Going to homepage");
    navigate("/");
  };

  const handleRequestNewReset = () => {
    console.log("Requesting new password reset");
    navigate("/auth");
    toast.info("Please use the 'Forgot Password' option to get a new reset link");
  };

  if (loading || processingTokens) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-[#F5F3FF] via-[#EDE9FE] to-white">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-gray-600">
          {processingTokens ? "Processing your reset link..." : "Loading reset form..."}
        </p>
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
          {session ? (
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
              
              <div className="space-y-3 text-sm text-gray-600">
                <p>This password reset link appears to be invalid or has encountered an issue.</p>
                
                <details className="text-left bg-gray-50 p-3 rounded">
                  <summary className="cursor-pointer font-medium">Common solutions</summary>
                  <ul className="list-disc pl-4 space-y-1 mt-2">
                    <li>Request a new password reset link from the login page</li>
                    <li>Check that you're using the complete link from your email</li>
                    <li>Make sure you haven't already used this reset link</li>
                    <li>Verify the link hasn't expired (usually expires after 1 hour)</li>
                    <li>Try opening the link in a different browser or incognito mode</li>
                  </ul>
                </details>
              </div>
              
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    onClick={handleRequestNewReset}
                    className="flex-1"
                  >
                    Get New Reset Link
                  </Button>
                  
                  <Button
                    onClick={handleRetryProcessing}
                    variant="outline"
                    className="flex-1"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Retry
                  </Button>
                </div>
                
                <Button
                  onClick={handleReturnToLogin}
                  variant="outline"
                  className="w-full"
                >
                  Return to Login
                </Button>
                
                <Button
                  onClick={handleGoHome}
                  variant="ghost"
                  className="w-full"
                >
                  <Home className="h-4 w-4 mr-2" />
                  Go to Homepage
                </Button>
                
                <p className="text-xs text-gray-500">
                  If you continue having issues, try clearing your browser cache or contact support
                </p>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
