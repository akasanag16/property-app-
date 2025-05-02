
import React from "react";
import { Users } from "lucide-react";
import { TenantStatCard } from "./TenantStatCard";
import type { Tenant } from "@/types/tenant";

interface TotalTenantsCardProps {
  tenants: Tenant[];
}

export function TotalTenantsCard({ tenants }: TotalTenantsCardProps) {
  return (
    <TenantStatCard 
      title="Total Tenants" 
      description="Active tenants across properties"
    >
      <div className="flex items-center">
        <Users className="h-8 w-8 text-blue-500 mr-3" />
        <div className="text-3xl font-bold">{tenants.length}</div>
      </div>
    </TenantStatCard>
  );
}
