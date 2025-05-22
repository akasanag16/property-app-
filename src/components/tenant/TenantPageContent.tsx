
import React from "react";
import { Button } from "@/components/ui/button";
import { DatabaseWarningBanner } from "./DatabaseWarningBanner";
import { TenantStats } from "./TenantStats";
import { TenantTable } from "./TenantTable";
import { TenantStates } from "./TenantStates";
import { RefreshCw } from "lucide-react";
import { Tenant } from "@/types/tenant";
import { OwnerInvitationsList } from "../invitations/OwnerInvitationsList";
import { OwnerInvitation } from "@/hooks/invitations/useOwnerInvitations";

interface TenantPageContentProps {
  tenants: Tenant[];
  loading: boolean;
  error: string | null;
  emailColumnMissing: boolean;
  refreshing: boolean;
  onRefresh: () => void;
  tenantInvitations?: OwnerInvitation[];
  invitationsLoading?: boolean;
  invitationsError?: string | null;
  resendingId?: string | null;
  handleResendInvitation?: (id: string) => Promise<void>;
  showStats?: boolean;
  showInvitations?: boolean;
}

export function TenantPageContent({
  tenants,
  loading,
  error,
  emailColumnMissing,
  refreshing,
  onRefresh,
  tenantInvitations = [],
  invitationsLoading = false,
  invitationsError = null,
  resendingId = null,
  handleResendInvitation = async () => {},
  showStats = false,
  showInvitations = false,
}: TenantPageContentProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Tenants</h1>
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={refreshing}
          className="flex items-center gap-1"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          {refreshing ? "Refreshing..." : "Refresh"}
        </Button>
      </div>

      {emailColumnMissing && (
        <DatabaseWarningBanner 
          message="The email column is missing from the profiles table. This is needed for proper tenant management."
          alertType="warning"
          migrationFile="20250501_add_email_to_profiles.sql"
        />
      )}

      {/* Tenant Stats Section - Optional */}
      {showStats && !error && tenants.length > 0 && (
        <TenantStats tenants={tenants} />
      )}

      {/* Tenant Invitations Section - Optional */}
      {showInvitations && (
        <div className="mb-6">
          <OwnerInvitationsList
            invitations={tenantInvitations}
            loading={invitationsLoading}
            error={invitationsError}
            resendingId={resendingId}
            title="Pending Tenant Invitations"
            emptyMessage="No pending tenant invitations"
            onResend={handleResendInvitation}
          />
        </div>
      )}

      {/* Tenant Table Section */}
      {error ? (
        <TenantStates.Error error={error} onRefresh={onRefresh} />
      ) : loading ? (
        <TenantStates.Loading />
      ) : tenants.length === 0 ? (
        <TenantStates.Empty />
      ) : (
        <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
          <TenantTable tenants={tenants} />
        </div>
      )}
    </div>
  );
}
