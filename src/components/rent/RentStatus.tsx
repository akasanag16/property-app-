
import { useRentReminderInstances } from "@/hooks/rent/useRentReminderInstances";
import { useAuth } from "@/contexts/AuthContext";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Card, CardContent } from "@/components/ui/card";
import { CircleDollarSign, AlertCircle, CheckCircle, Clock } from "lucide-react";
import { useMemo } from "react";

interface RentStatusProps {
  propertyId?: string;
}

export function RentStatus({ propertyId }: RentStatusProps) {
  const { user } = useAuth();
  const { rentInstances, isLoading } = useRentReminderInstances(user, propertyId);
  
  const stats = useMemo(() => {
    if (!rentInstances) return { paid: 0, pending: 0, overdue: 0, total: 0 };
    
    const result = {
      paid: rentInstances.filter(i => i.status === 'paid').length,
      pending: rentInstances.filter(i => i.status === 'pending').length,
      overdue: rentInstances.filter(i => i.status === 'overdue').length,
      total: rentInstances.length
    };
    
    return result;
  }, [rentInstances]);
  
  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  if (!rentInstances || rentInstances.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="pt-6 flex flex-row items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Total Payments</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </div>
          <CircleDollarSign className="h-8 w-8 text-gray-400" />
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="pt-6 flex flex-row items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Paid</p>
            <p className="text-2xl font-bold">{stats.paid}</p>
          </div>
          <CheckCircle className="h-8 w-8 text-green-500" />
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="pt-6 flex flex-row items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Pending</p>
            <p className="text-2xl font-bold">{stats.pending}</p>
          </div>
          <Clock className="h-8 w-8 text-yellow-500" />
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="pt-6 flex flex-row items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Overdue</p>
            <p className="text-2xl font-bold">{stats.overdue}</p>
          </div>
          <AlertCircle className="h-8 w-8 text-red-500" />
        </CardContent>
      </Card>
    </div>
  );
}
