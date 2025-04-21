
-- Add transaction control functions for edge functions
CREATE OR REPLACE FUNCTION public.begin_transaction()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Begin a transaction
  -- Since transactions are automatically started in Postgres,
  -- this is mostly for consistency in the API
  NULL;
END;
$$;

CREATE OR REPLACE FUNCTION public.commit_transaction()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Commit the current transaction
  COMMIT;
END;
$$;

CREATE OR REPLACE FUNCTION public.rollback_transaction()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Roll back the current transaction
  ROLLBACK;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.begin_transaction TO authenticated;
GRANT EXECUTE ON FUNCTION public.commit_transaction TO authenticated;
GRANT EXECUTE ON FUNCTION public.rollback_transaction TO authenticated;
