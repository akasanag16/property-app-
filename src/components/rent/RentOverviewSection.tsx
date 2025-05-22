
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { RentReminderInstance } from "@/types/rent";
import { DollarSign, Calendar, AlertCircle, CheckCircle, Clock } from "lucide-react";

interface RentOverviewSectionProps {
  rentInstances: RentReminderInstance[] | undefined;
  isLoading: boolean;
}

export function RentOverviewSection({ rentInstances, isLoading }: RentOverviewSectionProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium h-4 bg-gray-200 rounded w-3/4"></CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold h-8 bg-gray-200 rounded w-1/2 mb-1"></div>
              <p className="text-xs text-muted-foreground h-3 bg-gray-100 rounded w-2/3"></p>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Calculate statistics
  const now = new Date();
  const totalRentValue = rentInstances?.reduce((sum, instance) => sum + Number(instance.amount), 0) || 0;
  const paidInstances = rentInstances?.filter(instance => instance.status === 'paid') || [];
  const overdueInstances = rentInstances?.filter(instance => instance.status === 'overdue') || [];
  const pendingInstances = rentInstances?.filter(instance => instance.status === 'pending') || [];
  
  const paidTotal = paidInstances.reduce((sum, instance) => sum + Number(instance.amount), 0);
  const overdueTotal = overdueInstances.reduce((sum, instance) => sum + Number(instance.amount), 0);
  const pendingTotal = pendingInstances.reduce((sum, instance) => sum + Number(instance.amount), 0);
  
  const pendingThisMonth = pendingInstances.filter(instance => {
    const dueDate = new Date(instance.due_date);
    return dueDate.getMonth() === now.getMonth() && dueDate.getFullYear() === now.getFullYear();
  });
  
  const pendingThisMonthTotal = pendingThisMonth.reduce((sum, instance) => sum + Number(instance.amount), 0);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Total Expected Rent</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${totalRentValue.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">
            Across {rentInstances?.length || 0} payments
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Collected Rent</CardTitle>
          <CheckCircle className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${paidTotal.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">
            {paidInstances.length} payments received
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Overdue Rent</CardTitle>
          <AlertCircle className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${overdueTotal.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">
            {overdueInstances.length} overdue payments
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Pending This Month</CardTitle>
          <Clock className="h-4 w-4 text-amber-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${pendingThisMonthTotal.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">
            {pendingThisMonth.length} upcoming payments
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
