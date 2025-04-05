-- Comprehensive SQL to fix all security issues identified in Supabase Security Advisor
-- Run this in your Supabase SQL Editor

BEGIN;

-- =================================================================
-- 1. FIX RLS REFERENCES TO USER METADATA
-- =================================================================

-- The Security Advisor identified insecure references to user_metadata in RLS policies
-- This primarily affects the notification_settings table

-- First, fix the is_admin function to use more secure approaches for metadata
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
  -- Instead of directly accessing user_metadata as JSON, use auth.jwt() function
  IF NOT is_admin THEN
    -- Use a more secure approach to check metadata
    SELECT EXISTS (
      SELECT 1
      FROM auth.users
      WHERE 
        id = auth.uid() AND (
          -- Parse as JSONB with proper type casting
          COALESCE((auth.jwt() ->> 'app_metadata')::jsonb->>'role', '') = 'admin' OR
          COALESCE((auth.jwt() ->> 'app_metadata')::jsonb->>'is_admin', '') = 'true'
        )
    ) INTO is_admin;
  END IF;
  
  RETURN is_admin;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix all policies that reference user_metadata directly in notification_settings
-- Drop existing policies
DROP POLICY IF EXISTS "Users can view notification settings" ON public.notification_settings;
DROP POLICY IF EXISTS "Users can update notification settings" ON public.notification_settings;

-- Create secure replacement policies
CREATE POLICY "Users can view notification settings"
ON public.notification_settings FOR SELECT
USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can update notification settings"
ON public.notification_settings FOR UPDATE
USING (auth.uid() = user_id OR public.is_admin());

-- =================================================================
-- 2. FIX FUNCTION SEARCH PATH MUTABLE ISSUES
-- =================================================================

-- Fix for ensure_user_id_matches_auth function
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

-- Fix for handle_new_user function
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

-- Fix for update_profile_updated_at function
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

-- Fix for update_updated_at_column function
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

-- =================================================================
-- 3. FIX SEARCH PATH IN OTHER FUNCTIONS
-- =================================================================

-- Fix for init_progress_tracking function
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

-- =================================================================
-- 4. VERIFY OUR FIXES
-- =================================================================

-- List all functions to verify fixes
SELECT 
  n.nspname as schema_name,
  p.proname as function_name,
  pg_get_function_arguments(p.oid) as arguments,
  CASE p.prosecdef WHEN true THEN 'security definer' ELSE 'security invoker' END as security
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public';

-- List all policies to verify fixes
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM
  pg_policies
WHERE
  schemaname = 'public';

COMMIT;

-- =================================================================
-- 5. INSTRUCTIONS FOR AUTH SETTINGS (MUST BE DONE IN DASHBOARD)
-- =================================================================

/*
To fix the remaining security issues (OTP expiry and leaked password protection),
you need to update your Auth settings in the Supabase dashboard:

1. Go to Authentication > Configuration > Security
2. Under "One-time passwords", set the expiry time to 15-30 minutes (recommended)
3. Under "Password protection", enable "Detect leaked passwords"

These changes cannot be made through SQL and must be done through the dashboard.
*/