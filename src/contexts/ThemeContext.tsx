import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthContext';

export type ThemeMode = 'light' | 'dark' | 'system';

export interface ThemePreferences {
  mode: ThemeMode;
}

interface ThemeContextType {
  theme: ThemePreferences;
  currentMode: 'light' | 'dark'; // Actual active mode
  setTheme: (preferences: Partial<ThemePreferences>) => Promise<void>;
}

const defaultTheme: ThemePreferences = {
  mode: 'system',
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [theme, setThemeState] = useState<ThemePreferences>(defaultTheme);
  const [currentMode, setCurrentMode] = useState<'light' | 'dark'>('light');

  // Load theme preferences from database
  useEffect(() => {
    const loadThemePreferences = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('theme_preferences')
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.error('Error loading theme preferences:', error);
          return;
        }

        if (data && data.theme_preferences) {
          setThemeState(data.theme_preferences as ThemePreferences);
        }
      } catch (error) {
        console.error('Error loading theme preferences:', error);
      }
    };

    loadThemePreferences();
  }, [user]);

  // Detect system theme preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = () => {
      if (theme.mode === 'system') {
        setCurrentMode(mediaQuery.matches ? 'dark' : 'light');
      }
    };
    
    // Initial check
    handleChange();
    
    // Listen for changes
    mediaQuery.addEventListener('change', handleChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [theme.mode]);

  // Apply theme mode
  useEffect(() => {
    if (theme.mode === 'system') {
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setCurrentMode(systemPrefersDark ? 'dark' : 'light');
    } else {
      setCurrentMode(theme.mode as 'light' | 'dark');
    }
  }, [theme.mode]);

  // Apply dark mode class to document
  useEffect(() => {
    if (currentMode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [currentMode]);

  // Save theme preferences to database
  const setTheme = async (preferences: Partial<ThemePreferences>) => {
    if (!user) {
      // If not logged in, just update local state
      setThemeState(prev => ({ ...prev, ...preferences }));
      return;
    }

    try {
      const newPreferences = { ...theme, ...preferences };
      setThemeState(newPreferences);

      const { error } = await supabase
        .from('user_profiles')
        .update({ theme_preferences: newPreferences })
        .eq('user_id', user.id);

      if (error) {
        console.error('Error saving theme preferences:', error);
      }
    } catch (error) {
      console.error('Error saving theme preferences:', error);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, currentMode, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
