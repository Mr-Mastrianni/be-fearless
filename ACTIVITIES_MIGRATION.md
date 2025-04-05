# Migrating Activities from progress_tracking to activities Table

## Overview

This document describes the migration process for activities from the nested JSON structure in `user_profiles.progress_tracking` to the new dedicated `activities` table. This migration provides several benefits:

1. Simplified data structure
2. Better query performance
3. More reliable data storage and retrieval
4. Easier data validation
5. Support for more robust search and filtering

## Migration Process

The migration happens gradually through the following mechanisms:

1. When users log new activities, they are saved directly to the new `activities` table
2. Existing activities are still read from `progress_tracking` if they don't exist in the `activities` table
3. A background migration process can be run to migrate all historical data

## Running the Migration

To migrate existing activities from the nested JSON to the new table, a database administrator can run the following SQL:

```sql
-- Make sure the activities table exists first
SELECT create_activities_table();

-- Migrate activities from progress_tracking to the activities table
INSERT INTO activities (
  id,
  user_id,
  name,
  category,
  difficulty_level,
  notes,
  completed_at,
  created_at
)
SELECT 
  COALESCE(
    (act->>'id')::uuid, 
    gen_random_uuid()
  ) as id,
  user_id,
  COALESCE(
    act->>'name', 
    act->>'activity_name', 
    'Unnamed Activity'
  ) as name,
  COALESCE(
    act->>'category', 
    act->>'fearCategory', 
    act->>'fear_category', 
    'Unknown'
  ) as category,
  COALESCE(
    act->>'difficulty', 
    act->>'difficultyLevel', 
    'Level 3'
  ) as difficulty_level,
  COALESCE(act->>'notes', '') as notes,
  COALESCE(
    (act->>'date')::timestamptz, 
    (act->>'timestamp')::timestamptz, 
    now()
  ) as completed_at,
  now() as created_at
FROM 
  user_profiles,
  jsonb_array_elements(progress_tracking->'activities') as act
WHERE 
  progress_tracking->'activities' IS NOT NULL
  -- Avoid duplicates by checking that the id doesn't already exist in activities
  AND NOT EXISTS (
    SELECT 1 FROM activities 
    WHERE 
      activities.id = (act->>'id')::uuid
      OR (
        activities.user_id = user_profiles.user_id
        AND activities.name = COALESCE(act->>'name', act->>'activity_name', 'Unnamed Activity')
        AND activities.completed_at = COALESCE((act->>'date')::timestamptz, (act->>'timestamp')::timestamptz, now())
      )
  );
```

## Technical Notes

1. The new `activities` table is created automatically when a user attempts to save an activity and the table doesn't exist.
2. The new table includes appropriate indexes and Row Level Security (RLS) policies.
3. The application code has been updated to look for activities in the new table first, with fallback to the old structure.
4. Eventually, after confirming all data has been migrated successfully, the nested JSON structure can be deprecated.

## Rollback Plan

In the unlikely event that the migration causes issues, the application can continue to use the old data structure by modifying the Dashboard component to only read from `progress_tracking` and updating the activity form to save back to that structure.