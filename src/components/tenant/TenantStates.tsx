
import React from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, UsersRound, PlusCircle } from "lucide-react";

export function TenantLoadingState() {
  return (
    <div className="flex justify-center py-12">
      <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full" />
    </div>
  );
}

export function TenantEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center bg-gray-50 rounded-lg border">
      <UsersRound className="h-12 w-12 text-gray-400 mb-4" />
      <h2 className="text-xl font-semibold mb-2 text-gray-800">No Tenants Found</h2>
      <p className="text-gray-500 mb-6 max-w-md">
        You don't have any tenants yet. Add properties and invite tenants.
      </p>
      <Button className="flex items-center gap-2">
        <PlusCircle className="h-4 w-4" />
        Add Tenant
      </Button>
    </div>
  );
}

export function TenantErrorState({ error, onRefresh }: { error: string, onRefresh: () => void }) {
  return (
    <div className="text-center py-12 bg-red-50 rounded-lg border border-red-200">
      <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-2" />
      <h2 className="text-xl font-semibold mb-2">Error Loading Tenants</h2>
      <p className="text-red-600 mb-4">{error}</p>
      <Button onClick={onRefresh} variant="outline">
        Try Again
      </Button>
    </div>
  );
}

// Export a combined object for convenience
export const TenantStates = {
  Loading: TenantLoadingState,
  Empty: TenantEmptyState,
  Error: TenantErrorState
};
