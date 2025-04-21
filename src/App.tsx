
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import AcceptInvitation from "./pages/auth/AcceptInvitation";
import NotFound from "./pages/NotFound";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import OwnerDashboard from "./pages/owner/OwnerDashboard";
import TenantDashboard from "./pages/tenant/TenantDashboard";
import ServiceProviderDashboard from "./pages/service-provider/ServiceProviderDashboard";
import Unauthorized from "./pages/Unauthorized";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/invitation/accept" element={<AcceptInvitation />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            
            {/* Protected routes (any authenticated user) */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
            </Route>
            
            {/* Owner-specific routes */}
            <Route element={<ProtectedRoute allowedRoles={["owner"]} />}>
              <Route path="/owner-dashboard" element={<OwnerDashboard />} />
            </Route>
            
            {/* Tenant-specific routes */}
            <Route element={<ProtectedRoute allowedRoles={["tenant"]} />}>
              <Route path="/tenant-dashboard" element={<TenantDashboard />} />
            </Route>
            
            {/* Service provider-specific routes */}
            <Route element={<ProtectedRoute allowedRoles={["service_provider"]} />}>
              <Route path="/service-provider-dashboard" element={<ServiceProviderDashboard />} />
            </Route>
            
            {/* Not found route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
