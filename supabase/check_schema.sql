-- Diagnostic script to check table schemas before applying fixes

-- Check if notification_settings table exists and its columns
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'notification_settings'
) as notification_settings_exists;

-- Check columns of notification_settings if it exists
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'notification_settings';

-- Check admin_users table structure
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'admin_users'
) as admin_users_exists;

-- Check columns of admin_users if it exists
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'admin_users';

-- Check if is_admin function exists
SELECT EXISTS (
  SELECT FROM pg_proc 
  WHERE proname = 'is_admin'
) as is_admin_function_exists;

-- Check user_profiles table to see what columns it has for user reference
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'user_profiles'
AND column_name LIKE '%user%';

-- Check policies on notification_settings
SELECT tablename, policyname, cmd 
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'notification_settings';