import { supabase } from './supabase';

/**
 * Repairs and normalizes user activity data in the database
 * @param userId The user ID to repair data for
 * @returns Object with success status and message
 */
export async function repairUserActivityData(userId: string) {
  try {
    console.log('Starting repair of user activity data for:', userId);
    
    // 1. Get the current user profile
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
      
    if (profileError) {
      throw new Error(`Failed to fetch user profile: ${profileError.message}`);
    }
    
    if (!profile) {
      throw new Error('User profile not found');
    }
    
    // 2. Extract the progress_tracking data
    const progressTracking = profile.progress_tracking || {
      activities: [],
      milestones: [],
      stats: {
        activitiesCompleted: 0,
        activitiesInProgress: 0, 
        activitiesPlanned: 0
      }
    };
    
    console.log('Current progress tracking:', progressTracking);
    console.log('Activities count:', progressTracking.activities?.length || 0);
    
    // 3. Make a backup of original activities
    const originalActivities = [...(progressTracking.activities || [])];
    
    // 4. Filter and normalize activities
    const normalizedActivities = originalActivities
      .filter(activity => activity && typeof activity === 'object' && activity.id)
      .map(activity => {
        // Create a normalized version with consistent fields
        return {
          id: activity.id,
          name: activity.name || activity.activity_name || 'Unnamed Activity',
          category: activity.category || activity.fearCategory || activity.fear_category || 'Unknown',
          date: activity.date || new Date().toISOString(),
          notes: activity.notes || '',
          status: activity.status || 'completed',
          difficulty: activity.difficulty || mapFearLevelToDifficulty(activity.fearLevelBefore),
          fearLevelBefore: activity.fearLevelBefore || 3,
          fearLevelAfter: activity.fearLevelAfter || 3
        };
      });
    
    console.log('Normalized activities:', normalizedActivities);
    
    // 5. Update stats
    const stats = {
      activitiesCompleted: normalizedActivities.filter(a => a.status === 'completed').length,
      activitiesInProgress: normalizedActivities.filter(a => a.status === 'in-progress').length,
      activitiesPlanned: normalizedActivities.filter(a => a.status === 'planned').length
    };
    
    // 6. Create the updated progress_tracking object
    const updatedProgressTracking = {
      ...progressTracking,
      activities: normalizedActivities,
      stats
    };
    
    // 7. Update the user profile
    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({
        progress_tracking: updatedProgressTracking
      })
      .eq('user_id', userId);
      
    if (updateError) {
      throw new Error(`Failed to update user profile: ${updateError.message}`);
    }
    
    return {
      success: true,
      message: `Successfully repaired activity data. ${originalActivities.length} activities were normalized.`,
      originalCount: originalActivities.length,
      normalizedCount: normalizedActivities.length
    };
  } catch (error) {
    console.error('Error repairing user activity data:', error);
    return {
      success: false,
      message: `Failed to repair activity data: ${error.message}`
    };
  }
}

/**
 * Maps a fear level to a difficulty string
 */
function mapFearLevelToDifficulty(fearLevel?: number): string {
  if (!fearLevel) return 'Intermediate';
  
  if (fearLevel <= 2) return 'Beginner';
  if (fearLevel === 3) return 'Intermediate';
  return 'Advanced';
}

/**
 * Completely resets user activity data
 */
export async function resetUserActivityData(userId: string) {
  try {
    console.log('Resetting user activity data for:', userId);
    
    // Create a clean progress_tracking object
    const cleanProgressTracking = {
      activities: [],
      milestones: [],
      stats: {
        activitiesCompleted: 0,
        activitiesInProgress: 0,
        activitiesPlanned: 0
      }
    };
    
    // Update the user profile
    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({
        progress_tracking: cleanProgressTracking
      })
      .eq('user_id', userId);
      
    if (updateError) {
      throw new Error(`Failed to reset user profile: ${updateError.message}`);
    }
    
    return {
      success: true,
      message: 'Successfully reset activity data'
    };
  } catch (error) {
    console.error('Error resetting user activity data:', error);
    return {
      success: false,
      message: `Failed to reset activity data: ${error.message}`
    };
  }
}