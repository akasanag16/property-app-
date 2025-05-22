
import React from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useOwnerServiceProviders } from "@/hooks/services/useOwnerServiceProviders";
import { ServiceProviderPageContent } from "@/components/services/ServiceProviderPageContent";

export default function OwnerServiceProviders() {
  const { user } = useAuth();
  const { 
    serviceProviders, 
    loading, 
    error,
    refreshing,
    handleRefresh,
    serviceProviderInvitations,
    invitationsLoading,
    invitationsError,
    resendingId,
    handleResendInvitation
  } = useOwnerServiceProviders(user?.id);

  return (
    <DashboardLayout>
      <div className="container px-4 py-6">
        <ServiceProviderPageContent
          serviceProviders={serviceProviders}
          loading={loading}
          error={error}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          serviceProviderInvitations={serviceProviderInvitations}
          invitationsLoading={invitationsLoading}
          invitationsError={invitationsError}
          resendingId={resendingId}
          handleResendInvitation={handleResendInvitation}
        />
      </div>
    </DashboardLayout>
  );
}
