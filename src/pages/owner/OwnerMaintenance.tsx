
import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MaintenanceStatusSummary } from "@/components/owner/maintenance/MaintenanceStatusSummary";
import { MaintenanceRequestsList } from "@/components/owner/maintenance/MaintenanceRequestsList";
import { useOwnerMaintenanceRequests } from "@/hooks/owner/useOwnerMaintenanceRequests";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ErrorAlert } from "@/components/ui/alert-error";

export default function OwnerMaintenance() {
  const [activeTab, setActiveTab] = useState("all");
  
  const { 
    requests,
    pendingRequests,
    inProgressRequests,
    completedRequests,
    loading,
    error,
    handleRefresh,
    updateStatus
  } = useOwnerMaintenanceRequests();

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Maintenance Requests</h1>
          </div>
          <LoadingSpinner />
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Maintenance Requests</h1>
          </div>
          <ErrorAlert 
            message={`Error loading maintenance requests: ${error.message}`}
            onRetry={handleRefresh}
          />
        </div>
      </DashboardLayout>
    );
  }

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

        <MaintenanceStatusSummary 
          pendingCount={pendingRequests.length}
          inProgressCount={inProgressRequests.length}
          completedCount={completedRequests.length}
        />
        
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">
              All ({requests.length})
            </TabsTrigger>
            <TabsTrigger value="pending">
              Pending ({pendingRequests.length})
            </TabsTrigger>
            <TabsTrigger value="in-progress">
              In Progress ({inProgressRequests.length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed ({completedRequests.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="mt-6">
            <MaintenanceRequestsList 
              requests={requests}
              onUpdateStatus={updateStatus}
            />
          </TabsContent>
          
          <TabsContent value="pending" className="mt-6">
            <MaintenanceRequestsList 
              requests={pendingRequests}
              onUpdateStatus={updateStatus}
            />
          </TabsContent>
          
          <TabsContent value="in-progress" className="mt-6">
            <MaintenanceRequestsList 
              requests={inProgressRequests}
              onUpdateStatus={updateStatus}
            />
          </TabsContent>
          
          <TabsContent value="completed" className="mt-6">
            <MaintenanceRequestsList 
              requests={completedRequests}
              onUpdateStatus={updateStatus}
            />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
