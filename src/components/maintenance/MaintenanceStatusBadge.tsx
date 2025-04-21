
import { Badge } from "@/components/ui/badge";

type StatusBadgeProps = {
  status: string;
};

export function MaintenanceStatusBadge({ status }: StatusBadgeProps) {
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
}
