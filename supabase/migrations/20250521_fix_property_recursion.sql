
-- This migration fixes the infinite recursion issue in properties table policies
-- Create a function to check owner property access without causing recursion
CREATE OR REPLACE FUNCTION public.check_owner_property_access(owner_id_param uuid, property_id_param uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM properties
    WHERE id = property_id_param
    AND owner_id = owner_id_param
  );
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.check_owner_property_access(uuid, uuid) TO authenticated;

-- Create a function to safely get service provider data by owner ID
CREATE OR REPLACE FUNCTION public.safe_get_owner_service_providers(owner_id_param uuid)
RETURNS TABLE(
  service_provider_id uuid,
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
    sppl.service_provider_id,
    sppl.property_id,
    p.name as property_name
  FROM 
    service_provider_property_link sppl
  JOIN 
    properties p ON sppl.property_id = p.id
  WHERE 
    p.owner_id = owner_id_param;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.safe_get_owner_service_providers(uuid) TO authenticated;
