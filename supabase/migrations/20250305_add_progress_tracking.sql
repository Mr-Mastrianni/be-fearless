-- Add progress_tracking column to user_profiles if it doesn't exist
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS progress_tracking JSONB;
