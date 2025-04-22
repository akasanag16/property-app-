
-- Create a function to safely get a property name by ID without recursion
CREATE OR REPLACE FUNCTION public.get_property_name(property_id_param UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  property_name TEXT;
BEGIN
  SELECT name INTO property_name
  FROM properties
  WHERE id = property_id_param;
  
  RETURN property_name;
END;
$$;
