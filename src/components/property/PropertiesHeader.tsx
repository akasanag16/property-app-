
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Filter, RefreshCw } from "lucide-react";
import { toast } from "sonner";

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
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const handleRefresh = () => {
    setIsRefreshing(true);
    onRefresh();
    toast.success("Properties refreshed");
    
    // Simulate refresh state for better UX
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };
  
  return (
    <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0 pb-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">My Properties</h1>
        <p className="text-gray-500 mt-1">
          Manage your property portfolio in one place
        </p>
      </div>
      <div className="flex space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onToggleFilters}
          className="bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
        >
          <Filter className="h-4 w-4 mr-2" />
          {showFilters ? "Hide Filters" : "Show Filters"}
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? "Refreshing..." : "Refresh"}
        </Button>
        
        <Button
          size="sm"
          onClick={onAddProperty}
          className="bg-indigo-600 hover:bg-indigo-700 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Property
        </Button>
      </div>
    </div>
  );
}
