
export type MaintenanceRequest = {
  id: string;
  title: string;
  description: string;
  status: "pending" | "accepted" | "completed";
  created_at: string;
  property: {
    name: string;
    id: string;  // Adding id to match what we're using in the hook
  };
  tenant: {
    first_name: string | null;
    last_name: string | null;
  } | null;
  assigned_service_provider: {
    first_name: string | null;
    last_name: string | null;
  } | null;
};

export type MaintenanceRequestsListProps = {
  userRole: "owner" | "tenant" | "service_provider";
  refreshKey?: number;
};
