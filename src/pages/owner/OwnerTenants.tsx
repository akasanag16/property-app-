
import { DashboardLayout } from "@/components/layout/DashboardLayout";

export default function OwnerTenants() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Tenants</h1>
        <p className="text-gray-600">
          View and manage your tenants here.
        </p>
      </div>
    </DashboardLayout>
  );
}
