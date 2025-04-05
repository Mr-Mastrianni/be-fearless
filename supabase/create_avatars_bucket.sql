-- This SQL script creates an 'avatars' storage bucket with appropriate permissions
-- Run this in your Supabase SQL Editor (https://bzryrvfjfzchzbmxzdyi.supabase.co/project/sql)

BEGIN;

-- Check if 'avatars' bucket exists
DO $$
DECLARE
  bucket_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM storage.buckets WHERE name = 'avatars'
  ) INTO bucket_exists;
  
  IF NOT bucket_exists THEN
    -- Create the 'avatars' bucket if it doesn't exist
    INSERT INTO storage.buckets (id, name, public, avif_autodetection, file_size_limit, allowed_mime_types)
    VALUES ('avatars', 'avatars', TRUE, FALSE, 5242880, ARRAY['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'image/svg+xml']::text[]);
    
    RAISE NOTICE 'Created avatars bucket';
  ELSE
    RAISE NOTICE 'Avatars bucket already exists';
  END IF;
END $$;

-- Create storage policies using proper RLS instead of direct table manipulation

-- Create policy for public read access
DROP POLICY IF EXISTS "Public can view avatars" ON storage.objects;
CREATE POLICY "Public can view avatars"
ON storage.objects
FOR SELECT
USING (bucket_id = 'avatars');

-- Create policy for authenticated users to upload
DROP POLICY IF EXISTS "Authenticated users can upload avatars" ON storage.objects;
CREATE POLICY "Authenticated users can upload avatars"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars');

-- Create policy for avatar owners to update their files
DROP POLICY IF EXISTS "Users can update their own avatars" ON storage.objects;
CREATE POLICY "Users can update their own avatars"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'avatars' AND (auth.uid() = owner OR owner IS NULL));

-- Create policy for avatar owners to delete their files
DROP POLICY IF EXISTS "Users can delete their own avatars" ON storage.objects;
CREATE POLICY "Users can delete their own avatars"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'avatars' AND (auth.uid() = owner OR owner IS NULL));

-- Verify that the bucket exists
SELECT
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
FROM
  storage.buckets
WHERE
  id = 'avatars';

COMMIT;
