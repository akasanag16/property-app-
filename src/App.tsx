
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import TenantDashboard from "./pages/tenant/TenantDashboard";
import ServiceProviderDashboard from "./pages/service-provider/ServiceProviderDashboard";
import OwnerDashboard from "./pages/owner/OwnerDashboard";
import AcceptInvitation from "./pages/auth/AcceptInvitation";
import ResetPassword from "./pages/auth/ResetPassword";
import Unauthorized from "./pages/Unauthorized";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // Don't retry for authentication errors
        if (error instanceof Error && error.message.includes('auth')) {
          return false;
        }
        return failureCount < 3;
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
    mutations: {
      retry: (failureCount, error) => {
        // Don't retry for client errors (4xx)
        if (error instanceof Error && error.message.includes('400')) {
          return false;
        }
        return failureCount < 2;
      },
    },
  },
});

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <BrowserRouter>
            <AuthProvider>
              <div className="min-h-screen bg-background">
                <Routes>
                  {/* Public routes */}
                  <Route path="/" element={<Index />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/auth/reset-password" element={<ResetPassword />} />
                  <Route path="/auth/accept-invitation" element={<AcceptInvitation />} />
                  <Route path="/unauthorized" element={<Unauthorized />} />
                  
                  {/* Protected routes */}
                  <Route path="/dashboard" element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  } />
                  <Route path="/owner-dashboard" element={
                    <ProtectedRoute allowedRoles={['owner']}>
                      <OwnerDashboard />
                    </ProtectedRoute>
                  } />
                  <Route path="/tenant-dashboard" element={
                    <ProtectedRoute allowedRoles={['tenant']}>
                      <TenantDashboard />
                    </ProtectedRoute>
                  } />
                  <Route path="/service-provider-dashboard" element={
                    <ProtectedRoute allowedRoles={['service_provider']}>
                      <ServiceProviderDashboard />
                    </ProtectedRoute>
                  } />
                </Routes>
              </div>
              <Toaster />
              <Sonner 
                position="top-right"
                richColors
                closeButton
                expand={true}
                visibleToasts={5}
              />
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
