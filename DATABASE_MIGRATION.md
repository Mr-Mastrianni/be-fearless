# Database Migration: Age Range to Date of Birth

This document outlines the database schema changes required to update the user profile from using an age range to a specific date of birth.

## Schema Changes

The following SQL statements need to be executed in your Supabase database:

```sql
-- Add the new date_of_birth column
ALTER TABLE user_profiles ADD COLUMN date_of_birth DATE;

-- Remove the old age_range column
ALTER TABLE user_profiles DROP COLUMN age_range;
```

## How to Apply Changes

### Option 1: Using Supabase Dashboard

1. Log in to your Supabase dashboard
2. Navigate to the SQL Editor
3. Create a new query
4. Copy and paste the SQL statements above
5. Run the query

### Option 2: Using Supabase CLI

If you have the Supabase CLI installed:

```bash
supabase db execute --file update_schema.sql
```

## Code Changes

The following code changes have been made to support this migration:

1. Updated `AuthContext.tsx` to use `date_of_birth` instead of `age_range` in the `ProfileData` interface
2. Modified the `Onboarding.tsx` component to use a date picker input instead of an age range dropdown
3. Updated profile completion tracking to check for `date_of_birth` instead of `age_range`

## Data Migration Considerations

Since we're moving from categorical data (age ranges) to a specific date, there's no direct mapping for existing users. Consider the following approaches:

1. Leave `date_of_birth` as null for existing users and prompt them to update their profile
2. For analytics purposes, you might want to create a function that derives age ranges from date of birth when needed

## Testing

After applying these changes, test the following:

1. New user registration and onboarding flow
2. Existing user profile editing
3. Any features that previously relied on age range data
