
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw } from "lucide-react";

type DashboardHeaderProps = {
  email?: string;
  firstName?: string;
  lastName?: string;
  onRefresh: () => void;
  onAddProperty: () => void;
};

export function DashboardHeader({ email, firstName, lastName, onRefresh, onAddProperty }: DashboardHeaderProps) {
  // Display name if available, otherwise fall back to email
  const displayName = firstName && lastName 
    ? `${firstName} ${lastName}` 
    : firstName || lastName 
      ? `${firstName || ''} ${lastName || ''}`.trim() 
      : email;

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-fuchsia-600">
          Property Owner Dashboard
        </h1>
        
        <div className="flex space-x-2">
          <Button size="sm" variant="outline" onClick={onRefresh} 
            className="border-purple-200 hover:bg-purple-50 text-gray-700">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          
          <Button size="sm" onClick={onAddProperty}
            className="bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:opacity-90 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Add Property
          </Button>
        </div>
      </div>
      
      <p className="text-gray-600 mb-8">Welcome, {displayName}</p>
    </>
  );
}
