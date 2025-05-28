
import { supabase } from "@/integrations/supabase/client";

/**
 * Gets the appropriate reset redirect URL for the current environment
 */
export const getResetRedirectURL = () => {
  return "https://prop-link-manage.lovable.app/auth/reset-password";
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
