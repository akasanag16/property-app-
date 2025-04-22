
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

/**
 * Parses the recovery token from URL parameters for password reset flows
 * 
 * @returns {Promise<boolean>} True if a recovery token was found and processed
 */
export const parseRecoveryTokenFromURL = async () => {
  const hash = window.location.hash;
  const queryParams = new URLSearchParams(window.location.search);
  const isResetPasswordPage = window.location.pathname.includes('reset-password');
  const hasRecoveryType = hash.includes('type=recovery') || queryParams.get('type') === 'recovery';
  
  console.log("Checking for recovery token:", { 
    path: window.location.pathname,
    hash,
    hasRecoveryType,
    isResetPasswordPage
  });
  
  if (hasRecoveryType) {
    try {
      if (hash && hash.includes('access_token')) {
        const urlParams = new URLSearchParams(hash.substring(1));
        const accessToken = urlParams.get('access_token');
        const refreshToken = urlParams.get('refresh_token');
        
        if (accessToken && refreshToken) {
          console.log("Found recovery tokens in hash, setting session");
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });
          
          if (error) throw error;
          return true;
        }
      }
      
      const accessToken = queryParams.get('access_token');
      const refreshToken = queryParams.get('refresh_token');
      
      if (accessToken && refreshToken) {
        console.log("Found recovery tokens in query params, setting session");
        const { data, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken
        });
        
        if (error) throw error;
        return true;
      }
    } catch (error) {
      console.error("Error processing recovery:", error);
      throw error;
    }
  }
  return false;
};
