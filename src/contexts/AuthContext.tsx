import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate, NavigateFunction } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Session, User } from '@supabase/supabase-js';
import { useToast } from '@/components/ui/use-toast';
import { Activity } from '@/models/ActivityTypes';

// Enhanced cache for user profiles to reduce database queries
const profileCache = new Map<string, {
  data: any;
  timestamp: number;
  expiresIn: number; // milliseconds
  fetchPromise?: Promise<any>; // Track in-flight requests
}>();

// Helper function to get cached profiles
const getCachedProfile = (userId: string) => {
  const cached = profileCache.get(userId);
  if (!cached) return null;

  // Check if cache entry is expired
  const now = Date.now();
  if (now - cached.timestamp > cached.expiresIn) {
    console.log(`🔍 CACHE DIAGNOSTIC: Cache for user ${userId} is expired (age: ${(now - cached.timestamp)/1000}s)`);
    profileCache.delete(userId);
    return null;
  }

  console.log(`Using cached profile for user ${userId}, age: ${(now - cached.timestamp)/1000}s`);
  return cached.data;
};

// Set a cached profile
const setCachedProfile = (userId: string, data: any, expiresIn = 300000) => { // Increased to 5 minutes
  console.log(`🔍 CACHE DIAGNOSTIC: Setting cache for user ${userId} with expiry ${expiresIn/1000}s`);
  profileCache.set(userId, {
    data,
    timestamp: Date.now(),
    expiresIn
  });
};

// Get or create a profile fetch promise
const getProfileFetchPromise = (userId: string) => {
  const cached = profileCache.get(userId);
  if (cached?.fetchPromise) {
    console.log(`🔍 CACHE DIAGNOSTIC: Reusing in-flight request for user ${userId}`);
    return cached.fetchPromise;
  }
  return null;
};

// Set a profile fetch promise
const setProfileFetchPromise = (userId: string, promise: Promise<any>) => {
  console.log(`🔍 CACHE DIAGNOSTIC: Setting fetch promise for user ${userId}`);
  const cached = profileCache.get(userId) || {
    data: null,
    timestamp: Date.now(),
    expiresIn: 300000
  };

  cached.fetchPromise = promise;
  profileCache.set(userId, cached);

  // Clear the promise when it resolves or rejects
  promise.finally(() => {
    console.log(`🔍 CACHE DIAGNOSTIC: Clearing fetch promise for user ${userId}`);
    const current = profileCache.get(userId);
    if (current) {
      delete current.fetchPromise;
      profileCache.set(userId, current);
    }
  });
};

// Define the profile data interface
export interface ProfileData {
  full_name: string;
  avatar_url?: string | null;
  date_of_birth?: string | null;
  key_fears?: string[] | null;
  experience_level?: string | null;
  challenge_intensity?: string | null;
  notification_preferences?: Record<string, any> | null;
  learning_style?: string | null;
  bio?: string | null;
  location?: string | null;
  phone_number?: string | null;
  profile_completed?: boolean;
}

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signUp: (email: string, password: string, userData?: { fullName?: string }) => Promise<{
    success: boolean;
    error?: string;
  }>;
  signIn: (email: string, password: string) => Promise<{
    success: boolean;
    error?: string;
  }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{
    success: boolean;
    error?: string;
  }>;
  updatePassword: (password: string) => Promise<{
    success: boolean;
    error?: string;
  }>;
  updateProfile: (userData: Partial<ProfileData>, markAsComplete?: boolean) => Promise<{
    success: boolean;
    error?: string;
  }>;
  getUserProfile: () => Promise<{
    data: ProfileData | null;
    error: string | null;
  }>;
  createProfileForUser: () => Promise<{
    data: ProfileData | null;
    error: string | null;
  }>;
  deleteAccount: () => Promise<{
    success: boolean;
    error?: string;
    warning?: string;
  }>;
  profileCompletionPercentage: number;
  addActivityToJourney: (activity: Activity) => Promise<{
    success: boolean;
    error?: string;
  }>;
  getUserActivities: () => Promise<{
    data: Activity[];
    error?: string;
  }>;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [profileCompletionPercentage, setProfileCompletionPercentage] = useState(0);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check if the user has admin role
  const checkAdminRole = async (currentUser: User) => {
    try {
      // First check user metadata for admin role
      if (currentUser.user_metadata?.is_admin === true || currentUser.user_metadata?.is_admin === 'true') {
        console.log('Admin role found in user metadata (is_admin flag)');
        setIsAdmin(true);
        return;
      }

      // Also check for legacy role field
      if (currentUser.user_metadata?.role === 'admin') {
        console.log('Admin role found in user metadata (role field)');
        setIsAdmin(true);
        return;
      }

      // Then check the admin_users table for this user
      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('user_id', currentUser.id)
        .single();

      if (error) {
        if (error.code !== 'PGRST116') { // Not found error
          console.error('Error checking admin status:', error);
        }
        setIsAdmin(false);
        return;
      }

      if (data) {
        console.log('Admin user found in admin_users table');
        setIsAdmin(true);

        // Update user metadata if it doesn't have the admin role
        if (currentUser.user_metadata?.is_admin !== true && currentUser.user_metadata?.is_admin !== 'true') {
          const { error: updateError } = await supabase.auth.updateUser({
            data: { is_admin: true }
          });

          if (updateError) {
            console.error('Error updating user metadata with admin role:', updateError);
          } else {
            console.log('User metadata updated with admin role');
          }
        }
      } else {
        setIsAdmin(false);
      }
    } catch (error) {
      console.error('Error in checkAdminRole:', error);
      setIsAdmin(false);
    }
  };
