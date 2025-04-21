
import { useAuth } from "@/contexts/AuthContext";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

export default function ServiceProviderDashboard() {
  const { user } = useAuth();
  
  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold mb-6">Service Provider Dashboard</h1>
      <p className="text-gray-600 mb-8">Welcome, {user?.email}</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Assigned Properties</h2>
          <p className="text-gray-500">View properties you're assigned to</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Maintenance Requests</h2>
          <p className="text-gray-500">Manage and resolve maintenance requests</p>
        </div>
      </div>
    </DashboardLayout>
  );
}
