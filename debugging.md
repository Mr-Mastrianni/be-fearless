# Debugging Guide

## Debugging the Sign Up Flow

If you're having issues with the sign-up process, try these debugging steps:

### Developer Tools Debugging

1. Open your browser's developer tools (F12 or right-click and select "Inspect")
2. Go to the Network tab
3. Try to sign up with a new account
4. Look for any failing requests (marked in red) 
5. Check the response of any Supabase requests

### Console Logging

We've added console logging to track the sign-up process:
1. Open your browser's developer console (usually F12 > Console tab)
2. Look for logs that start with "Attempting to sign up with"
3. Check for any error messages

### Try Direct Approach

We've modified the sign-up flow to use Supabase directly, bypassing our context layer.
This should help identify whether the issue is with our application code or with Supabase.

### Common Issues

1. **Network Connectivity**: Make sure you have internet access
2. **CORS Issues**: These would appear in the console
3. **Invalid Email Format**: Ensure the email is properly formatted
4. **Password Requirements**: Password must be at least 8 characters
5. **Email Already In Use**: If the email is already registered

### Testing with Temporary Email

Try creating an account with a temporary email service like tempmail.org to see if 
email delivery is the issue.

## Debugging Activity Logging Issues

### Activity Logging System Update (Added 2025-03-18)

#### Overview

We've redesigned the activity logging system to fix persistent issues with saving and displaying activities.

#### Changes Made

1. Created a new approach using a dedicated `activities` table instead of nested JSON:
   - Added `BasicActivityLogger.tsx` - A simpler form that saves directly to the activities table
   - Added SQL function `create_activities_table.sql` that creates the activities table when needed
   - Created migration file `20250318_create_activities_table.sql` to add the function to the database
   - Updated Dashboard.tsx to use the new logger and fetch from the new table

2. Implementation Details:
   - The new table stores each activity as a separate row with proper columns
   - Added Row Level Security policies to ensure users can only access their own activities
   - The system will gradually migrate from the old nested JSON approach to the new table approach
   - Added fallback to read from the old structure if the new table doesn't exist yet

3. Support for Backward Compatibility:
   - The Dashboard component checks both storage locations for activities
   - Created migration documentation in `public/ACTIVITIES_MIGRATION.md`

#### Testing Instructions

1. Verify that the new activity logger works:
   - Navigate to Dashboard > Activities tab
   - Click "Log New Activity"
   - Fill out the form and click "Save Activity"
   - Verify that the activity shows up in the list
   - Check browser console for any errors

2. Verify that existing activities are still visible:
   - Activities from the old progress_tracking structure should still display

#### Troubleshooting

If issues persist, please check:
1. Supabase logs for any SQL errors
2. Browser console for JavaScript errors
3. Verify the activities table was created correctly

#### Next Steps

1. After confirming the new system works reliably:
   - Run the migration script to move all activities to the new table
   - Remove the fallback code from Dashboard.tsx
   - Remove the debugging tools (DebugDataViewer, DirectSQLViewer, RepairTool)
   
2. Future improvements:
   - Add edit functionality for existing activities
   - Implement activity deletion
   - Add activity filters and search
