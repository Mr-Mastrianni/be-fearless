-- Simpler fix script focusing on mutable search path issues
-- Run each statement separately if you encounter errors

-- 1. Fix the is_admin function
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
    WHERE user_id = auth.uid()
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
          COALESCE((auth.jwt() ->> 'user_metadata')::jsonb->>'role', '') = 'admin' OR
          COALESCE((auth.jwt() ->> 'user_metadata')::jsonb->>'is_admin', '') = 'true'
        )
    ) INTO is_admin;
  END IF;
  
  RETURN is_admin;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Fix ensure_user_id_matches_auth function if it exists
-- If you get an error on this, just skip to the next statement
CREATE OR REPLACE FUNCTION public.ensure_user_id_matches_auth()
RETURNS TRIGGER AS $$
BEGIN
  -- Set search path explicitly to prevent search path injection
  SET search_path = 'public';
  
  IF NEW.user_id <> auth.uid() THEN
    RAISE EXCEPTION 'User ID does not match authenticated user';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Fix handle_new_user function if it exists
-- If you get an error on this, just skip to the next statement
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Set search path explicitly to prevent search path injection
  SET search_path = 'public';
  
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

-- 4. Fix update_profile_updated_at function if it exists
-- If you get an error on this, just skip to the next statement
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

-- 5. Fix update_updated_at_column function if it exists
-- If you get an error on this, just skip to the next statement
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

-- 6. Fix init_progress_tracking function if it exists
-- If you get an error on this, just skip to the next statement
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

-- 7. Create a more secure policy for notification_settings if needed
-- If you get an error on this, just skip it
DROP POLICY IF EXISTS "Users can view notification settings" ON public.notification_settings;
CREATE POLICY "Users can view notification settings"
ON public.notification_settings FOR SELECT
USING ((auth.uid() = user_id) OR (SELECT public.is_admin()));

DROP POLICY IF EXISTS "Users can update notification settings" ON public.notification_settings;
CREATE POLICY "Users can update notification settings"
ON public.notification_settings FOR UPDATE
USING ((auth.uid() = user_id) OR (SELECT public.is_admin()));

-- 8. Display the functions we've modified
SELECT 
  routine_schema, 
  routine_name, 
  routine_type,
  external_security
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('is_admin', 'ensure_user_id_matches_auth', 'handle_new_user', 
                   'update_profile_updated_at', 'update_updated_at_column', 'init_progress_tracking');