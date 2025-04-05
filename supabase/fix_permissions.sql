-- This SQL will fix permissions issues with the user_profiles table
-- Run this in your Supabase SQL Editor (https://bzryrvfjfzchzbmxzdyi.supabase.co/project/sql)

-- 1. Make sure public schema is accessible
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

-- 2. Make sure the user_profiles table is accessible
GRANT ALL ON TABLE public.user_profiles TO authenticated;
GRANT SELECT ON TABLE public.user_profiles TO anon;

-- 3. Check for RLS (Row Level Security) and make sure it's enabled
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- 4. Drop all existing RLS policies for user_profiles to start fresh
DROP POLICY IF EXISTS "Users can view their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.user_profiles;

-- 5. Create policy for SELECT - allows users to view only their own profile
CREATE POLICY "Users can view their own profile"
ON public.user_profiles FOR SELECT
USING (auth.uid() = user_id);

-- 6. Create policy for UPDATE - allows users to update only their own profile
CREATE POLICY "Users can update their own profile"
ON public.user_profiles FOR UPDATE
USING (auth.uid() = user_id);

-- 7. Create policy for INSERT - allows users to create their own profile 
CREATE POLICY "Users can insert their own profile"
ON public.user_profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 8. Create function to ensure the user_id matches the authenticated user on insert/update
CREATE OR REPLACE FUNCTION public.ensure_user_id_matches_auth()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.user_id <> auth.uid() THEN
    RAISE EXCEPTION 'User ID does not match authenticated user';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Create trigger to enforce this check
DROP TRIGGER IF EXISTS ensure_user_id_matches_auth_trigger ON public.user_profiles;
CREATE TRIGGER ensure_user_id_matches_auth_trigger
BEFORE INSERT OR UPDATE ON public.user_profiles
FOR EACH ROW
EXECUTE FUNCTION public.ensure_user_id_matches_auth();

-- 10. List all policies to verify
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
  tablename = 'user_profiles';
