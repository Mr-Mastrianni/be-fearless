-- Create admin_users table if it doesn't exist
CREATE TABLE IF NOT EXISTS admin_users (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create system_settings table if it doesn't exist
CREATE TABLE IF NOT EXISTS system_settings (
  id SERIAL PRIMARY KEY,
  app_name TEXT DEFAULT 'Courage Bot Adventure',
  support_email TEXT DEFAULT 'support@couragebot.com',
  maintenance_mode BOOLEAN DEFAULT FALSE,
  allow_new_registrations BOOLEAN DEFAULT TRUE,
  max_upload_size_mb INTEGER DEFAULT 5,
  default_user_experience_level TEXT DEFAULT 'beginner',
  last_backup_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create notification_settings table if it doesn't exist
CREATE TABLE IF NOT EXISTS notification_settings (
  id SERIAL PRIMARY KEY,
  enable_email_notifications BOOLEAN DEFAULT TRUE,
  enable_push_notifications BOOLEAN DEFAULT TRUE,
  enable_in_app_notifications BOOLEAN DEFAULT TRUE,
  weekly_digest_enabled BOOLEAN DEFAULT TRUE,
  admin_alert_emails TEXT[] DEFAULT ARRAY['admin@couragebot.com'],
  email_from_name TEXT DEFAULT 'Courage Bot',
  email_subject_prefix TEXT DEFAULT '[Courage Bot]',
  email_footer_text TEXT DEFAULT '© Courage Bot Adventure. All rights reserved.',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create auth_users_view if it doesn't exist (dropping first if it exists)
DROP VIEW IF EXISTS auth_users_view;
CREATE OR REPLACE VIEW auth_users_view AS
SELECT
  id,
  email,
  raw_user_meta_data->>'full_name' as full_name,
  raw_user_meta_data->>'is_admin' as is_admin,
  last_sign_in_at,
  created_at,
  updated_at
FROM auth.users;

-- Insert default system settings if not exists
INSERT INTO system_settings (id, app_name, support_email)
VALUES (1, 'Courage Bot Adventure', 'support@couragebot.com')
ON CONFLICT (id) DO NOTHING;

-- Insert default notification settings if not exists
INSERT INTO notification_settings (id)
VALUES (1)
ON CONFLICT (id) DO NOTHING;

-- Add Row Level Security (RLS) policies
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid errors
DROP POLICY IF EXISTS admin_users_select ON admin_users;
DROP POLICY IF EXISTS admin_users_insert ON admin_users;
DROP POLICY IF EXISTS admin_users_update ON admin_users;
DROP POLICY IF EXISTS admin_users_delete ON admin_users;
DROP POLICY IF EXISTS system_settings_select ON system_settings;
DROP POLICY IF EXISTS system_settings_insert ON system_settings;
DROP POLICY IF EXISTS system_settings_update ON system_settings;
DROP POLICY IF EXISTS notification_settings_select ON notification_settings;
DROP POLICY IF EXISTS notification_settings_insert ON notification_settings;
DROP POLICY IF EXISTS notification_settings_update ON notification_settings;

-- Admin users table policies
CREATE POLICY admin_users_select ON admin_users
  FOR SELECT USING (
    auth.uid() IN (SELECT user_id FROM admin_users) OR 
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'is_admin' = 'true'
  );

CREATE POLICY admin_users_insert ON admin_users
  FOR INSERT WITH CHECK (
    auth.uid() IN (SELECT user_id FROM admin_users) OR 
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'is_admin' = 'true'
  );

CREATE POLICY admin_users_update ON admin_users
  FOR UPDATE USING (
    auth.uid() IN (SELECT user_id FROM admin_users) OR 
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'is_admin' = 'true'
  );

CREATE POLICY admin_users_delete ON admin_users
  FOR DELETE USING (
    auth.uid() IN (SELECT user_id FROM admin_users) OR 
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'is_admin' = 'true'
  );

-- System settings table policies
CREATE POLICY system_settings_select ON system_settings FOR SELECT USING (true);

CREATE POLICY system_settings_insert ON system_settings
  FOR INSERT WITH CHECK (
    auth.uid() IN (SELECT user_id FROM admin_users) OR 
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'is_admin' = 'true'
  );

CREATE POLICY system_settings_update ON system_settings
  FOR UPDATE USING (
    auth.uid() IN (SELECT user_id FROM admin_users) OR 
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'is_admin' = 'true'
  );

-- Notification settings table policies
CREATE POLICY notification_settings_select ON notification_settings FOR SELECT USING (true);

CREATE POLICY notification_settings_insert ON notification_settings
  FOR INSERT WITH CHECK (
    auth.uid() IN (SELECT user_id FROM admin_users) OR 
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'is_admin' = 'true'
  );

CREATE POLICY notification_settings_update ON notification_settings
  FOR UPDATE USING (
    auth.uid() IN (SELECT user_id FROM admin_users) OR 
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'is_admin' = 'true'
  );
