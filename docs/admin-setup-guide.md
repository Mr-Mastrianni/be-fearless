# Courage Bot Adventure - Admin Setup Guide

This guide will walk you through the process of setting up an admin user for the Courage Bot Adventure application.

## Prerequisites

Before you begin, make sure you have:

1. A Supabase project set up with the Courage Bot Adventure database
2. Node.js installed on your machine
3. Access to your Supabase project's service role key

## Step 1: Create Required Database Tables

First, you need to create the necessary admin-related tables in your Supabase database.

1. Log in to your Supabase dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `scripts/create-admin-tables.sql`
4. Run the SQL script to create the required tables and policies

Alternatively, you can run the SQL script from the command line using the Supabase CLI.

## Step 2: Set Up Environment Variables

Create or update your `.env` file in the project root with the following variables:

```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**Important**: The service role key has full access to your database, so keep it secure and never expose it in client-side code.

## Step 3: Make a User an Admin

There are two ways to set a user as an admin:

### Option 1: Using the provided script (Recommended)

1. Make sure you have installed the required dependencies:
   ```
   npm install @supabase/supabase-js dotenv
   ```

2. Run the admin user setup script:
   ```
   node scripts/set-admin-user.js your-email@example.com
   ```

   This script will:
   - Find the user with the specified email
   - Update their user metadata to include admin privileges
   - Add them to the `admin_users` table for redundancy

### Option 2: Manual setup via Supabase Dashboard

#### A. Update User Metadata

1. Go to your Supabase dashboard
2. Navigate to Authentication > Users
3. Find the user you want to make an admin
4. Click on the user to view their details
5. Under "User Metadata", add:
   ```json
   {
     "is_admin": true
   }
   ```
   (If there's existing metadata, add the `is_admin` field to it)
6. Save the changes

#### B. Add to admin_users Table

1. Go to the Table Editor
2. Select the `admin_users` table
3. Click "Insert row"
4. Fill in:
   - `user_id`: The UUID of the user
   - `email`: The email of the user
   - Leave the other fields to use their default values
5. Save the row

## Step 4: Verify Admin Access

1. Log in to the Courage Bot Adventure application with the admin user
2. You should now see an "Admin" link in the navigation
3. Click on it to access the admin dashboard

## Troubleshooting

If you're having issues with admin access:

1. **Check User Metadata**: Verify that the user has `is_admin: true` in their metadata
2. **Check admin_users Table**: Ensure the user is present in the `admin_users` table
3. **Check Browser Console**: Look for any errors in the browser console
4. **Clear Browser Cache**: Sometimes cached authentication data can cause issues
5. **Check Supabase Policies**: Ensure the RLS policies are correctly set up

## Security Considerations

- The admin dashboard provides powerful capabilities, so be cautious about who you grant admin access to
- Regularly audit your admin users list
- Consider implementing more granular permissions for different admin roles in the future
