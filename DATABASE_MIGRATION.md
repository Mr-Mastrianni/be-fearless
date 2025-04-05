# Database Migration Guide

This guide will help you apply the necessary database schema changes to support the latest features of the Be Courageous app.

## Date of Birth Migration

We've updated the app to capture a specific date of birth instead of an age range. This provides more precise data for personalization while still allowing us to derive age ranges when needed.

### Schema Changes Required

The following SQL statements need to be executed in your Supabase database:

```sql
-- Add the new date_of_birth column
ALTER TABLE user_profiles ADD COLUMN date_of_birth DATE;

-- Remove the old age_range column
ALTER TABLE user_profiles DROP COLUMN age_range;
```

## How to Apply These Changes

### Option 1: Using Supabase Dashboard (Recommended)

1. Log in to your [Supabase dashboard](https://app.supabase.io)
2. Select your project
3. Navigate to the SQL Editor in the left sidebar
4. Click "New Query"
5. Copy and paste the SQL statements above
6. Click "Run" to execute the query

![Supabase SQL Editor](https://i.imgur.com/example-image.png)

### Option 2: Using Supabase CLI

If you have the Supabase CLI installed and configured:

```bash
# Navigate to your project directory
cd your-project-directory

# Create a migration file
echo "ALTER TABLE user_profiles ADD COLUMN date_of_birth DATE;
ALTER TABLE user_profiles DROP COLUMN age_range;" > migration.sql

# Apply the migration
supabase db execute --file migration.sql
```

## Verifying the Changes

After applying the changes, you can verify they were successful by:

1. Going to the Supabase dashboard
2. Selecting "Table Editor" from the left sidebar
3. Selecting the "user_profiles" table
4. Checking that the "date_of_birth" column exists and "age_range" column is gone

## Troubleshooting

### Common Errors

#### Column "date_of_birth" already exists

This means you've already added the column. You can skip this part of the migration.

```sql
-- Just run this part
ALTER TABLE user_profiles DROP COLUMN age_range;
```

#### Column "age_range" does not exist

This means you've already removed the column. You can skip this part of the migration.

```sql
-- Just run this part
ALTER TABLE user_profiles ADD COLUMN date_of_birth DATE;
```

### Need Help?

If you encounter any issues with the migration, please:

1. Check the browser console for specific error messages
2. Ensure you have the necessary permissions to modify the database
3. Contact our support team for assistance

## After Migration

Once the migration is complete, you should be able to:

1. Complete the onboarding process
2. View and edit your date of birth in your profile
3. Use all features of the Be Courageous app

Thank you for updating your database schema!
