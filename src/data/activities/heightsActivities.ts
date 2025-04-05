import { Activity } from '@/models/ActivityTypes';
import { locations } from './locations';

// Activities related to fear of heights
export const heightsActivities: Activity[] = [
  {
    id: "beginner_rock_climbing",
    title: "Indoor Rock Climbing (Beginner)",
    description: "Start with low walls and expert guidance in a controlled indoor environment.",
    imageUrl: "docs/pexels-cottonbro-6689613.jpg",
    fearCategories: ['heights'],
    difficultyLevel: "beginner",
    safety: "Complete harness system, crash pads, and certified instructors ensure maximum safety.",
    costRange: "low",
    location: "Indoor climbing gym",
    locations: [locations.boulder, locations.seattle, locations.san_francisco],
    timeCommitment: "1-3_hours",
    indoorOutdoor: "indoor",
    minGroupSize: 1,
    maxGroupSize: 10,
    minimumAge: 8,
    physicalDemand: "moderate",
    weatherDependent: false,
    progression: "zip_lining"
  },
  {
    id: "zip_lining",
    title: "Beginner Zip Lining",
    description: "Glide through the air on cables stretched between points of different heights in a controlled environment.",
    imageUrl: "docs/zipline.jpg",
    fearCategories: ['heights'],
    difficultyLevel: "easy",
    safety: "Double-clipped safety lines, professional guides, and comprehensive safety briefing.",
    costRange: "medium",
    location: "Zip line course",
    locations: [locations.costa_rica, locations.vancouver, locations.boulder],
    timeCommitment: "half_day",
    indoorOutdoor: "outdoor",
    minGroupSize: 2,
    maxGroupSize: 12,
    minimumAge: 10,
    physicalDemand: "low",
    weatherDependent: true,
    seasonalAvailability: ["spring", "summer", "fall"],
    progression: "rope_swings"
  },
  {
    id: "rope_swings",
    title: "Canyon Rope Swing",
    description: "Swing from towering heights over canyons or valleys with professional equipment and guidance.",
    imageUrl: "docs/ropse-swing.jpg",
    fearCategories: ['heights'],
    difficultyLevel: "moderate",
    safety: "Multiple attachment points, redundant systems, and supervision by experienced adventure specialists.",
    costRange: "medium",
    location: "Canyon or valley",
    locations: [locations.moab, locations.grand_canyon],
    timeCommitment: "half_day",
    indoorOutdoor: "outdoor",
    minGroupSize: 2,
    maxGroupSize: 8,
    minimumAge: 14,
    physicalDemand: "moderate",
    weatherDependent: true,
    seasonalAvailability: ["spring", "summer", "fall"],
    progression: "bungee_jumping"
  },
  {
    id: "bungee_jumping",
    title: "Bungee Jumping",
    description: "Take a leap of faith from great heights with nothing but a bungee cord to catch you.",
    imageUrl: "https://images.pexels.com/photos/26811613/pexels-photo-26811613/free-photo-of-man-jumping-bungee.jpeg?auto=compress&cs=tinysrgb&w=800",
    alternateImageUrl: "https://images.unsplash.com/photo-1544637784-a0d8166f82b5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1600&q=80",
    fearCategories: ['heights'],
    difficultyLevel: "challenging",
    safety: "Professional equipment tested to withstand 10 times your weight, comprehensive medical checks, and professional supervision.",
    costRange: "high",
    location: "Bungee platform",
    locations: [locations.new_zealand, locations.interlaken],
    timeCommitment: "half_day",
    indoorOutdoor: "outdoor",
    minGroupSize: 2,
    maxGroupSize: 8,
    minimumAge: 18,
    physicalDemand: "high",
    weatherDependent: true,
    seasonalAvailability: ["spring", "summer", "fall"],
    progression: "hang_gliding"
  },
  {
    id: "hang_gliding",
    title: "Tandem Hang Gliding",
    description: "Soar like a bird and experience the freedom of unpowered flight with an experienced pilot.",
    imageUrl: "https://images.pexels.com/photos/9532461/pexels-photo-9532461.jpeg?auto=compress&cs=tinysrgb&w=800",
    alternateImageUrl: "https://images.unsplash.com/photo-1552673490-cf08bf9c2bdc?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1600&q=80",
    fearCategories: ['heights'],
    difficultyLevel: "challenging",
    safety: "Tandem flights with experienced pilots, modern gliders with redundant safety systems, and full certification.",
    costRange: "high",
    location: "Mountain launch site",
    locations: [locations.interlaken, locations.new_zealand, locations.yosemite],
    timeCommitment: "half_day",
    indoorOutdoor: "outdoor",
    minGroupSize: 1,
    maxGroupSize: 4,
    minimumAge: 16,
    physicalDemand: "moderate",
    weatherDependent: true,
    seasonalAvailability: ["spring", "summer", "fall"],
    progression: "outdoor_rock_climbing"
  },
  {
    id: "outdoor_rock_climbing",
    title: "Outdoor Rock Climbing",
    description: "Scale natural rock formations and push your mental and physical limits with professional guidance.",
    imageUrl: "https://images.unsplash.com/photo-1522079803432-e0b7649dc1de?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1600&q=80",
    fearCategories: ['heights'],
    difficultyLevel: "challenging",
    safety: "Professional guide, redundant safety systems, and pre-planned routes.",
    costRange: "high",
    location: "Natural rock formations",
    locations: [locations.yosemite, locations.boulder, locations.moab],
    timeCommitment: "full_day",
    indoorOutdoor: "outdoor",
    minGroupSize: 2,
    maxGroupSize: 4,
    minimumAge: 16,
    physicalDemand: "high",
    weatherDependent: true,
    seasonalAvailability: ["spring", "summer", "fall"],
    progression: "tandem_base_jumping"
  },
  {
    id: "tandem_base_jumping",
    title: "Tandem Base Jumping",
    description: "Experience the thrill of jumping from fixed objects with a parachute while securely attached to an expert.",
    imageUrl: "https://images.pexels.com/photos/11049262/pexels-photo-11049262.jpeg?auto=compress&cs=tinysrgb&w=800",
    alternateImageUrl: "https://images.unsplash.com/photo-1552938514-d1e514d0de4b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1600&q=80",
    fearCategories: ['heights'],
    difficultyLevel: "difficult",
    safety: "Tandem jumps with world-class base jumpers having 500+ jumps, modern equipment with redundant systems, and comprehensive safety briefing.",
    costRange: "premium",
    location: "Base jumping site",
    locations: [locations.moab, locations.new_zealand],
    timeCommitment: "full_day",
    indoorOutdoor: "outdoor",
    minGroupSize: 1,
    maxGroupSize: 3,
    minimumAge: 18,
    physicalDemand: "high",
    weatherDependent: true,
    seasonalAvailability: ["summer"],
    progression: "wing_walking"
  },
  {
    id: "wing_walking",
    title: "Wing Walking Experience",
    description: "Stand and walk on the wings of a flying biplane for the ultimate height challenge.",
    imageUrl: "https://images.pexels.com/photos/30871452/pexels-photo-30871452/free-photo-of-airplane-wing-view-at-sunset.jpeg?auto=compress&cs=tinysrgb&w=800",
    alternateImageUrl: "https://images.unsplash.com/photo-1600337958117-55efa5aaee4f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1600&q=80",
    fearCategories: ['heights'],
    difficultyLevel: "difficult",
    safety: "Professional harness system, experienced pilots, comprehensive safety briefing, and strict weather protocols.",
    costRange: "premium",
    location: "Airfield",
    locations: [locations.san_francisco, locations.new_zealand],
    timeCommitment: "half_day",
    indoorOutdoor: "outdoor",
    minGroupSize: 1,
    maxGroupSize: 3,
    minimumAge: 18,
    physicalDemand: "high",
    weatherDependent: true,
    seasonalAvailability: ["spring", "summer"],
    progression: ""
  }
];
