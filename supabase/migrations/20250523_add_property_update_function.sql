
-- Create function to update property details safely
CREATE OR REPLACE FUNCTION public.safe_update_property_details(
  property_id_param UUID,
  owner_id_param UUID,
  name_param TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  is_owner BOOLEAN;
BEGIN
  -- Check if the user is the owner of this property
  SELECT (owner_id = owner_id_param) INTO is_owner
  FROM properties
  WHERE id = property_id_param;
  
  IF NOT is_owner THEN
    RAISE EXCEPTION 'User is not the owner of this property';
  END IF;
  
  -- Update the property details
  UPDATE properties
  SET name = name_param
  WHERE id = property_id_param;
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RAISE;
END;
$$;
