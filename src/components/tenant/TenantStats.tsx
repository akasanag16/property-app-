
import React from "react";
import { TotalTenantsCard } from "./stats/TotalTenantsCard";
import { MonthlyIncomeCard } from "./stats/MonthlyIncomeCard";
import { PaymentStatusCard } from "./stats/PaymentStatusCard";
import { DatabaseWarningBanner } from "./DatabaseWarningBanner";
import { Tenant } from "@/types/tenant";

interface TenantStatsProps {
  tenants: Tenant[];
  emailColumnMissing?: boolean;
}

export function TenantStats({ tenants, emailColumnMissing }: TenantStatsProps) {
  return (
    <div className="space-y-6">
      {emailColumnMissing && (
        <DatabaseWarningBanner 
          message="The email column is missing from the profiles table. This is needed for proper tenant management."
          alertType="warning"
        />
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <TotalTenantsCard tenants={tenants} />
        <MonthlyIncomeCard tenants={tenants} />
        <PaymentStatusCard tenants={tenants} />
      </div>
    </div>
  );
}
