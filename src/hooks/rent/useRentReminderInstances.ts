
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { RentReminderInstance } from "@/types/rent";
import { toast } from "@/hooks/use-toast";
import { User } from "@supabase/supabase-js";

export function useRentReminderInstances(user: User | null, propertyId?: string) {
  const queryClient = useQueryClient();

  const { data: rentInstances, isLoading, error } = useQuery({
    queryKey: ['rentReminderInstances', user?.id, propertyId],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .rpc('get_owner_rent_reminder_instances', { owner_id_param: user.id });
        
      if (error) {
        console.error('Error fetching rent reminder instances:', error);
        toast.error('Failed to load rent payments');
        throw error;
      }
      
      let instances = data as RentReminderInstance[];
      
      // If propertyId is provided, filter instances for that property
      if (propertyId) {
        instances = instances.filter(instance => instance.property_id === propertyId);
      }
      
      return instances;
    },
    enabled: !!user?.id
  });

  const markAsPaid = useMutation({
    mutationFn: async (instanceId: string) => {
      const { data, error } = await supabase
        .rpc('mark_rent_as_paid', { instance_id_param: instanceId });
      
      if (error) {
        console.error('Error marking rent as paid:', error);
        toast.error('Failed to mark rent as paid');
        throw error;
      }
      
      return data;
    },
    onSuccess: () => {
      toast.success('Rent marked as paid');
      queryClient.invalidateQueries({ queryKey: ['rentReminderInstances'] });
    }
  });

  const markAsPending = useMutation({
    mutationFn: async (instanceId: string) => {
      const { data, error } = await supabase
        .rpc('mark_rent_as_pending', { instance_id_param: instanceId });
      
      if (error) {
        console.error('Error marking rent as pending:', error);
        toast.error('Failed to update rent status');
        throw error;
      }
      
      return data;
    },
    onSuccess: () => {
      toast.success('Rent marked as pending');
      queryClient.invalidateQueries({ queryKey: ['rentReminderInstances'] });
    }
  });

  return {
    rentInstances,
    isLoading,
    error,
    markAsPaid,
    markAsPending
  };
}
