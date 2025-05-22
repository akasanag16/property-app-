
import React from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { TenantPageContent } from "@/components/tenant/TenantPageContent";
import { useTenantsPageData } from "@/hooks/tenant/useTenantsPageData";

export default function OwnerTenants() {
  const { user } = useAuth();
  const {
    tenants,
    loading,
    error,
    emailColumnMissing,
    refreshing,
    handleRefresh,
    tenantInvitations,
    invitationsLoading,
    invitationsError,
    resendingId,
    handleResendInvitation
  } = useTenantsPageData(user);

  return (
    <DashboardLayout>
      <div className="container px-4 py-6">
        <TenantPageContent
          tenants={tenants}
          loading={loading}
          error={error}
          emailColumnMissing={emailColumnMissing}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tenantInvitations={tenantInvitations}
          invitationsLoading={invitationsLoading}
          invitationsError={invitationsError}
          resendingId={resendingId}
          handleResendInvitation={handleResendInvitation}
        />
      </div>
    </DashboardLayout>
  );
}
