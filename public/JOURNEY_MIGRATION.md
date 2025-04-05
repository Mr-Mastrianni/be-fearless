# User Journey Database Migration

This guide will help you apply the necessary database schema changes to support the "Add to My Journey" feature in the Be Courageous app.

## Progress Tracking Migration

We need to add a `progress_tracking` column to the `user_profiles` table to store user journey information.

### Schema Changes Required

The following SQL statement needs to be executed in your Supabase database:

```sql
-- Add progress_tracking column if it doesn't exist
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS progress_tracking JSONB;
```

## How to Apply These Changes

### Option 1: Using Supabase Dashboard (Recommended)

1. Log in to your [Supabase dashboard](https://app.supabase.io)
2. Select your project
3. Navigate to the SQL Editor in the left sidebar
4. Click "New Query"
5. Copy and paste the SQL statement above
6. Click "Run" to execute the query

### Option 2: Using Supabase CLI

If you have the Supabase CLI installed and configured:

```bash
# Navigate to your project directory
cd your-project-directory

# Create a migration file
echo "ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS progress_tracking JSONB;" > journey_migration.sql

# Apply the migration
supabase db execute --file journey_migration.sql
```

## Verifying the Changes

After applying the changes, you can verify they were successful by:

1. Going to the Supabase dashboard
2. Selecting "Table Editor" from the left sidebar
3. Selecting the "user_profiles" table
4. Checking that the "progress_tracking" column exists

## Data Structure

The `progress_tracking` column will store a JSON object with the following structure:

```json
{
  "activities": [
    {
      "id": "activity_id",
      "title": "Activity Title",
      "imageUrl": "https://example.com/image.jpg",
      "fearCategories": ["heights", "water"],
      "difficultyLevel": "beginner",
      "added_at": "2023-03-05T14:48:07-05:00",
      "status": "planned" // planned, in_progress, completed
    }
  ],
  "milestones": [],
  "stats": {
    "activitiesCompleted": 0,
    "activitiesInProgress": 0,
    "activitiesPlanned": 0
  }
}
```

## Troubleshooting

### Common Errors

#### Column "progress_tracking" already exists

This means you've already added the column. No action is needed.

### Need Help?

If you encounter any issues with the migration, please:

1. Check the browser console for specific error messages
2. Ensure you have the necessary permissions to modify the database
3. Contact our support team for assistance

## After Migration

Once the migration is complete, you should be able to:

1. Add activities to your journey from the activity details view
2. View your journey activities on the dashboard (future feature)
3. Track your progress through various courage-building activities

Thank you for updating your database schema!
