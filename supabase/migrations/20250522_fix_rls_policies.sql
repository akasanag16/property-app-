
-- Add RLS policies for tenant_property_link table
ALTER TABLE IF EXISTS public.tenant_property_link ENABLE ROW LEVEL SECURITY;

-- Policy for tenants to view their own links
CREATE POLICY IF NOT EXISTS "Tenants can view their own links" 
  ON public.tenant_property_link 
  FOR SELECT 
  USING (tenant_id = auth.uid());

-- Policy for owners to view links for properties they own
CREATE POLICY IF NOT EXISTS "Owners can view links for their properties" 
  ON public.tenant_property_link 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM properties p
      WHERE p.id = property_id
      AND p.owner_id = auth.uid()
    )
  );

-- Add RLS policies for service_provider_property_link table
ALTER TABLE IF EXISTS public.service_provider_property_link ENABLE ROW LEVEL SECURITY;

-- Policy for service providers to view their own links
CREATE POLICY IF NOT EXISTS "Service providers can view their own links" 
  ON public.service_provider_property_link 
  FOR SELECT 
  USING (service_provider_id = auth.uid());

-- Policy for owners to view links for properties they own
CREATE POLICY IF NOT EXISTS "Owners can view service provider links for their properties" 
  ON public.service_provider_property_link 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM properties p
      WHERE p.id = property_id
      AND p.owner_id = auth.uid()
    )
  );

-- Ensure profiles table has proper RLS
ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own profile
CREATE POLICY IF NOT EXISTS "Users can view their own profile" 
  ON public.profiles 
  FOR SELECT 
  USING (id = auth.uid());

-- Allow users to update their own profile
CREATE POLICY IF NOT EXISTS "Users can update their own profile" 
  ON public.profiles 
  FOR UPDATE 
  USING (id = auth.uid());

-- Allow public view of basic profile info (needed for tenant/provider displays)
CREATE POLICY IF NOT EXISTS "Public can view basic profile info" 
  ON public.profiles 
  FOR SELECT 
  USING (true);
