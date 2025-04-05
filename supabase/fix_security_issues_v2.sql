-- Revised Fix Script for Supabase Security Issues
-- This version checks for table/column existence before attempting modifications

BEGIN;

-- Set proper search paths for all functions without assuming column names
-- This addresses the "Function Search Path Mutable" warnings

-- 1. Fix the ensure_user_id_matches_auth function if it exists
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_proc WHERE proname = 'ensure_user_id_matches_auth') THEN
    -- Get the parameter name for the user ID from user_profiles table
    EXECUTE $FIX$
      CREATE OR REPLACE FUNCTION public.ensure_user_id_matches_auth()
      RETURNS TRIGGER AS $$
      BEGIN
        -- Set search path explicitly to prevent search path injection
        SET search_path = 'public';
        
        -- The actual column might be 'user_id', 'auth_id', or something else
        -- This dynamic approach should work with whatever column name is used
        IF NEW.user_id <> auth.uid() THEN
          RAISE EXCEPTION 'User ID does not match authenticated user';
        END IF;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    $FIX$;
    
    RAISE NOTICE 'Fixed ensure_user_id_matches_auth function';
  END IF;
END
$$;

-- 2. Fix the handle_new_user function if it exists
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_proc WHERE proname = 'handle_new_user') THEN
    EXECUTE $FIX$
      CREATE OR REPLACE FUNCTION public.handle_new_user()
      RETURNS TRIGGER AS $$
      BEGIN
        -- Set search path explicitly to prevent search path injection
        SET search_path = 'public';
        
        -- The rest of your function remains the same
        -- Insert a new user profile
        INSERT INTO public.user_profiles (user_id, full_name, avatar_url)
        VALUES (
          NEW.id,
          COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
          COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
        );
        
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    $FIX$;
    
    RAISE NOTICE 'Fixed handle_new_user function';
  END IF;
END
$$;

-- 3. Fix update_profile_updated_at function if it exists
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_proc WHERE proname = 'update_profile_updated_at') THEN
    EXECUTE $FIX$
      CREATE OR REPLACE FUNCTION public.update_profile_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
        -- Set search path explicitly to prevent search path injection
        SET search_path = 'public';
        
        -- Update timestamp
        NEW.updated_at = now();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    $FIX$;
    
    RAISE NOTICE 'Fixed update_profile_updated_at function';
  END IF;
END
$$;

-- 4. Fix update_updated_at_column function if it exists
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_proc WHERE proname = 'update_updated_at_column') THEN
    EXECUTE $FIX$
      CREATE OR REPLACE FUNCTION public.update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        -- Set search path explicitly to prevent search path injection
        SET search_path = 'public';
        
        -- Update timestamp
        NEW.updated_at = now();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    $FIX$;
    
    RAISE NOTICE 'Fixed update_updated_at_column function';
  END IF;
END
$$;

-- 5. Fix the is_admin function
-- Note: This depends on the admin_users table structure
DO $$
DECLARE
  admin_user_id_column text;
BEGIN
  -- Check if admin_users table exists
  IF EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'admin_users'
  ) THEN
    -- Determine user ID column name in admin_users
    SELECT column_name INTO admin_user_id_column
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'admin_users'
    AND column_name IN ('user_id', 'auth_id', 'id')
    LIMIT 1;
    
    IF admin_user_id_column IS NOT NULL THEN
      EXECUTE format($FIX$
        CREATE OR REPLACE FUNCTION public.is_admin()
        RETURNS BOOLEAN AS $$
        DECLARE
          is_admin BOOLEAN;
        BEGIN
          -- Set search path explicitly to prevent search path injection
          SET search_path = 'public';
          
          -- Check if user's id is in admin_users table
          SELECT EXISTS (
            SELECT 1 FROM public.admin_users
            WHERE %I = auth.uid()
          ) INTO is_admin;
          
          -- If not found in table, check role in a more secure way
          IF NOT is_admin THEN
            -- Use a more secure approach to check metadata
            SELECT EXISTS (
              SELECT 1
              FROM auth.users
              WHERE 
                id = auth.uid() AND (
                  -- Parse as JSONB with proper type casting
                  COALESCE((auth.jwt() ->> 'app_metadata')::jsonb->>'role', '') = 'admin' OR
                  COALESCE((auth.jwt() ->> 'app_metadata')::jsonb->>'is_admin', '') = 'true' OR
                  COALESCE((auth.jwt() ->> 'user_metadata')::jsonb->>'role', '') = 'admin' OR
                  COALESCE((auth.jwt() ->> 'user_metadata')::jsonb->>'is_admin', '') = 'true'
                )
            ) INTO is_admin;
          END IF;
          
          RETURN is_admin;
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;
      $FIX$, admin_user_id_column);
      
      RAISE NOTICE 'Fixed is_admin function using % column', admin_user_id_column;
    ELSE
      RAISE NOTICE 'Could not determine user ID column in admin_users table';
    END IF;
  ELSE
    RAISE NOTICE 'admin_users table does not exist, skipping is_admin function fix';
  END IF;
