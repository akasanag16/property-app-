
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { UserRole } from "@/lib/auth";

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
}

export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { user, userRole, loading } = useAuth();

  // If still loading auth state, show nothing (or a spinner)
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  // Redirect to auth page if not logged in
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // If roles are specified, check if user has required role
  if (allowedRoles && userRole && !allowedRoles.includes(userRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // If all checks pass, render the protected content
  return <Outlet />;
}
