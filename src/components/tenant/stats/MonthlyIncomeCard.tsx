
import React from "react";
import { DollarSign } from "lucide-react";
import { TenantStatCard } from "./TenantStatCard";
import type { Tenant } from "@/types/tenant";

interface MonthlyIncomeCardProps {
  tenants: Tenant[];
}

export function MonthlyIncomeCard({ tenants }: MonthlyIncomeCardProps) {
  const totalMonthlyIncome = tenants.reduce((total, tenant) => 
    total + (tenant.next_payment?.amount || 0), 0
  );

  return (
    <TenantStatCard 
      title="Monthly Income" 
      description="Expected rent this month"
    >
      <div className="flex items-center">
        <DollarSign className="h-8 w-8 text-green-500 mr-3" />
        <div className="text-3xl font-bold">${totalMonthlyIncome.toLocaleString()}</div>
      </div>
    </TenantStatCard>
  );
}
