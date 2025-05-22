
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { toast } from "sonner";
import { RentReminderInstance } from "@/types/rent";

export function useTenantRentReminders(user: User | null) {
  const { data: rentInstances, isLoading, error } = useQuery({
    queryKey: ['tenantRentReminders', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .rpc('get_tenant_rent_reminder_instances', { tenant_id_param: user.id });
        
      if (error) {
        console.error('Error fetching tenant rent reminders:', error);
        toast.error('Failed to load rent payment information');
        throw error;
      }
      
      return data as RentReminderInstance[];
    },
    enabled: !!user?.id
  });

  // Get upcoming payment (closest due date in the future)
  const getUpcomingPayment = () => {
    if (!rentInstances?.length) return null;
    
    const now = new Date();
    const futurePayments = rentInstances.filter(
      payment => new Date(payment.due_date) > now && payment.status === 'pending'
    );
    
    if (!futurePayments.length) return null;
    
    return futurePayments.sort(
      (a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
    )[0];
  };

  // Get next payment due date
  const getNextPaymentDueIn = () => {
    const upcomingPayment = getUpcomingPayment();
    if (!upcomingPayment) return null;
    
    const dueDate = new Date(upcomingPayment.due_date);
    const today = new Date();
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  return {
    rentInstances,
    isLoading,
    error,
    getUpcomingPayment,
    getNextPaymentDueIn
  };
}
