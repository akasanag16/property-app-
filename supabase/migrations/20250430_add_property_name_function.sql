
-- Create a function to get property names by IDs without causing recursion
CREATE OR REPLACE FUNCTION public.get_property_name_by_ids(property_ids uuid[])
RETURNS TABLE(id uuid, name text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT p.id, p.name
  FROM properties p
  WHERE p.id = ANY(property_ids);
END;
$$;
