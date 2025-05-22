
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

type MaintenanceListFooterProps = {
  onRefresh: () => void;
  isUpdating: boolean;
};

export function MaintenanceListFooter({ 
  onRefresh, 
  isUpdating 
}: MaintenanceListFooterProps) {
  return (
    <div className="flex justify-center mt-4">
      <Button 
        variant="outline" 
        onClick={onRefresh} 
        className="flex items-center gap-2 px-6 py-2 rounded-full shadow-sm transition-all hover:shadow"
        disabled={isUpdating}
      >
        <RefreshCw className="h-4 w-4" />
        Refresh
      </Button>
    </div>
  );
}
