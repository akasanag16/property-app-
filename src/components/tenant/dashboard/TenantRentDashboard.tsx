
import { useState } from "react";
import { User } from "@supabase/supabase-js";
import { useTenantRentReminders } from "@/hooks/rent/useTenantRentReminders";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format, addDays } from "date-fns";
import { Calendar, DollarSign, AlertTriangle, Clock, CheckCircle } from "lucide-react";
import { RentReminderInstance } from "@/types/rent";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface TenantRentDashboardProps {
  user: User | null;
}

export function TenantRentDashboard({ user }: TenantRentDashboardProps) {
  const { rentInstances, isLoading, error, getUpcomingPayment, getNextPaymentDueIn } = useTenantRentReminders(user);
  const [filter, setFilter] = useState<'all' | 'pending' | 'paid' | 'overdue'>('all');
  const dueInDays = getNextPaymentDueIn() || 0;
  const upcomingPayment = getUpcomingPayment();

  if (isLoading) {
    return (
      <div className="flex justify-center p-6">
        <LoadingSpinner />
      </div>
    );
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
      {/* Next payment summary card */}
      {upcomingPayment && (
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h3 className="text-lg font-semibold mb-1">Next Payment Due</h3>
                <div className="flex items-center gap-2 text-blue-700">
                  <Calendar className="h-5 w-5" />
                  <span>{format(new Date(upcomingPayment.due_date), 'MMMM d, yyyy')}</span>
                  <span className="text-blue-500">({dueInDays} days from now)</span>
                </div>
                <p className="mt-2 text-gray-600">{upcomingPayment.property_name}</p>
              </div>
              <div className="flex flex-col items-end">
                <div className="text-xl md:text-2xl font-bold text-blue-700">${upcomingPayment.amount.toFixed(2)}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all" onClick={() => setFilter('all')}>All</TabsTrigger>
          <TabsTrigger value="pending" onClick={() => setFilter('pending')}>Pending</TabsTrigger>
          <TabsTrigger value="paid" onClick={() => setFilter('paid')}>Paid</TabsTrigger>
          <TabsTrigger value="overdue" onClick={() => setFilter('overdue')}>Overdue</TabsTrigger>
        </TabsList>
        
        <TabsContent value={filter} className="mt-6">
          <div className="grid gap-4">
            {filteredInstances.map((instance: RentReminderInstance) => (
              <Card key={instance.id} className={cn(
                "overflow-hidden",
                instance.status === 'overdue' && "border-red-200",
                instance.status === 'paid' && "border-green-200",
                instance.status === 'pending' && "border-yellow-200"
              )}>
                <div className={cn(
                  "h-1",
                  instance.status === 'overdue' && "bg-red-400",
                  instance.status === 'paid' && "bg-green-400",
                  instance.status === 'pending' && "bg-yellow-400"
                )}></div>
                <CardContent className="p-4 pt-5">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h3 className="font-medium mb-1">{instance.property_name}</h3>
                      <div className="flex items-center gap-2 text-gray-500 text-sm">
                        <Calendar className="w-4 h-4" /> 
                        <span>Due: {format(new Date(instance.due_date), 'MMM d, yyyy')}</span>
                        
                        {instance.status === 'pending' && (
                          <span className="text-yellow-600">
                            ({dueInDays} days left)
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="flex items-center">
                        <DollarSign className="w-5 h-5 text-gray-500 mr-1" />
                        <span className="font-semibold">${instance.amount.toFixed(2)}</span>
                      </div>
                      
                      <div>
                        {getRentStatusBadge(instance.status)}
                      </div>
                      
                      {instance.paid_date && (
                        <div className="text-sm text-gray-500 flex items-center gap-1">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          Paid on {format(new Date(instance.paid_date), 'MMM d, yyyy')}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
