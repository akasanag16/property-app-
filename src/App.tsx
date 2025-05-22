
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/auth/ResetPassword";
import AcceptInvitation from "./pages/auth/AcceptInvitation";
import EmailConfirm from "./pages/auth/EmailConfirm";
import NotFound from "./pages/NotFound";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import OwnerDashboard from "./pages/owner/OwnerDashboard";
import TenantDashboard from "./pages/tenant/TenantDashboard";
import ServiceProviderDashboard from "./pages/service-provider/ServiceProviderDashboard";
import PropertyMaintenanceRequests from "./pages/service-provider/PropertyMaintenanceRequests";
import Unauthorized from "./pages/Unauthorized";
import OwnerTenants from "./pages/owner/OwnerTenants";
import OwnerServiceProviders from "./pages/owner/OwnerServiceProviders";
import OwnerMaintenance from "./pages/owner/OwnerMaintenance";
import OwnerProperties from "./pages/owner/OwnerProperties";

// Create the query client outside the component to prevent unnecessary recreations
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <Routes>
              {/* Public routes - These don't require authentication */}
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/auth/reset-password" element={<ResetPassword />} />
              <Route path="/auth/confirm" element={<EmailConfirm />} />
              <Route path="/invitation/accept" element={<AcceptInvitation />} />
              <Route path="/auth/accept-invitation" element={<AcceptInvitation />} />
              
              {/* Important: The unauthorized page must be accessible without authentication */}
              <Route path="/unauthorized" element={<Unauthorized />} />
              
              {/* Protected routes (any authenticated user) */}
              <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<Dashboard />} />
              </Route>
              
              {/* Owner-specific routes */}
              <Route element={<ProtectedRoute allowedRoles={["owner"]} />}>
                <Route path="/owner-dashboard" element={<OwnerDashboard />} />
                <Route path="/owner/properties" element={<OwnerProperties />} />
                <Route path="/owner/tenants" element={<OwnerTenants />} />
                <Route path="/owner/service-providers" element={<OwnerServiceProviders />} />
                <Route path="/owner/maintenance" element={<OwnerMaintenance />} />
              </Route>
              
              {/* Tenant-specific routes */}
              <Route element={<ProtectedRoute allowedRoles={["tenant"]} />}>
                <Route path="/tenant-dashboard" element={<TenantDashboard />} />
                <Route path="/tenant/properties" element={<TenantDashboard />} />
                <Route path="/tenant/maintenance" element={<TenantDashboard />} />
              </Route>
              
              {/* Service provider-specific routes */}
              <Route element={<ProtectedRoute allowedRoles={["service_provider"]} />}>
                <Route path="/service-provider-dashboard" element={<ServiceProviderDashboard />} />
                <Route path="/service-provider/properties" element={<ServiceProviderDashboard />} />
                <Route path="/service-provider/maintenance" element={<ServiceProviderDashboard />} />
                <Route path="/service-provider/property/:propertyId/maintenance" element={<PropertyMaintenanceRequests />} />
              </Route>
              
              {/* Not found route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </TooltipProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
