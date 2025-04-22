import React, { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";
import { toast } from "sonner";
import { UserRole } from "@/lib/auth";

interface AuthContextType {
  session: Session | null;
  user: User | null;
  userRole: UserRole | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check URL for password reset recovery token
    const parseRecoveryFromURL = async () => {
      // Look for recovery tokens in both hash and query parameters
      const hash = window.location.hash;
      const queryParams = new URLSearchParams(window.location.search);
      
      // Check if we're on the reset-password page with a token
      const isResetPasswordPage = window.location.pathname.includes('reset-password');
      const hasRecoveryType = hash.includes('type=recovery') || queryParams.get('type') === 'recovery';
      
      // Log what we're finding for debugging
      console.log("Checking for recovery token:", { 
        path: window.location.pathname,
        hash,
        hasRecoveryType,
        isResetPasswordPage
      });
      
      if (hasRecoveryType) {
        try {
          // Extract tokens from hash
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
              
              // Redirect to password reset page if not already there
              if (!isResetPasswordPage) {
                navigate('/auth/reset-password');
              }
              return true;
            }
          }
          
          // Also check query parameters for tokens (some auth providers use this format)
          const accessToken = queryParams.get('access_token');
          const refreshToken = queryParams.get('refresh_token');
          
          if (accessToken && refreshToken) {
            console.log("Found recovery tokens in query params, setting session");
            const { data, error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken
            });
            
            if (error) throw error;
            
            // Redirect to password reset page if not already there
            if (!isResetPasswordPage) {
              navigate('/auth/reset-password');
            }
            return true;
          }
        } catch (error) {
          console.error("Error processing recovery:", error);
          toast.error("Failed to process password recovery");
        }
      }
      return false;
    };

    // First, set up the auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        console.log("Auth state changed:", event, currentSession);
        
        if (currentSession?.user) {
          setSession(currentSession);
          setUser(currentSession.user);
          
          // Use setTimeout to avoid potential auth deadlocks
          setTimeout(() => {
            fetchUserRole(currentSession.user.id);
          }, 0);
        } else {
          setSession(null);
          setUser(null);
          setUserRole(null);
        }
      }
    );

    // Then check for existing session
    const initializeAuth = async () => {
      try {
        // Check if we have a recovery token in the URL
        const isRecovery = await parseRecoveryFromURL();
        if (isRecovery) {
          setLoading(false);
          return;
        }
        
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        if (currentSession?.user) {
          setSession(currentSession);
          setUser(currentSession.user);
          await fetchUserRole(currentSession.user.id);
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  // Fetch user role from profiles table
  const fetchUserRole = async (userId: string) => {
    try {
      console.log("Fetching user role for:", userId);
      
      const { data, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .maybeSingle();

      if (error) {
        console.error("Error fetching profile:", error);
        return;
      }

      if (data) {
        console.log("User role fetched:", data.role);
        setUserRole(data.role as UserRole);
      } else {
        console.warn("No profile found for user:", userId);
      }
    } catch (error) {
      console.error("Error fetching user role:", error);
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setSession(null);
      setUser(null);
      setUserRole(null);
      navigate("/auth");
      toast.success("Signed out successfully");
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error("Failed to sign out");
    }
  };

  return (
    <AuthContext.Provider value={{ session, user, userRole, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
