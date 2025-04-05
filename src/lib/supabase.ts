import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Supabase environment variables are missing. Authentication features will not work properly.' +
    '\nMake sure you have VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY defined in your .env file.' +
    '\nYou may need to restart your development server after adding these variables.'
  );
}

// Check for development mode flags
const isDevMode = import.meta.env.VITE_DEV_MODE === 'true';
const skipEmailVerification = import.meta.env.VITE_SKIP_EMAIL_VERIFICATION === 'true';

// Create the Supabase client - in development we'll use a fallback for demo purposes if env vars are missing
const url = supabaseUrl || 'https://bzryrvfjfzchzbmxzdyi.supabase.co';
const key = supabaseAnonKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ6cnlydmZqZnpjaHpibXh6ZHlpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA3MTA2NDEsImV4cCI6MjA1NjI4NjY0MX0.Kqph8KJDbvwQdTHlpu0uhbaTYleopuftGgDI5lZfoI8';

console.log('Supabase client initializing in', isDevMode ? 'DEVELOPMENT' : 'PRODUCTION', 'mode');
console.log('Email verification:', skipEmailVerification ? 'DISABLED' : 'ENABLED');

// Create a more robust health check function with timeout
export const checkSupabaseHealth = async () => {
  console.log('Performing Supabase health check...');
  const startTime = Date.now();

  // Create a timeout promise
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error('Supabase health check timed out after 5000ms'));
    }, 5000); // 5 second timeout
  });

  try {
    // Race the fetch against the timeout
    const response = await Promise.race([
      fetch(`${url}/rest/v1/`, {
        headers: {
          'apikey': key,
          'Content-Type': 'application/json'
        },
        // Add a signal to abort the fetch if needed
        signal: AbortSignal.timeout(4500) // Slightly shorter than our promise timeout
      }),
      timeoutPromise
    ]) as Response;

    const endTime = Date.now();
    const duration = endTime - startTime;
    console.log(`Supabase health check completed in ${duration}ms. Status: ${response.status}`);

    // We'll skip the database query check to avoid circular reference
    // Just return the basic health check result
    return {
      healthy: response.ok,
      duration,
      status: response.status
    };
  } catch (error) {
    const endTime = Date.now();
    const duration = endTime - startTime;
    console.error(`Supabase health check failed after ${duration}ms:`, error);

    // Try to determine if this is a network issue
    const isNetworkError = error instanceof TypeError &&
      (error.message.includes('network') || error.message.includes('fetch'));
    const isTimeout = error instanceof Error && error.message.includes('timed out');

    return {
      healthy: false,
      duration,
      error,
      errorType: isTimeout ? 'timeout' : (isNetworkError ? 'network' : 'unknown')
    };
  }
};

// Configure client with proper storage options for session persistence
export const supabase = createClient(url, key, {
  auth: {
    persistSession: true,
    storageKey: 'becourageousnonprofit.auth.token',
    storage: window.localStorage,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    // Use either pkce or implicit flow based on environment
    flowType: skipEmailVerification ? 'implicit' : 'pkce',
    // Enable debug mode in development
    debug: isDevMode
  },
  global: {
    // Add request monitoring
    fetch: (url, options) => {
      const requestStart = Date.now();
      console.log(`[Supabase Request] Starting request to: ${url.toString().split('?')[0]}`);

      return fetch(url, options).then(response => {
        const requestEnd = Date.now();
        console.log(`[Supabase Request] Completed in ${requestEnd - requestStart}ms: ${url.toString().split('?')[0]}`);
        return response;
      }).catch(error => {
        const requestEnd = Date.now();
        console.error(`[Supabase Request] Failed after ${requestEnd - requestStart}ms:`, error);
        throw error;
      });
    }
  }
});

// Add a listener for auth errors
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Supabase auth event:', event);

  if (event === 'TOKEN_REFRESHED') {
    console.log('Auth token refreshed successfully');
  }

  if (event === 'SIGNED_OUT') {
    console.log('User signed out');
    // Clear any cached data
    localStorage.removeItem('courage-bot-adventure.user.profile');
  }
});

export default supabase;
