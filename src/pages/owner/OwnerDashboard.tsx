
import { useAuth } from "@/contexts/AuthContext";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

export default function OwnerDashboard() {
  const { user } = useAuth();
  
  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold mb-6">Property Owner Dashboard</h1>
      <p className="text-gray-600 mb-8">Welcome, {user?.email}</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">My Properties</h2>
          <p className="text-gray-500">Manage your properties</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Tenant Invitations</h2>
          <p className="text-gray-500">Invite new tenants to your properties</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Service Provider Invitations</h2>
          <p className="text-gray-500">Invite service providers to your properties</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Maintenance Requests</h2>
          <p className="text-gray-500">View and manage maintenance requests</p>
        </div>
      </div>
    </DashboardLayout>
  );
}
