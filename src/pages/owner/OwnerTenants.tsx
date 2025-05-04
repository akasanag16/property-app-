
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
    handleRefresh
  } = useTenantsPageData(user);
  
  // Debug logs
  console.log("OwnerTenants - user:", user?.id);
  console.log("OwnerTenants - tenants:", tenants);
  console.log("OwnerTenants - loading:", loading);
  console.log("OwnerTenants - error:", error);

  return (
    <DashboardLayout>
      <TenantPageContent
        tenants={tenants}
        loading={loading}
        error={error}
        emailColumnMissing={emailColumnMissing}
        refreshing={refreshing}
        onRefresh={handleRefresh}
      />
    </DashboardLayout>
  );
}
