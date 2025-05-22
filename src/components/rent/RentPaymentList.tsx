
import { useState } from "react";
import { format } from "date-fns";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RentReminderInstance } from "@/types/rent";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, X, Calendar, CircleDollarSign } from "lucide-react";
import { useRentReminderInstances } from "@/hooks/rent/useRentReminderInstances";
import { useAuth } from "@/contexts/AuthContext";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface RentPaymentListProps {
  propertyId?: string;
}

export function RentPaymentList({ propertyId }: RentPaymentListProps) {
  const { user } = useAuth();
  const { rentInstances, isLoading, markAsPaid, markAsPending } = useRentReminderInstances(user, propertyId);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleMarkAsPaid = async (instanceId: string) => {
    setProcessingId(instanceId);
    try {
      await markAsPaid.mutateAsync(instanceId);
    } finally {
      setProcessingId(null);
    }
  };

  const handleMarkAsPending = async (instanceId: string) => {
    setProcessingId(instanceId);
    try {
      await markAsPending.mutateAsync(instanceId);
    } finally {
      setProcessingId(null);
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "N/A";
    return format(new Date(dateStr), 'MMM d, yyyy');
  };

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-500">Paid</Badge>;
      case 'overdue':
        return <Badge variant="destructive">Overdue</Badge>;
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return <div className="flex justify-center p-4"><LoadingSpinner /></div>;
  }

  if (!rentInstances || rentInstances.length === 0) {
    return (
      <div className="text-center p-6 bg-gray-50 rounded-md">
        <CircleDollarSign className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-lg font-semibold text-gray-900">No rent payments</h3>
        <p className="mt-1 text-sm text-gray-500">
          No rent payment records found for this property. Set up a rent reminder first.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Property</TableHead>
            <TableHead>Tenant</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Paid On</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rentInstances.map((instance) => (
            <TableRow key={instance.id}>
              <TableCell>{instance.property_name}</TableCell>
              <TableCell>
                {instance.tenant_first_name} {instance.tenant_last_name}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {formatDate(instance.due_date)}
                </div>
              </TableCell>
              <TableCell className="font-semibold">${instance.amount}</TableCell>
              <TableCell>{renderStatusBadge(instance.status)}</TableCell>
              <TableCell>{formatDate(instance.paid_date)}</TableCell>
              <TableCell>
                {instance.status !== 'paid' ? (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="flex items-center gap-1 text-green-600 hover:text-green-700 hover:bg-green-50"
                    onClick={() => handleMarkAsPaid(instance.id)}
                    disabled={processingId === instance.id}
                  >
                    {processingId === instance.id ? <LoadingSpinner size="xs" /> : <Check className="h-4 w-4" />}
                    Mark Paid
                  </Button>
                ) : (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="flex items-center gap-1 text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                    onClick={() => handleMarkAsPending(instance.id)}
                    disabled={processingId === instance.id}
                  >
                    {processingId === instance.id ? <LoadingSpinner size="xs" /> : <X className="h-4 w-4" />}
                    Undo
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
