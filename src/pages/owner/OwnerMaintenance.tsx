
import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { RefreshCw, Check, Clock } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { MaintenanceStatusBadge } from "@/components/maintenance/MaintenanceStatusBadge";

// Sample maintenance requests
const sampleMaintenanceRequests = [
  {
    id: "1",
    title: "Leaking Kitchen Faucet",
    description: "The kitchen faucet has been leaking for two days now. Water is pooling under the sink.",
    status: "pending",
    created_at: "2025-04-15T10:30:00Z",
    tenant: {
      first_name: "John",
      last_name: "Doe",
      email: "john.doe@example.com",
      phone: "555-123-4567"
    },
    property: {
      id: "1",
      name: "Riverdale Apartment",
      address: "123 Riverdale Ave, New York, NY 10001"
    },
    assigned_service_provider: null
  },
  {
    id: "2",
    title: "Broken Air Conditioning",
    description: "The AC unit in the living room is not cooling properly and making a loud noise.",
    status: "accepted",
    created_at: "2025-04-14T08:15:00Z",
    tenant: {
      first_name: "Jane",
      last_name: "Smith",
      email: "jane.smith@example.com",
      phone: "555-987-6543"
    },
    property: {
      id: "2",
      name: "Sunset Condo",
      address: "456 Sunset Blvd, Los Angeles, CA 90001"
    },
    assigned_service_provider: {
      first_name: "Michael",
      last_name: "Technician",
      email: "michael.tech@example.com",
      phone: "555-444-3333"
    }
  },
  {
    id: "3",
    title: "Bathroom Ceiling Leak",
    description: "There appears to be water leaking from the ceiling in the main bathroom.",
    status: "completed",
    created_at: "2025-04-10T14:45:00Z",
    tenant: {
      first_name: "Emily",
      last_name: "Brown",
      email: "emily.brown@example.com",
      phone: "555-222-1111"
    },
    property: {
      id: "4",
      name: "Downtown Loft",
      address: "101 Main St, Seattle, WA 98001"
    },
    assigned_service_provider: {
      first_name: "Robert",
      last_name: "Plumber",
      email: "robert.plumber@example.com",
      phone: "555-666-7777"
    }
  },
  {
    id: "4",
    title: "Front Door Lock Broken",
    description: "The front door lock is difficult to turn and sometimes gets stuck.",
    status: "pending",
    created_at: "2025-04-16T09:00:00Z",
    tenant: {
      first_name: "David",
      last_name: "Wilson",
      email: "david.wilson@example.com",
      phone: "555-888-9999"
    },
    property: {
      id: "5",
      name: "Park View Townhouse",
      address: "202 Park Ave, Boston, MA 02101"
    },
    assigned_service_provider: null
  },
  {
    id: "5",
    title: "Pest Control Needed",
    description: "I've noticed some ants and possibly mice in the kitchen area.",
    status: "accepted",
    created_at: "2025-04-12T11:20:00Z",
    tenant: {
      first_name: "Michael",
      last_name: "Johnson",
      email: "michael.johnson@example.com",
      phone: "555-777-2222"
    },
    property: {
      id: "3",
      name: "Lakeside House",
      address: "789 Lakeside Dr, Chicago, IL 60001"
    },
    assigned_service_provider: {
      first_name: "Sarah",
      last_name: "Exterminator",
      email: "sarah.ext@example.com",
      phone: "555-333-5555"
    }
  }
];

