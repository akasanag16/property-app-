
import { ErrorAlert } from "@/components/ui/alert-error";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

type MaintenanceErrorStateProps = {
  error: Error | null;
  onRetry: () => void;
};

export function MaintenanceErrorState({ error, onRetry }: MaintenanceErrorStateProps) {
  const errorMessage = error instanceof Error 
    ? error.message 
    : "Unknown error loading maintenance requests";

  return (
    <div className="space-y-4">
      <ErrorAlert 
        message={`Error loading maintenance requests: ${errorMessage}`} 
        onRetry={onRetry} 
      />
      <div className="flex justify-center">
        <Button variant="outline" onClick={onRetry} className="flex items-center">
          <RefreshCw className="mr-2 h-4 w-4" />
          Try Again
        </Button>
      </div>
    </div>
  );
}
