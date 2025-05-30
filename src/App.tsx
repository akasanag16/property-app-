
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Index from "./pages/Index";
import Auth from "./pages/auth/Auth";
import Dashboard from "./pages/Dashboard";
import TenantDashboard from "./pages/TenantDashboard";
import ServiceProviderDashboard from "./pages/ServiceProviderDashboard";
import AcceptInvitation from "./pages/auth/AcceptInvitation";
import ResetPassword from "./pages/auth/ResetPassword";

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
                  <Route path="/" element={<Index />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/auth/reset-password" element={<ResetPassword />} />
                  <Route path="/auth/accept-invitation" element={<AcceptInvitation />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/tenant-dashboard" element={<TenantDashboard />} />
                  <Route path="/service-provider-dashboard" element={<ServiceProviderDashboard />} />
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
