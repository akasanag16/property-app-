
export type MaintenanceRequest = {
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

export type MaintenanceRequestsListProps = {
  userRole: "owner" | "tenant" | "service_provider";
  refreshKey?: number;
};
