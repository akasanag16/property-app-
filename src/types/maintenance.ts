
export type MaintenanceRequest = {
  id: string;
  title: string;
  description: string;
  status: "pending" | "accepted" | "completed";
  created_at: string;
  property: {
    name: string;
    id: string;
    address?: string;
  };
  tenant: {
    first_name: string | null;
    last_name: string | null;
    email?: string;
    phone?: string;
  } | null;
  assigned_service_provider: {
    first_name: string | null;
    last_name: string | null;
    email?: string;
    phone?: string;
  } | null;
};

export type MaintenanceRequestsListProps = {
  userRole: "owner" | "tenant" | "service_provider";
  refreshKey?: number;
};

export type MaintenanceRequestDetails = {
  id: string;
  title: string;
  description: string;
  status: "pending" | "accepted" | "completed";
  created_at: string;
  property: {
    id: string;
    name: string;
    address?: string;
  };
  tenant: {
    first_name: string | null;
    last_name: string | null;
    email?: string;
    phone?: string;
  } | null;
  assigned_service_provider: {
    first_name: string | null;
    last_name: string | null;
    email?: string;
    phone?: string;
  } | null;
};
