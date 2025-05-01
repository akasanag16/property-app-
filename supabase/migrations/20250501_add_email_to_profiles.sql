
-- Add email column to profiles table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'email'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN email TEXT;
    END IF;
END
$$;

-- Update existing profiles with emails from auth.users if available
UPDATE public.profiles 
SET email = users.email
FROM auth.users
WHERE profiles.id = users.id AND profiles.email IS NULL;

-- Create an index on the email column for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- Set up a trigger to keep the email in sync with auth.users
CREATE OR REPLACE FUNCTION public.sync_user_email()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  UPDATE public.profiles
  SET email = NEW.email
  WHERE id = NEW.id;
  
  RETURN NEW;
END;
$$;

-- Drop the trigger if it exists to avoid errors on recreation
DROP TRIGGER IF EXISTS on_auth_user_email_updated ON auth.users;

-- Create the trigger
CREATE TRIGGER on_auth_user_email_updated
  AFTER UPDATE OF email ON auth.users
  FOR EACH ROW
  EXECUTE PROCEDURE public.sync_user_email();
