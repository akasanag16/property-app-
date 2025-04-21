
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
