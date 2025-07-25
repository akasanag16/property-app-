
import React, { createContext, useContext, useEffect, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { UserRole } from "@/lib/auth";
import { useUserRole } from "@/hooks/useUserRole";
import { useAuthSession } from "@/hooks/useAuthSession";

interface AuthContextType {
  session: Session | null;
  user: User | null;
  userRole: UserRole | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

// Create a default value for the context to avoid the need for null checks
const defaultContextValue: AuthContextType = {
  session: null,
  user: null,
  userRole: null,
  loading: true,
  signOut: async () => { console.error("AuthContext not initialized"); }
};

const AuthContext = createContext<AuthContextType>(defaultContextValue);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const {
    session,
    user,
    loading: sessionLoading,
    signOut
  } = useAuthSession();
  
  const { userRole, fetching: roleLoading } = useUserRole(user);
  const [isInitialized, setIsInitialized] = useState(false);

  // Store user role in sessionStorage for access outside the auth context
  useEffect(() => {
    if (userRole) {
      try {
        sessionStorage.setItem('userRole', userRole);
      } catch (error) {
        // Silently handle sessionStorage errors
        if (process.env.NODE_ENV === 'development') {
          console.error("Could not store role in sessionStorage:", error);
        }
      }
    } else {
      try {
        // Only remove if not loading - this prevents clearing during load state
        if (!roleLoading) {
          sessionStorage.removeItem('userRole');
        }
      } catch (error) {
        // Silently handle sessionStorage errors
        if (process.env.NODE_ENV === 'development') {
          console.error("Could not remove role from sessionStorage:", error);
        }
      }
    }
  }, [userRole, roleLoading]);

  // Initialize context when auth check is complete
  useEffect(() => {
    // Mark context as initialized once the first auth check is complete
    if (!sessionLoading && !roleLoading && !isInitialized) {
      setIsInitialized(true);
    }
  }, [sessionLoading, roleLoading, isInitialized]);

  // The loading state should be true if sessionLoading or roleLoading is true
  const loading = sessionLoading || roleLoading || !isInitialized;

  // Provide context value
  const contextValue: AuthContextType = {
    session, 
    user, 
    userRole, 
    loading,
    signOut
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
