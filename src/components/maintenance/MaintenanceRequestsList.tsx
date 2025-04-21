import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, Clock } from "lucide-react";

type MaintenanceRequest = {
  id: string;
  title: string;
  description: string;
  status: "pending" | "accepted" | "completed";
  created_at: string;
  property: {
    name: string;
  };
  tenant: {
    first_name: string | null;
    last_name: string | null;
  };
  assigned_service_provider: {
    first_name: string | null;
    last_name: string | null;
  } | null;
};

type MaintenanceRequestsListProps = {
  userRole: "owner" | "tenant" | "service_provider";
  refreshKey?: number;
};

export function MaintenanceRequestsList({ userRole, refreshKey = 0 }: MaintenanceRequestsListProps) {
  const { user } = useAuth();
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch maintenance requests
  const fetchRequests = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("maintenance_requests")
        .select(`
          *,
          property:properties(name),
          tenant:profiles!maintenance_requests_tenant_id_fkey(first_name, last_name),
          assigned_service_provider:profiles!maintenance_requests_assigned_service_provider_id_fkey(first_name, last_name)
        `)
        .order("created_at", { ascending: false });

      // Apply filters based on user role
      if (userRole === "tenant") {
        query = query.eq("tenant_id", user?.id);
      } else if (userRole === "service_provider") {
        query = query.eq("assigned_service_provider_id", user?.id);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Ensure proper typing of the data
      const typedData: MaintenanceRequest[] = (data || []).map(item => ({
        ...item,
        tenant: {
          first_name: item.tenant?.first_name || "Unknown",
          last_name: item.tenant?.last_name || "User",
        },
        property: {
          name: item.property?.name || "Unknown Property"
        },
        assigned_service_provider: item.assigned_service_provider ? {
          first_name: item.assigned_service_provider.first_name,
          last_name: item.assigned_service_provider.last_name
        } : null
      }));

      setRequests(typedData);
    } catch (error) {
      console.error("Error fetching maintenance requests:", error);
      toast.error("Failed to load maintenance requests");
    } finally {
      setLoading(false);
    }
  };

  // Handle status update
  const updateStatus = async (requestId: string, newStatus: "accepted" | "completed") => {
    try {
      const { error } = await supabase
        .from("maintenance_requests")
        .update({ status: newStatus })
        .eq("id", requestId);

      if (error) throw error;
      
      toast.success(`Request marked as ${newStatus}`);
      // The list will be updated by real-time subscription
    } catch (error) {
      console.error("Error updating request status:", error);
      toast.error("Failed to update request status");
    }
  };

  // Assign request to service provider (for owner)
  const assignRequest = async (requestId: string, serviceProviderId: string) => {
    try {
      const { error } = await supabase
        .from("maintenance_requests")
        .update({ assigned_service_provider_id: serviceProviderId })
        .eq("id", requestId);

      if (error) throw error;
      
      toast.success("Request assigned to service provider");
      // The list will be updated by real-time subscription
    } catch (error) {
      console.error("Error assigning request:", error);
      toast.error("Failed to assign request");
    }
  };

  // Set up real-time subscription
  useEffect(() => {
    fetchRequests();

    // Subscribe to real-time changes
    const channel = supabase
      .channel('table-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'maintenance_requests',
        },
        (payload) => {
          // Refresh the list when data changes
          fetchRequests();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userRole, user?.id, refreshKey]);

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Render status badge
  const StatusBadge = ({ status }: { status: string }) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>;
      case "accepted":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">In Progress</Badge>;
      case "completed":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-lg border">
        <p className="text-gray-500">No maintenance requests found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {requests.map((request) => (
        <div key={request.id} className="bg-white rounded-lg border p-4 shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-medium text-lg">{request.title}</h3>
            <StatusBadge status={request.status} />
          </div>
          
          <div className="text-sm text-gray-500 mb-2">
            <span>Property: {request.property.name}</span>
            <span className="mx-2">•</span>
            <span>Reported: {formatDate(request.created_at)}</span>
          </div>
          
          {userRole === "owner" && request.tenant && (
            <div className="text-sm text-gray-500 mb-3">
              <span>Tenant: {request.tenant.first_name} {request.tenant.last_name}</span>
            </div>
          )}
          
          <p className="text-gray-700 mb-4">{request.description}</p>
          
          {request.assigned_service_provider && (
            <div className="text-sm text-gray-600 mb-3">
              <span className="font-medium">Assigned to: </span>
              {request.assigned_service_provider.first_name} {request.assigned_service_provider.last_name}
            </div>
          )}
          
          {/* Action buttons based on role and status */}
          {userRole === "service_provider" && request.status === "pending" && (
            <Button 
              onClick={() => updateStatus(request.id, "accepted")}
              size="sm"
              className="mr-2"
            >
              <Clock className="h-4 w-4 mr-1" />
              Accept Request
            </Button>
          )}
          
          {userRole === "service_provider" && request.status === "accepted" && (
            <Button 
              onClick={() => updateStatus(request.id, "completed")}
              size="sm"
              className="mr-2"
            >
              <Check className="h-4 w-4 mr-1" />
              Mark as Completed
            </Button>
          )}
        </div>
      ))}
    </div>
  );
}
