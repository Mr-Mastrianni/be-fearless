-- Function to create the activities table if it doesn't exist
-- Designed to be called via supabase.rpc('create_activities_table') from the frontend
-- Called by BasicActivityLogger when inserting fails because the table doesn't exist

CREATE OR REPLACE FUNCTION create_activities_table()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if the activities table already exists
  IF NOT EXISTS (
    SELECT FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'activities'
  ) THEN
    -- Create the activities table with appropriate columns
    CREATE TABLE public.activities (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      difficulty_level TEXT NOT NULL,
      notes TEXT,
      completed_at TIMESTAMPTZ NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    -- Add appropriate indexes
    CREATE INDEX activities_user_id_idx ON public.activities(user_id);
    CREATE INDEX activities_category_idx ON public.activities(category);
    
    -- Set up Row Level Security (RLS) policies
    -- Enable RLS
    ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
    
    -- Create policy to allow users to see only their own activities
    CREATE POLICY "Users can view their own activities" 
    ON public.activities FOR SELECT 
    USING (auth.uid() = user_id);
    
    -- Create policy to allow users to insert their own activities
    CREATE POLICY "Users can insert their own activities" 
    ON public.activities FOR INSERT 
    WITH CHECK (auth.uid() = user_id);
    
    -- Create policy to allow users to update their own activities
    CREATE POLICY "Users can update their own activities" 
    ON public.activities FOR UPDATE 
    USING (auth.uid() = user_id);
    
    -- Create policy to allow users to delete their own activities
    CREATE POLICY "Users can delete their own activities" 
    ON public.activities FOR DELETE 
    USING (auth.uid() = user_id);
    
    -- Grant access to authenticated users
    GRANT SELECT, INSERT, UPDATE, DELETE ON public.activities TO authenticated;
    
    RETURN true;
  ELSE
    -- Table already exists, do nothing
    RETURN false;
  END IF;
END;
$$;