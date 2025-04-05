-- SQL script to add phone_number column to user_profiles table if it doesn't exist

BEGIN;

-- Check if the column already exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'user_profiles' 
        AND column_name = 'phone_number'
    ) THEN
        -- Add the phone_number column
        ALTER TABLE public.user_profiles
        ADD COLUMN phone_number TEXT;
        
        RAISE NOTICE 'Added phone_number column to user_profiles table';
    ELSE
        RAISE NOTICE 'phone_number column already exists in user_profiles table';
    END IF;
END $$;

-- Verify the column exists
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'user_profiles'
AND column_name = 'phone_number';

COMMIT;