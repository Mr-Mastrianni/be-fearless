// Activity type definitions for the Courage Bot Adventure app

export type FearCategory = 'heights' | 'water' | 'social' | 'confined' | 'extreme_sports';

export type DifficultyLevel = 'beginner' | 'easy' | 'moderate' | 'challenging' | 'difficult';

export type CostRange = 'free' | 'low' | 'medium' | 'high' | 'premium';

// Location type with coordinates to allow for distance calculation
export interface Location {
  id: string;
  name: string;
  city?: string;
  state?: string;
  country: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

// Time commitment for activities
export type TimeCommitment = 'under_1_hour' | '1-3_hours' | 'half_day' | 'full_day' | 'multi_day';

// Activity model with all relevant properties
export interface Activity {
  id: string;
  title: string;
  description: string;
  image?: string;
  imageUrl?: string;
  alternateImageUrl?: string;
  fearCategories: FearCategory[]; // Multiple fear categories may apply
  difficultyLevel: DifficultyLevel;
  safety?: string;
  costRange: CostRange;
  location: string;
  locations?: Location[]; // Where this activity can be done
  timeCommitment: TimeCommitment;
  indoorOutdoor: 'indoor' | 'outdoor' | 'both';
  minGroupSize?: number;
  maxGroupSize?: number;
  minimumAge?: number;
  physicalDemand?: 'low' | 'moderate' | 'high';
  weatherDependent?: boolean;
  seasonalAvailability?: string[];
  progression?: string; // Next level activity for this fear
  matchScore?: number; // Score indicating how well the activity matches the user's profile (0-1)
}

// User preferences that affect activity matching
export interface ActivityPreferences {
  fearCategories: FearCategory[];
  maxDifficulty: DifficultyLevel;
  preferredDifficulty?: DifficultyLevel;
  maxCost: CostRange;
  costRange?: CostRange;
  preferredLocations?: string[]; // Location IDs
  maxDistance?: number; // Max distance in miles/km
  maxTimeCommitment: TimeCommitment;
  timeCommitment?: TimeCommitment;
  indoorOutdoorPreference: 'indoor' | 'outdoor' | 'both';
  groupSizePreference?: 'solo' | 'small' | 'medium' | 'large';
  physicalLimitations?: string[];
}

// Match score result
export interface ActivityMatch {
  activity: Activity;
  matchScore: number; // 0-100 score indicating how well the activity matches preferences
  matchReasons: string[]; // Array of reasons why this activity was matched
}

// Fear assessment data
export interface FearAssessmentData {
  user_id: string;
  timestamp: string;
  results: Array<{
    fear: FearCategory;
    score: number;
    notes?: string;
    count?: number;
  }>;
  totalScore?: number;
  completionDate?: string;
}
