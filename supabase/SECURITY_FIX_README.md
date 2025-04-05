# Supabase Security Fixes

This document outlines security issues identified in your Supabase project and provides instructions for fixing them.

## Issues Identified

From the Supabase Security Advisor, we found the following issues:

1. **RLS references user metadata** - Insecure references to user metadata in RLS policies
2. **Function Search Path Mutable** - Multiple functions without explicit search paths
3. **Auth OTP Long Expiry** - One-time password expiry exceeds recommended threshold
4. **Leaked Password Protection Disabled** - Password protection feature is not enabled

Additionally, we identified an issue with the MCP Supabase server that prevents it from bypassing RLS policies, causing "permission denied" errors.

## Fix Instructions

### 1. Fix Supabase Security Issues

Run the SQL script in the Supabase SQL Editor:

1. Navigate to the Supabase Dashboard for your project
2. Go to the SQL Editor
3. Open or paste the contents of `supabase/fix_security_issues.sql`
4. Run the script

This script will:
- Fix insecure references to user metadata in RLS policies
- Add explicit search paths to all functions
- Create secure replacement policies
- Set proper SECURITY DEFINER on functions

### 2. Fix Auth Settings Manually

You'll need to update these settings through the Supabase dashboard:

1. Go to Authentication > Configuration > Security
2. Under "One-time passwords", set the expiry time to 15-30 minutes
3. Under "Password protection", enable "Detect leaked passwords"

### 3. Fix MCP Server Access

To fix the MCP Supabase server access issue (allowing it to bypass RLS):

```bash
node fix_mcp_supabase_access.js
```

This script will update the MCP configuration to use the service role key, which has permission to bypass RLS policies.

**Important:** After running this script, you'll need to restart any running MCP servers or restart your editor for the changes to take effect.

## Verification

After applying the fixes:

1. Run the Security Advisor again to verify the issues are resolved
2. Test the MCP Supabase server access by running a query:
   ```javascript
   use_mcp_tool({
     server_name: "supabase",
     tool_name: "supabase_query",
     arguments: {
       table: "user_profiles",
       limit: 1
     }
   })
   ```

## Security Considerations

- Using the service role key in the MCP server grants it admin privileges, which should only be used for development and debugging purposes.
- For production environments, consider creating a dedicated service account with limited permissions.