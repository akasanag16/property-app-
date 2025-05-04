
import { useState, useEffect } from "react";
import { User } from "@supabase/supabase-js";
import { useTenantData } from "./useTenantData";
import { toast } from "sonner";

/**
 * Custom hook to manage tenant page data loading and refresh functionality
 */
export function useTenantsPageData(user: User | null) {
  const [refreshKey, setRefreshKey] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  
  const { tenants, loading, error, emailColumnMissing } = useTenantData(user, refreshKey);
  
  const handleRefresh = () => {
    setRefreshing(true);
    setRefreshKey(prev => prev + 1);
    toast.success("Refreshing tenant data...");
  };

  useEffect(() => {
    // Initial load - force refresh once on component mount
    if (refreshKey === 0) {
      handleRefresh();
    }

    if (!loading && refreshing) {
      setRefreshing(false);
    }
  }, [loading, refreshing, refreshKey]);

  return {
    tenants,
    loading,
    error, 
    emailColumnMissing,
    refreshing,
    handleRefresh
  };
}
