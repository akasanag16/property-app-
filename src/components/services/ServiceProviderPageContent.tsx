import React from "react";
import { ServiceProvider } from "@/hooks/services/useOwnerServiceProviders";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ServiceProviderCardList } from "./ServiceProviderCardList";

interface ServiceProviderPageContentProps {
  serviceProviders: ServiceProvider[];
  loading: boolean;
  error: string | null;
  refreshing: boolean;
  onRefresh: () => void;
  // We're still keeping these props to ensure compatibility with the parent component
  // but we won't be using them in the UI
  serviceProviderInvitations: any[];
  invitationsLoading: boolean;
  invitationsError: string | null;
  resendingId: string | null;
  handleResendInvitation: (id: string) => Promise<void>;
}

export function ServiceProviderPageContent({
  serviceProviders,
  loading,
  error,
  refreshing,
  onRefresh
}: ServiceProviderPageContentProps) {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Service Providers</h1>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onRefresh}
          disabled={refreshing}
        >
          {refreshing ? "Refreshing..." : "Refresh"}
        </Button>
      </div>
      
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error}
            <div className="mt-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onRefresh}
              >
                Try again
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Service Provider Cards Section */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Assigned Service Providers</h2>
        <ServiceProviderCardList
          serviceProviders={serviceProviders}
          loading={loading}
          error={error}
        />
      </section>
    </div>
  );
}
