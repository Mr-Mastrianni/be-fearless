import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { DifficultyLevel } from "@/models/ActivityTypes"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Returns a Tailwind CSS color class based on difficulty level
 * @param difficulty The difficulty level of an activity
 * @returns A Tailwind CSS color class string
 */
export function getColorForDifficulty(difficulty: DifficultyLevel | undefined): string {
  if (!difficulty) return "text-gray-500";
  
  switch (difficulty) {
    case "beginner":
      return "text-green-500";
    case "easy":
      return "text-blue-500";
    case "moderate":
      return "text-yellow-500";
    case "challenging":
      return "text-orange-500";
    case "difficult":
      return "text-red-500";
    default:
      return "text-gray-500";
  }
}

/**
 * Extracts initials from a person's full name
 * @param name The full name to extract initials from
 * @returns A string containing the initials (max 2 characters)
 */
export function getInitials(name: string): string {
  if (!name || typeof name !== 'string') return 'U';
  
  const names = name.trim().split(' ');
  if (names.length === 0) return 'U';
  
  if (names.length === 1) {
    return names[0].charAt(0).toUpperCase();
  }
  
  return `${names[0].charAt(0)}${names[names.length - 1].charAt(0)}`.toUpperCase();
}
