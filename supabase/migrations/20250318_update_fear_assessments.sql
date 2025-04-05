-- Update fear_assessments table structure to support activity logging
BEGIN;

-- First check if the table exists, if not create it
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT FROM pg_tables 
        WHERE schemaname = 'public' AND tablename = 'fear_assessments'
    ) THEN
        -- Create the table
        CREATE TABLE public.fear_assessments (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
            timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            results JSONB NOT NULL,
            activity_id UUID NULL,
            fear_category TEXT NULL,
            fear_level_before INTEGER NULL,
            fear_level_after INTEGER NULL,
            activity_name TEXT NULL,
            notes TEXT NULL,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );

        -- Set up RLS
        ALTER TABLE public.fear_assessments ENABLE ROW LEVEL SECURITY;

        -- Create policies
        CREATE POLICY "Users can view their own assessment results"
        ON public.fear_assessments
        FOR SELECT
        USING (auth.uid() = user_id);

        CREATE POLICY "Users can insert their own assessment results"
        ON public.fear_assessments
        FOR INSERT
        WITH CHECK (auth.uid() = user_id);

        CREATE POLICY "Users can update their own assessment results"
        ON public.fear_assessments
        FOR UPDATE
        USING (auth.uid() = user_id);

        -- Grant permissions
        GRANT ALL ON public.fear_assessments TO authenticated;
        GRANT ALL ON public.fear_assessments TO service_role;

        -- Create indexes
        CREATE INDEX IF NOT EXISTS fear_assessments_user_id_idx ON public.fear_assessments(user_id);
        CREATE INDEX IF NOT EXISTS fear_assessments_timestamp_idx ON public.fear_assessments(timestamp);

    ELSE
        -- Table exists, add any missing columns
        ALTER TABLE public.fear_assessments
        ADD COLUMN IF NOT EXISTS activity_id UUID NULL,
        ADD COLUMN IF NOT EXISTS fear_category TEXT NULL,
        ADD COLUMN IF NOT EXISTS fear_level_before INTEGER NULL,
        ADD COLUMN IF NOT EXISTS fear_level_after INTEGER NULL,
        ADD COLUMN IF NOT EXISTS activity_name TEXT NULL,
        ADD COLUMN IF NOT EXISTS notes TEXT NULL;
    END IF;
END $$;

-- Create or replace the update_updated_at trigger if it doesn't exist
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop the trigger if it exists
DROP TRIGGER IF EXISTS update_fear_assessments_updated_at ON public.fear_assessments;

-- Create the trigger
CREATE TRIGGER update_fear_assessments_updated_at
BEFORE UPDATE ON public.fear_assessments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

COMMIT;