import { Coins, Building, ArrowUp, ArrowDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import type { Property } from "@/types/property";

type DashboardStatsProps = {
  properties: Property[];
  loading: boolean;
  totalIncome?: number;
  tenantCount?: number;
};

export function DashboardStats({ properties, loading, totalIncome = 0, tenantCount = 0 }: DashboardStatsProps) {
  const propertyCount = properties?.length || 0;
  const hasProperties = propertyCount > 0;
  const hasTenants = tenantCount > 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Card>
        <CardContent className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Total Properties</span>
            <Building className="h-5 w-5 text-gray-500" />
          </div>
          <div className="text-3xl font-bold">
            {loading ? <span className="loading loading-dots loading-md"></span> : <AnimatedCounter value={propertyCount} />}
          </div>
          {hasProperties && (
            <div className="text-sm text-gray-500 flex items-center">
              <ArrowUp className="h-4 w-4 mr-1 text-green-500" />
              All properties are currently active
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Total Tenants</span>
            <Coins className="h-5 w-5 text-gray-500" />
          </div>
          <div className="text-3xl font-bold">
            {loading ? <span className="loading loading-dots loading-md"></span> : <AnimatedCounter value={tenantCount} />}
          </div>
          {hasTenants && (
            <div className="text-sm text-gray-500 flex items-center">
              <ArrowUp className="h-4 w-4 mr-1 text-green-500" />
              All tenants are up to date with payments
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Total Income</span>
            <Coins className="h-5 w-5 text-gray-500" />
          </div>
          <div className="text-3xl font-bold">
            {loading ? <span className="loading loading-dots loading-md"></span> : <AnimatedCounter value={totalIncome} />}
          </div>
          {totalIncome > 0 && (
            <div className="text-sm text-gray-500 flex items-center">
              <ArrowUp className="h-4 w-4 mr-1 text-green-500" />
              Income is trending up this month
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