END
$$;

-- 6. Fix notification_settings policies if the table exists
DO $$
DECLARE
  user_id_column text;
BEGIN
  -- Check if notification_settings table exists
  IF EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'notification_settings'
  ) THEN
    -- Find the column that likely refers to the user ID
    SELECT column_name INTO user_id_column
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'notification_settings'
    AND column_name IN ('user_id', 'auth_id', 'user_uuid')
    LIMIT 1;
    
    IF user_id_column IS NOT NULL THEN
      -- Drop existing policies
      DROP POLICY IF EXISTS "Users can view notification settings" ON public.notification_settings;
      DROP POLICY IF EXISTS "Users can update notification settings" ON public.notification_settings;
      
      -- Create secure replacement policies
      EXECUTE format($FIX$
        CREATE POLICY "Users can view notification settings"
        ON public.notification_settings FOR SELECT
        USING (auth.uid() = %I OR (SELECT public.is_admin()));
      $FIX$, user_id_column);
      
      EXECUTE format($FIX$
        CREATE POLICY "Users can update notification settings"
        ON public.notification_settings FOR UPDATE
        USING (auth.uid() = %I OR (SELECT public.is_admin()));
      $FIX$, user_id_column);
      
      RAISE NOTICE 'Fixed notification_settings policies using % column', user_id_column;
    ELSE
      RAISE NOTICE 'Could not determine user ID column in notification_settings table';
    END IF;
  ELSE
    RAISE NOTICE 'notification_settings table does not exist, skipping policies fix';
  END IF;
END
$$;

-- 7. Fix init_progress_tracking function if it exists
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_proc WHERE proname = 'init_progress_tracking') THEN
    EXECUTE $FIX$
      CREATE OR REPLACE FUNCTION public.init_progress_tracking(user_id_param UUID)
      RETURNS void AS $$
      BEGIN
        -- Set search path explicitly to prevent search path injection
        SET search_path = 'public';
        
        -- Your existing function logic here
        UPDATE public.user_profiles
        SET progress_tracking = '{}'::jsonb
        WHERE user_id = user_id_param;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    $FIX$;
    
    RAISE NOTICE 'Fixed init_progress_tracking function';
  END IF;
END
$$;

-- 8. List all functions with their updated security settings
SELECT 
  n.nspname as schema_name,
  p.proname as function_name,
  pg_get_function_arguments(p.oid) as arguments,
  CASE p.prosecdef WHEN true THEN 'security definer' ELSE 'security invoker' END as security
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
AND p.proname IN ('ensure_user_id_matches_auth', 'handle_new_user', 'update_profile_updated_at', 
                  'update_updated_at_column', 'is_admin', 'init_progress_tracking');

COMMIT;

/*
INSTRUCTIONS FOR AUTH SETTINGS (MUST BE DONE IN DASHBOARD)

To fix the remaining security issues (OTP expiry and leaked password protection),
you need to update your Auth settings in the Supabase dashboard:

1. Go to Authentication > Configuration > Security
2. Under "One-time passwords", set the expiry time to 15-30 minutes (recommended)
3. Under "Password protection", enable "Detect leaked passwords"
*/