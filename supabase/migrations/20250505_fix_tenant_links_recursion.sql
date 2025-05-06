
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

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_tenant_property_links_for_properties(uuid[]) TO authenticated;

-- Function to create maintenance requests without recursion
CREATE OR REPLACE FUNCTION public.create_maintenance_request(
  title_param text,
  description_param text,
  property_id_param uuid,
  tenant_id_param uuid,
  status_param text DEFAULT 'pending'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  new_request_id UUID;
BEGIN
  -- Insert the maintenance request
  INSERT INTO public.maintenance_requests (
    title,
    description,
    property_id,
    tenant_id,
    status
  ) VALUES (
    title_param,
    description_param,
    property_id_param,
    tenant_id_param,
    status_param::request_status
  )
  RETURNING id INTO new_request_id;
  
  RETURN new_request_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.create_maintenance_request(text, text, uuid, uuid, text) TO authenticated;
