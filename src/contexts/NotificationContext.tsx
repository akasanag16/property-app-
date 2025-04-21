
import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Notification = {
  id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
  related_entity_id?: string;
  related_entity_type?: string;
};

type NotificationContextType = {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
};

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (!user) return;

    // Fetch existing notifications
    const fetchNotifications = async () => {
      const { data, error } = await supabase
        .rpc('get_user_notifications', { user_id_param: user.id })
        .then(result => {
          if (result.error) {
            throw result.error;
          }
          return { data: result.data as Notification[], error: null };
        })
        .catch(err => {
          console.error('Error in get_user_notifications RPC:', err);
          
          // Fallback to raw SQL query if RPC doesn't exist yet
          return supabase.from('notifications')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });
        });

      if (error) {
        console.error('Error fetching notifications:', error);
        return;
      }

      setNotifications(data || []);
    };

    fetchNotifications();

    // Subscribe to new notifications
    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('Notification change received:', payload);
          if (payload.eventType === 'INSERT') {
            setNotifications(prev => [payload.new as Notification, ...prev]);
            // Show toast for new notifications
            toast(payload.new.title, {
              description: payload.new.message,
            });
          } else if (payload.eventType === 'UPDATE') {
            setNotifications(prev =>
              prev.map(n => n.id === payload.new.id ? payload.new as Notification : n)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const markAsRead = async (id: string) => {
    // Use raw SQL via RPC to update the notification
    const { error } = await supabase
      .rpc('mark_notification_as_read', { notification_id_param: id })
      .then(result => {
        if (result.error) {
          throw result.error;
        }
        return { error: null };
      })
      .catch(err => {
        console.error('Error in mark_notification_as_read RPC:', err);
        
        // Fallback to a raw query if the RPC doesn't exist yet
        return supabase.from('notifications')
          .update({ is_read: true })
          .eq('id', id);
      });

    if (error) {
      console.error('Error marking notification as read:', error);
      return;
    }

    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, is_read: true } : n)
    );
  };

  const markAllAsRead = async () => {
    // Use raw SQL via RPC to update all notifications
    const { error } = await supabase
      .rpc('mark_all_notifications_as_read', { user_id_param: user?.id })
      .then(result => {
        if (result.error) {
          throw result.error;
        }
        return { error: null };
      })
      .catch(err => {
        console.error('Error in mark_all_notifications_as_read RPC:', err);
        
        // Fallback to a raw query if the RPC doesn't exist yet
        return supabase.from('notifications')
          .update({ is_read: true })
          .eq('user_id', user?.id);
      });

    if (error) {
      console.error('Error marking all notifications as read:', error);
      return;
    }

    setNotifications(prev =>
      prev.map(n => ({ ...n, is_read: true }))
    );
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markAsRead, markAllAsRead }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
