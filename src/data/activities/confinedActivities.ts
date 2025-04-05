import { Activity } from '@/models/ActivityTypes';
import { locations } from './locations';

// Activities related to fear of confined spaces
export const confinedActivities: Activity[] = [
  {
    id: "escape_room_beginner",
    title: "Beginner-Friendly Escape Room",
    description: "Solve puzzles in a spacious escape room with multiple exits and no locked doors.",
    imageUrl: "https://images.unsplash.com/photo-1511882150382-421056c89033?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1600&q=80",
    fearCategories: ['confined'],
    difficultyLevel: "beginner",
    safety: "Multiple exits, staff monitoring, and ability to leave at any time.",
    costRange: "medium",
    location: "Escape room facility",
    locations: [locations.seattle, locations.san_francisco, locations.boulder, locations.new_york, locations.chicago],
    timeCommitment: "1-3_hours",
    indoorOutdoor: "indoor",
    minGroupSize: 2,
    maxGroupSize: 6,
    minimumAge: 12,
    physicalDemand: "low",
    weatherDependent: false,
    progression: "advanced_escape_room"
  }
];
