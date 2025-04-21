
import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { TenantStats } from "@/components/tenant/TenantStats";
import { TenantTable } from "@/components/tenant/TenantTable";
import { TenantLoadingState, TenantEmptyState } from "@/components/tenant/TenantStates";
import { Tenant } from "@/types/tenant";

// Sample data import for demonstration
import { sampleTenants } from "@/data/sampleProperties";

export default function OwnerTenants() {
  const { user } = useAuth();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  
  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  const fetchTenants = async () => {
    try {
      setLoading(true);
      // In a real implementation, we would fetch tenant data from the database
      // For demo purposes, use the sample data
      setTenants(sampleTenants);
    } catch (error) {
      console.error("Error fetching tenants:", error);
      toast.error("Failed to load tenants");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    fetchTenants();
  }, [user, refreshKey]);

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

        {loading ? (
          <TenantLoadingState />
        ) : tenants.length === 0 ? (
          <TenantEmptyState />
        ) : (
          <>
            <TenantStats tenants={tenants} />
            <TenantTable tenants={tenants} />
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
