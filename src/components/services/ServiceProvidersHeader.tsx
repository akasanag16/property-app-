
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface ServiceProvidersHeaderProps {
  onRefresh: () => void;
  loading: boolean;
}

export function ServiceProvidersHeader({ onRefresh, loading }: ServiceProvidersHeaderProps) {
  return (
    <div className="flex justify-between items-center">
      <h1 className="text-2xl font-bold">Service Providers</h1>
      <Button
        variant="outline"
        size="sm"
        onClick={onRefresh}
      >
        <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
        {loading ? 'Refreshing...' : 'Refresh'}
      </Button>
    </div>
  );
}
