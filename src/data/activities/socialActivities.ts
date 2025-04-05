import { Activity } from '@/models/ActivityTypes';
import { locations } from './locations';

// Activities related to social anxiety
export const socialActivities: Activity[] = [
  {
    id: "small_group_workshop",
    title: "Small Group Social Skills Workshop",
    description: "Learn and practice social skills in a small, supportive group environment.",
    imageUrl: "https://images.unsplash.com/photo-1515169067868-5387ec356754?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1600&q=80",
    fearCategories: ['social'],
    difficultyLevel: "beginner",
    safety: "Trained facilitators, confidential setting, and supportive group guidelines.",
    costRange: "medium",
    location: "Community center or therapy office",
    locations: [locations.seattle, locations.san_francisco, locations.boulder, locations.new_york],
    timeCommitment: "1-3_hours",
    indoorOutdoor: "indoor",
    minGroupSize: 3,
    maxGroupSize: 8,
    minimumAge: 16,
    physicalDemand: "low",
    weatherDependent: false,
    progression: "networking_event"
  },
  {
    id: "networking_event",
    title: "Guided Networking Event",
    description: "Attend a networking event with pre-event coaching and on-site support.",
    imageUrl: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1600&q=80",
    fearCategories: ['social'],
    difficultyLevel: "intermediate",
    safety: "Pre-event preparation, on-site support person, and structured conversation starters.",
    costRange: "medium",
    location: "Conference center or hotel",
    locations: [locations.seattle, locations.san_francisco, locations.boulder, locations.new_york, locations.chicago],
    timeCommitment: "1-3_hours",
    indoorOutdoor: "indoor",
    minGroupSize: 1,
    maxGroupSize: 3,
    minimumAge: 18,
    physicalDemand: "low",
    weatherDependent: false,
    progression: "public_performance"
  }
];
