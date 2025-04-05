import React from 'react';
import { X } from 'lucide-react';

interface ProfileCompletionIndicatorProps {
  profile: {
    full_name?: string | null;
    avatar_url?: string | null;
    date_of_birth?: string | null;
    key_fears?: string[] | null;
    experience_level?: string | null;
    challenge_intensity?: string | null;
    learning_style?: string | null;
    bio?: string | null;
    location?: string | null;
  };
  onClose?: () => void;
}

const ProfileCompletionIndicator: React.FC<ProfileCompletionIndicatorProps> = ({ profile, onClose }) => {
  // Define required fields and their weights
  const profileFields = [
    { name: 'full_name', weight: 15, label: 'Full Name' },
    { name: 'avatar_url', weight: 10, label: 'Profile Picture' },
    { name: 'date_of_birth', weight: 10, label: 'Date of Birth' },
    { name: 'key_fears', weight: 15, label: 'Key Fears' },
    { name: 'experience_level', weight: 10, label: 'Experience Level' },
    { name: 'challenge_intensity', weight: 10, label: 'Challenge Intensity' },
    { name: 'learning_style', weight: 10, label: 'Learning Style' },
    { name: 'bio', weight: 10, label: 'Bio' },
    { name: 'location', weight: 10, label: 'Location' },
  ];
  
  // Calculate completion percentage
  const calculateCompletionPercentage = () => {
    let completedWeight = 0;
    let totalWeight = 0;
    
    profileFields.forEach((field) => {
      totalWeight += field.weight;
      
      // Check if the field has a value
      const value = profile[field.name as keyof typeof profile];
      if (
        value !== null && 
        value !== undefined && 
        (typeof value !== 'string' || value.trim() !== '') &&
        (!Array.isArray(value) || value.length > 0)
      ) {
        completedWeight += field.weight;
      }
    });
    
    return Math.round((completedWeight / totalWeight) * 100);
  };
  
  const completionPercentage = calculateCompletionPercentage();
  
  // Get the fields that are not yet completed
  const missingFields = profileFields.filter((field) => {
    const value = profile[field.name as keyof typeof profile];
    return (
      value === null || 
      value === undefined || 
      (typeof value === 'string' && value.trim() === '') ||
      (Array.isArray(value) && value.length === 0)
    );
  });
  
  return (
    <div className="bg-white rounded-lg shadow p-4 mb-6 relative">
      {onClose && (
        <button 
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 focus:outline-none"
          aria-label="Close"
        >
          <X size={18} />
        </button>
      )}
      
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-semibold text-gray-800">Profile Completion</h2>
        <span className="text-lg font-bold text-blue-600">{completionPercentage}%</span>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div 
          className="bg-blue-600 h-2.5 rounded-full transition-all duration-500 ease-in-out" 
          style={{ width: `${completionPercentage}%` }}
        ></div>
      </div>
      
      {missingFields.length > 0 && completionPercentage < 100 && (
        <div className="mt-3">
          <p className="text-sm text-gray-600">
            Complete these fields to improve your profile:
          </p>
          <ul className="mt-1 text-sm text-gray-600 grid grid-cols-2 gap-x-2 gap-y-1">
            {missingFields.map((field) => (
              <li key={field.name} className="flex items-center">
                <span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
                {field.label}
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {completionPercentage === 100 && (
        <p className="mt-2 text-sm text-green-600 font-medium">
          Great job! Your profile is complete.
        </p>
      )}
    </div>
  );
};

export default ProfileCompletionIndicator;
