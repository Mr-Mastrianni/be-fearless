import { Activity } from '@/models/ActivityTypes';
import { heightsActivities } from './heightsActivities';
import { waterActivities } from './waterActivities';
import { socialActivities } from './socialActivities';
import { confinedActivities } from './confinedActivities';
import { locations } from './locations';

// Export all activities in a single array for easy access
export const allActivities: Activity[] = [
  ...heightsActivities,
  ...waterActivities,
  ...socialActivities,
  ...confinedActivities
];

// Export individual category arrays for direct access
export {
  heightsActivities,
  waterActivities,
  socialActivities,
  confinedActivities,
  locations
};

// Activity difficulty level display helpers
export const difficultyLabels = {
  beginner: "Beginner",
  easy: "Easy",
  moderate: "Moderate",
  challenging: "Challenging",
  difficult: "Difficult"
};

export const difficultyColors = {
  beginner: "bg-green-100 text-green-800",
  easy: "bg-blue-100 text-blue-800",
  moderate: "bg-yellow-100 text-yellow-800",
  challenging: "bg-orange-100 text-orange-800",
  difficult: "bg-red-100 text-red-800"
};

// Cost level display helpers
export const costLabels = {
  free: "Free",
  low: "$",
  medium: "$$",
  high: "$$$",
  premium: "$$$$"
};

// Time commitment display helpers
export const timeCommitmentLabels = {
  under_1_hour: "Under 1 hour",
  "1-3_hours": "1-3 hours",
  half_day: "Half day",
  full_day: "Full day",
  multi_day: "Multiple days"
};

// Helper functions for filtering activities
export const filterActivitiesByFearCategory = (activities: Activity[], fearCategory: string): Activity[] => {
  return activities.filter(activity => 
    activity.fearCategories.includes(fearCategory as any)
  );
};

export const filterActivitiesByMaxDifficulty = (activities: Activity[], maxDifficulty: string): Activity[] => {
  const difficultyLevels = ['beginner', 'easy', 'moderate', 'challenging', 'difficult'];
  const maxIndex = difficultyLevels.indexOf(maxDifficulty);
  
  return activities.filter(activity => {
    const activityIndex = difficultyLevels.indexOf(activity.difficultyLevel);
    return activityIndex <= maxIndex;
  });
};

export const filterActivitiesByLocation = (activities: Activity[], locationIds: string[]): Activity[] => {
  return activities.filter(activity => 
    activity.locations.some(location => locationIds.includes(location.id))
  );
};

// Filter activities by maximum cost
export const filterActivitiesByMaxCost = (activities: Activity[], maxCost: string): Activity[] => {
  const costLevels = ['free', 'low', 'medium', 'high', 'premium'];
  const maxIndex = costLevels.indexOf(maxCost);
  
  return activities.filter(activity => {
    const activityIndex = costLevels.indexOf(activity.costRange);
    return activityIndex <= maxIndex;
  });
};

// Filter activities by maximum time commitment
export const filterActivitiesByMaxTimeCommitment = (activities: Activity[], maxTimeCommitment: string): Activity[] => {
  const timeCommitmentLevels = ['under_1_hour', '1-3_hours', 'half_day', 'full_day', 'multi_day'];
  const maxIndex = timeCommitmentLevels.indexOf(maxTimeCommitment);
  
  return activities.filter(activity => {
    const activityIndex = timeCommitmentLevels.indexOf(activity.timeCommitment);
    return activityIndex <= maxIndex;
  });
};

// Filter activities by indoor/outdoor preference
export const filterActivitiesByEnvironment = (activities: Activity[], preference: 'indoor' | 'outdoor' | 'both'): Activity[] => {
  if (preference === 'both') {
    return activities;
  }
  
  return activities.filter(activity => {
    if (preference === 'indoor') {
      return activity.indoorOutdoor === 'indoor';
    } else {
      return activity.indoorOutdoor === 'outdoor';
    }
  });
};

// Search activities by text
export const searchActivitiesByText = (activities: Activity[], searchTerm: string): Activity[] => {
  if (!searchTerm || searchTerm.trim() === '') {
    return activities;
  }
  
  const normalizedSearchTerm = searchTerm.toLowerCase().trim();
  
  return activities.filter(activity => {
    return (
      activity.title.toLowerCase().includes(normalizedSearchTerm) ||
      activity.description.toLowerCase().includes(normalizedSearchTerm) ||
      activity.fearCategories.some(cat => cat.toLowerCase().includes(normalizedSearchTerm)) ||
      activity.locations.some(loc => loc.name.toLowerCase().includes(normalizedSearchTerm))
    );
  });
};

// Sort activities
export const sortActivities = (activities: Activity[], sortOrder: string): Activity[] => {
  const sorted = [...activities];
  
  switch (sortOrder) {
    case 'alphabetical':
      return sorted.sort((a, b) => a.title.localeCompare(b.title));
    case 'difficulty_asc':
      return sorted.sort((a, b) => {
        const difficultyLevels = ['beginner', 'easy', 'moderate', 'challenging', 'difficult'];
        return difficultyLevels.indexOf(a.difficultyLevel) - difficultyLevels.indexOf(b.difficultyLevel);
      });
    case 'difficulty_desc':
      return sorted.sort((a, b) => {
        const difficultyLevels = ['beginner', 'easy', 'moderate', 'challenging', 'difficult'];
        return difficultyLevels.indexOf(b.difficultyLevel) - difficultyLevels.indexOf(a.difficultyLevel);
      });
    case 'recommended':
    default:
      // Default sorting (could be based on user preferences in the future)
      return sorted;
  }
};