useEffect(() => {
  // Get initial session
  const getInitialSession = async () => {
    try {
      const sessionStartTime = Date.now();
      console.log(`🔍 AUTH DIAGNOSTIC [${sessionStartTime}]: Starting initial session fetch`);
      setIsLoading(true);

      // Run a Supabase health check before attempting auth
      const { checkSupabaseHealth } = await import('@/lib/supabase');
      const healthResult = await checkSupabaseHealth();
      console.log(`🔍 AUTH DIAGNOSTIC [${Date.now()}]: Supabase health check result:`, healthResult);

      if (!healthResult.healthy) {
        console.warn('⚠️ Supabase health check failed. Auth operations may timeout.');
      }
        setIsLoading(true);

        // Add timeout for initial session fetch with better error message and longer timeout (30s)
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => {
            const err = new Error('Session fetch timed out (after 30 seconds)');
            console.error('🚨 SESSION TIMEOUT: Unable to connect to Supabase auth service after 30 seconds');
            reject(err);
          }, 30000); // Increased from 15s to 30s based on observed response times
        });

        // Race the promises
        const result = await Promise.race([
          sessionPromise,
          timeoutPromise
        ]) as { data: { session: Session | null } };

        setSession(result.data.session);
        setUser(result.data.session?.user ?? null);

        // If we have a session, ensure we have a profile
        if (result.data.session?.user) {
          try {
            // Check if profile exists
            const { data: profileData, error: profileError } = await supabase
              .from('user_profiles')
              .select('*')
              .eq('user_id', result.data.session.user.id)
              .single();

            if (profileError && profileError.code === 'PGRST116') {
              // No profile found, create one
              await createProfileForUser();
            }
          } catch (profileCheckError) {
            console.error('Error checking for profile during initial session:', profileCheckError);
            // Don't fail the auth process for profile errors
          }
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
        toast({
          title: 'Authentication error',
          description: 'There was a problem retrieving your session. Please refresh the page.',
          variant: 'destructive',
        });
        // Ensure we set user and session to null on error
        setSession(null);
        setUser(null);
      } finally {
        // Always set loading to false to prevent getting stuck
        setIsLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event);

        // Update session and user state immediately to prevent UI flicker
        setSession(session);
        setUser(session?.user ?? null);

        if (event === 'PASSWORD_RECOVERY') {
          setIsLoading(false);
          navigate('/reset-password');
          return;
        }

        // When a user signs in, ensure their profile is properly set up
        if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session?.user) {
          setIsLoading(true);
          console.log('User signed in or token refreshed, checking profile...');

          // Check if this is a new user that needs to be redirected to onboarding
          const userData = session.user.user_metadata;
          if (userData && userData.is_new_user === true) {
            // Clear the flag so they're not redirected again
            try {
              await supabase.auth.updateUser({
                data: { is_new_user: false }
              });

              // Redirect to onboarding
              setIsLoading(false);
              navigate('/onboarding');
              return;
            } catch (error) {
              console.error('Error updating new user flag:', error);
              // Continue with profile check even if this fails
            }
          }

          try {
            // Set a timeout for profile check - reduced to 5 seconds for faster loading
            const profileCheckPromise = new Promise<void>(async (resolve) => {
              try {
                // Get the user profile with a single attempt for faster loading
                const { data, error } = await supabase
                  .from('user_profiles')
                  .select('*')
                  .eq('user_id', session.user.id)
                  .single();

                // If error and not "no rows returned" error, log it
                if (error && error.code !== 'PGRST116') {
                  console.error('Error checking user profile:', error);
                }

                // If no profile exists, create one
                if (!data || error?.code === 'PGRST116') {
                  console.log('No profile found for user, creating one...');
                  try {
                    await createProfileForUser();
                  } catch (createError) {
                    console.error('Error creating profile:', createError);
                    // Don't throw, just log the error
                  }
                }
                // If profile exists but avatar_url is missing, sync it from user metadata
                else if (session.user.user_metadata?.avatar_url && !data.avatar_url) {
                  console.log('Syncing avatar_url from user metadata to profile...');
                  try {
                    await supabase
                      .from('user_profiles')
                      .update({ avatar_url: session.user.user_metadata.avatar_url })
                      .eq('user_id', session.user.id);
                  } catch (updateError) {
                    console.error('Error syncing avatar to profile:', updateError);
                    // Don't throw, just log the error
                  }
                }
                // If avatar_url exists in profile but not in user metadata, sync it to user metadata
                else if (data.avatar_url && !session.user.user_metadata?.avatar_url) {
                  console.log('Syncing avatar_url from profile to user metadata...');
                  try {
                    await supabase.auth.updateUser({
                      data: { avatar_url: data.avatar_url }
                    });
                  } catch (updateError) {
                    console.error('Error syncing avatar to user metadata:', updateError);
                    // Don't throw, just log the error
                  }
                }
                resolve();
              } catch (error) {
                console.error('Error in profile check:', error);
                resolve(); // Resolve anyway to prevent hanging
              }
            });

            const timeoutPromise = new Promise<void>((_, reject) => {
              setTimeout(() => {
                const err = new Error('Profile check timed out');
                console.error(`🚨 PROFILE CHECK TIMEOUT: Unable to complete profile check for user ${session.user.id} after 30 seconds`);
                reject(err);
              }, 30000); // Increased from 20s to 30s based on observed response times
            });

            // Race the promises
            await Promise.race([profileCheckPromise, timeoutPromise]).catch(error => {
              console.error('Profile check error:', error);

              // Report diagnostic information
              if (error.message.includes('timed out')) {
                console.log('🔍 DIAGNOSTIC INFO:');
                console.log(`- Browser: ${navigator.userAgent}`);
                console.log(`- Online Status: ${navigator.onLine ? 'Connected' : 'Offline'}`);
                console.log(`- Performance: ${window.performance ? 'Available' : 'Not available'}`);
                console.log(`- Time: ${new Date().toISOString()}`);
              }

              // Don't throw, just log the error
            });
          } catch (error) {
            console.error('Error handling user profile on sign in:', error);
            // Don't show toast for profile errors to prevent confusion
          } finally {
            // Always set loading to false to prevent getting stuck
            setIsLoading(false);
          }
        } else if (event === 'SIGNED_OUT') {
          // For sign out, ensure we clear the state
          setSession(null);
          setUser(null);
          setIsLoading(false);
        } else {
          // For other events, ensure loading is set to false
          setIsLoading(false);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, toast]);

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Sign in error:', error.message);
        return { success: false, error: error.message };
      }

      if (data?.user) {
        // After successful sign in, check if profile is complete
        try {
          console.log('Checking if user profile is complete after login...');
          const { data: profileData, error: profileError } = await supabase
            .from('user_profiles')
            .select('profile_completed')
            .eq('user_id', data.user.id)
            .single();

          if (profileError) {
            console.error('Error checking profile completion status:', profileError);
          } else if (profileData && profileData.profile_completed === false) {
            console.log('User profile not complete, will be redirected to onboarding');
            // We don't redirect here - the ProfileCompletionCheck component will handle it
          }
        } catch (profileCheckError) {
          console.error('Error checking profile completion:', profileCheckError);
        }

        return { success: true };
      } else {
        return { success: false, error: 'An unexpected error occurred' };
      }
    } catch (error: any) {
      console.error('Sign in exception:', error.message);
      return { success: false, error: error.message };
    }
  };

  // Sign up with email and password
  const signUp = async (email: string, password: string, userData?: { fullName?: string }) => {
    try {
      // Create the user in Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            is_new_user: true, // Flag to identify new users for onboarding
            full_name: userData?.fullName || '',
          },
          // Don't force email verification in development for better testing
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        console.error('Sign up error:', error.message);
        return { success: false, error: error.message };
      }

      console.log('User signed up successfully:', data);

      // The profile will be created when the user signs in
      // via the auth state change listener

      return { success: true };
    } catch (error) {
      console.error('Unexpected error in signUp:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      await supabase.auth.signOut();

      // Clear session and user states
      setSession(null);
      setUser(null);

      navigate('/');
    } catch (error: any) {
      console.error('Sign out error:', error.message);
      toast({
        title: 'Error signing out',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  // Reset password (send reset email)
  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        console.error('Reset password error:', error.message);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error: any) {
      console.error('Reset password exception:', error.message);
      return { success: false, error: error.message };
    }
  };

  // Update password
  const updatePassword = async (newPassword: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        console.error('Update password error:', error.message);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error: any) {
      console.error('Update password exception:', error.message);
      return { success: false, error: error.message };
    }
  };

  // Update user profile
  const updateProfile = async (profileData: Partial<ProfileData>, markAsComplete?: boolean) => {
    try {
      if (!user) {
        console.error('Cannot update profile: No user is logged in');
        return { success: false, error: 'No user is logged in' };
      }

      console.log('Updating profile for user:', user.id);
      console.log('Profile data to update:', profileData);
      console.log('Mark as complete:', markAsComplete);

      // Add updated_at timestamp and profile_completed flag if requested
      const dataToUpdate = {
        ...profileData,
        updated_at: new Date().toISOString(),
        ...(markAsComplete ? { profile_completed: true } : {})
      };

      // Update the profile in the database
      const { error } = await supabase
        .from('user_profiles')
        .update(dataToUpdate)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error updating profile:', error);
        return { success: false, error: error.message };
      }

      console.log('Profile updated successfully');

      // If avatar_url is being updated, also update user metadata
      if (profileData.avatar_url) {
        console.log('Updating user metadata with new avatar URL:', profileData.avatar_url);

        const { error: updateError } = await supabase.auth.updateUser({
          data: { avatar_url: profileData.avatar_url }
        });

        if (updateError) {
          console.error('Error updating user metadata with avatar URL:', updateError);
          // Don't return error here, as the profile update was successful
        } else {
          console.log('User metadata updated with new avatar URL');
        }
      }

      return { success: true, error: null };
    } catch (error) {
      console.error('Unexpected error in updateProfile:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  };

  // Get user profile data with improved caching and request coordination
  const getUserProfile = async () => {
    try {
      if (!user) {
        console.error('Cannot get user profile: No user is logged in');
        return { data: null, error: 'No user is logged in' };
      }

      const getUserProfileStart = Date.now(); // Start time log
      console.log(`[${getUserProfileStart}] Getting user profile for user:`, user.id);
      console.log(`🔍 DIAGNOSTIC: Active profile requests for user ${user.id}`);

      // First check if we have a cached profile
      const cachedProfile = getCachedProfile(user.id);
      if (cachedProfile) {
        console.log(`[${Date.now()}] Using cached profile for user ${user.id}`);
        console.log(`🔍 DIAGNOSTIC: Profile cache hit for user ${user.id}`);
        return { data: cachedProfile, error: null };
      }
      console.log(`🔍 DIAGNOSTIC: Profile cache miss for user ${user.id}`);

      // Check if there's already an in-flight request for this user
      const existingPromise = getProfileFetchPromise(user.id);
      if (existingPromise) {
        console.log(`[${Date.now()}] Reusing existing profile fetch for user ${user.id}`);
        try {
          return await existingPromise;
        } catch (error) {
          console.error(`Error from existing profile fetch: ${error}`);
          // Continue with a new request if the existing one failed
        }
      }

      // Set a timeout to prevent getting stuck indefinitely (increased to 30s)
      const timeoutPromise = new Promise<{data: ProfileData | null, error: string | null}>((resolve) => {
        setTimeout(() => {
          console.error(`🚨 PROFILE TIMEOUT: Unable to fetch profile for user ${user.id} after 30 seconds`);
          console.log(`🔍 DIAGNOSTIC: Profile timeout triggered at ${Date.now()}`);
          // Instead of rejecting, we'll resolve with a null result and error message
          // This prevents the app from crashing and allows it to continue with default values
          resolve({ data: null, error: 'Profile fetch timed out' });
        }, 30000); // Increased from 15s to 30s for better reliability
      });

      // Add retry logic for profile fetch with more attempts
      const retryFetch = async (attempt = 1, maxAttempts = 3) => {
        try {
          const queryStart = Date.now();
          console.log(`[${queryStart}] Starting Supabase profile query for user: ${user.id} (attempt ${attempt})`);

          const { data, error } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('user_id', user.id)
            .single();

          const queryEnd = Date.now();
          console.log(`[${queryEnd}] Supabase profile query finished for user: ${user.id}. Duration: ${queryEnd - queryStart}ms`);

          return { data, error };
        } catch (err) {
          console.error(`Error in profile fetch attempt ${attempt}:`, err);
          if (attempt < maxAttempts) {
            console.log(`Retrying profile fetch (attempt ${attempt + 1})`);
            return retryFetch(attempt + 1, maxAttempts);
          }
          throw err;
        }
      };

      // Create the actual fetch promise with retry logic
      const fetchPromise = new Promise(async (resolve) => {
        try {
          // Use our retry function for better resilience
          const { data, error } = await retryFetch();

          if (error) {
            console.error('Error getting user profile:', error);

            // If profile doesn't exist, create one
            if (error.code === 'PGRST116') {
              console.log('No profile found, creating one...');
              const result = await createProfileForUser();
              resolve(result);
              return;
            }

            resolve({ data: null, error: error.message });
            return;
          }

          console.log('Retrieved user profile:', data);

          // If no data was returned but also no error, create a profile
          if (!data) {
            console.log('No profile data returned, creating one...');
            const result = await createProfileForUser();
            resolve(result);
            return;
          }

          // Simple avatar synchronization - only if really needed
          if (user.user_metadata?.avatar_url && !data.avatar_url) {
            console.log('Syncing avatar_url from user metadata to profile');
            // Just update the returned data without waiting for DB update
            data.avatar_url = user.user_metadata.avatar_url;

            // Fire and forget update
            supabase
              .from('user_profiles')
              .update({ avatar_url: user.user_metadata.avatar_url })
              .eq('user_id', user.id)
              .then(result => {
                if (result.error) {
                  console.error('Error updating profile with avatar:', result.error);
                }
              });

      // Register this fetch promise so other components can reuse it
      setProfileFetchPromise(user.id, fetchPromise);
          }

          // Cache successfully retrieved profiles for 5 minutes
          if (data) {
            console.log(`🔍 DIAGNOSTIC: Caching profile for user ${user.id} for 5 minutes`);
            setCachedProfile(user.id, data, 300000); // 5 minute cache
          }
          resolve({ data, error: null });
        } catch (error) {
          console.error('Unexpected error in getUserProfile fetch:', error);
          resolve({ data: null, error: 'An unexpected error occurred' });
        }
      });

      // Register this fetch promise so other components can reuse it
      setProfileFetchPromise(user.id, fetchPromise);

      // Use Promise.race with a more robust approach
      try {
        // Race the promises
        const result = await Promise.race([
          fetchPromise,
          timeoutPromise
        ]) as {data: ProfileData | null, error: string | null};

        // Log the result
        console.log(`Promise.race completed with result:`,
          result.data ? 'Data present' : 'No data',
          result.error ? `Error: ${result.error}` : 'No error');


        const getUserProfileEnd = Date.now(); // Add end time log
        console.log(`[${getUserProfileEnd}] getUserProfile finished for user ${user.id}. Duration: ${getUserProfileEnd - getUserProfileStart}ms. Result:`,
          result.data ? 'Data present' : 'No data', result.error);

        // If we got data, cache it for future use
        if (result.data) {
          setCachedProfile(user.id, result.data);
        }

        return result;
      } catch (unexpectedError) {
        // This should rarely happen since we're using Promise.allSettled
        const raceErrorTime = Date.now(); // Add race error time log
        console.error(`[${raceErrorTime}] Unexpected error in profile fetch for user ${user.id}:`, unexpectedError);
        const result = {
          data: null,
          error: unexpectedError instanceof Error ? unexpectedError.message : 'Unexpected profile fetch error'
        };
        const getUserProfileEndError = Date.now(); // Add end time log (error case)
        console.log(`[${getUserProfileEndError}] getUserProfile finished (unexpected error) for user ${user.id}. Duration: ${getUserProfileEndError - getUserProfileStart}ms`);
        return result;
      }
    } catch (error) {
      const unexpectedErrorTime = Date.now(); // Add unexpected error time log
      console.error(`[${unexpectedErrorTime}] Unexpected error in getUserProfile for user ${user?.id}:`, error);
      const result = { data: null, error: 'An unexpected error occurred' };
      const getUserProfileEndUnexpected = Date.now(); // Add end time log (unexpected error case)
      // Define the variable that was missing
      const getUserProfileStart = unexpectedErrorTime;
      console.log(`[${getUserProfileEndUnexpected}] getUserProfile finished (unexpected error) for user ${user?.id}. Duration: ${getUserProfileEndUnexpected - getUserProfileStart}ms. Result:`, result);
      return result;
    }
  };

  // Create a new profile for the user if one doesn't exist
  const createProfileForUser = async () => {
    try {
      if (!user) {
        console.error('Cannot create profile: No user is logged in');
        return { data: null, error: 'No user is logged in' };
      }

      console.log('Creating new profile for user:', user.id);

      // Set a timeout to prevent getting stuck indefinitely - reduced for better performance
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Profile creation timed out')), 4000); // Reduced timeout
      });

      // Create the actual creation promise with simplified logic
      const createPromise = new Promise(async (resolve) => {
        try {
          // Get user metadata for profile initialization
          const metadata = user.user_metadata || {};

          // Prepare profile data with minimal required fields
          const profileData = {
            user_id: user.id,
            full_name: metadata.full_name || '',
            avatar_url: metadata.avatar_url || null,
            profile_completed: false,
            created_at: new Date().toISOString(),
          };

          console.log('Creating profile with data:', profileData);

          // Insert the new profile
          const { data, error } = await supabase
            .from('user_profiles')
            .insert(profileData)
            .select('*')
            .single();

          if (error) {
            console.error('Error creating user profile:', error);
            resolve({ data: null, error: error.message });
            return;
          }

          console.log('Profile created successfully:', data);
          resolve({ data, error: null });
        } catch (error) {
          console.error('Unexpected error in createProfileForUser execution:', error);
          resolve({ data: null, error: 'An unexpected error occurred' });
        }
      });

      // Race the creation against the timeout
      try {
        return await Promise.race([createPromise, timeoutPromise]) as {
          data: ProfileData | null;
          error: string | null;
        };
      } catch (raceError) {
        console.error('Profile creation race error:', raceError);
        // If timeout wins the race, return a friendly error
        return {
          data: null,
          error: raceError instanceof Error ? raceError.message : 'Profile creation timed out'
        };
      }
    } catch (error) {
      console.error('Unexpected error in createProfileForUser:', error);
      return { data: null, error: 'An unexpected error occurred' };
    }
  };

  // Delete account
  const deleteAccount = async () => {
    try {
      if (!user) {
        console.error('deleteAccount: No user found');
        return { success: false, error: 'User not authenticated' };
      }

      // Get current auth session for JWT token
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session?.access_token) {
        console.error('deleteAccount: No access token found');
        return { success: false, error: 'Authentication token not found' };
      }

      // Call the Edge Function to delete the account
      try {
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/delete-account`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${sessionData.session.access_token}`
            }
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          console.error('Edge function error:', errorData);
          return { success: false, error: errorData.error || 'Failed to delete account' };
        }

        return { success: true };
      } catch (fetchError) {
        console.error('Error calling delete-account function:', fetchError);

        // Fallback to client-side deletion of profile data if edge function fails
        console.log('Falling back to client-side profile deletion only');

        // Delete user profile in the database
        console.log('Deleting profile in database...');

        const { error: profileDeleteError } = await supabase
          .from('user_profiles')
          .delete()
          .eq('user_id', user.id);

        if (profileDeleteError) {
          console.error('Delete profile error:', profileDeleteError.message);
          return { success: false, error: 'Failed to delete profile: ' + profileDeleteError.message };
        }

        console.log('Profile deleted successfully in database');
        console.warn('NOTE: The actual auth account was not deleted due to Edge Function failure');

        return {
          success: true,
          warning: 'Only profile data was deleted. The auth account remains but is inaccessible.'
        };
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('Delete account exception:', errorMessage);
      if (error instanceof Error && error.stack) {
        console.error('Error stack:', error.stack);
      }
      return { success: false, error: errorMessage };
    }
  };

  // Add activity to user's journey
  const addActivityToJourney = async (activity: Activity) => {
    try {
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      // Check if the user_activities table exists
      const { error: tableCheckError } = await supabase
        .from('user_activities')
        .select('id')
        .limit(1);

      // If table doesn't exist, create it
      if (tableCheckError && tableCheckError.message.includes('does not exist')) {
        console.log('Creating user_activities table...');
        // We'll use progress_tracking JSONB field in user_profiles instead
        // since we can't create tables from the client
      }

      // Get the current user profile
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('progress_tracking')
        .eq('user_id', user.id)
        .single();

      if (profileError) {
        console.error('Error fetching user profile:', profileError);
        return { success: false, error: 'Failed to fetch user profile' };
      }

      // Initialize or update progress_tracking
      let progressTracking = profileData.progress_tracking || {};
      let activities = progressTracking.activities || [];

      // Check if activity already exists
      const activityExists = activities.some((a: any) => a.id === activity.id);

      if (activityExists) {
        return { success: false, error: 'Activity already added to your journey' };
      }

      // Add the new activity with added date
      activities.push({
        id: activity.id,
        title: activity.title,
        imageUrl: activity.imageUrl || activity.image,
        fearCategories: activity.fearCategories,
        difficultyLevel: activity.difficultyLevel, // Removed fallback to non-existent 'difficulty'
        added_at: new Date().toISOString(),
        status: 'planned', // planned, in_progress, completed
      });

      // Update the progress_tracking field
      progressTracking.activities = activities;

      // Update the user profile
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({ progress_tracking: progressTracking })
        .eq('user_id', user.id);

      if (updateError) {
        console.error('Error updating progress tracking:', updateError);
        return { success: false, error: 'Failed to add activity to journey' };
      }

      toast({
        title: 'Activity Added',
        description: `${activity.title} has been added to your journey`,
        duration: 3000,
      });

      return { success: true };
    } catch (error: any) {
      console.error('Add activity exception:', error.message);
      return { success: false, error: error.message };
    }
  };

  // Get user activities
  const getUserActivities = async () => {
    try {
      if (!user) {
        return { data: [], error: 'User not authenticated' };
      }

      // Get the current user profile
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('progress_tracking')
        .eq('user_id', user.id)
        .single();

      if (profileError) {
        console.error('Error fetching user profile:', profileError);
        return { data: [], error: 'Failed to fetch user profile' };
      }

      // Get activities from progress_tracking
      const progressTracking = profileData.progress_tracking || {};
      const activities = progressTracking.activities || [];

      return { data: activities, error: undefined };
    } catch (error: any) {
      console.error('Get user activities exception:', error.message);
      return { data: [], error: error.message };
    }
  };

  useEffect(() => {
    // Use a debounced function to prevent excessive checks
    const checkProfileCompletion = async () => {
      const checkProfileStart = Date.now(); // Add start time log
      console.log(`[${checkProfileStart}] checkProfileCompletion started for user: ${user?.id}`);
      console.log(`🔍 PROFILE COMPLETION DIAGNOSTIC [${checkProfileStart}]: Starting profile completion check`);
      if (user) {
        try {
          // First check the cache for immediate response
          const cachedProfile = getCachedProfile(user.id);
          if (cachedProfile) {
            console.log(`🔍 PROFILE COMPLETION DIAGNOSTIC [${Date.now()}]: Using cached profile for completion check`);
            updateProfileCompletionPercentage(cachedProfile);
            return;
          }

          // If no cache, get the profile with a more reasonable timeout
          console.log(`🔍 PROFILE COMPLETION DIAGNOSTIC [${Date.now()}]: Creating profile promise`);
          // Use a direct call to Supabase instead of getUserProfile to avoid nested timeouts
          let data = null;
          try {
            console.log(`🔍 PROFILE COMPLETION DIAGNOSTIC [${Date.now()}]: Starting direct Supabase query`);
            const startTime = Date.now();

            // Set a timeout for the direct query
            const timeoutId = setTimeout(() => {
              console.log(`🔍 PROFILE COMPLETION DIAGNOSTIC [${Date.now()}]: Direct query timeout reached (10s)`);
              // We don't abort the query, just continue with null data
              if (!data) {
                console.log(`[${Date.now()}] Using default profile completion percentage due to timeout`);
                setProfileCompletionPercentage(0);
              }
            }, 10000); // 10 second timeout

            // Make a direct, simplified query
            const { data: profileData, error } = await supabase
              .from('user_profiles')
              .select('full_name, avatar_url, date_of_birth, key_fears, experience_level, challenge_intensity, learning_style, bio, location, phone_number')
              .eq('user_id', user.id)
              .single();

            // Clear the timeout since we got a response
            clearTimeout(timeoutId);

            const endTime = Date.now();
            console.log(`🔍 PROFILE COMPLETION DIAGNOSTIC [${Date.now()}]: Direct query completed in ${endTime - startTime}ms`);

            if (error) {
              console.error(`Error in direct profile query:`, error);
            } else {
              data = profileData;
              // Cache the profile data for future use
              setCachedProfile(user.id, profileData);
            }
          } catch (queryError) {
            console.error(`Exception in direct profile query:`, queryError);
          }


          if (data) {
            const totalFields = 10; // total number of profile fields we're tracking
            let completedFields = 0;

            // Count completed fields
            if (data.full_name) completedFields++;
            if (data.avatar_url) completedFields++;
            if (data.date_of_birth) completedFields++;
            if (data.key_fears && data.key_fears.length > 0) completedFields++;
            if (data.experience_level) completedFields++;
            if (data.challenge_intensity) completedFields++;
            if (data.learning_style) completedFields++;
            if (data.bio) completedFields++;
            if (data.location) completedFields++;
            if (data.phone_number) completedFields++;

            setProfileCompletionPercentage(Math.round((completedFields / totalFields) * 100));
          } else {
             console.log(`[${Date.now()}] Using default profile completion percentage`);
             // Instead of waiting forever, default to 0% (can update later when fetch completes)
             setProfileCompletionPercentage(0);
          }
        } catch (error: any) {
          console.error(`[${Date.now()}] Error in checkProfileCompletion:`, error.message);
          // Default to 0% on error
          setProfileCompletionPercentage(0);
        }
      } else {
        console.log(`[${Date.now()}] checkProfileCompletion skipped: no user.`);
        setProfileCompletionPercentage(0); // Reset completion percentage when no user
      }
      const checkProfileEnd = Date.now(); // Add end time log
      console.log(`[${checkProfileEnd}] checkProfileCompletion finished for user: ${user?.id}. Duration: ${checkProfileEnd - checkProfileStart}ms`);
    };

    checkProfileCompletion();
  }, [user]);

  // Helper function to calculate profile completion percentage
  const updateProfileCompletionPercentage = (data: ProfileData) => {
    const totalFields = 10; // total number of profile fields we're tracking
    let completedFields = 0;

    // Count completed fields
    if (data.full_name) completedFields++;
    if (data.avatar_url) completedFields++;
    if (data.date_of_birth) completedFields++;
    if (data.key_fears && data.key_fears.length > 0) completedFields++;
    if (data.experience_level) completedFields++;
    if (data.challenge_intensity) completedFields++;
    if (data.learning_style) completedFields++;
    if (data.bio) completedFields++;
    if (data.location) completedFields++;
    if (data.phone_number) completedFields++;

    const percentage = Math.round((completedFields / totalFields) * 100);
    console.log(`🔍 PROFILE COMPLETION: Calculated ${percentage}% completion (${completedFields}/${totalFields} fields)`);
    setProfileCompletionPercentage(percentage);
  };

  const value = {
    session,
    user,
    isLoading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    updateProfile,
    getUserProfile,
    createProfileForUser,
    deleteAccount,
    profileCompletionPercentage,
    addActivityToJourney,
    getUserActivities,
    isAuthenticated: !!user,
    isAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
