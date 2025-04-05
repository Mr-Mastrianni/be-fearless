// Script to set a user as admin via metadata
import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Initialize environment variables
config();

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Missing Supabase URL or service role key in environment variables');
  console.error('Make sure you have VITE_SUPABASE_URL and VITE_SUPABASE_SERVICE_ROLE_KEY in your .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Get email from command line arguments
const userEmail = process.argv[2];

if (!userEmail) {
  console.error('Error: No email provided');
  console.error('Usage: node set-admin-user.js user@example.com');
  process.exit(1);
}

async function setUserAsAdmin(email) {
  try {
    // First, get the user by email
    const { data: users, error: userError } = await supabase
      .from('auth_users_view')
      .select('id')
      .eq('email', email)
      .single();

    if (userError) {
      console.error('Error finding user:', userError.message);
      return;
    }

    if (!users) {
      console.error(`No user found with email: ${email}`);
      return;
    }

    const userId = users.id;

    // Update user metadata to include admin role
    const { data, error } = await supabase.auth.admin.updateUserById(
      userId,
      { user_metadata: { is_admin: true } }
    );

    if (error) {
      console.error('Error updating user:', error.message);
      return;
    }

    console.log(`✅ Successfully set user ${email} as admin via metadata!`);
    
    // Also add to admin_users table for redundancy
    const { error: tableError } = await supabase
      .from('admin_users')
      .upsert({ user_id: userId, email: email, created_at: new Date().toISOString() });

    if (tableError) {
      console.error('Warning: Failed to add user to admin_users table:', tableError.message);
      console.log('The user is still an admin via metadata, but not in the admin_users table.');
    } else {
      console.log(`✅ Also added user to admin_users table for redundancy.`);
    }
  } catch (error) {
    console.error('Unexpected error:', error.message);
  }
}

// Run the function
setUserAsAdmin(userEmail);
