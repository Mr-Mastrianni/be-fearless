-- This SQL will create a function to automatically create user_profiles when users sign up
-- Run this in your Supabase SQL Editor (https://bzryrvfjfzchzbmxzdyi.supabase.co/project/sql)

BEGIN;

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
DECLARE
  name_value TEXT;
BEGIN
  -- Try to get the user's name from metadata
  name_value := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    'New User'
  );
  
  -- Create a basic profile for the new user
  INSERT INTO public.user_profiles (
    user_id, 
    full_name,
    profile_completed,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id, 
    name_value,
    FALSE,
    NOW(),
    NOW()
  )
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger to call handle_new_user when a user is created
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create an entry for existing users who don't have a profile yet
INSERT INTO public.user_profiles (
  user_id, 
  full_name,
  profile_completed,
  created_at,
  updated_at
)
SELECT 
  id, 
  COALESCE(raw_user_meta_data->>'full_name', raw_user_meta_data->>'name', 'User ' || id),
  FALSE,
  NOW(),
  NOW()
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_profiles p WHERE p.user_id = u.id
);

-- Check if entries were created
SELECT COUNT(*) as profile_count FROM public.user_profiles;

COMMIT;
