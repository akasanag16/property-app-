
import { DashboardLayout } from "@/components/layout/DashboardLayout";

export default function OwnerServiceProviders() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Service Providers</h1>
        <p className="text-gray-600">
          View and manage your service providers here.
        </p>
      </div>
    </DashboardLayout>
  );
}
