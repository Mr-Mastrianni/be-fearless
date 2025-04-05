-- SQL to add admin bypass policies to all relevant tables
-- This allows admin users to view all user data

BEGIN;

-- Create or ensure admin_users table exists
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Helper function to check if current user is an admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
DECLARE
  is_admin BOOLEAN;
BEGIN
  -- Check if user's id is in admin_users table
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE user_id = auth.uid()
  ) INTO is_admin;
  
  -- Also check user_metadata for admin role (if not found in table)
  IF NOT is_admin THEN
    is_admin := (
      SELECT COUNT(*) > 0
      FROM auth.users
      WHERE 
        id = auth.uid() AND (
          (auth.jwt() ->> 'user_metadata')::jsonb ->> 'is_admin' = 'true' OR
          (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'admin'
        )
    );
  END IF;
  
  RETURN is_admin;
END;
$$ LANGUAGE plpgsql;

-- Add RLS policies to all relevant tables to allow admin access

-- 1. user_profiles table
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.user_profiles;
CREATE POLICY "Admins can view all profiles"
  ON public.user_profiles
  FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can update all profiles" ON public.user_profiles;
CREATE POLICY "Admins can update all profiles"
  ON public.user_profiles
  FOR UPDATE
  USING (public.is_admin());

-- 2. fear_assessments table
DROP POLICY IF EXISTS "Admins can view all assessment results" ON public.fear_assessments;
CREATE POLICY "Admins can view all assessment results"
  ON public.fear_assessments
  FOR SELECT
  USING (public.is_admin());

-- 3. auth.users view for admins
CREATE OR REPLACE VIEW public.auth_users_view AS
SELECT
  id,
  email,
  phone,
  created_at,
  last_sign_in_at,
  user_metadata
FROM auth.users
WHERE public.is_admin() = TRUE;

-- Verify the function works
SELECT public.is_admin();

-- Verify the policies were created
SELECT tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE schemaname = 'public' AND policyname LIKE '%admin%';

COMMIT;