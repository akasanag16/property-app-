-- Security Fix: Clean up duplicate RLS policies and add missing policies

-- First, drop all duplicate RLS policies on maintenance_requests table
-- Keep only the essential ones that provide proper access control

-- Drop duplicate policies (keeping the most specific ones)
DROP POLICY IF EXISTS "Allow owners to view property maintenance requests" ON maintenance_requests;
DROP POLICY IF EXISTS "Allow service providers to update assigned maintenance requests" ON maintenance_requests;
DROP POLICY IF EXISTS "Allow service providers to view assigned maintenance requests" ON maintenance_requests;
DROP POLICY IF EXISTS "Allow tenants to insert maintenance requests" ON maintenance_requests;
DROP POLICY IF EXISTS "Allow tenants to view their maintenance requests" ON maintenance_requests;
DROP POLICY IF EXISTS "Owners can update maintenance requests for their properties" ON maintenance_requests;
DROP POLICY IF EXISTS "Owners can view maintenance requests for their properties" ON maintenance_requests;
DROP POLICY IF EXISTS "Service providers can update assigned requests" ON maintenance_requests;
DROP POLICY IF EXISTS "Service providers can update their assigned maintenance request" ON maintenance_requests;
DROP POLICY IF EXISTS "Service providers can view assigned maintenance requests" ON maintenance_requests;
DROP POLICY IF EXISTS "Service providers can view their assigned maintenance requests" ON maintenance_requests;
DROP POLICY IF EXISTS "Tenants can create maintenance requests" ON maintenance_requests;
DROP POLICY IF EXISTS "Tenants can view their own maintenance requests" ON maintenance_requests;
DROP POLICY IF EXISTS "Tenants can view their own requests" ON maintenance_requests;

-- Keep only the consolidated essential policies
-- The "Users can view relevant maintenance requests" policy already covers most access

-- Add missing INSERT policy for profiles table (CRITICAL SECURITY FIX)
CREATE POLICY "Users can insert their own profile" 
ON profiles 
FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Create security definer function to validate role changes and prevent privilege escalation
CREATE OR REPLACE FUNCTION public.validate_role_change(user_id uuid, old_role user_role, new_role user_role)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only allow role changes by the user themselves for specific transitions
  -- or by administrators (this would need to be expanded based on admin system)
  
  -- For now, prevent any role escalation - users cannot change their role to owner
  IF old_role != 'owner' AND new_role = 'owner' THEN
    RETURN FALSE;
  END IF;
  
  -- Allow tenant -> service_provider transition (common use case)
  IF old_role = 'tenant' AND new_role = 'service_provider' THEN
    RETURN TRUE;
  END IF;
  
  -- Allow service_provider -> tenant transition
  IF old_role = 'service_provider' AND new_role = 'tenant' THEN
    RETURN TRUE;
  END IF;
  
  -- Deny any other role changes for security
  IF old_role != new_role THEN
    RETURN FALSE;
  END IF;
  
  RETURN TRUE;
END;
$$;

-- Add trigger to validate role changes on profiles update
CREATE OR REPLACE FUNCTION public.check_role_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  old_role user_role;
BEGIN
  -- Get the old role
  SELECT role INTO old_role FROM profiles WHERE id = NEW.id;
  
  -- Validate the role change
  IF NOT validate_role_change(NEW.id, old_role, NEW.role) THEN
    RAISE EXCEPTION 'Unauthorized role change attempt from % to %', old_role, NEW.role;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for role change validation
DROP TRIGGER IF EXISTS validate_role_change_trigger ON profiles;
CREATE TRIGGER validate_role_change_trigger
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  WHEN (OLD.role IS DISTINCT FROM NEW.role)
  EXECUTE FUNCTION check_role_change();

-- Create function for secure input validation
CREATE OR REPLACE FUNCTION public.validate_email_format(email_input text)
RETURNS boolean
LANGUAGE plpgsql
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

-- Create function for secure token generation (for invitations)
CREATE OR REPLACE FUNCTION public.generate_secure_token()
RETURNS text
LANGUAGE plpgsql
AS $$
BEGIN
  -- Generate cryptographically secure random token
  RETURN encode(gen_random_bytes(32), 'base64');
END;
$$;