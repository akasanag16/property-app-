
import { supabase } from "@/integrations/supabase/client";

/**
 * Extracts auth tokens from URL (both query params and hash fragments)
 */
export const extractAuthTokens = () => {
  const url = new URL(window.location.href);
  
  console.log("Extracting auth tokens from URL:", url.href);
  
  // Check query parameters first (newer Supabase format)
  const code = url.searchParams.get('code');
  if (code) {
    console.log("Found auth code in query params:", code.substring(0, 10) + "...");
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
      console.log("Found recovery tokens in hash, type:", type);
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
    console.log("Processing auth tokens, type:", tokens.type);
    
    if (tokens.type === 'query' && tokens.code) {
      // Handle PKCE flow with code
      console.log("Processing PKCE code exchange");
      const { data, error } = await supabase.auth.exchangeCodeForSession(tokens.code);
      
      if (error) {
        console.error("Code exchange error:", error);
        return { success: false, error: `Failed to exchange code: ${error.message}` };
      }
      
      if (!data.session) {
        console.error("No session returned from code exchange");
        return { success: false, error: "No session established after code exchange" };
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
        return { success: false, error: `Failed to set session: ${error.message}` };
      }
      
      if (!data.session) {
        console.error("No session returned from setSession");
        return { success: false, error: "No session established after setting tokens" };
      }
      
      console.log("Session established successfully via token");
      return { success: true, session: data.session };
    }
    
    return { success: false, error: "Invalid token format" };
  } catch (error) {
    console.error("Token processing error:", error);
    return { 
      success: false, 
      error: `Failed to process authentication tokens: ${error instanceof Error ? error.message : 'Unknown error'}` 
    };
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
    console.log("Validating reset session...");
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error("Session validation error:", error);
      return false;
    }
    
    if (!session) {
      console.log("No active session found");
      return false;
    }
    
    // Check if this is actually a password recovery session
    const user = session.user;
    if (!user) {
      console.log("No user in session");
      return false;
    }
    
    console.log("Valid reset session found for user:", user.email);
    return true;
  } catch (error) {
    console.error("Session validation failed:", error);
    return false;
  }
};

/**
 * Enhanced error handling for reset token processing
 */
export const handleResetTokenError = (error: any) => {
  console.error("Reset token error:", error);
  
  if (error?.message?.includes('expired')) {
    return "This password reset link has expired. Please request a new one.";
  }
  
  if (error?.message?.includes('invalid')) {
    return "This password reset link is invalid. Please request a new one.";
  }
  
  if (error?.message?.includes('used')) {
    return "This password reset link has already been used. Please request a new one.";
  }
  
  return "There was an issue processing your password reset link. Please try requesting a new one.";
};
