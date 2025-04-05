import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { Activity, ActivityPreferences, FearCategory, DifficultyLevel, CostRange, TimeCommitment, ActivityMatch, FearAssessmentData } from '@/models/ActivityTypes';
import { 
  allActivities, 
  filterActivitiesByFearCategory, 
  filterActivitiesByMaxDifficulty,
  filterActivitiesByMaxCost,
  filterActivitiesByEnvironment,
  filterActivitiesByLocation,
  filterActivitiesByMaxTimeCommitment,
  searchActivitiesByText,
  sortActivities
} from '@/data/activities';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

// Define the context shape
interface ActivityMatcherContextType {
  // State
  userPreferences: ActivityPreferences | null;
  matchedActivities: Activity[];
  filteredActivities: Activity[];
  isLoading: boolean;
  activeFilters: {
    fearCategories: FearCategory[];
    maxDifficulty: DifficultyLevel | null;
    maxTimeCommitment: TimeCommitment | null;
    indoorOutdoor: 'indoor' | 'outdoor' | 'both' | null;
  };
  searchTerm: string;
  sortOrder: 'alphabetical' | 'difficulty_asc' | 'difficulty_desc' | 'recommended';
  viewMode: 'grid' | 'list';
  fearAssessmentData: FearAssessmentData | null;

  // Actions
  setActiveFilters: (filters: Partial<ActivityMatcherContextType['activeFilters']>) => void;
  setSearchTerm: (term: string) => void;
  setSortOrder: (order: ActivityMatcherContextType['sortOrder']) => void;
  setViewMode: (mode: 'grid' | 'list') => void;
  refreshUserPreferences: () => Promise<void>;
}

// Create the context
const ActivityMatcherContext = createContext<ActivityMatcherContextType | undefined>(undefined);

// Default preferences
const defaultPreferences: ActivityPreferences = {
  fearCategories: [],
  maxDifficulty: 'beginner',
  preferredDifficulty: 'beginner',
  maxCost: 'medium',
  costRange: 'medium',
  maxTimeCommitment: 'half_day',
  timeCommitment: 'half_day',
  indoorOutdoorPreference: 'both',
};

// Default filters 
const defaultFilters = {
  fearCategories: [],
  maxDifficulty: null,
  maxTimeCommitment: null,
  indoorOutdoor: null,
};

// Helper function to convert difficulty level string to number for comparison
const difficultyLevelToNumber = (level: DifficultyLevel | undefined): number => {
  if (!level) return 0;
  
  switch (level) {
    case 'beginner': return 1;
    case 'easy': return 2;
    case 'moderate': return 3;
    case 'challenging': return 4;
    case 'difficult': return 5;
    default: return 0;
  }
};

