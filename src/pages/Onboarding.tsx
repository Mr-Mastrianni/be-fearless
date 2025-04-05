import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import DatabaseSchemaAlert from '@/components/DatabaseSchemaAlert';
import { supabase } from '@/lib/supabase';
import { syncUserToAirtable } from '@/lib/airtable-sync';

// Import refactored components
import {
  WelcomeStep,
  BasicInfoStep,
  CourageProfileStep,
  LearningDetailsStep,
  CompletionStep
} from '@/components/onboarding/OnboardingSteps';
import OnboardingFearAssessment from '@/components/onboarding/OnboardingFearAssessment';

const Onboarding: React.FC = () => {
  const { user, updateProfile, getUserProfile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Profile state
  const [fullName, setFullName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState<string | null>(null);
  const [location, setLocation] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [keyFears, setKeyFears] = useState<string[]>([]);
  const [experienceLevel, setExperienceLevel] = useState<string | null>(null);
  const [challengeIntensity, setChallengeIntensity] = useState<string | null>(null);
  const [learningStyle, setLearningStyle] = useState<string | null>(null);
  const [bio, setBio] = useState('');
  const [fearAssessmentResults, setFearAssessmentResults] = useState<any[]>([]);
  
  useEffect(() => {
    // Check if we already have user data
    const checkUserProfile = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        console.log('Fetching user profile on onboarding page load...');
        const { data, error } = await getUserProfile();
        
        if (error) {
          console.error('Error fetching profile:', error);
          return;
        }
        
        console.log('Profile data loaded:', data);
        
        // Pre-populate fields from existing profile data
        if (data) {
          if (data.full_name) setFullName(data.full_name);
          if (data.date_of_birth) setDateOfBirth(data.date_of_birth);
          if (data.key_fears && Array.isArray(data.key_fears)) setKeyFears(data.key_fears);
          if (data.experience_level) setExperienceLevel(data.experience_level);
          if (data.challenge_intensity) setChallengeIntensity(data.challenge_intensity);
          if (data.learning_style) setLearningStyle(data.learning_style);
          if (data.bio) setBio(data.bio);
          if (data.location) setLocation(data.location);
          if (data.phone_number) setPhoneNumber(data.phone_number);
          
          // If profile is already marked as complete, redirect to dashboard
          if (data.profile_completed) {
            console.log('Profile already completed, redirecting to dashboard...');
            toast({
              title: "Profile already set up",
              description: "You're all set! Redirecting to your dashboard."
            });
            navigate('/dashboard');
          }
        }
      } catch (err) {
        console.error('Error in profile check:', err);
      } finally {
        setLoading(false);
      }
    };
    
    checkUserProfile();
  }, [user, getUserProfile, navigate, toast]);
  
  // Handle fear assessment completion
  const handleFearAssessmentComplete = (results: any[]) => {
    console.log('Fear assessment completed with results:', results);
    setFearAssessmentResults(results);
    
    // Extract fear categories for the profile
    const topFearCategories = results.slice(0, 3).map(fear => fear.fear);
    setKeyFears(topFearCategories);
    
    // Move to the completion step
    setCurrentStep(currentStep + 1);
  };
  
  const steps = [
    {
      title: "Welcome to Be Courageous",
      description: "Let's set up your profile to personalize your courage journey",
      component: <WelcomeStep />,
      isValid: () => true, // Always valid to proceed
    },
    {
      title: "Basic Information",
      description: "Tell us who you are",
      component: (
        <BasicInfoStep
          fullName={fullName}
          setFullName={setFullName}
          dateOfBirth={dateOfBirth}
          setDateOfBirth={setDateOfBirth}
          location={location}
          setLocation={setLocation}
          phoneNumber={phoneNumber}
          setPhoneNumber={setPhoneNumber}
        />
      ),
      isValid: () => !!fullName.trim(), // Must have at least a name
    },
    {
      title: "Your Courage Profile",
      description: "Tell us about your fears and preferences",
      component: (
        <CourageProfileStep
          keyFears={keyFears}
          setKeyFears={setKeyFears}
          experienceLevel={experienceLevel}
          setExperienceLevel={setExperienceLevel}
          challengeIntensity={challengeIntensity}
          setChallengeIntensity={setChallengeIntensity}
        />
      ),
      isValid: () => !!experienceLevel, // Must select experience level (fears will be set by assessment)
    },
    {
      title: "Learning & Final Details",
      description: "Almost done! Tell us how you learn best",
      component: (
        <LearningDetailsStep
          learningStyle={learningStyle}
          setLearningStyle={setLearningStyle}
          bio={bio}
          setBio={setBio}
        />
      ),
      isValid: () => true, // These fields are optional
    },
    {
      title: "Fear Assessment",
      description: "Let's understand your fears better to personalize your journey",
      component: (
        <OnboardingFearAssessment onComplete={handleFearAssessmentComplete} />
      ),
      isValid: () => true, // Will be handled by the assessment component
    },
    {
      title: "Ready to Start Your Journey",
      description: "You're all set to begin your courage journey!",
      component: <CompletionStep />,
      isValid: () => true, // Always valid
    },
  ];
  
  const handleNext = () => {
    if (currentStep === steps.length - 1) {
      handleFinish();
    } else if (steps[currentStep].isValid()) {
      // Special case for fear assessment step - the component handles its own navigation
      if (currentStep === 4) {
        // This is handled by the onComplete callback in the assessment component
        return;
      }
      setCurrentStep(currentStep + 1);
    } else {
      setError('Please complete all required fields before proceeding.');
    }
  };
  
  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setError(null);
    }
  };
  
  const handleFinish = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Starting profile save...');
      
      // Prepare fear assessment data
      const fearAssessmentData = fearAssessmentResults.length > 0 
        ? {
            timestamp: new Date().toISOString(),
            results: fearAssessmentResults
          }
        : null;
      
      const profileData = {
        full_name: fullName.trim(),
        date_of_birth: dateOfBirth,
        key_fears: keyFears,
        experience_level: experienceLevel,
        challenge_intensity: challengeIntensity,
        learning_style: learningStyle,
        bio: bio.trim() || null,
        location: location.trim() || null,
        phone_number: phoneNumber.trim() || null,
        fear_assessment_results: fearAssessmentData,
        last_assessment: fearAssessmentData ? new Date().toISOString() : null
      };
      
      console.log('Profile data to save:', profileData);
      
      // Make sure we have a valid name
      if (!fullName.trim()) {
        setError('Full name is required');
        setLoading(false);
        return;
      }
      
      console.log('Calling updateProfile...');
      console.log('Setting profile_completed = true');
      // Explicitly set profile as completed during the onboarding process
      // First check if user is logged in
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('No user found during profile update');
        setError('You must be logged in to complete onboarding. Please log in again.');
        setLoading(false);
        setTimeout(() => navigate('/login'), 2000);
        return;
      }
      
      const { success, error } = await updateProfile(profileData, true);
      
      console.log('updateProfile result:', { success, error });
      
      if (success) {
        console.log('Profile updated successfully!');
        console.log('Profile should now be marked as completed');
        
        // Sync user data to Airtable with better error handling
        console.log('Syncing user data to Airtable...');
        let airtableSuccess = false;
        
        try {
          // Make sure we have the most current user
          const { data: { user: currentUser } } = await supabase.auth.getUser();
          
          if (!currentUser) {
            console.error('User not found for Airtable sync');
            throw new Error('User not found for Airtable sync');
          }
          
          // Use timeout to prevent hanging if Airtable sync takes too long
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Airtable sync timed out')), 15000)
          );
          
          // Try to sync with timeout
          const airtableSyncPromise = syncUserToAirtable(currentUser.id);
          const airtableResult = await Promise.race([airtableSyncPromise, timeoutPromise]) as {
            success: boolean;
            data?: any;
            error?: string;
          };
          
          if (airtableResult.success) {
            console.log('Airtable sync successful!', airtableResult.data);
            airtableSuccess = true;
          } else {
            console.error('Airtable sync failed:', airtableResult.error);
            // We'll continue despite failure, but show a toast notification
          }
        } catch (syncError) {
          console.error('Error syncing to Airtable:', syncError);
          // Continue despite error
        }
        
        // Force a small delay to ensure database consistency before redirect
        setTimeout(() => {
          toast({
            title: "Onboarding completed!",
            description: airtableSuccess 
              ? "Your profile has been set up successfully and synced to our systems."
              : "Your profile has been set up successfully. Data sync is pending."
          });
          
          // Show additional toast for Airtable sync status if it failed
          if (!airtableSuccess) {
            toast({
              title: "Note about data sync",
              description: "Your data will be synced to our analytics system later. This doesn't affect your ability to use the app.",
              variant: "default"
            });
          }
          
          // Redirect to dashboard
          console.log('Redirecting to dashboard...');
          navigate('/dashboard');
        }, 1000);
      } else {
        // Check for specific error messages
        if (error && error.includes('column "date_of_birth" does not exist')) {
          setError('Database schema needs to be updated. Please apply the schema changes in update_schema.sql.');
          console.error('Database schema error - date_of_birth column missing:', error);
        } else if (error && error.includes('column "age_range" does not exist')) {
          setError('Database schema has been partially updated. Please complete the schema changes.');
          console.error('Database schema error - age_range column referenced but removed:', error);
        } else {
          setError(`Failed to save your profile: ${error || 'Unknown error'}`);
          console.error('Profile save error:', error);
        }
      }
    } catch (err: any) {
      console.error('Error saving profile:', err);
      // Provide more detailed error message if available
      const errorMessage = err?.message || 'Unknown error occurred';
      setError(`Failed to save your profile: ${errorMessage}. Please try again.`);
      
      // Log additional details for debugging
      if (err?.code) {
        console.error('Error code:', err.code);
      }
      if (err?.details) {
        console.error('Error details:', err.details);
      }
    } finally {
      setLoading(false);
    }
  };
  
  const currentStepData = steps[currentStep];
  const progress = ((currentStep) / (steps.length - 1)) * 100;
  
  if (loading && currentStep === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  return (
    <div className="max-w-2xl mx-auto p-6 my-8">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Progress bar */}
        <div className="w-full bg-gray-200 h-2">
          <div 
            className="bg-blue-600 h-2 transition-all duration-300 ease-in-out" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        
        <div className="p-6">
          {/* Step header */}
          <div className="mb-6">
            <h1 className="text-xl font-bold text-gray-800">{currentStepData.title}</h1>
            <p className="text-gray-600 mt-1">{currentStepData.description}</p>
          </div>
          
          {/* Error message */}
          {error && (
            <div className="p-3 mb-4 bg-red-100 text-red-700 rounded">
              {error}
              <DatabaseSchemaAlert errorMessage={error} />
            </div>
          )}
          
          {/* Step content */}
          <div className="my-6">
            {currentStepData.component}
          </div>
          
          {/* Navigation buttons - Hide for fear assessment step */}
          {currentStep !== 4 && (
            <div className="flex justify-between mt-8">
              <button
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className={`flex items-center px-4 py-2 rounded ${
                  currentStep === 0 
                    ? 'opacity-50 cursor-not-allowed bg-gray-200 text-gray-500' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <ArrowLeft size={16} className="mr-2" />
                Back
              </button>
              
              <button
                onClick={handleNext}
                disabled={loading}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center">
                    <span className="animate-spin h-4 w-4 mr-2 border-t-2 border-b-2 border-white rounded-full"></span>
                    Processing...
                  </span>
                ) : (
                  <>
                    {currentStep === steps.length - 1 ? 'Finish' : 'Next'}
                    {currentStep !== steps.length - 1 && <ArrowRight size={16} className="ml-2" />}
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
