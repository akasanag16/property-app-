
import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { UserRole } from "@/lib/auth";

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
  children: ReactNode;
}

export function ProtectedRoute({ allowedRoles, children }: ProtectedRouteProps) {
  const { user, userRole, loading } = useAuth();
  const location = useLocation();

  console.log("ProtectedRoute: Checking auth", { 
    user: user?.email || "null", 
    userRole, 
    loading,
    allowedRoles,
    pathname: location.pathname
  });

  // If still loading auth state, show a loading spinner
  if (loading) {
    console.log("ProtectedRoute: Auth still loading, showing spinner");
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  // Redirect to auth page if not logged in
  if (!user) {
    console.log("ProtectedRoute: User not authenticated, redirecting to auth");
    return <Navigate to="/auth" replace state={{ from: location }} />;
  }

  // If roles are specified, check if user has required role
  if (allowedRoles && allowedRoles.length > 0) {
    if (!userRole) {
      console.log("ProtectedRoute: User role not determined yet, showing loading");
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      );
    }
    
    if (!allowedRoles.includes(userRole)) {
      console.log("ProtectedRoute: User doesn't have required role, redirecting to unauthorized", { userRole, allowedRoles });
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // If all checks pass, render the protected content
  console.log("ProtectedRoute: Auth checks passed, rendering protected content");
  return <>{children}</>;
}