export const ActivityMatcherProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [userPreferences, setUserPreferences] = useState<ActivityPreferences | null>(null);
  const [matchedActivities, setMatchedActivities] = useState<Activity[]>([]);
  const [filteredActivities, setFilteredActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilters, setActiveFilters] = useState(defaultFilters);
  const [sortOrder, setSortOrder] = useState<'alphabetical' | 'difficulty_asc' | 'difficulty_desc' | 'recommended'>('recommended');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [fearAssessmentData, setFearAssessmentData] = useState<FearAssessmentData | null>(null);

  // Load user preferences from Supabase
  const loadUserPreferences = useCallback(async () => {
    setIsLoading(true);
    try {
      if (!user) return;
      
      const { data, error } = await supabase
        .from('user_profiles')
        .select('key_fears, experience_level, location')
        .eq('user_id', user.id)
        .single();
      
      if (error) throw error;
      
      if (data) {
        // Map profile data to activity preferences
        const preferences: ActivityPreferences = {
          fearCategories: data.key_fears as FearCategory[] || [],
          maxDifficulty: mapExperienceToDifficulty(data.experience_level) || defaultPreferences.maxDifficulty,
          preferredDifficulty: mapExperienceToDifficulty(data.experience_level) || defaultPreferences.preferredDifficulty,
          maxCost: defaultPreferences.maxCost,
          costRange: defaultPreferences.costRange,
          maxTimeCommitment: defaultPreferences.maxTimeCommitment,
          timeCommitment: defaultPreferences.timeCommitment,
          indoorOutdoorPreference: defaultPreferences.indoorOutdoorPreference,
        };
        
        setUserPreferences(preferences);
        
        // Set initial filters based on preferences
        setActiveFilters({
          ...defaultFilters,
          fearCategories: preferences.fearCategories,
        });
        
        // Find initial matches
        matchActivitiesToUserProfile();
      }
    } catch (error) {
      console.error('Error loading user preferences:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Load fear assessment data from Supabase
  const loadFearAssessmentData = useCallback(async () => {
    try {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('fear_assessments')
          .select('*')
          .eq('user_id', user.id)
          .order('timestamp', { ascending: false })
          .limit(1)
          .single();
        
        if (error) {
          // No assessment data found is an expected case
          if (error.code !== 'PGRST116') {
            console.error('Error loading fear assessment data from table:', error);
          }
          // Continue with profile data instead
        } else if (data) {
          setFearAssessmentData(data);
          return; // We successfully got assessment data, so we can return
        }
      } catch (assessmentTableError) {
        console.error('Error with fear_assessments table:', assessmentTableError);
        // Continue with profile data instead
      }
      
      // As a fallback, get fear data from user_profiles if we couldn't get it from fear_assessments
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('key_fears, last_assessment')
        .eq('user_id', user.id)
        .single();
      
      if (profileError) {
        console.error('Error loading user profile for fear data:', profileError);
        return;
      }
      
      if (profileData && profileData.key_fears && Array.isArray(profileData.key_fears) && profileData.key_fears.length > 0) {
        // Create a synthetic assessment record from profile data
        const syntheticAssessment: FearAssessmentData = {
          user_id: user.id,
          timestamp: profileData.last_assessment || new Date().toISOString(),
          fears: profileData.key_fears.map((fear: string) => ({
            category: fear as FearCategory,
            score: 5, // Default mid-range score
            notes: ''
          }))
        };
        setFearAssessmentData(syntheticAssessment);
      }
    } catch (error) {
      console.error('Error loading fear assessment data:', error);
    }
  }, [user]);

  // Load user preferences from profile
  useEffect(() => {
    if (user) {
      loadUserPreferences();
      loadFearAssessmentData();
    } else {
      setUserPreferences(null);
      setMatchedActivities([]);
      setFilteredActivities([]);
      setFearAssessmentData(null);
    }
  }, [user, loadUserPreferences, loadFearAssessmentData]);

  // Apply filters, search, and sorting to matched activities
  const applyFilters = useCallback(() => {
    try {
      // Guard against null or undefined matchedActivities
      if (!matchedActivities || !Array.isArray(matchedActivities)) {
        console.warn('matchedActivities is not an array:', matchedActivities);
        setFilteredActivities([]);
        return;
      }
      
      let filtered = [...matchedActivities];
      
      // Apply fear category filters
      if (activeFilters.fearCategories.length > 0) {
        filtered = filtered.filter(activity => 
          activity.fearCategories.some(fear => 
            activeFilters.fearCategories.includes(fear)
          )
        );
      }
      
      // Apply difficulty filter
      if (activeFilters.maxDifficulty) {
        filtered = filterActivitiesByMaxDifficulty(filtered, activeFilters.maxDifficulty);
      }
      
      // Apply time commitment filter
      if (activeFilters.maxTimeCommitment) {
        filtered = filterActivitiesByMaxTimeCommitment(filtered, activeFilters.maxTimeCommitment);
      }
      
      // Apply indoor/outdoor filter
      if (activeFilters.indoorOutdoor) {
        filtered = filterActivitiesByEnvironment(filtered, activeFilters.indoorOutdoor);
      }
      
      // Apply search term filter if present
      if (searchTerm) {
        filtered = searchActivitiesByText(filtered, searchTerm);
      }
      
      // Apply sort order
      switch (sortOrder) {
        case 'alphabetical':
          filtered = sortActivities(filtered, 'name');
          break;
        case 'difficulty_asc':
          filtered = sortActivities(filtered, 'difficulty', 'asc');
          break;
        case 'difficulty_desc':
          filtered = sortActivities(filtered, 'difficulty', 'desc');
          break;
        case 'recommended':
          // Already sorted by match score during the matchActivitiesToUserProfile function
          // But ensure the sort stays stable
          filtered = [...filtered].sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
          break;
      }
      
      setFilteredActivities(filtered);
    } catch (error) {
      console.error('Error applying filters:', error);
      // Fall back to all matched activities
      setFilteredActivities(matchedActivities);
    }
  }, [activeFilters, searchTerm, sortOrder, matchedActivities]);

  // Update filtered activities when filters, search term, sort order, or matched activities change
  useEffect(() => {
    applyFilters();
  }, [activeFilters, searchTerm, sortOrder, matchedActivities, applyFilters]);

  // Refresh user preferences (call this after assessment is taken)
  const refreshUserPreferences = useCallback(async () => {
    await loadUserPreferences();
    await loadFearAssessmentData();
  }, [loadUserPreferences, loadFearAssessmentData]);

  // Map experience level from profile to difficulty level
  const mapExperienceToDifficulty = useCallback((experience: string | null): DifficultyLevel => {
    switch (experience) {
      case 'novice':
        return 'beginner';
      case 'intermediate':
        return 'moderate';
      case 'experienced':
        return 'challenging';
      case 'expert':
        return 'difficult';
      default:
        return 'beginner';
    }
  }, []);

  // Find activities that match user's profile
  const matchActivitiesToUserProfile = useCallback(async () => {
    if (!allActivities || allActivities.length === 0) {
      console.warn('No activities available for matching');
      setMatchedActivities([]);
      return;
    }
    
    try {
      // Initialize a scoring array for activities
      const scoredActivities = allActivities.map(activity => {
        if (!activity) {
          console.warn('Null activity found in allActivities');
          return null;
        }
        try {
          // Calculate a match score for this activity
          const score = calculateActivityScore(activity);
          return { 
            ...activity, 
            matchScore: score 
          };
        } catch (scoreError) {
          console.error(`Error calculating score for activity ${activity.id || 'unknown'}:`, scoreError);
          return {
            ...activity,
            matchScore: 0
          };
        }
      }).filter(Boolean) as Activity[]; // Filter out any null activities
      
      // Sort by match score (descending)
      const sortedMatches = scoredActivities.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
      
      setMatchedActivities(sortedMatches);
    } catch (error) {
      console.error('Error matching activities to profile:', error);
      // Fall back to all activities if there's an error in the matching logic
      setMatchedActivities(allActivities);
    }
  }, []);

  // Determine if activities match the user's fear profile
  const getFearProfileMatch = useCallback((activity: Activity): number => {
    if (!fearAssessmentData || !fearAssessmentData.fears) return 0;
    if (!activity || !activity.fearCategories) return 0;
    
    try {
      // Safety check on fearAssessmentData results
      if (!Array.isArray(fearAssessmentData.fears)) {
        console.warn('Fear assessment fears is not an array:', fearAssessmentData.fears);
        return 0;
      }

      // Get all fear categories from the activity
      const activityFears = activity.fearCategories || [];
      if (activityFears.length === 0) return 0;
      
      // Calculate score based on matching fears
      let matchScore = 0;
      let matchCount = 0;
      
      for (const fear of activityFears) {
        if (!fear) continue; // Skip null/undefined fears
        
        const matchingFear = fearAssessmentData.fears.find(result => 
          result && typeof result === 'object' && result.category === fear);
        
        if (matchingFear && typeof matchingFear.score === 'number') {
          matchScore += matchingFear.score;
          matchCount++;
        }
      }
      
      return matchCount ? matchScore / matchCount : 0;
    } catch (error) {
      console.error('Error calculating fear profile match:', error);
      return 0;
    }
  }, [fearAssessmentData]);

  // Calculate an overall match score for an activity
  const calculateActivityScore = useCallback((activity: Activity): number => {
    if (!activity) return 0;
    if (!userPreferences) return 0.5; // Return a neutral score if no preferences
    
    try {
      let score = 0;
      const weights = {
        fearMatch: 4,    // Most important - activities that match user's fears
        difficulty: 2,   // Difficulty level matches user's comfort
        location: 1.5,   // Location preference
        time: 1,         // Time commitment
      };
      
      // Calculate individual scores
      const fearScore = getFearProfileMatch(activity);
      
      // Get preference matches - using proper type-safe accessors
      const activityDifficultyLevel = activity.difficultyLevel || 'beginner';
      const preferredDifficulty = userPreferences.preferredDifficulty || userPreferences.maxDifficulty;
      
      const difficultyMatch = activityDifficultyLevel === preferredDifficulty ? 1 : 
        (preferredDifficulty && Math.abs(
          difficultyLevelToNumber(activityDifficultyLevel) - 
          difficultyLevelToNumber(preferredDifficulty)
        ) <= 1) ? 0.5 : 0;
      
      // Location match with safe access
      let locationMatch = 0;
      if (activity.location && Array.isArray(userPreferences.preferredLocations) && userPreferences.preferredLocations.length > 0) {
        locationMatch = userPreferences.preferredLocations.some(loc => 
          loc && activity.location && activity.location.includes(loc)
        ) ? 1 : 0;
      }
      
      // Time commitment match with safe access
      const activityTimeCommitment = activity.timeCommitment || 'half_day';
      const userTimeCommitment = userPreferences.timeCommitment || userPreferences.maxTimeCommitment;
      const timeMatch = activityTimeCommitment === userTimeCommitment ? 1 : 0.5;
      
      // Calculate weighted score
      score = (
        (fearScore * weights.fearMatch) +
        (difficultyMatch * weights.difficulty) +
        (locationMatch * weights.location) +
        (timeMatch * weights.time)
      ) / (weights.fearMatch + weights.difficulty + weights.location + weights.time);
      
      // Normalize score to be between 0 and 1
      return Math.max(0, Math.min(1, score));
    } catch (error) {
      console.error('Error calculating activity score:', error);
      return 0;
    }
  }, [userPreferences, getFearProfileMatch]);

  return (
    <ActivityMatcherContext.Provider
      value={{
        userPreferences,
        matchedActivities,
        filteredActivities,
        isLoading,
        activeFilters,
        searchTerm,
        sortOrder,
        viewMode,
        fearAssessmentData,
        setActiveFilters: (filters) => setActiveFilters({ ...activeFilters, ...filters }),
        setSearchTerm,
        setSortOrder,
        setViewMode,
        refreshUserPreferences
      }}
    >
      {children}
    </ActivityMatcherContext.Provider>
  );
};

// Custom hook to use the context
export const useActivityMatcher = () => {
  const context = useContext(ActivityMatcherContext);
  if (context === undefined) {
    throw new Error('useActivityMatcher must be used within an ActivityMatcherProvider');
  }
  return context;
};
