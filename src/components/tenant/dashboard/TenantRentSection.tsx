
import { User } from "@supabase/supabase-js";
import { TenantRentDashboard } from "./TenantRentDashboard";
import { useEffect } from "react";
import { useNotifications } from "@/contexts/NotificationContext";
import { useTenantRentReminders } from "@/hooks/rent/useTenantRentReminders";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface TenantRentSectionProps {
  user: User | null;
}

export function TenantRentSection({ user }: TenantRentSectionProps) {
  const { rentInstances, getUpcomingPayment } = useTenantRentReminders(user);
  const upcomingPayment = getUpcomingPayment();

  // Subscribe to real-time notifications for rent reminders
  useEffect(() => {
    if (!user) return;
    
    console.log("Setting up real-time rent notification listener for tenant", user.id);
    
    // Subscribe to notification changes for this tenant
    const channel = supabase
      .channel('rent-notifications')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id} AND type=eq.rent_reminder`,
        },
        (payload) => {
          console.log('Rent notification received:', payload);
          if (payload.eventType === 'INSERT') {
            toast.info(payload.new.title, {
              description: payload.new.message,
              duration: 6000,
            });
          }
        }
      )
      .subscribe();

    return () => {
      console.log("Cleaning up rent notification listener");
      supabase.removeChannel(channel);
    };
  }, [user]);

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Your Rent Payments</h2>
      {upcomingPayment && (
        <div className="mb-4 bg-blue-50 border-l-4 border-blue-500 p-4 rounded-md">
          <p className="text-blue-700 font-medium">
            Next payment of ${upcomingPayment.amount.toFixed(2)} is due on {new Date(upcomingPayment.due_date).toLocaleDateString()}
          </p>
        </div>
      )}
      <TenantRentDashboard user={user} />
    </div>
  );
}
