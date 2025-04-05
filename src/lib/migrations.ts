import { supabase } from './supabase';

/**
 * Apply database migrations that are needed for the app to function correctly
 */
export const applyMigrations = async () => {
  try {
    console.log('Checking if migrations are needed...');
    
    // First check if user is authenticated to avoid 401 errors
    const { data: sessionData } = await supabase.auth.getSession();
    const isAuthenticated = !!sessionData.session?.user;
    
    // Only run migrations that require authentication if a user is logged in
    if (isAuthenticated) {
      // Check if progress_tracking column exists
      const { error: tableInfoError } = await supabase
        .from('user_profiles')
        .select('progress_tracking')
        .limit(1);
      
      // If column doesn't exist, add it
      if (tableInfoError && tableInfoError.message.includes('column "progress_tracking" does not exist')) {
        console.log('Adding progress_tracking column to user_profiles table...');
        
        // We can't run ALTER TABLE from client-side code, so we'll use a workaround
        // by updating a row with the new column, which will create it if it doesn't exist
        
        // Get the first user profile
        const { data: profiles } = await supabase
          .from('user_profiles')
          .select('user_id')
          .limit(1);
        
        if (profiles && profiles.length > 0) {
          // Update the first profile with an empty progress_tracking object
          const { error: updateError } = await supabase
            .rpc('init_progress_tracking', { user_id_param: profiles[0].user_id });
          
          if (updateError) {
            console.error('Error initializing progress_tracking:', updateError);
          } else {
            console.log('Successfully initialized progress_tracking column');
          }
        } else {
          console.log('No user profiles found, skipping migration');
        }
      } else {
        console.log('progress_tracking column already exists, no migration needed');
      }
    } else {
      console.log('User not authenticated. Skipping migrations that require authentication.');
    }
  } catch (error) {
    console.error('Error applying migrations:', error);
  }
};
