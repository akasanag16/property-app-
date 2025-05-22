
-- Add function to count maintenance requests for service providers
CREATE OR REPLACE FUNCTION public.count_service_provider_maintenance_requests(
  provider_id_param UUID
)
RETURNS TABLE(count BIGINT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::bigint
  FROM
    maintenance_requests mr
  WHERE
    mr.assigned_service_provider_id = provider_id_param;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.count_service_provider_maintenance_requests(UUID) TO authenticated;

-- Add function to count pending maintenance requests for service providers
CREATE OR REPLACE FUNCTION public.count_service_provider_pending_requests(
  provider_id_param UUID
)
RETURNS TABLE(count BIGINT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::bigint
  FROM
    maintenance_requests mr
  WHERE
    mr.assigned_service_provider_id = provider_id_param
    AND mr.status IN ('pending', 'accepted');
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.count_service_provider_pending_requests(UUID) TO authenticated;
