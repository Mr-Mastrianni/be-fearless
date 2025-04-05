import { supabase } from './supabase';

// Function to sync user data to Airtable
export async function syncUserToAirtable(userId: string) {
  try {
    console.log('Syncing user data to Airtable:', userId);
    
    // Call the Supabase Edge Function for Airtable sync
    const { data: sessionData } = await supabase.auth.getSession();
    
    if (!sessionData.session?.access_token) {
      console.error('No access token found for Airtable sync');
      return { success: false, error: 'Authentication token not found' };
    }
    
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/airtable`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionData.session.access_token}`
        },
        body: JSON.stringify({ 
          action: 'sync_user',
          userId: userId
        })
      }
    );
    
    const result = await response.json();
    
    if (!response.ok) {
      console.error('Airtable sync error:', result);
      return { 
        success: false, 
        error: result.message || 'Failed to sync user data to Airtable'
      };
    }
    
    console.log('Airtable sync successful:', result);
    return { success: true, data: result };
    
  } catch (error: any) {
    console.error('Error in syncUserToAirtable:', error);
    return { 
      success: false, 
      error: error.message || 'An unexpected error occurred during Airtable sync'
    };
  }
}

// Function to sync all users to Airtable (admin only)
export async function syncAllUsersToAirtable() {
  try {
    console.log('Syncing all users to Airtable');
    
    // Check if user is an admin
    const { data: sessionData } = await supabase.auth.getSession();
    
    if (!sessionData.session?.access_token) {
      console.error('No access token found for Airtable sync');
      return { success: false, error: 'Authentication token not found' };
    }
    
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/airtable`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionData.session.access_token}`
        },
        body: JSON.stringify({ 
          action: 'sync_all_users'
        })
      }
    );
    
    const result = await response.json();
    
    if (!response.ok) {
      console.error('Airtable sync all users error:', result);
      return { 
        success: false, 
        error: result.message || 'Failed to sync users to Airtable'
      };
    }
    
    console.log('Airtable sync all users successful:', result);
    return { success: true, data: result };
    
  } catch (error: any) {
    console.error('Error in syncAllUsersToAirtable:', error);
    return { 
      success: false, 
      error: error.message || 'An unexpected error occurred during Airtable sync'
    };
  }
}