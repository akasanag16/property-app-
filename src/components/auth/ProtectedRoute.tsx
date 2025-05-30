
import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { UserRole } from "@/lib/auth";

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
  children: ReactNode;
}

export function ProtectedRoute({ allowedRoles, children }: ProtectedRouteProps) {
  const { user, userRole, loading } = useAuth();

  console.log("ProtectedRoute: Checking auth", { 
    user: user?.email || "null", 
    userRole, 
    loading,
    allowedRoles 
  });

  // If still loading auth state, show a loading spinner
  if (loading) {
    console.log("Auth still loading, showing spinner");
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  // Redirect to auth page if not logged in
  if (!user) {
    console.log("User not authenticated, redirecting to auth");
    return <Navigate to="/auth" replace />;
  }

  // If roles are specified, check if user has required role
  if (allowedRoles && allowedRoles.length > 0 && userRole && !allowedRoles.includes(userRole)) {
    console.log("User doesn't have required role, redirecting to unauthorized", { userRole, allowedRoles });
    return <Navigate to="/unauthorized" replace />;
  }

  // If all checks pass, render the protected content
  console.log("Auth checks passed, rendering protected content");
  return <>{children}</>;
}
