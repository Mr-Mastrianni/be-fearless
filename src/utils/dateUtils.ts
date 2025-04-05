/**
 * Utility functions for working with dates in the application
 */

/**
 * Calculate age from date of birth
 * @param dateOfBirth Date of birth as string in YYYY-MM-DD format
 * @returns Age as a number or null if invalid date
 */
export const calculateAge = (dateOfBirth: string | null): number | null => {
  if (!dateOfBirth) return null;
  
  try {
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    
    // Check if date is valid
    if (isNaN(birthDate.getTime())) return null;
    
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();
    
    // Adjust age if birthday hasn't occurred yet this year
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  } catch (error) {
    console.error('Error calculating age:', error);
    return null;
  }
};

/**
 * Convert date of birth to age range category
 * @param dateOfBirth Date of birth as string in YYYY-MM-DD format
 * @returns Age range category or null if invalid date
 */
export const getAgeRangeFromDob = (dateOfBirth: string | null): string | null => {
  const age = calculateAge(dateOfBirth);
  if (age === null) return null;
  
  if (age < 18) return 'under18';
  if (age <= 24) return '18-24';
  if (age <= 34) return '25-34';
  if (age <= 44) return '35-44';
  if (age <= 54) return '45-54';
  if (age <= 64) return '55-64';
  return '65+';
};

/**
 * Format date of birth for display
 * @param dateOfBirth Date of birth as string in YYYY-MM-DD format
 * @param format Format to use (default: 'long')
 * @returns Formatted date string or empty string if invalid
 */
export const formatDateOfBirth = (
  dateOfBirth: string | null, 
  format: 'short' | 'medium' | 'long' = 'long'
): string => {
  if (!dateOfBirth) return '';
  
  try {
    const date = new Date(dateOfBirth);
    
    // Check if date is valid
    if (isNaN(date.getTime())) return '';
    
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: format === 'short' ? '2-digit' : format === 'medium' ? 'short' : 'long',
      day: 'numeric'
    };
    
    return new Intl.DateTimeFormat('en-US', options).format(date);
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
};

/**
 * Validate date of birth
 * @param dateOfBirth Date of birth as string in YYYY-MM-DD format
 * @returns True if valid date and not in future
 */
export const isValidDateOfBirth = (dateOfBirth: string | null): boolean => {
  if (!dateOfBirth) return false;
  
  try {
    const date = new Date(dateOfBirth);
    const today = new Date();
    
    // Check if date is valid and not in future
    return !isNaN(date.getTime()) && date <= today;
  } catch {
    return false;
  }
};
