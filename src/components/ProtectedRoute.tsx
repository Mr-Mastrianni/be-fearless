import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import ProfileCompletionCheck from './ProfileCompletionCheck';
import { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { RefreshCw } from 'lucide-react';

interface ProtectedRouteProps {
  children?: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  const [loadingTimeoutDuration, setLoadingTimeoutDuration] = useState(0);
  const [authError, setAuthError] = useState(false);

  // Set a timeout to detect if loading takes too long
  useEffect(() => {
    if (!isLoading) {
      // Reset timeout state when loading completes
      setLoadingTimeout(false);
      setLoadingTimeoutDuration(0);
      return;
    }

    // Start with a 5 second timeout
    const timeoutId = setTimeout(() => {
      setLoadingTimeout(true);
      setLoadingTimeoutDuration(5);
    }, 5000);

    // Set a 15 second timeout for extended loading
    const extendedTimeoutId = setTimeout(() => {
      setLoadingTimeoutDuration(15);
    }, 15000);

    // Set a 30 second timeout for auth error
    const authErrorTimeoutId = setTimeout(() => {
      setAuthError(true);
    }, 30000);

    return () => {
      clearTimeout(timeoutId);
      clearTimeout(extendedTimeoutId);
      clearTimeout(authErrorTimeoutId);
    };
  }, [isLoading]);

  // If still checking authentication status, show loading indicator
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-courage-600 mb-4"></div>
        
        {loadingTimeout && (
          <div className="text-center mt-4">
            <p className="text-gray-600 mb-2">
              {loadingTimeoutDuration >= 15 
                ? "Loading is taking longer than expected..." 
                : "Still loading..."}
            </p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => window.location.reload()}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" /> Refresh Page
            </Button>
          </div>
        )}
        
        {authError && (
          <div className="text-center mt-8 max-w-md mx-auto p-4 bg-red-50 rounded-lg border border-red-200">
            <p className="text-red-600 font-medium mb-2">Authentication Error</p>
            <p className="text-gray-700 mb-4">
              We're having trouble verifying your login status. This could be due to network issues or session expiration.
            </p>
            <div className="flex justify-center gap-4">
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={() => {
                  // Clear local storage and reload
                  localStorage.clear();
                  window.location.href = '/login';
                }}
              >
                Sign Out & Login Again
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => window.location.reload()}
              >
                Try Again
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If authenticated, check if profile is complete
  return (
    <>
      <ProfileCompletionCheck redirectTo="/onboarding" />
      {children ? <>{children}</> : <Outlet />}
    </>
  );
};

export default ProtectedRoute;
