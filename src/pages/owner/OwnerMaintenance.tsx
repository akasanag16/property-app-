
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { MaintenanceRequestsList } from "@/components/maintenance/MaintenanceRequestsList";

export default function OwnerMaintenance() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Maintenance Requests</h1>
        <p className="text-gray-600">
          View and manage maintenance requests from your tenants.
        </p>
        <MaintenanceRequestsList userRole="owner" />
      </div>
    </DashboardLayout>
  );
}
