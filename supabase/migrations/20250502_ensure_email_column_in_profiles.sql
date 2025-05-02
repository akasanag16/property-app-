
-- This migration ensures the email column exists in the profiles table
-- and updates the trigger to keep it in sync with auth.users

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
        
        -- Update existing profiles with emails from auth.users
        UPDATE public.profiles 
        SET email = users.email
        FROM auth.users
        WHERE profiles.id = users.id AND profiles.email IS NULL;
        
        -- Create an index on the email column for faster lookups
        CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
        
        -- Create or update the trigger to sync email
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
    END IF;
END
$$;

-- Make sure the handle_new_user function also includes email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (id, role, first_name, last_name, email)
  VALUES (
    new.id,
    COALESCE((new.raw_user_meta_data->>'role')::user_role, 'owner'),
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name',
    new.email
  );
  RETURN new;
END;
$$;

-- Re-create the trigger to ensure it uses our updated function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
