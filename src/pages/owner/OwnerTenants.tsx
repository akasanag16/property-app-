
import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { TenantStats } from "@/components/tenant/TenantStats";
import { TenantTable } from "@/components/tenant/TenantTable";
import { TenantLoadingState, TenantEmptyState } from "@/components/tenant/TenantStates";
import { useTenantData } from "@/hooks/tenant/useTenantData";
import { ErrorAlert } from "@/components/ui/alert-error";
import { DatabaseWarningBanner } from "@/components/tenant/DatabaseWarningBanner";

export default function OwnerTenants() {
  const { user } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);
  
  const { tenants, loading, error, emailColumnMissing } = useTenantData(user, refreshKey);
  
  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Tenants</h1>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        <p className="text-gray-600">
          View and manage your tenants and their payments.
        </p>

        {emailColumnMissing && (
          <DatabaseWarningBanner 
            message="The email column is missing from the profiles table. Please run the database migration to add this column."
            migrationFile="20250501_add_email_to_profiles.sql"
          />
        )}

        {error && (
          <ErrorAlert 
            message={error}
            onRetry={handleRefresh}
          />
        )}

        {loading ? (
          <TenantLoadingState />
        ) : tenants.length === 0 ? (
          <TenantEmptyState />
        ) : (
          <>
            <TenantStats tenants={tenants} emailColumnMissing={emailColumnMissing} />
            <TenantTable tenants={tenants} />
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
