-- Function to create the courage_videos table if it doesn't exist
CREATE OR REPLACE FUNCTION create_courage_videos_table()
RETURNS void AS $$
BEGIN
  -- Check if table exists
  IF NOT EXISTS (
    SELECT FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename = 'courage_videos'
  ) THEN
    -- Create the table
    CREATE TABLE public.courage_videos (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      title TEXT NOT NULL,
      description TEXT,
      url TEXT NOT NULL,
      thumbnail TEXT,
      category TEXT,
      user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
      uploader_name TEXT,
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now()
    );

    -- Add RLS policies
    ALTER TABLE public.courage_videos ENABLE ROW LEVEL SECURITY;
    
    -- Anyone can view videos
    CREATE POLICY "Anyone can view videos"
    ON public.courage_videos
    FOR SELECT
    USING (true);
    
    -- Only authenticated users can insert videos
    CREATE POLICY "Authenticated users can insert videos"
    ON public.courage_videos
    FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');
    
    -- Users can only update their own videos
    CREATE POLICY "Users can update their own videos"
    ON public.courage_videos
    FOR UPDATE
    USING (auth.uid() = user_id);
    
    -- Users can only delete their own videos
    CREATE POLICY "Users can delete their own videos"
    ON public.courage_videos
    FOR DELETE
    USING (auth.uid() = user_id);
    
    -- Set up permissions
    GRANT SELECT ON public.courage_videos TO anon, authenticated, service_role;
    GRANT INSERT, UPDATE, DELETE ON public.courage_videos TO authenticated, service_role;
    GRANT USAGE ON SEQUENCE courage_videos_id_seq TO authenticated, service_role;

    RAISE NOTICE 'Created courage_videos table';
  ELSE
    RAISE NOTICE 'courage_videos table already exists';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;