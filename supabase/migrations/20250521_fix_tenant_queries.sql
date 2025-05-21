
-- Create a security definer function to safely get tenant data for an owner's properties
CREATE OR REPLACE FUNCTION public.safe_get_owner_tenants(owner_id_param uuid)
RETURNS TABLE(
  tenant_id uuid,
  property_id uuid,
  property_name text
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    tpl.tenant_id,
    tpl.property_id,
    p.name as property_name
  FROM 
    tenant_property_link tpl
  JOIN 
    properties p ON tpl.property_id = p.id
  WHERE 
    p.owner_id = owner_id_param;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.safe_get_owner_tenants(uuid) TO authenticated;
