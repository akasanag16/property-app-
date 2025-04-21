
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw } from "lucide-react";

type DashboardHeaderProps = {
  email?: string;
  onRefresh: () => void;
  onAddProperty: () => void;
};

export function DashboardHeader({ email, onRefresh, onAddProperty }: DashboardHeaderProps) {
  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Property Owner Dashboard</h1>
        
        <div className="flex space-x-2">
          <Button size="sm" variant="outline" onClick={onRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          
          <Button size="sm" onClick={onAddProperty}>
            <Plus className="h-4 w-4 mr-2" />
            Add Property
          </Button>
        </div>
      </div>
      
      <p className="text-gray-600 mb-8">Welcome, {email}</p>
    </>
  );
}
