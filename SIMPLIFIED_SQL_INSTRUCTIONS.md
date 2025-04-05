# Simplified SQL Fix Instructions

I've created a much simpler SQL script to fix the security issues. This script avoids complex SQL blocks that might cause syntax errors.

## Instructions

1. Open your Supabase dashboard at https://app.supabase.io/
2. Navigate to the SQL Editor (click SQL in the left sidebar)
3. Create a new query
4. Copy the contents of `supabase/fix_security_issues_v3.sql`
5. **IMPORTANT: Run each statement SEPARATELY instead of all at once**

## How to Run Statements Separately

1. Select just the CREATE OR REPLACE FUNCTION block for the first function (is_admin)
2. Run just that selection
3. Continue with each function one at a time

For example, first run just this block:

```sql
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
DECLARE
  is_admin BOOLEAN;
BEGIN
  -- Set search path explicitly to prevent search path injection
  SET search_path = 'public';
  
  -- Check if user's id is in admin_users table
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE user_id = auth.uid()
  ) INTO is_admin;
  
  -- If not found in table, check role in a more secure way
  IF NOT is_admin THEN
    -- Use a more secure approach to check metadata
    SELECT EXISTS (
      SELECT 1
      FROM auth.users
      WHERE 
        id = auth.uid() AND (
          -- Parse as JSONB with proper type casting
          COALESCE((auth.jwt() ->> 'user_metadata')::jsonb->>'role', '') = 'admin' OR
          COALESCE((auth.jwt() ->> 'user_metadata')::jsonb->>'is_admin', '') = 'true'
        )
    ) INTO is_admin;
  END IF;
  
  RETURN is_admin;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

Then run the next function, and so on.

## Important Notes

- **It's normal for some statements to fail** if the functions or tables don't exist in your database. Simply skip to the next statement if that happens.
- The most important functions to fix are the ones mentioned in your Security Advisor warnings (the ones with "Function Search Path Mutable" warnings).
- If you get column not found errors, it means your table structure is slightly different. You may need to adjust the column names in the script.

## After Running the SQL Fixes

Don't forget to update your Auth settings in the Supabase dashboard:

1. Go to Authentication > Configuration > Security
2. Under "One-time passwords", set the expiry time to 15-30 minutes
3. Under "Password protection", enable "Detect leaked passwords"