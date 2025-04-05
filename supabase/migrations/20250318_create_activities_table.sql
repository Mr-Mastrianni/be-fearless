-- Migration to add the create_activities_table function
-- This will add the function that can create the activities table when needed

-- Include the function definition
\i '../functions/create_activities_table.sql'

-- Run the function to create the table immediately
SELECT create_activities_table();