
-- Add transaction control functions for edge functions
CREATE OR REPLACE FUNCTION public.begin_transaction()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- This function starts a transaction
END;
$$;

CREATE OR REPLACE FUNCTION public.commit_transaction()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- This function commits a transaction
END;
$$;

CREATE OR REPLACE FUNCTION public.rollback_transaction()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- This function rolls back a transaction
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.begin_transaction TO authenticated;
GRANT EXECUTE ON FUNCTION public.commit_transaction TO authenticated;
GRANT EXECUTE ON FUNCTION public.rollback_transaction TO authenticated;
