
import React from "react";
import { TotalTenantsCard } from "./stats/TotalTenantsCard";
import { MonthlyIncomeCard } from "./stats/MonthlyIncomeCard";
import { PaymentStatusCard } from "./stats/PaymentStatusCard";
import { Tenant } from "@/types/tenant";

interface TenantStatsProps {
  tenants: Tenant[];
}

export function TenantStats({ tenants }: TenantStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <TotalTenantsCard tenants={tenants} />
      <MonthlyIncomeCard tenants={tenants} />
      <PaymentStatusCard tenants={tenants} />
    </div>
  );
}
