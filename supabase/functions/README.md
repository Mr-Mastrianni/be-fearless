# Account Deletion Edge Function

This directory contains a Supabase Edge Function that properly deletes user accounts. This is necessary because account deletion requires admin-level access which can't be done from client-side code.

## Deployment Instructions

1. Install the Supabase CLI if you haven't already:
   ```bash
   npm install -g supabase
   ```

2. Login to your Supabase account:
   ```bash
   supabase login
   ```

3. Link your local project to your Supabase project:
   ```bash
   supabase link --project-ref your-project-id
   ```

4. Deploy the function:
   ```bash
   supabase functions deploy delete-account --no-verify-jwt
   ```

5. Add the necessary environment variables to your Edge Function:
   ```bash
   supabase secrets set SUPABASE_URL=https://your-project.supabase.co
   supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

6. Update your frontend environment variables:
   
   Create or modify `.env.local` file in your project root with:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   ```

## Security Considerations

1. The Edge Function uses the service role key, which has full admin access to your Supabase project. Always keep this key secure.

2. The function validates the user's JWT token before performing any action to ensure only authenticated users can delete their own accounts.

3. Consider adding additional verification steps (like password re-entry) in your frontend before triggering account deletion.

## Testing

To test the function:

1. Log in to your application
2. Go to profile settings
3. Use the Delete Account feature
4. Verify that you can no longer log in with the deleted account credentials

## Troubleshooting

If account deletion fails:

1. Check the browser console for any error messages
2. Verify that your environment variables are correctly set
3. Check the Supabase Edge Function logs:
   ```bash
   supabase functions logs delete-account
   ```
