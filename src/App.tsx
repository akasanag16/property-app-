
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import OwnerDashboard from "./pages/owner/OwnerDashboard";
import OwnerProperties from "./pages/owner/OwnerProperties";
import OwnerTenants from "./pages/owner/OwnerTenants";
import OwnerServiceProviders from "./pages/owner/OwnerServiceProviders";
import OwnerMaintenance from "./pages/owner/OwnerMaintenance";
import OwnerRent from "./pages/owner/OwnerRent";
import TenantDashboard from "./pages/tenant/TenantDashboard";
import PropertyMaintenanceRequests from "./pages/service-provider/PropertyMaintenanceRequests";
import ServiceProviderDashboard from "./pages/service-provider/ServiceProviderDashboard";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import AcceptInvitation from "./pages/auth/AcceptInvitation";
import ResetPassword from "./pages/auth/ResetPassword";
import EmailConfirm from "./pages/auth/EmailConfirm";
import NotFound from "./pages/NotFound";
import Unauthorized from "./pages/Unauthorized";
import { Toaster } from "sonner";
import { NotificationProvider } from "./contexts/NotificationContext";
import SettingsPage from "./pages/settings/SettingsPage";

// Create a client
const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <NotificationProvider>
          <Router>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/auth/reset-password" element={<ResetPassword />} />
              <Route path="/auth/email-confirm" element={<EmailConfirm />} />
              <Route path="/auth/accept-invitation" element={<AcceptInvitation />} />
              
              {/* Protected routes */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              
              {/* Owner routes */}
              <Route path="/owner-dashboard" element={
                <ProtectedRoute allowedRoles={["owner"]}>
                  <OwnerDashboard />
                </ProtectedRoute>
              } />
              <Route path="/owner/properties" element={
                <ProtectedRoute allowedRoles={["owner"]}>
                  <OwnerProperties />
                </ProtectedRoute>
              } />
              <Route path="/owner/tenants" element={
                <ProtectedRoute allowedRoles={["owner"]}>
                  <OwnerTenants />
                </ProtectedRoute>
              } />
              <Route path="/owner/service-providers" element={
                <ProtectedRoute allowedRoles={["owner"]}>
                  <OwnerServiceProviders />
                </ProtectedRoute>
              } />
              <Route path="/owner/maintenance" element={
                <ProtectedRoute allowedRoles={["owner"]}>
                  <OwnerMaintenance />
                </ProtectedRoute>
              } />
              <Route path="/owner/rent" element={
                <ProtectedRoute allowedRoles={["owner"]}>
                  <OwnerRent />
                </ProtectedRoute>
              } />
              <Route path="/owner/settings" element={
                <ProtectedRoute allowedRoles={["owner"]}>
                  <SettingsPage />
                </ProtectedRoute>
              } />
              
              {/* Tenant routes */}
              <Route path="/tenant-dashboard" element={
                <ProtectedRoute allowedRoles={["tenant"]}>
                  <TenantDashboard />
                </ProtectedRoute>
              } />
              <Route path="/tenant/properties" element={
                <ProtectedRoute allowedRoles={["tenant"]}>
                  <NotFound note="Tenant Properties page is under development" />
                </ProtectedRoute>
              } />
              <Route path="/tenant/maintenance" element={
                <ProtectedRoute allowedRoles={["tenant"]}>
                  <NotFound note="Tenant Maintenance page is under development" />
                </ProtectedRoute>
              } />
              <Route path="/tenant/rent" element={
                <ProtectedRoute allowedRoles={["tenant"]}>
                  <NotFound note="Tenant Rent page is under development" />
                </ProtectedRoute>
              } />
              <Route path="/tenant/settings" element={
                <ProtectedRoute allowedRoles={["tenant"]}>
                  <SettingsPage />
                </ProtectedRoute>
              } />
              
              {/* Service Provider routes */}
              <Route path="/service-provider-dashboard" element={
                <ProtectedRoute allowedRoles={["service_provider"]}>
                  <ServiceProviderDashboard />
                </ProtectedRoute>
              } />
              <Route path="/service-provider/properties" element={
                <ProtectedRoute allowedRoles={["service_provider"]}>
                  <NotFound note="Service Provider Properties page is under development" />
                </ProtectedRoute>
              } />
              <Route path="/service-provider/maintenance" element={
                <ProtectedRoute allowedRoles={["service_provider"]}>
                  <NotFound note="Service Provider Maintenance page is under development" />
                </ProtectedRoute>
              } />
              <Route path="/service-provider/properties/:id/maintenance" element={
                <ProtectedRoute allowedRoles={["service_provider"]}>
                  <PropertyMaintenanceRequests />
                </ProtectedRoute>
              } />
              <Route path="/service-provider/settings" element={
                <ProtectedRoute allowedRoles={["service_provider"]}>
                  <SettingsPage />
                </ProtectedRoute>
              } />
              
              <Route path="/unauthorized" element={<Unauthorized />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Router>
          <Toaster position="top-right" />
        </NotificationProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
