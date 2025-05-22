
import { Coins, Building, Users, Wrench } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import type { Property } from "@/types/property";

type DashboardStatsProps = {
  properties: Property[];
  loading?: boolean;
  tenantCount?: number;
  serviceProvidersCount?: number;
  occupiedCount?: number;
};

export function DashboardStats({ 
  properties, 
  loading = false, 
  tenantCount = 0,
  serviceProvidersCount = 0,
  occupiedCount = 0 
}: DashboardStatsProps) {
  const propertyCount = properties?.length || 0;
  const hasProperties = propertyCount > 0;
  const hasTenants = tenantCount > 0;
  const hasServiceProviders = serviceProvidersCount > 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="overflow-hidden border-0 shadow-sm hover:shadow-md transition-shadow duration-300 bg-gradient-to-br from-blue-50 to-indigo-50">
        <CardContent className="flex items-center p-6">
          <div className="flex items-center justify-center bg-blue-100 h-12 w-12 rounded-full mr-4">
            <Building className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Properties</p>
            <div className="text-2xl font-bold text-gray-800">
              {loading ? (
                <span className="inline-block w-12 h-6 bg-gray-200 animate-pulse rounded"></span>
              ) : (
                <AnimatedCounter value={propertyCount} />
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden border-0 shadow-sm hover:shadow-md transition-shadow duration-300 bg-gradient-to-br from-purple-50 to-pink-50">
        <CardContent className="flex items-center p-6">
          <div className="flex items-center justify-center bg-purple-100 h-12 w-12 rounded-full mr-4">
            <Users className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Tenants</p>
            <div className="text-2xl font-bold text-gray-800">
              {loading ? (
                <span className="inline-block w-12 h-6 bg-gray-200 animate-pulse rounded"></span>
              ) : (
                <AnimatedCounter value={tenantCount} />
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden border-0 shadow-sm hover:shadow-md transition-shadow duration-300 bg-gradient-to-br from-emerald-50 to-teal-50">
        <CardContent className="flex items-center p-6">
          <div className="flex items-center justify-center bg-emerald-100 h-12 w-12 rounded-full mr-4">
            <Wrench className="h-6 w-6 text-emerald-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Service Providers</p>
            <div className="text-2xl font-bold text-gray-800">
              {loading ? (
                <span className="inline-block w-12 h-6 bg-gray-200 animate-pulse rounded"></span>
              ) : (
                <AnimatedCounter value={serviceProvidersCount} />
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
