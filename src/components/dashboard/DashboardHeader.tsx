
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw, Home } from "lucide-react";

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
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center bg-indigo-100 h-12 w-12 rounded-full">
            <Home className="h-6 w-6 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
              Property Owner Dashboard
            </h1>
            <p className="text-gray-600 mt-1">Welcome back, {displayName}</p>
          </div>
        </div>
        
        <div className="flex space-x-3">
          <Button 
            size="sm" 
            variant="outline" 
            onClick={onRefresh} 
            className="border-indigo-200 hover:bg-indigo-50 text-gray-700 rounded-full"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          
          <Button 
            size="sm" 
            onClick={onAddProperty}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 text-white rounded-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Property
          </Button>
        </div>
      </div>
    </>
  );
}
