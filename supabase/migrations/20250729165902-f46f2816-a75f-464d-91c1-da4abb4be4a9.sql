-- Fix function search path security issues

-- Update validate_email_format function with proper search path
CREATE OR REPLACE FUNCTION public.validate_email_format(email_input text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
IMMUTABLE
AS $$
BEGIN
  -- More robust email validation than simple regex
  RETURN email_input ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
    AND LENGTH(email_input) <= 320  -- RFC 5321 limit
    AND email_input NOT LIKE '%..%'  -- No consecutive dots
    AND email_input NOT LIKE '.%'    -- No leading dot
    AND email_input NOT LIKE '%.';   -- No trailing dot
END;
$$;

-- Update generate_secure_token function with proper search path
CREATE OR REPLACE FUNCTION public.generate_secure_token()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Generate cryptographically secure random token
  RETURN encode(gen_random_bytes(32), 'base64');
END;
$$;