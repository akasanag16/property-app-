
-- Create an optimized function to get service providers with their details in one query
-- This reduces the number of database calls and improves performance
CREATE OR REPLACE FUNCTION public.get_owner_service_providers_with_details(owner_id_param uuid)
RETURNS TABLE(
  id uuid,
  first_name text,
  last_name text,
  email text,
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
    p.id,
    p.first_name,
    p.last_name,
    p.email,
    prop.id as property_id,
    prop.name as property_name
  FROM 
    profiles p
  JOIN 
    service_provider_property_link sppl ON p.id = sppl.service_provider_id
  JOIN 
    properties prop ON sppl.property_id = prop.id
  WHERE 
    prop.owner_id = owner_id_param
  ORDER BY 
    p.first_name, p.last_name;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_owner_service_providers_with_details(uuid) TO authenticated;

-- Create an index to improve query performance
CREATE INDEX IF NOT EXISTS idx_service_provider_property_link_service_provider_id
ON service_provider_property_link(service_provider_id);

CREATE INDEX IF NOT EXISTS idx_service_provider_property_link_property_id
ON service_provider_property_link(property_id);

CREATE INDEX IF NOT EXISTS idx_properties_owner_id
ON properties(owner_id);
