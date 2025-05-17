
-- Create a security definer function to check tenant-property relationships without recursion
CREATE OR REPLACE FUNCTION public.check_tenant_property_access(tenant_id_param uuid, property_id_param uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.tenant_property_link
    WHERE tenant_id = tenant_id_param
    AND property_id = property_id_param
  );
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.check_tenant_property_access(uuid, uuid) TO authenticated;

-- This function will be used in RLS policies to avoid recursion
-- Apply this to the tenant_property_link table for security when accessing it
