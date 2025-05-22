
import React from "react";
import { Property } from "@/types/property";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Tool, ArrowRight, Building, DollarSign } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { TenantPropertiesSkeleton } from "./TenantDashboardSkeleton";

interface TenantPropertiesSectionProps {
  properties: Property[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  onMaintenanceClick: () => void;
  onRentClick?: () => void;
}

export function TenantPropertiesSection({
  properties,
  loading,
  error,
  onRetry,
  onMaintenanceClick,
  onRentClick,
}: TenantPropertiesSectionProps) {
  if (loading) {
    return <TenantPropertiesSkeleton />;
  }

  if (error) {
    return (
      <div className="text-center p-6 bg-white rounded-lg shadow">
        <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-3" />
        <h3 className="text-lg font-medium mb-2">Failed to load properties</h3>
        <p className="text-gray-500 mb-4">{error}</p>
        <Button onClick={onRetry}>Try Again</Button>
      </div>
    );
  }

  if (properties.length === 0) {
    return (
      <div className="text-center p-6 bg-white rounded-lg shadow">
        <Building className="h-10 w-10 text-gray-400 mx-auto mb-3" />
        <h3 className="text-lg font-medium mb-2">No Properties Found</h3>
        <p className="text-gray-500">
          You are not currently associated with any properties.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
        {properties.map((property) => (
          <Card key={property.id} className="overflow-hidden">
            <CardHeader className="bg-slate-50 pb-4">
              <CardTitle className="flex items-start gap-2">
                <Building className="h-5 w-5 text-primary mt-1" />
                <span>{property.name}</span>
              </CardTitle>
            </CardHeader>
            
            <CardContent className="pt-4">
              <p className="text-gray-600 mb-2">{property.address}</p>
              
              {property.details?.description && (
                <p className="text-sm text-gray-500 line-clamp-2">
                  {property.details.description}
                </p>
              )}
            </CardContent>
            
            <CardFooter className="flex flex-wrap gap-2 justify-end border-t p-4">
              <Button 
                variant="outline" 
                size="sm"
                className="flex items-center gap-1"
                onClick={onMaintenanceClick}
              >
                <Tool className="h-4 w-4" />
                <span>Maintenance</span>
              </Button>
              
              {onRentClick && (
                <Button 
                  variant="outline" 
                  size="sm"
                  className="flex items-center gap-1"
                  onClick={onRentClick}
                >
                  <DollarSign className="h-4 w-4" />
                  <span>Rent</span>
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
