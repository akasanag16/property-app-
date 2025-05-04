
-- Function to get tenant-property links for properties without causing recursion
CREATE OR REPLACE FUNCTION public.get_tenant_property_links_for_properties(property_ids uuid[])
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
    tpl.property_id = ANY(property_ids);
END;
$$;
