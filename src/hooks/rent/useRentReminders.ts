
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { RentReminder, CreateRentReminderParams } from "@/types/rent";
import { toast } from "@/hooks/use-toast";
import { User } from "@supabase/supabase-js";

export function useRentReminders(user: User | null) {
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);

  const { data: rentReminders, isLoading, error } = useQuery({
    queryKey: ['rentReminders', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .rpc('get_owner_rent_reminders', { owner_id_param: user.id });
        
      if (error) {
        console.error('Error fetching rent reminders:', error);
        toast.error('Failed to load rent reminders');
        throw error;
      }
      
      return data as RentReminder[];
    },
    enabled: !!user?.id
  });

  const createRentReminder = useMutation({
    mutationFn: async (params: CreateRentReminderParams) => {
      setIsCreating(true);
      
      const { data, error } = await supabase
        .rpc('create_or_update_rent_reminder', {
          property_id_param: params.property_id,
          reminder_day_param: params.reminder_day,
          amount_param: params.amount,
          tenant_notification_days_param: params.tenant_notification_days || 4,
          owner_notification_days_param: params.owner_notification_days || 5
        });
      
      if (error) {
        console.error('Error creating/updating rent reminder:', error);
        toast.error('Failed to save rent reminder');
        throw error;
      }
      
      return data;
    },
    onSuccess: () => {
      toast.success('Rent reminder saved successfully');
      queryClient.invalidateQueries({ queryKey: ['rentReminders'] });
      setIsCreating(false);
    },
    onError: () => {
      setIsCreating(false);
    }
  });

  const getPropertyReminder = (propertyId: string): RentReminder | undefined => {
    return rentReminders?.find(reminder => reminder.property_id === propertyId);
  };

  return {
    rentReminders,
    isLoading,
    error,
    isCreating,
    createRentReminder,
    getPropertyReminder
  };
}
