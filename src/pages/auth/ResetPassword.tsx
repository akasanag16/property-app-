
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { UpdatePasswordForm } from "@/components/auth/forms/UpdatePasswordForm";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, AlertCircle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function ResetPassword() {
  const [loading, setLoading] = useState(true);
  const [validSession, setValidSession] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>({});
  const navigate = useNavigate();

  useEffect(() => {
    const processResetToken = async () => {
      try {
        console.log("Reset password page loaded");
        const currentUrl = window.location.href;
        console.log("Current URL:", currentUrl);
        
        // Parse URL parameters more robustly
        const url = new URL(currentUrl);
        const hash = url.hash.substring(1);
        const searchParams = new URLSearchParams(url.search);
        
        const debugData = {
          fullUrl: currentUrl,
          origin: url.origin,
          pathname: url.pathname,
          hash: hash,
          searchParams: Object.fromEntries(searchParams),
          timestamp: new Date().toISOString()
        };
        
        setDebugInfo(debugData);
        console.log("Debug info:", debugData);
        
        let accessToken = null;
        let refreshToken = null;
        let type = null;
        
        // Try hash fragment first (modern Supabase auth flow)
        if (hash) {
          const hashParams = new URLSearchParams(hash);
          accessToken = hashParams.get('access_token');
          refreshToken = hashParams.get('refresh_token');
          type = hashParams.get('type');
          
          console.log("Hash tokens found:", {
            hasAccessToken: !!accessToken,
            hasRefreshToken: !!refreshToken,
            type
          });
        }
        
        // Try query parameters as fallback
        if (!accessToken || !refreshToken) {
          accessToken = searchParams.get('access_token');
          refreshToken = searchParams.get('refresh_token');
          type = searchParams.get('type');
          
          console.log("Query tokens found:", {
            hasAccessToken: !!accessToken,
            hasRefreshToken: !!refreshToken,
            type
          });
        }
        
        // Check for error parameters
        const errorParam = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');
        
        if (errorParam) {
          console.error("URL contains error:", errorParam, errorDescription);
          throw new Error(`Authentication error: ${errorParam} - ${errorDescription || 'Unknown error'}`);
        }
        
        // Validate recovery flow
        if (type !== 'recovery') {
          console.log("Not a recovery flow, type:", type);
          if (!type) {
            throw new Error("Invalid reset link - missing authentication type");
          } else {
            throw new Error(`Invalid reset link - expected 'recovery' type but got '${type}'`);
          }
        }
        
        if (!accessToken || !refreshToken) {
          console.log("Missing tokens:", { accessToken: !!accessToken, refreshToken: !!refreshToken });
          throw new Error("Invalid reset link - missing authentication tokens");
        }
        
        console.log("Setting session with recovery tokens...");
        
        // Set the session
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
        
        // Clean up the URL
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

  const handleRetryProcessing = () => {
    setLoading(true);
    setError(null);
    // Reload the page to retry processing
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
              
              <div className="space-y-3 text-sm text-gray-600">
                <p>This password reset link appears to be invalid or has encountered an issue.</p>
                
                <details className="text-left bg-gray-50 p-3 rounded">
                  <summary className="cursor-pointer font-medium">Common causes and solutions</summary>
                  <ul className="list-disc pl-4 space-y-1 mt-2">
                    <li>The link has already been used (links are single-use)</li>
                    <li>The link has expired (usually after 1 hour)</li>
                    <li>The link was not copied completely from your email</li>
                    <li>There's a configuration issue with the authentication service</li>
                  </ul>
                </details>
                
                {debugInfo.fullUrl && (
                  <details className="text-left bg-blue-50 p-3 rounded">
                    <summary className="cursor-pointer font-medium text-blue-700">Technical details</summary>
                    <div className="mt-2 text-xs font-mono break-all">
                      <p><strong>URL:</strong> {debugInfo.fullUrl}</p>
                      <p><strong>Origin:</strong> {debugInfo.origin}</p>
                      <p><strong>Hash:</strong> {debugInfo.hash || 'None'}</p>
                      <p><strong>Query params:</strong> {JSON.stringify(debugInfo.searchParams)}</p>
                    </div>
                  </details>
                )}
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
