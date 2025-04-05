import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthContext';

export interface DashboardLayout {
  viewMode: 'grid' | 'list';
  widgets: {
    activity: { visible: boolean; position: number; size: 'small' | 'medium' | 'large' };
    progress: { visible: boolean; position: number; size: 'small' | 'medium' | 'large' };
    journal: { visible: boolean; position: number; size: 'small' | 'medium' | 'large' };
    recommended: { visible: boolean; position: number; size: 'small' | 'medium' | 'large' };
    personalized: { visible: boolean; position: number; size: 'small' | 'medium' | 'large' };
    journey?: { visible: boolean; position: number; size: 'small' | 'medium' | 'large' };
  };
}

export interface ExperiencePreferences {
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  focus: string[];
  pacing: 'slow' | 'moderate' | 'fast';
  guidance: 'detailed' | 'minimal' | 'balanced';
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  frequency: 'daily' | 'weekly' | 'monthly' | 'never';
  reminderTime?: string;
}

export interface UserPreferences {
  dashboardLayout: DashboardLayout;
  experiencePreferences: ExperiencePreferences;
  notificationPreferences: NotificationPreferences;
}

interface UserPreferencesContextType {
  preferences: UserPreferences;
  dashboardLayout: DashboardLayout;
  experiencePreferences: ExperiencePreferences;
  notificationPreferences: NotificationPreferences;
  setUserPreferences: (preferences: UserPreferences) => void;
  updateDashboardLayout: (layout: Partial<DashboardLayout>) => Promise<void>;
  updateExperiencePreferences: (prefs: Partial<ExperiencePreferences>) => Promise<void>;
  updateNotificationPreferences: (prefs: Partial<NotificationPreferences>) => Promise<void>;
  resetPreferences: () => Promise<void>;
}

const defaultDashboardLayout: DashboardLayout = {
  viewMode: 'grid',
  widgets: {
    activity: { visible: true, position: 0, size: 'medium' },
    progress: { visible: true, position: 1, size: 'large' },
    journal: { visible: true, position: 2, size: 'medium' },
    recommended: { visible: true, position: 3, size: 'medium' },
    personalized: { visible: true, position: 4, size: 'large' },
    journey: { visible: true, position: 5, size: 'medium' },
  },
};

const defaultPreferences: UserPreferences = {
  dashboardLayout: defaultDashboardLayout,
  experiencePreferences: {
    difficulty: 'beginner',
    focus: ['general'],
    pacing: 'moderate',
    guidance: 'balanced',
  },
  notificationPreferences: {
    email: true,
    push: true,
    frequency: 'weekly',
  },
};

const UserPreferencesContext = createContext<UserPreferencesContextType | undefined>(undefined);

export function UserPreferencesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences);

  // Load user preferences from the database
  useEffect(() => {
    const loadUserPreferences = async () => {
      if (!user) return;

      try {
        console.log('Loading user preferences for user:', user.id);
        console.log(`🔍 PREFERENCE DIAGNOSTIC: Starting preferences load for user ${user.id} at ${Date.now()}`);
        
        const { data, error } = await supabase
          .from('user_profiles')
          .select('dashboard_layout, experience_preferences, notification_preferences')
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.error('Error loading user preferences:', error);
          // If we can't load preferences, initialize with defaults
          console.log('Initializing with default preferences');
          setPreferences(defaultPreferences);
          
          // Try to save default preferences
          try {
            await supabase
              .from('user_profiles')
              .update({
                dashboard_layout: defaultPreferences.dashboardLayout,
                experience_preferences: defaultPreferences.experiencePreferences,
                notification_preferences: defaultPreferences.notificationPreferences,
              })
              .eq('user_id', user.id);
            console.log('Default preferences saved to database');
          } catch (saveError) {
            console.error('Error saving default preferences:', saveError);
          }
          
          return;
        }

        console.log('Loaded user preferences:', data);
        console.log(`🔍 PREFERENCE DIAGNOSTIC: Completed preferences load for user ${user.id} at ${Date.now()}`);
        
        // Check if each preference object exists, use default if not
        const loadedPreferences = {
          dashboardLayout: data.dashboard_layout || defaultPreferences.dashboardLayout,
          experiencePreferences: data.experience_preferences || defaultPreferences.experiencePreferences,
          notificationPreferences: data.notification_preferences || defaultPreferences.notificationPreferences,
        };

        console.log('Setting preferences:', loadedPreferences);
        setPreferences(loadedPreferences);
      } catch (error) {
        console.error('Exception loading user preferences:', error);
        // Fall back to defaults
        setPreferences(defaultPreferences);
      }
    };

    loadUserPreferences();
  }, [user]);

  // Update dashboard layout
  const updateDashboardLayout = async (layout: Partial<DashboardLayout>) => {
    if (!user) return;

    try {
      const updatedLayout = {
        ...preferences.dashboardLayout,
        ...layout,
      };

      setPreferences((prev) => ({
        ...prev,
        dashboardLayout: updatedLayout,
      }));

      await supabase
        .from('user_profiles')
        .update({ dashboard_layout: updatedLayout })
        .eq('user_id', user.id);
    } catch (error) {
      console.error('Error updating dashboard layout:', error);
    }
  };

  // Update experience preferences
  const updateExperiencePreferences = async (prefs: Partial<ExperiencePreferences>) => {
    if (!user) return;

    try {
      const updatedPrefs = {
        ...preferences.experiencePreferences,
        ...prefs,
      };

      setPreferences((prev) => ({
        ...prev,
        experiencePreferences: updatedPrefs,
      }));

      await supabase
        .from('user_profiles')
        .update({ experience_preferences: updatedPrefs })
        .eq('user_id', user.id);
    } catch (error) {
      console.error('Error updating experience preferences:', error);
    }
  };

  // Update notification preferences
  const updateNotificationPreferences = async (prefs: Partial<NotificationPreferences>) => {
    if (!user) return;

    try {
      const updatedPrefs = {
        ...preferences.notificationPreferences,
        ...prefs,
      };

      setPreferences((prev) => ({
        ...prev,
        notificationPreferences: updatedPrefs,
      }));

      await supabase
        .from('user_profiles')
        .update({ notification_preferences: updatedPrefs })
        .eq('user_id', user.id);
    } catch (error) {
      console.error('Error updating notification preferences:', error);
    }
  };

  // Reset preferences to defaults
  const resetPreferences = async () => {
    if (!user) return;

    try {
      setPreferences(defaultPreferences);

      await supabase
        .from('user_profiles')
        .update({
          dashboard_layout: defaultPreferences.dashboardLayout,
          experience_preferences: defaultPreferences.experiencePreferences,
          notification_preferences: defaultPreferences.notificationPreferences,
        })
        .eq('user_id', user.id);
    } catch (error) {
      console.error('Error resetting preferences:', error);
    }
  };

  const setUserPreferences = (preferences: UserPreferences) => {
    setPreferences(preferences);
  };

  return (
    <UserPreferencesContext.Provider
      value={{
        preferences,
        dashboardLayout: preferences.dashboardLayout,
        experiencePreferences: preferences.experiencePreferences,
        notificationPreferences: preferences.notificationPreferences,
        setUserPreferences,
        updateDashboardLayout,
        updateExperiencePreferences,
        updateNotificationPreferences,
        resetPreferences,
      }}
    >
      {children}
    </UserPreferencesContext.Provider>
  );
}

export function useUserPreferences() {
  const context = useContext(UserPreferencesContext);
  if (context === undefined) {
    throw new Error('useUserPreferences must be used within a UserPreferencesProvider');
  }
  return context;
}
