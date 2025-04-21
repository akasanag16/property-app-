
import { DashboardLayout } from "@/components/layout/DashboardLayout";

export default function OwnerProperties() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">My Properties</h1>
        <p className="text-gray-600">
          View and manage your properties here.
        </p>
      </div>
    </DashboardLayout>
  );
}
