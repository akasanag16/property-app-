
import { supabase } from "@/integrations/supabase/client";

/**
 * Extracts auth tokens from URL (both query params and hash fragments)
 */
export const extractAuthTokens = () => {
  const url = new URL(window.location.href);
  
  // Check query parameters first (newer Supabase format)
  const code = url.searchParams.get('code');
  if (code) {
    console.log("Found auth code in query params:", code);
    return { code, type: 'query' };
  }
  
  // Check hash fragments (older format)
  const hash = url.hash.substring(1);
  if (hash) {
    const params = new URLSearchParams(hash);
    const accessToken = params.get('access_token');
    const refreshToken = params.get('refresh_token');
    const type = params.get('type');
    
    if (accessToken && type === 'recovery') {
      console.log("Found recovery tokens in hash:", { accessToken: "***", refreshToken: "***", type });
      return { accessToken, refreshToken, type: 'hash' };
    }
  }
  
  console.log("No auth tokens found in URL");
  return null;
};

/**
 * Processes auth tokens and establishes session
 */
export const processAuthTokens = async () => {
  const tokens = extractAuthTokens();
  
  if (!tokens) {
    return { success: false, error: "No authentication tokens found in URL" };
  }
  
  try {
    if (tokens.type === 'query' && tokens.code) {
      // Handle PKCE flow with code
      console.log("Processing PKCE code exchange");
      const { data, error } = await supabase.auth.exchangeCodeForSession(tokens.code);
      
      if (error) {
        console.error("Code exchange error:", error);
        return { success: false, error: error.message };
      }
      
      console.log("Session established successfully via code exchange");
      return { success: true, session: data.session };
    } else if (tokens.type === 'hash' && tokens.accessToken) {
      // Handle legacy token format
      console.log("Processing legacy token format");
      const { data, error } = await supabase.auth.setSession({
        access_token: tokens.accessToken,
        refresh_token: tokens.refreshToken || ""
      });
      
      if (error) {
        console.error("Set session error:", error);
        return { success: false, error: error.message };
      }
      
      console.log("Session established successfully via token");
      return { success: true, session: data.session };
    }
    
    return { success: false, error: "Invalid token format" };
  } catch (error) {
    console.error("Token processing error:", error);
    return { success: false, error: "Failed to process authentication tokens" };
  }
};

/**
 * Cleans up URL after processing tokens
 */
export const cleanupURL = () => {
  const cleanUrl = `${window.location.origin}${window.location.pathname}`;
  window.history.replaceState({}, document.title, cleanUrl);
  console.log("URL cleaned up:", cleanUrl);
};

/**
 * Validates current session for password reset
 */
export const validateResetSession = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error("Session validation error:", error);
      return false;
    }
    
    if (!session) {
      console.log("No active session found");
      return false;
    }
    
    console.log("Valid reset session found for user:", session.user.email);
    return true;
  } catch (error) {
    console.error("Session validation failed:", error);
    return false;
  }
};
