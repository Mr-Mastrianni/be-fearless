import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const AuthCallback = () => {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        setIsLoading(true);
        
        // Get the URL hash
        const hash = window.location.hash;
        
        // If we have a hash, we need to exchange it for a session
        if (hash) {
          const { data, error } = await supabase.auth.getSession();
          
          if (error) {
            console.error('Auth callback error:', error.message);
            setError(error.message);
          } else if (data?.session) {
            // Successfully authenticated
            console.log('Auth callback successful, redirecting to dashboard');
            navigate('/dashboard');
          }
        } else {
          // Check if we have a session already
          const { data } = await supabase.auth.getSession();
          
          if (data?.session) {
            navigate('/dashboard');
          } else {
            // No session and no hash, something went wrong
            setError('Authentication failed. Please try logging in again.');
          }
        }
      } catch (err) {
        console.error('Auth callback exception:', err);
        setError('An unexpected error occurred during authentication.');
      } finally {
        setIsLoading(false);
      }
    };

    handleAuthCallback();
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Loader2 className="h-12 w-12 animate-spin text-courage-600 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Verifying your account...</h1>
        <p className="text-gray-600 text-center">
          Please wait while we complete the authentication process.
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="bg-red-100 text-red-800 p-4 rounded-lg mb-6 max-w-md">
          <h2 className="text-lg font-semibold mb-2">Authentication Error</h2>
          <p>{error}</p>
        </div>
        <Button 
          onClick={() => navigate('/login')}
          className="bg-courage-600 hover:bg-courage-700"
        >
          Return to Login
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <Loader2 className="h-12 w-12 animate-spin text-courage-600 mb-4" />
      <h1 className="text-2xl font-bold mb-2">Redirecting...</h1>
      <p className="text-gray-600 text-center">
        You should be redirected automatically. If not, please click the button below.
      </p>
      <Button 
        onClick={() => navigate('/dashboard')}
        className="mt-6 bg-courage-600 hover:bg-courage-700"
      >
        Go to Dashboard
      </Button>
    </div>
  );
};

export default AuthCallback;
