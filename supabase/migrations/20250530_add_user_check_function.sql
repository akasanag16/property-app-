
-- This function checks if user IDs exist in the auth schema
-- This helps debug issues where users exist but don't have profile records
CREATE OR REPLACE FUNCTION public.check_users_exist(user_ids uuid[])
RETURNS TABLE(user_id uuid, exists_in_auth boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id AS user_id,
    TRUE AS exists_in_auth
  FROM 
    auth.users u
  WHERE 
    u.id = ANY(user_ids);
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.check_users_exist(uuid[]) TO authenticated;
