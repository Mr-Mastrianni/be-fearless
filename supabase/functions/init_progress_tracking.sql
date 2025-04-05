-- Function to initialize progress_tracking column and ensure fear_assessments table has correct structure
CREATE OR REPLACE FUNCTION public.init_progress_tracking(user_id_param UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if progress_tracking column exists in user_profiles
  BEGIN
    PERFORM progress_tracking FROM user_profiles LIMIT 1;
  EXCEPTION
    WHEN undefined_column THEN
      -- Column doesn't exist, so create it
      ALTER TABLE public.user_profiles ADD COLUMN progress_tracking JSONB;
  END;
  
  -- Ensure fear_assessments table exists and has the right columns
  BEGIN
    -- Check if the table exists first
    IF NOT EXISTS (
      SELECT FROM pg_tables 
      WHERE schemaname = 'public' AND tablename = 'fear_assessments'
    ) THEN
      -- Create the fear_assessments table if it doesn't exist
      CREATE TABLE public.fear_assessments (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
        timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        results JSONB NOT NULL,
        activity_id UUID NULL,  -- Add optional activity_id column
        fear_category TEXT NULL, -- Add optional fear_category column
        fear_level_before INTEGER NULL, -- Add optional fear_level_before column
        fear_level_after INTEGER NULL, -- Add optional fear_level_after column
        activity_name TEXT NULL, -- Add optional activity_name column
        notes TEXT NULL, -- Add optional notes column
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      -- Set up RLS policies
      ALTER TABLE public.fear_assessments ENABLE ROW LEVEL SECURITY;

      -- Create policies for the table
      CREATE POLICY "Users can view their own assessment results"
      ON public.fear_assessments
      FOR SELECT
      USING (auth.uid() = user_id);

      CREATE POLICY "Users can insert their own assessment results"
      ON public.fear_assessments
      FOR INSERT
      WITH CHECK (auth.uid() = user_id);

      -- Grant permissions
      GRANT ALL ON public.fear_assessments TO authenticated;
      GRANT ALL ON public.fear_assessments TO service_role;
    ELSE
      -- Table exists, check for and add any missing columns
      BEGIN
        ALTER TABLE public.fear_assessments
          ADD COLUMN IF NOT EXISTS activity_id UUID NULL,
          ADD COLUMN IF NOT EXISTS fear_category TEXT NULL,
          ADD COLUMN IF NOT EXISTS fear_level_before INTEGER NULL,
          ADD COLUMN IF NOT EXISTS fear_level_after INTEGER NULL,
          ADD COLUMN IF NOT EXISTS activity_name TEXT NULL,
          ADD COLUMN IF NOT EXISTS notes TEXT NULL;
      EXCEPTION
        WHEN others THEN
          -- Log the error but continue
          RAISE NOTICE 'Error updating fear_assessments table: %', SQLERRM;
      END;
    END IF;
  EXCEPTION
    WHEN others THEN
      -- Log the error but continue
      RAISE NOTICE 'Error checking fear_assessments table: %', SQLERRM;
  END;
  
  -- Initialize progress_tracking for the specified user
  UPDATE public.user_profiles
  SET progress_tracking = jsonb_build_object(
    'activities', jsonb_build_array(),
    'milestones', jsonb_build_array(),
    'stats', jsonb_build_object(
      'activitiesCompleted', 0,
      'activitiesInProgress', 0,
      'activitiesPlanned', 0
    )
  )
  WHERE user_id = user_id_param AND (progress_tracking IS NULL);
END;
$$;
