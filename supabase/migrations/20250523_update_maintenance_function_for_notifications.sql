
-- Update the safe_update_maintenance_request function to include tenant notification
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
  tenant_id_var UUID;
  request_details RECORD;
  is_owner BOOLEAN;
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
        'You have been assigned to a maintenance request: ' || request_details.title,
        'maintenance_assignment',
        request_id_param,
        'maintenance_request'
      );
    ELSE
      -- Just update the status if no service provider is provided
      UPDATE maintenance_requests
      SET status = status_param::request_status
      WHERE id = request_id_param;
    END IF;
  ELSE
    -- For other status updates, don't modify the assigned service provider
    UPDATE maintenance_requests
    SET status = status_param::request_status
    WHERE id = request_id_param;
    
    -- Create notification for tenant based on status
    IF status_param = 'review' THEN
      -- Notify tenant that their request is under review
      PERFORM create_notification(
        tenant_id_var,
        'Maintenance Request Update',
        'Your maintenance request "' || request_details.title || '" is now under review.',
        'maintenance_status',
        request_id_param,
        'maintenance_request'
      );
    ELSIF status_param = 'completed' THEN
      -- Notify tenant that their request is completed
      PERFORM create_notification(
        tenant_id_var,
        'Maintenance Request Completed',
        'Your maintenance request "' || request_details.title || '" has been completed.',
        'maintenance_status',
        request_id_param,
        'maintenance_request'
      );
    ELSIF status_param = 'rejected' THEN
      -- Notify tenant that their request is rejected
      PERFORM create_notification(
        tenant_id_var,
        'Maintenance Request Rejected',
        'Your maintenance request "' || request_details.title || '" has been rejected.',
        'maintenance_status',
        request_id_param,
        'maintenance_request'
      );
    END IF;
  END IF;
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RAISE;
END;
$$;
