-- Create fear_assessments table
CREATE TABLE IF NOT EXISTS public.fear_assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    results JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Set up RLS policies
ALTER TABLE public.fear_assessments ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to only see and edit their own assessment results
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

-- Add this table to public schema for access
GRANT ALL ON public.fear_assessments TO authenticated;
GRANT ALL ON public.fear_assessments TO service_role;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS fear_assessments_user_id_idx ON public.fear_assessments(user_id);
CREATE INDEX IF NOT EXISTS fear_assessments_timestamp_idx ON public.fear_assessments(timestamp);

-- Add trigger for updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_fear_assessments_updated_at
BEFORE UPDATE ON public.fear_assessments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Make sure user_profiles has key_fears and last_assessment columns
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS key_fears TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS last_assessment TIMESTAMPTZ;
