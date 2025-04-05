# Step-by-Step Instructions for Running SQL Fix Scripts in Supabase

This guide will walk you through the process of running the `fix_security_issues.sql` script in your Supabase dashboard to fix the security issues we identified.

## 1. Access Your Supabase Dashboard

1. Open your web browser and go to [https://app.supabase.io/](https://app.supabase.io/)
2. Log in to your Supabase account
3. Select your project (in this case, the "courage-bot-adventure" project)

## 2. Open the SQL Editor

1. In the left sidebar of your Supabase dashboard, click on **SQL Editor**
2. You should see a new SQL editor tab open

## 3. Copy the SQL Script Content

1. Open the file `supabase/fix_security_issues.sql` in your code editor
2. Select all content (Ctrl+A / Cmd+A)
3. Copy the content (Ctrl+C / Cmd+C)

## 4. Run the SQL Script

1. In the Supabase SQL Editor, paste the copied SQL content
2. Review the SQL to make sure it looks correct
3. Click the **Run** button (usually located at the top-right of the SQL Editor)
4. Wait for the script to execute (this might take a few seconds)

## 5. Verify the Changes

The SQL script will output information about the functions and policies that were modified. Verify that there are no errors in the output.

## 6. Update Auth Settings Manually

You also need to update some settings through the Supabase dashboard UI:

1. In the left sidebar of your Supabase dashboard, click on **Authentication**
2. Then click on **Configuration**
3. Click on the **Security** tab
4. Under "One-time passwords", set the expiry time to 15-30 minutes (recommended)
5. Under "Password protection", enable "Detect leaked passwords"
6. Save the changes

## 7. Test the Changes

After completing all steps:

1. Run the Security Advisor again to verify the issues are resolved
   - Click on **Project Settings** in the left sidebar
   - Click on **Security Advisor** (usually in the Security section)
   - Verify that the previously identified issues are now resolved

## 8. Test MCP Supabase Access

After restarting your editor to apply the MCP configuration changes:

1. Use the MCP Supabase tool to query a table:
   ```javascript
   // Example query that should now work
   use_mcp_tool({
     server_name: "supabase",
     tool_name: "supabase_query",
     arguments: {
       table: "user_profiles",
       limit: 1
     }
   })
   ```

## Troubleshooting

If you encounter any errors while running the SQL:

1. **Syntax Errors**: Make sure you've copied the entire SQL script correctly
2. **Permission Errors**: Ensure you're logged in as a user with admin privileges
3. **Object Already Exists Errors**: The script includes DROP statements to remove existing objects, but if you see errors about objects that don't exist, these can generally be ignored

If you're still having issues, you can run the script in smaller sections by selecting and executing parts of it individually.