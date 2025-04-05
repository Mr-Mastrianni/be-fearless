import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

interface ProfileCompletionCheckProps {
  children: React.ReactNode;
  redirectTo?: string;
}

/**
 * Component that checks if a user's profile is complete
 * If not, it redirects them to the onboarding flow
 */
const ProfileCompletionCheck: React.FC<ProfileCompletionCheckProps> = ({ 
  children, 
  redirectTo = '/onboarding' 
}) => {
  const { user, getUserProfile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profileComplete, setProfileComplete] = useState(false);

  useEffect(() => {
    const checkProfileCompletion = async () => {
      if (!user) return;

      try {
        console.log('Checking profile completion for user:', user.id);
        
        // Add timeout for profile check - reduced for better performance
        const profilePromise = getUserProfile();
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Profile completion check timed out')), 5000); // Reduced timeout
        });
        
        // Race the promises
        const { data, error } = await Promise.race([
          profilePromise,
          timeoutPromise.then(() => {
            console.error('Profile completion check timed out');
            return { data: null, error: 'Timeout exceeded' };
          })
        ]);
        
        if (error) {
          console.error('Error checking profile completion:', error);
          // If there's an error, we'll assume the profile is complete to prevent blocking access
          // This is a graceful degradation approach
          setProfileComplete(true);
          setLoading(false);
          return;
        }
        
        console.log('Profile data:', data);
        
        // If profile has all required fields and database flag is marked as complete, we're done
        if (data?.profile_completed === true) {
          console.log('PROFILE CHECK: Profile is marked as completed in database');
          setProfileComplete(true);
          setLoading(false);
          return;
        }
        
        // Check required fields - simplified for speed
        const requiredFields = ['full_name'];
        const hasRequiredFields = requiredFields.every(field => {
          const value = data?.[field as keyof typeof data];
          const isValid = value !== null && value !== undefined && 
                (typeof value !== 'string' || value.trim() !== '');
          
          console.log(`Field ${field} is ${isValid ? 'valid' : 'invalid'}:`, value);
          return isValid;
        });
        
        console.log('Has all required fields:', hasRequiredFields);
        
        // If we have a profile with at least the name, consider it complete for now
        // This prevents unnecessary redirects
        if (hasRequiredFields) {
          setProfileComplete(true);
          
          // If the profile has required fields but isn't marked as complete,
          // update it in the background without blocking the UI
          if (!data?.profile_completed) {
            console.log('Marking profile as complete in database...');
            try {
              supabase
                .from('user_profiles')
                .update({ profile_completed: true })
                .eq('user_id', user.id)
                .then(({ error: updateError }) => {
                  if (updateError) {
                    console.error('Error updating profile completion status:', updateError);
                  } else {
                    console.log('Successfully marked profile as complete in database');
                  }
                });
            } catch (updateError) {
              console.error('Error marking profile as complete:', updateError);
              // Don't block the UI for this error
            }
          }
        } else {
          setProfileComplete(false);
        }
      } catch (error) {
        console.error('Error during profile completion check:', error);
        // If there's an unexpected error, assume profile is complete to prevent blocking access
        setProfileComplete(true);
      } finally {
        // Always ensure loading is set to false to prevent infinite loading
        setLoading(false);
      }
    };

    // Set a timeout to prevent infinite loading - reduced for better performance
    const timeoutId = setTimeout(() => {
      if (loading) {
        console.warn('Profile completion check timed out after 5 seconds');
        setLoading(false);
        // Assume profile is complete to prevent blocking access
        setProfileComplete(true);
      }
    }, 5000); // Reduced timeout

    checkProfileCompletion();

    // Clean up the timeout
    return () => clearTimeout(timeoutId);
  }, [user, getUserProfile]);

  useEffect(() => {
    // Only trigger a redirect if the profile check has finished loading
    // and the profile is definitely not complete, and we have a user
    if (!loading && !profileComplete && user) {
      // Check if we're already on the onboarding page to prevent redirect loops
      const currentPath = window.location.pathname;
      
      // Don't redirect if we're already at the destination
      if (currentPath !== redirectTo) {
        console.log('Profile not complete, current path:', currentPath);
        console.log('Redirecting to:', redirectTo);
        navigate(redirectTo);
      } else {
        console.log('Already at', redirectTo, '- not redirecting to prevent loop');
      }
    }
  }, [loading, profileComplete, navigate, redirectTo, user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Only render children if profile is complete
  return profileComplete ? <>{children}</> : null;
};

export default ProfileCompletionCheck;
