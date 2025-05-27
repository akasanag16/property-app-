
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
    isResetPasswordPage,
    origin: window.location.origin
  });
  
  if (hasRecoveryType) {
    try {
      // Process tokens from hash fragment (modern approach)
      if (hash && hash.includes('access_token')) {
        const urlParams = new URLSearchParams(hash.substring(1));
        const accessToken = urlParams.get('access_token');
        const refreshToken = urlParams.get('refresh_token');
        const type = urlParams.get('type');
        
        if (accessToken && refreshToken && type === 'recovery') {
          console.log("Found recovery tokens in hash, setting session");
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });
          
          if (error) {
            console.error("Error setting session from hash:", error);
            throw new Error(`Session error: ${error.message}`);
          }
          
          console.log("Session set successfully from hash");
          return true;
        }
      }
      
      // Process tokens from query parameters (fallback)
      const accessToken = queryParams.get('access_token');
      const refreshToken = queryParams.get('refresh_token');
      const type = queryParams.get('type');
      
      if (accessToken && refreshToken && type === 'recovery') {
        console.log("Found recovery tokens in query params, setting session");
        const { data, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken
        });
        
        if (error) {
          console.error("Error setting session from query params:", error);
          throw new Error(`Session error: ${error.message}`);
        }
        
        console.log("Session set successfully from query params");
        return true;
      }
      
      console.log("Recovery type found but missing valid tokens");
      throw new Error("Invalid recovery tokens - tokens may be expired or malformed");
      
    } catch (error) {
      console.error("Error processing recovery:", error);
      throw error;
    }
  }
  
  console.log("No recovery token found");
  return false;
};

/**
 * Validates if the current session is valid for password reset
 */
export const validateResetSession = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error("Error getting session:", error);
      return false;
    }
    
    if (!session) {
      console.log("No active session found");
      return false;
    }
    
    console.log("Valid session found for user:", session.user.email);
    return true;
  } catch (error) {
    console.error("Error validating session:", error);
    return false;
  }
};

/**
 * Cleans up URL parameters after processing auth tokens
 */
export const cleanAuthURL = () => {
  const cleanUrl = `${window.location.origin}${window.location.pathname}`;
  window.history.replaceState({}, document.title, cleanUrl);
  console.log("URL cleaned up:", cleanUrl);
};

/**
 * Gets the appropriate reset redirect URL for the current environment
 */
export const getResetRedirectURL = () => {
  const baseUrl = window.location.origin;
  return `${baseUrl}/auth/reset-password`;
};

/**
 * Validates if a URL is properly formatted for reset redirects
 */
export const validateResetURL = (url: string): boolean => {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.protocol === 'https:' || parsedUrl.protocol === 'http:';
  } catch {
    return false;
  }
};
