
-- Create function to get user notifications
CREATE OR REPLACE FUNCTION public.get_user_notifications(user_id_param UUID)
RETURNS SETOF public.notifications
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT * FROM public.notifications 
  WHERE user_id = user_id_param 
  ORDER BY created_at DESC;
$$;

-- Create function to mark a notification as read
CREATE OR REPLACE FUNCTION public.mark_notification_as_read(notification_id_param UUID)
RETURNS VOID
LANGUAGE sql
SECURITY DEFINER
AS $$
  UPDATE public.notifications 
  SET is_read = true 
  WHERE id = notification_id_param;
$$;

-- Create function to mark all notifications as read for a user
CREATE OR REPLACE FUNCTION public.mark_all_notifications_as_read(user_id_param UUID)
RETURNS VOID
LANGUAGE sql
SECURITY DEFINER
AS $$
  UPDATE public.notifications 
  SET is_read = true 
  WHERE user_id = user_id_param;
$$;

-- Create function to insert a notification
CREATE OR REPLACE FUNCTION public.create_notification(
  user_id_param UUID,
  title_param TEXT,
  message_param TEXT,
  type_param TEXT,
  related_entity_id_param UUID DEFAULT NULL,
  related_entity_type_param TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO public.notifications (
    user_id, 
    title, 
    message, 
    type, 
    related_entity_id, 
    related_entity_type
  ) VALUES (
    user_id_param,
    title_param,
    message_param,
    type_param,
    related_entity_id_param,
    related_entity_type_param
  )
  RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$;
