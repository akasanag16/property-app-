
import React from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export function TenantLoadingState() {
  return (
    <div className="flex justify-center py-12">
      <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full" />
    </div>
  );
}

export function TenantEmptyState() {
  return (
    <div className="text-center py-12 bg-gray-50 rounded-lg border">
      <h2 className="text-xl font-semibold mb-2">No Tenants Found</h2>
      <p className="text-gray-500 mb-4">
        You don't have any tenants yet. Add properties and invite tenants.
      </p>
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
