import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { Button } from './ui/button';

interface AdminRouteProps {
  children?: React.ReactNode;
}

/**
 * AdminRoute component that restricts access to admin users only
 * Extends the functionality of ProtectedRoute by adding admin role check
 */
const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { user, isLoading, isAdmin } = useAuth();
  const location = useLocation();

  // If still checking authentication status, show loading indicator
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-courage-600 mb-4"></div>
        <p className="text-gray-600">Verifying admin access...</p>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If authenticated but not admin, show access denied
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full">
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Access Denied</AlertTitle>
            <AlertDescription>
              You don't have permission to access this area. This section is restricted to admin users only.
            </AlertDescription>
          </Alert>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={() => window.history.back()} 
              variant="outline"
            >
              Go Back
            </Button>
            <Button 
              onClick={() => window.location.href = '/dashboard'} 
              variant="default"
            >
              Return to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // If authenticated and admin, render children
  return children ? <>{children}</> : <Outlet />;
};

export default AdminRoute;
