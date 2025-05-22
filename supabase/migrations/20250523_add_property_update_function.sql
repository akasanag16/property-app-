
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

-- Update the maintenance request function to add notifications for tenants
CREATE OR REPLACE FUNCTION public.safe_update_maintenance_request(
  request_id_param UUID,
  owner_id_param UUID,
  status_param TEXT,
  service_provider_id_param UUID DEFAULT NULL::UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  property_id_var UUID;
  request_details RECORD;
  is_owner BOOLEAN;
  tenant_id_var UUID;
  request_title TEXT;
BEGIN
  -- Get the property ID and tenant ID for this request
  SELECT 
    property_id, 
    tenant_id, 
    title 
  INTO request_details
  FROM maintenance_requests
  WHERE id = request_id_param;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Maintenance request not found';
  END IF;
  
  property_id_var := request_details.property_id;
  tenant_id_var := request_details.tenant_id;
  request_title := request_details.title;
  
  -- Check if the user is the owner of this property directly without causing recursion
  SELECT (owner_id = owner_id_param) INTO is_owner
  FROM properties
  WHERE id = property_id_var;
  
  IF NOT is_owner THEN
    RAISE EXCEPTION 'User is not the owner of this property';
  END IF;
  
  -- Update the maintenance request status
  IF status_param = 'accepted' THEN
    -- If accepting the request and a service provider is provided, assign them
    IF service_provider_id_param IS NOT NULL THEN
      UPDATE maintenance_requests
      SET 
        status = status_param::request_status,
        assigned_service_provider_id = service_provider_id_param
      WHERE id = request_id_param;
      
      -- Create notification for service provider
      PERFORM create_notification(
        service_provider_id_param,
        'New Maintenance Request Assigned',
        'You have been assigned to a maintenance request: ' || request_title,
        'maintenance_assignment',
        request_id_param,
        'maintenance_request'
      );
      
      -- Create notification for tenant
      PERFORM create_notification(
        tenant_id_var,
        'Maintenance Request Accepted',
        'Your maintenance request has been accepted: ' || request_title,
        'maintenance_status_update',
        request_id_param,
        'maintenance_request'
      );
    ELSE
      -- Just update the status if no service provider is provided
      UPDATE maintenance_requests
      SET status = status_param::request_status
      WHERE id = request_id_param;
      
      -- Notify tenant about status change
      PERFORM create_notification(
        tenant_id_var,
        'Maintenance Request Status Updated',
        'Your maintenance request status has been updated to: ' || status_param || ' - ' || request_title,
        'maintenance_status_update',
        request_id_param,
        'maintenance_request'
      );
    END IF;
  ELSE
    -- For other status updates, don't modify the assigned service provider
    UPDATE maintenance_requests
    SET status = status_param::request_status
    WHERE id = request_id_param;
    
    -- Notify tenant about the status change regardless of what it is
    PERFORM create_notification(
      tenant_id_var,
      'Maintenance Request Status Updated',
      'Your maintenance request status has been updated to: ' || status_param || ' - ' || request_title,
      'maintenance_status_update',
      request_id_param,
      'maintenance_request'
    );
  END IF;
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RAISE;
END;
$$;
