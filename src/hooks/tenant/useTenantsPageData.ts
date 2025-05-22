
import { useState, useEffect } from "react";
import { User } from "@supabase/supabase-js";
import { useTenantData } from "./useTenantData";
import { toast } from "sonner";
import { useOwnerInvitations } from "../invitations/useOwnerInvitations";

/**
 * Custom hook to manage tenant page data loading and refresh functionality
 */
export function useTenantsPageData(user: User | null) {
  const [refreshKey, setRefreshKey] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  
  const { tenants, loading, error, emailColumnMissing } = useTenantData(user, refreshKey);
  const { 
    invitations: tenantInvitations, 
    loading: invitationsLoading, 
    error: invitationsError, 
    resendingId,
    handleResendInvitation 
  } = useOwnerInvitations(user, 'tenant', refreshKey);
  
  const handleRefresh = () => {
    setRefreshing(true);
    setRefreshKey(prev => prev + 1);
    toast.success("Refreshing tenant data...");
  };

  useEffect(() => {
    if (!loading && !invitationsLoading && refreshing) {
      setRefreshing(false);
    }
  }, [loading, invitationsLoading, refreshing]);

  return {
    tenants,
    loading,
    error, 
    emailColumnMissing,
    refreshing,
    handleRefresh,
    // Only return pending invitations for the invitations list
    tenantInvitations: tenantInvitations?.filter(inv => inv.status === 'pending') || [],
    invitationsLoading,
    invitationsError,
    resendingId,
    handleResendInvitation
  };
}
