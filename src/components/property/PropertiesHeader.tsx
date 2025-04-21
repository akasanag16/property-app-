
import { Button } from "@/components/ui/button";
import { Plus, Filter, RefreshCw } from "lucide-react";

type PropertiesHeaderProps = {
  onAddProperty: () => void;
  onRefresh: () => void;
  onToggleFilters: () => void;
  showFilters: boolean;
};

export function PropertiesHeader({ 
  onAddProperty, 
  onRefresh, 
  onToggleFilters, 
  showFilters 
}: PropertiesHeaderProps) {
  return (
    <div className="flex justify-between items-center">
      <h1 className="text-2xl font-bold">My Properties</h1>
      <div className="flex space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onToggleFilters}
        >
          <Filter className="h-4 w-4 mr-2" />
          {showFilters ? "Hide Filters" : "Show Filters"}
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
        
        <Button
          size="sm"
          onClick={onAddProperty}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Property
        </Button>
      </div>
    </div>
  );
}
