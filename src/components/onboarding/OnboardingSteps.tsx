import React from 'react';
import { CheckCircle, Calendar } from 'lucide-react';
import FearTagSelector from '../FearTagSelector';

// Step data constants
export const experienceLevels = [
  { value: 'beginner', label: 'Beginner - I\'m just starting my courage journey' },
  { value: 'intermediate', label: 'Intermediate - I\'ve faced some fears before' },
  { value: 'advanced', label: 'Advanced - I regularly push my comfort zone' },
  { value: 'expert', label: 'Expert - I help others overcome their fears' },
];

export const challengeIntensities = [
  { value: 'gentle', label: 'Gentle - Small, manageable steps' },
  { value: 'moderate', label: 'Moderate - Balanced challenges' },
  { value: 'intense', label: 'Intense - Push me out of my comfort zone' },
  { value: 'extreme', label: 'Extreme - Test my limits' },
];

export const learningStyles = [
  { value: 'visual', label: 'Visual - I learn best by seeing' },
  { value: 'auditory', label: 'Auditory - I learn best by hearing' },
  { value: 'reading', label: 'Reading - I learn best by reading' },
  { value: 'kinesthetic', label: 'Kinesthetic - I learn best by doing' },
];

// Welcome Step
export const WelcomeStep: React.FC = () => (
  <div className="space-y-6 text-center">
    <div className="bg-blue-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto">
      <CheckCircle className="w-10 h-10 text-blue-600" />
    </div>
    <h2 className="text-xl font-semibold">Welcome to Be Courageous!</h2>
    <p className="text-gray-600">
      We're excited to help you face your fears and grow your courage.
      Let's set up your profile in a few easy steps.
    </p>
  </div>
);

// Basic Information Step
interface BasicInfoStepProps {
  fullName: string;
  setFullName: (value: string) => void;
  dateOfBirth: string | null;
  setDateOfBirth: (value: string | null) => void;
  location: string;
  setLocation: (value: string) => void;
  phoneNumber: string;
  setPhoneNumber: (value: string) => void;
}

export const BasicInfoStep: React.FC<BasicInfoStepProps> = ({
  fullName,
  setFullName,
  dateOfBirth,
  setDateOfBirth,
  location,
  setLocation,
  phoneNumber,
  setPhoneNumber
}) => (
  <div className="space-y-6">
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
      <input
        type="text"
        id="fullName"
        name="fullName"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 text-gray-900"
        placeholder="Enter your full name"
      />
    </div>
    
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
      <div className="relative">
        <input
          type="date"
          id="dateOfBirth"
          name="dateOfBirth"
          value={dateOfBirth || ''}
          onChange={(e) => setDateOfBirth(e.target.value || null)}
          className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 text-gray-900"
          max={new Date().toISOString().split('T')[0]} // Prevent future dates
        />
        <Calendar className="absolute right-3 top-2.5 h-5 w-5 text-gray-400 pointer-events-none" />
      </div>
      <p className="mt-1 text-xs text-gray-500">
        Your date of birth helps us personalize your experience
      </p>
    </div>
    
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
      <input
        type="text"
        id="location"
        name="location"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 text-gray-900"
        placeholder="City, Country"
      />
    </div>
    
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
      <input
        type="tel"
        id="phoneNumber"
        name="phoneNumber"
        value={phoneNumber}
        onChange={(e) => setPhoneNumber(e.target.value)}
        className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 text-gray-900"
        placeholder="(123) 456-7890"
      />
      <p className="mt-1 text-xs text-gray-500">
        Your phone number will help us contact you for personalized support
      </p>
    </div>
  </div>
);

// Courage Profile Step
interface CourageProfileStepProps {
  keyFears: string[];
  setKeyFears: (value: string[]) => void;
  experienceLevel: string | null;
  setExperienceLevel: (value: string | null) => void;
  challengeIntensity: string | null;
  setChallengeIntensity: (value: string | null) => void;
}

export const CourageProfileStep: React.FC<CourageProfileStepProps> = ({
  keyFears,
  setKeyFears,
  experienceLevel,
  setExperienceLevel,
  challengeIntensity,
  setChallengeIntensity
}) => (
  <div className="space-y-6">
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Key Fears *</label>
      <FearTagSelector
        selectedFears={keyFears}
        onChange={setKeyFears}
      />
      <p className="mt-1 text-xs text-gray-500">
        Select or enter fears you want to overcome
      </p>
    </div>
    
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Experience Level *</label>
      <select
        id="experienceLevel"
        name="experienceLevel"
        value={experienceLevel || ''}
        onChange={(e) => setExperienceLevel(e.target.value || null)}
        className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 text-gray-900"
      >
        <option value="">Select your experience level</option>
        {experienceLevels.map((level) => (
          <option key={level.value} value={level.value}>
            {level.label}
          </option>
        ))}
      </select>
    </div>
    
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Challenge Intensity Preference</label>
      <select
        id="challengeIntensity"
        name="challengeIntensity"
        value={challengeIntensity || ''}
        onChange={(e) => setChallengeIntensity(e.target.value || null)}
        className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 text-gray-900"
      >
        <option value="">Select challenge intensity</option>
        {challengeIntensities.map((intensity) => (
          <option key={intensity.value} value={intensity.value}>
            {intensity.label}
          </option>
        ))}
      </select>
    </div>
  </div>
);

// Learning & Final Details Step
interface LearningDetailsStepProps {
  learningStyle: string | null;
  setLearningStyle: (value: string | null) => void;
  bio: string;
  setBio: (value: string) => void;
}

export const LearningDetailsStep: React.FC<LearningDetailsStepProps> = ({
  learningStyle,
  setLearningStyle,
  bio,
  setBio
}) => (
  <div className="space-y-6">
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Learning Style</label>
      <select
        id="learningStyle"
        name="learningStyle"
        value={learningStyle || ''}
        onChange={(e) => setLearningStyle(e.target.value || null)}
        className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 text-gray-900"
      >
        <option value="">Select your learning style</option>
        {learningStyles.map((style) => (
          <option key={style.value} value={style.value}>
            {style.label}
          </option>
        ))}
      </select>
    </div>
    
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
      <textarea
        id="bio"
        name="bio"
        value={bio}
        onChange={(e) => setBio(e.target.value)}
        className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 text-gray-900"
        placeholder="Tell us a bit about yourself and why you want to build courage"
        rows={4}
      ></textarea>
    </div>
  </div>
);

// Completion Step
export const CompletionStep: React.FC = () => (
  <div className="space-y-6 text-center">
    <div className="bg-green-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto">
      <CheckCircle className="w-10 h-10 text-green-600" />
    </div>
    <h2 className="text-xl font-semibold">Profile Completed!</h2>
    <p className="text-gray-600">
      Thanks for completing your profile. You're now ready to start your journey to becoming more courageous.
    </p>
    <p className="text-gray-600 mt-4">
      Click "Finish" to go to your personalized dashboard.
    </p>
  </div>
);
