-- This SQL will create or update the user_profiles table in Supabase with ALL required columns
-- Run this in your Supabase SQL Editor (https://bzryrvfjfzchzbmxzdyi.supabase.co/project/sql)

BEGIN;

-- Drop the table if it exists to ensure a clean slate with the correct structure
DROP TABLE IF EXISTS public.user_profiles;

-- Create the user_profiles table with ALL required columns
CREATE TABLE public.user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  age_range TEXT,
  key_fears TEXT[],
  experience_level TEXT,
  challenge_intensity TEXT,
  notification_preferences JSONB DEFAULT '{}',
  learning_style TEXT,
  bio TEXT,
  location TEXT,
  phone_number TEXT,
  profile_completed BOOLEAN DEFAULT FALSE,
  dashboard_layout JSONB DEFAULT '{}',
  experience_preferences JSONB DEFAULT '{}',
  theme_preferences JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security on the table
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.user_profiles;

-- Create policies for secure access
-- Policy for viewing profiles (users can only view their own)
CREATE POLICY "Users can view their own profile"
  ON public.user_profiles
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy for updating profiles (users can only update their own)
CREATE POLICY "Users can update their own profile"
  ON public.user_profiles
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy for inserting profiles (users can only insert for themselves)
CREATE POLICY "Users can insert their own profile"
  ON public.user_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_profile_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON public.user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_profile_updated_at();

-- Grant necessary privileges
GRANT SELECT, INSERT, UPDATE ON public.user_profiles TO authenticated;

-- Check if table was created successfully
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public'
  AND table_name = 'user_profiles'
);

-- Verify columns exist
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'user_profiles' 
ORDER BY ordinal_position;

COMMIT;
