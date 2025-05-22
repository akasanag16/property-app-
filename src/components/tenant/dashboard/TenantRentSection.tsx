
import { useState } from "react";
import { User } from "@supabase/supabase-js";
import { useTenantRentReminders } from "@/hooks/rent/useTenantRentReminders";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { format } from "date-fns";
import { Calendar, DollarSign, AlertTriangle } from "lucide-react";
import { RentReminderInstance } from "@/types/rent";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TenantRentSectionProps {
  user: User | null;
}

export function TenantRentSection({ user }: TenantRentSectionProps) {
  const { rentInstances, isLoading, error, getNextPaymentDueIn } = useTenantRentReminders(user);
  const [filter, setFilter] = useState<'all' | 'pending' | 'paid' | 'overdue'>('all');

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Failed to load rent information</h3>
        <p className="text-gray-500 mb-4">There was an error loading your rent payment information.</p>
        <Button 
          variant="outline" 
          onClick={() => window.location.reload()}
        >
          Try Again
        </Button>
      </div>
    );
  }

  if (!rentInstances?.length) {
    return (
      <div className="p-6 text-center">
        <Calendar className="w-12 h-12 text-primary/50 mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Rent Information</h3>
        <p className="text-gray-500">No rent payment information is available for your account.</p>
      </div>
    );
  }

  const filteredInstances = filter === 'all' 
    ? rentInstances 
    : rentInstances.filter(instance => instance.status === filter);

  const getRentStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Paid</Badge>;
      case 'overdue':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">Overdue</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">Pending</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-semibold">Your Rent Payments</h2>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setFilter('all')}
            className={cn(filter === 'all' ? "bg-primary/10" : "")}
          >
            All
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setFilter('pending')}
            className={cn(filter === 'pending' ? "bg-primary/10" : "")}
          >
            Pending
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setFilter('paid')}
            className={cn(filter === 'paid' ? "bg-primary/10" : "")}
          >
            Paid
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setFilter('overdue')}
            className={cn(filter === 'overdue' ? "bg-primary/10" : "")}
          >
            Overdue
          </Button>
        </div>
      </div>

      <div className="grid gap-4">
        {filteredInstances.map((instance: RentReminderInstance) => (
          <Card key={instance.id} className="p-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="font-medium">{instance.property_name}</h3>
                <div className="flex items-center gap-2 text-gray-500 mt-1">
                  <Calendar className="w-4 h-4" /> 
                  <span>Due: {format(new Date(instance.due_date), 'MMM d, yyyy')}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-6">
                <div className="flex items-center">
                  <DollarSign className="w-5 h-5 text-gray-500 mr-1" />
                  <span className="font-semibold">${instance.amount.toFixed(2)}</span>
                </div>
                
                <div>
                  {getRentStatusBadge(instance.status)}
                </div>
                
                {instance.paid_date && (
                  <div className="text-sm text-gray-500">
                    Paid on {format(new Date(instance.paid_date), 'MMM d, yyyy')}
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
