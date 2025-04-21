
import { Users, TrendingDown, TrendingUp, DollarSign } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tenant } from "@/types/tenant";

interface TenantStatsProps {
  tenants: Tenant[];
}

export function TenantStats({ tenants }: TenantStatsProps) {
  const totalMonthlyIncome = tenants.reduce((total, tenant) => 
    total + (tenant.next_payment?.amount || 0), 0
  );

  const overduePayments = tenants.filter(tenant => 
    tenant.last_payment?.status === 'overdue'
  );

  const upcomingPayments = tenants.filter(tenant => 
    tenant.next_payment && tenant.next_payment.due_in_days <= 7
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium">Total Tenants</CardTitle>
          <CardDescription>Active tenants across properties</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <Users className="h-8 w-8 text-blue-500 mr-3" />
            <div className="text-3xl font-bold">{tenants.length}</div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium">Monthly Income</CardTitle>
          <CardDescription>Expected rent this month</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <DollarSign className="h-8 w-8 text-green-500 mr-3" />
            <div className="text-3xl font-bold">${totalMonthlyIncome.toLocaleString()}</div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium">Payment Status</CardTitle>
          <CardDescription>Overview of rent payments</CardDescription>
        </CardHeader>
        <CardContent>
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
              <div className="text-xl font-bold">
                {tenants.filter(t => t.last_payment?.status === 'paid').length}
              </div>
              <div className="text-xs text-gray-500">Paid</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
