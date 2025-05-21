
import React, { createContext, useContext, useEffect } from "react";
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

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const {
    session,
    user,
    loading,
    signOut
  } = useAuthSession();
  
  const { userRole, fetching: roleLoading } = useUserRole(user);

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
        // Only remove if not loading - this prevents clearing during load state
        if (!roleLoading) {
          sessionStorage.removeItem('userRole');
        }
      } catch (error) {
        console.error("Could not remove role from sessionStorage:", error);
      }
    }
  }, [userRole, roleLoading]);

  // Debug auth state
  useEffect(() => {
    console.log("AuthProvider: Auth state updated", { 
      session: session ? "exists" : "null", 
      user: user ? user.email : "null", 
      userRole,
      loading: loading || roleLoading
    });
  }, [session, user, userRole, loading, roleLoading]);

  return (
    <AuthContext.Provider value={{ 
      session, 
      user, 
      userRole, 
      loading: loading || roleLoading, 
      signOut 
    }}>
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
