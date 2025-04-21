
import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { MaintenanceRequestsList } from "@/components/maintenance/MaintenanceRequestsList";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

export default function OwnerMaintenance() {
  const [refreshKey, setRefreshKey] = useState(0);
  
  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Maintenance Requests</h1>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleRefresh}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
        <p className="text-gray-600">
          View and manage maintenance requests from your tenants.
        </p>
        <MaintenanceRequestsList userRole="owner" refreshKey={refreshKey} />
      </div>
    </DashboardLayout>
  );
}
