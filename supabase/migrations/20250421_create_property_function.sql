
-- Create a function to bypass RLS for property creation
CREATE OR REPLACE FUNCTION public.create_property(
  name_param TEXT,
  address_param TEXT,
  owner_id_param UUID,
  details_param JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_property_id UUID;
BEGIN
  INSERT INTO public.properties (
    name,
    address,
    owner_id,
    details
  ) VALUES (
    name_param,
    address_param,
    owner_id_param,
    details_param
  )
  RETURNING id INTO new_property_id;
  
  RETURN new_property_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.create_property TO authenticated;

-- Add bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('property_images', 'property_images', true, 10485760, ARRAY['image/png', 'image/jpeg', 'image/gif', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- Create RLS policy to allow authenticated users to upload images
CREATE POLICY "Allow authenticated users to upload images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'property_images');

-- Create RLS policy to allow anyone to read images
CREATE POLICY "Allow public to read images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'property_images');
