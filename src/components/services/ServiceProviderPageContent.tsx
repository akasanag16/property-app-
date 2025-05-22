
import React from "react";
import { ServiceProvider } from "@/hooks/services/useOwnerServiceProviders";
import { OwnerInvitationsList } from "@/components/invitations/OwnerInvitationsList";
import { ServiceProviderTable } from "./ServiceProviderTable";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { OwnerInvitation } from "@/hooks/invitations/useOwnerInvitations";

interface ServiceProviderPageContentProps {
  serviceProviders: ServiceProvider[];
  loading: boolean;
  error: string | null;
  refreshing: boolean;
  onRefresh: () => void;
  serviceProviderInvitations: OwnerInvitation[];
  invitationsLoading: boolean;
  invitationsError: string | null;
  resendingId: string | null;
  // Changed return type to match the actual function implementation
  handleResendInvitation: (id: string) => void;
}

export function ServiceProviderPageContent({
  serviceProviders,
  loading,
  error,
  refreshing,
  onRefresh,
  serviceProviderInvitations,
  invitationsLoading,
  invitationsError,
  resendingId,
  handleResendInvitation
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

      {/* Pending Service Provider Invitations Section */}
      <section>
        <OwnerInvitationsList
          invitations={serviceProviderInvitations}
          loading={invitationsLoading}
          error={invitationsError}
          resendingId={resendingId}
          title="Pending Service Provider Invitations"
          emptyMessage="No pending service provider invitations"
          onResend={handleResendInvitation}
        />
      </section>

      {/* Service Provider Table Section */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Service Providers</h2>
        <ServiceProviderTable
          serviceProviders={serviceProviders}
          loading={loading}
          refreshing={refreshing}
        />
      </section>
    </div>
  );
}
