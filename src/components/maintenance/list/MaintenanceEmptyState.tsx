
import { Button } from "@/components/ui/button";
import { RefreshCw, AlertTriangle } from "lucide-react";

type MaintenanceEmptyStateProps = {
  onRefresh: () => void;
};

export function MaintenanceEmptyState({ onRefresh }: MaintenanceEmptyStateProps) {
  return (
    <div className="text-center py-8 bg-gray-50 rounded-lg border">
      <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-2" />
      <p className="text-gray-500">No maintenance requests found</p>
      <Button variant="ghost" onClick={onRefresh} className="mt-2">
        <RefreshCw className="mr-2 h-4 w-4" />
        Refresh
      </Button>
    </div>
  );
}
