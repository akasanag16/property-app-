
import React, { createContext, useContext } from "react";
import { Session, User } from "@supabase/supabase-js";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { UserRole } from "@/lib/auth";
import { useUserRole } from "@/hooks/useUserRole";
import { useAuthSession } from "@/hooks/useAuthSession";
import { parseRecoveryTokenFromURL } from "@/utils/authUtils";

interface AuthContextType {
  session: Session | null;
  user: User | null;
  userRole: UserRole | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const {
    session,
    setSession,
    user,
    setUser,
    loading,
    setLoading,
    signOut
  } = useAuthSession();
  
  const { userRole } = useUserRole(user);

  React.useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check if we have a recovery token in the URL
        const isRecovery = await parseRecoveryTokenFromURL();
        if (isRecovery) {
          setLoading(false);
          return;
        }
        
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        if (currentSession?.user) {
          setSession(currentSession);
          setUser(currentSession.user);
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
      } finally {
        setLoading(false);
      }
    };

    // First, set up the auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        console.log("Auth state changed:", event, currentSession);
        
        if (currentSession?.user) {
          setSession(currentSession);
          setUser(currentSession.user);
        } else {
          setSession(null);
          setUser(null);
        }
      }
    );

    initializeAuth();

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

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