export default function OwnerMaintenance() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeTab, setActiveTab] = useState("all");
  const [maintenanceRequests, setMaintenanceRequests] = useState(sampleMaintenanceRequests);
  
  const pendingRequests = maintenanceRequests.filter(req => req.status === "pending");
  const inProgressRequests = maintenanceRequests.filter(req => req.status === "accepted");
  const completedRequests = maintenanceRequests.filter(req => req.status === "completed");
  
  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    toast.success("Maintenance requests refreshed");
  };

  const updateStatus = async (requestId: string, newStatus: "accepted" | "completed") => {
    try {
      // In a real implementation, this would update the database
      // For demo purposes, update the state directly
      setMaintenanceRequests(prev => 
        prev.map(req => 
          req.id === requestId ? { ...req, status: newStatus } : req
        )
      );
      
      toast.success(`Request marked as ${newStatus}`);
    } catch (error) {
      console.error("Error updating request status:", error);
      toast.error("Failed to update request status");
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const MaintenanceRequestCard = ({ request }: { request: typeof maintenanceRequests[0] }) => (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{request.title}</CardTitle>
            <CardDescription>
              {request.property.name} • Reported: {formatDate(request.created_at)}
            </CardDescription>
          </div>
          <MaintenanceStatusBadge status={request.status} />
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-700 mb-4">{request.description}</p>
        
        <div className="bg-gray-50 p-3 rounded-md mb-4">
          <h4 className="font-medium text-sm mb-2">Tenant Information</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-gray-500">Name: </span>
              <span>{request.tenant.first_name} {request.tenant.last_name}</span>
            </div>
            <div>
              <span className="text-gray-500">Email: </span>
              <span>{request.tenant.email}</span>
            </div>
            <div>
              <span className="text-gray-500">Phone: </span>
              <span>{request.tenant.phone}</span>
            </div>
          </div>
        </div>
        
        {request.assigned_service_provider ? (
          <div className="bg-blue-50 p-3 rounded-md mb-4">
            <h4 className="font-medium text-sm mb-2">Assigned Service Provider</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-gray-500">Name: </span>
                <span>
                  {request.assigned_service_provider.first_name} {request.assigned_service_provider.last_name}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Contact: </span>
                <span>{request.assigned_service_provider.phone}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-sm text-amber-700 mb-4">
            No service provider assigned yet.
          </div>
        )}
        
        <div className="flex justify-end space-x-2">
          {request.status === "pending" && (
            <Button 
              onClick={() => updateStatus(request.id, "accepted")}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Clock className="h-4 w-4 mr-1" />
              Mark In Progress
            </Button>
          )}
          
          {request.status === "accepted" && (
            <Button 
              onClick={() => updateStatus(request.id, "completed")}
              size="sm"
              className="bg-green-600 hover:bg-green-700"
            >
              <Check className="h-4 w-4 mr-1" />
              Mark as Completed
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">Pending</CardTitle>
              <CardDescription>New requests</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-amber-500">{pendingRequests.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">In Progress</CardTitle>
              <CardDescription>Currently being addressed</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-500">{inProgressRequests.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">Completed</CardTitle>
              <CardDescription>Resolved issues</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-500">{completedRequests.length}</div>
            </CardContent>
          </Card>
        </div>
        
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">
              All ({maintenanceRequests.length})
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
            {maintenanceRequests.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg border">
                <p className="text-gray-500">No maintenance requests found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {maintenanceRequests.map((request) => (
                  <MaintenanceRequestCard key={request.id} request={request} />
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="pending" className="mt-6">
            {pendingRequests.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg border">
                <p className="text-gray-500">No pending maintenance requests</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingRequests.map((request) => (
                  <MaintenanceRequestCard key={request.id} request={request} />
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="in-progress" className="mt-6">
            {inProgressRequests.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg border">
                <p className="text-gray-500">No maintenance requests in progress</p>
              </div>
            ) : (
              <div className="space-y-4">
                {inProgressRequests.map((request) => (
                  <MaintenanceRequestCard key={request.id} request={request} />
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="completed" className="mt-6">
            {completedRequests.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg border">
                <p className="text-gray-500">No completed maintenance requests</p>
              </div>
            ) : (
              <div className="space-y-4">
                {completedRequests.map((request) => (
                  <MaintenanceRequestCard key={request.id} request={request} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
