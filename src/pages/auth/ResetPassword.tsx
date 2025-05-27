
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { UpdatePasswordForm } from "@/components/auth/forms/UpdatePasswordForm";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, AlertCircle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { Session } from "@supabase/supabase-js";

export default function ResetPassword() {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    console.log("ResetPassword component mounted");
    
    let mounted = true;

    const handleAuthStateChange = async () => {
      try {
        // Get the current session
        const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Session error:", sessionError);
          throw new Error(`Session error: ${sessionError.message}`);
        }

        if (!mounted) return;

        console.log("Current session:", currentSession ? "exists" : "null");
        
        if (currentSession) {
          console.log("Valid session found for password reset");
          setSession(currentSession);
        } else {
          console.log("No session found, checking URL for auth tokens");
          
          // Check if we're in a recovery flow by looking at the URL
          const url = new URL(window.location.href);
          const fragment = url.hash.substring(1);
          const params = new URLSearchParams(fragment);
          const type = params.get('type');
          
          console.log("URL analysis:", { fragment, type });
          
          if (type === 'recovery') {
            console.log("Recovery type detected, waiting for Supabase to process tokens");
            // Wait a bit for Supabase to process the tokens
            setTimeout(async () => {
              const { data: { session: retrySession } } = await supabase.auth.getSession();
              if (retrySession && mounted) {
                console.log("Session established after retry");
                setSession(retrySession);
              } else if (mounted) {
                console.log("No session after retry, showing error");
                setError("Invalid or expired reset link. Please request a new password reset.");
              }
              if (mounted) setLoading(false);
            }, 2000);
            return;
          } else {
            setError("Invalid reset link. Please use the link from your email or request a new password reset.");
          }
        }
      } catch (error) {
        console.error("Error in handleAuthStateChange:", error);
        if (mounted) {
          const errorMessage = error instanceof Error ? error.message : "Failed to process reset link";
          setError(errorMessage);
          toast.error(errorMessage);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state change:", event, session ? "session exists" : "no session");
      
      if (event === 'PASSWORD_RECOVERY') {
        console.log("Password recovery event detected");
        if (session && mounted) {
          setSession(session);
          setLoading(false);
          setError(null);
        }
      }
    });

    // Initial check
    handleAuthStateChange();

    // Cleanup
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleRetryProcessing = () => {
    setLoading(true);
    setError(null);
    window.location.reload();
  };

  const handleReturnToLogin = () => {
    navigate("/auth");
  };

  const handleGoHome = () => {
    navigate("/");
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-[#F5F3FF] via-[#EDE9FE] to-white">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-gray-600">Processing your reset link...</p>
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
                  </ul>
                </details>
              </div>
              
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    onClick={handleRetryProcessing}
                    variant="outline"
                    className="flex-1"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Retry
                  </Button>
                  
                  <Button
                    onClick={handleReturnToLogin}
                    className="flex-1"
                  >
                    Return to Login
                  </Button>
                </div>
                
                <Button
                  onClick={handleGoHome}
                  variant="ghost"
                  className="w-full"
                >
                  <Home className="h-4 w-4 mr-2" />
                  Go to Homepage
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
