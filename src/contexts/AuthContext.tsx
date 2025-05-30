
import React, { createContext, useContext, useEffect, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { UserRole } from "@/lib/auth";
import { useUserRole } from "@/hooks/useUserRole";
import { useAuthSession } from "@/hooks/useAuthSession";
import { toast } from "sonner";

interface AuthContextType {
  session: Session | null;
  user: User | null;
  userRole: UserRole | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const defaultContextValue: AuthContextType = {
  session: null,
  user: null,
  userRole: null,
  loading: false, // Changed to false to prevent blocking
  signOut: async () => { console.error("AuthContext not initialized"); },
  refreshSession: async () => { console.error("AuthContext not initialized"); }
};

const AuthContext = createContext<AuthContextType>(defaultContextValue);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const {
    session,
    user,
    loading: sessionLoading,
    signOut,
    refreshSession
  } = useAuthSession();
  
  const { userRole, fetching: roleLoading } = useUserRole(user);
  const [isInitialized, setIsInitialized] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);

  // Store user role in sessionStorage for access outside the auth context
  useEffect(() => {
    if (userRole) {
      try {
        sessionStorage.setItem('userRole', userRole);
      } catch (error) {
        console.error("Could not store role in sessionStorage:", error);
      }
    } else {
      try {
        if (!roleLoading && user) { // Only clear if we have a user but no role
          sessionStorage.removeItem('userRole');
        }
      } catch (error) {
        console.error("Could not remove role from sessionStorage:", error);
      }
    }
  }, [userRole, roleLoading, user]);

  // Debug auth state and handle errors
  useEffect(() => {
    console.log("AuthProvider: Auth state updated", { 
      session: session ? "exists" : "null", 
      user: user ? user.email : "null", 
      userRole,
      loading: sessionLoading || roleLoading,
      isInitialized
    });
    
    // Mark context as initialized after first auth check
    if (!sessionLoading && !isInitialized) {
      console.log("AuthProvider: Marking as initialized");
      setIsInitialized(true);
    }

    // Handle authentication errors only for authenticated users
    if (session && user && !userRole && !roleLoading && isInitialized) {
      const errorMsg = "Unable to determine user role. Please try signing out and back in.";
      if (lastError !== errorMsg) {
        setLastError(errorMsg);
        console.error("AuthProvider: Role error for authenticated user");
        toast.error(errorMsg, {
          duration: 8000,
          action: {
            label: "Sign Out",
            onClick: signOut
          }
        });
      }
    } else {
      setLastError(null);
    }
  }, [session, user, userRole, sessionLoading, roleLoading, isInitialized, lastError, signOut]);

  // Only show loading for authenticated routes, not for initial page load
  const loading = user ? (sessionLoading || roleLoading) : false;

  const contextValue: AuthContextType = {
    session, 
    user, 
    userRole, 
    loading,
    signOut,
    refreshSession
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
