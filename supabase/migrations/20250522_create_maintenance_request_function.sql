
-- Create a security definer function to create maintenance requests without recursion
CREATE OR REPLACE FUNCTION public.create_maintenance_request(
  title_param text,
  description_param text,
  property_id_param uuid,
  tenant_id_param uuid,
  status_param text DEFAULT 'pending'::text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  new_request_id UUID;
BEGIN
  -- Verify tenant has access to this property
  IF NOT EXISTS (
    SELECT 1
    FROM tenant_property_link
    WHERE tenant_id = tenant_id_param
    AND property_id = property_id_param
  ) THEN
    RAISE EXCEPTION 'Tenant does not have access to this property';
  END IF;
  
  -- Insert the maintenance request
  INSERT INTO maintenance_requests (
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
    status_param::request_status  -- Cast to request_status type
  )
  RETURNING id INTO new_request_id;
  
  RETURN new_request_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.create_maintenance_request(text, text, uuid, uuid, text) TO authenticated;
