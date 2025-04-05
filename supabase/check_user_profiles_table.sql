-- This SQL query will check the schema of the user_profiles table

-- Check if the user_profiles table exists
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE  table_schema = 'public'
   AND    table_name   = 'user_profiles'
);

-- Get column information for the user_profiles table
SELECT 
  column_name, 
  data_type, 
  is_nullable 
FROM 
  information_schema.columns 
WHERE 
  table_schema = 'public' 
  AND table_name = 'user_profiles'
ORDER BY 
  ordinal_position;

-- Check constraints on the table
SELECT 
  conname AS constraint_name,
  pg_get_constraintdef(c.oid) AS constraint_definition
FROM 
  pg_constraint c
  JOIN pg_namespace n ON n.oid = c.connamespace
  JOIN pg_class cl ON cl.oid = c.conrelid
WHERE 
  n.nspname = 'public'
  AND cl.relname = 'user_profiles';

-- Check if RLS is enabled on the table
SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'user_profiles';

-- List all RLS policies on the table
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM
  pg_policies
WHERE
  tablename = 'user_profiles';
