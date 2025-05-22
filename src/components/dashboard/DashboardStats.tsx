
import { Coins, Building, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import type { Property } from "@/types/property";

type DashboardStatsProps = {
  properties: Property[];
  loading?: boolean;
  totalIncome?: number;
  tenantCount?: number;
  occupiedCount?: number;
};

export function DashboardStats({ 
  properties, 
  loading = false, 
  totalIncome = 0, 
  tenantCount = 0,
  occupiedCount = 0 
}: DashboardStatsProps) {
  const propertyCount = properties?.length || 0;
  const hasProperties = propertyCount > 0;
  const hasTenants = tenantCount > 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Card>
        <CardContent className="flex flex-col gap-4 pt-6">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Total Properties</span>
            <Building className="h-5 w-5 text-gray-500" />
          </div>
          <div className="text-3xl font-bold">
            {loading ? <span className="loading loading-dots loading-md"></span> : <AnimatedCounter value={propertyCount} />}
          </div>
          {hasProperties && (
            <div className="text-sm text-gray-500">
              All properties are currently active
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-col gap-4 pt-6">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Total Tenants</span>
            <Users className="h-5 w-5 text-gray-500" />
          </div>
          <div className="text-3xl font-bold">
            {loading ? <span className="loading loading-dots loading-md"></span> : <AnimatedCounter value={tenantCount} />}
          </div>
          {hasTenants && (
            <div className="text-sm text-gray-500">
              All tenants are active
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-col gap-4 pt-6">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Total Income</span>
            <Coins className="h-5 w-5 text-gray-500" />
          </div>
          <div className="text-3xl font-bold">
            {loading ? <span className="loading loading-dots loading-md"></span> : <AnimatedCounter value={totalIncome} prefix="$" />}
          </div>
          {totalIncome > 0 && (
            <div className="text-sm text-gray-500">
              From all tenant payments
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
