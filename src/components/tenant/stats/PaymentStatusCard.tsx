
import React from "react";
import { TrendingDown, TrendingUp, DollarSign } from "lucide-react";
import { TenantStatCard } from "./TenantStatCard";
import type { Tenant } from "@/types/tenant";

interface PaymentStatusCardProps {
  tenants: Tenant[];
}

export function PaymentStatusCard({ tenants }: PaymentStatusCardProps) {
  const overduePayments = tenants.filter(tenant => 
    tenant.last_payment?.status === 'overdue'
  );

  const upcomingPayments = tenants.filter(tenant => 
    tenant.next_payment && tenant.next_payment.due_in_days <= 7
  );

  const paidPayments = tenants.filter(t => t.last_payment?.status === 'paid');

  return (
    <TenantStatCard 
      title="Payment Status" 
      description="Overview of rent payments"
    >
      <div className="flex justify-between">
        <div className="flex flex-col items-center">
          <TrendingDown className="h-6 w-6 text-red-500 mb-1" />
          <div className="text-xl font-bold">{overduePayments.length}</div>
          <div className="text-xs text-gray-500">Overdue</div>
        </div>

        <div className="flex flex-col items-center">
          <TrendingUp className="h-6 w-6 text-orange-500 mb-1" />
          <div className="text-xl font-bold">{upcomingPayments.length}</div>
          <div className="text-xs text-gray-500">Due Soon</div>
        </div>

        <div className="flex flex-col items-center">
          <DollarSign className="h-6 w-6 text-green-500 mb-1" />
          <div className="text-xl font-bold">{paidPayments.length}</div>
          <div className="text-xs text-gray-500">Paid</div>
        </div>
      </div>
    </TenantStatCard>
  );
}
