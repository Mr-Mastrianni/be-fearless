import React, { useState } from 'react';
import { saveUserToAirtable, syncAllUsersToAirtable } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

// Define timeout for API calls
const API_TIMEOUT = 30000; // 30 seconds

// Helper function to create a timeout promise
const createTimeout = (ms: number) => {
  return new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error(`Operation timed out after ${ms}ms`));
    }, ms);
  });
};

// Execute a function with timeout
const executeWithTimeout = async <T,>(
  promise: Promise<T>,
  timeoutMs: number = API_TIMEOUT
): Promise<T> => {
  return Promise.race([
    promise,
    createTimeout(timeoutMs)
  ]) as Promise<T>;
};

export default function AirtableSync() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [syncStatus, setSyncStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [syncMessage, setSyncMessage] = useState<string>('');
  const [bulkSyncStatus, setBulkSyncStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [bulkSyncMessage, setBulkSyncMessage] = useState<string>('');
  const [userCount, setUserCount] = useState<number | null>(null);

  // Fetch user count on component mount
  React.useEffect(() => {
    const fetchUserCount = async () => {
      try {
        const { count, error } = await executeWithTimeout(
          supabase.from('profiles').select('*', { count: 'exact', head: true }),
          10000
        );
        
        if (error) throw error;
        setUserCount(count);
      } catch (error) {
        console.error('Error fetching user count:', error);
        setUserCount(null);
      }
    };

    fetchUserCount();
  }, []);

  // Function to sync current user data
  const handleSyncCurrentUser = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "No user is currently logged in",
        variant: "destructive"
      });
      return;
    }

    setSyncStatus('loading');
    setSyncMessage('Syncing your user data to Airtable...');

    try {
      const result = await executeWithTimeout(
        saveUserToAirtable(user.id),
        API_TIMEOUT
      );

      if (result.success) {
        setSyncStatus('success');
        setSyncMessage('Your user data has been successfully synced to Airtable!');
        toast({
          title: "Success",
          description: "Your user data has been synced to Airtable",
        });
      } else {
        throw new Error(result.message || 'Unknown error occurred');
      }
    } catch (error) {
      setSyncStatus('error');
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setSyncMessage(`Error syncing user data: ${errorMessage}`);
      
      toast({
        title: "Error",
        description: `Failed to sync user data: ${errorMessage}`,
        variant: "destructive"
      });
    }
  };

  // Function to sync all users
  const handleSyncAllUsers = async () => {
    setBulkSyncStatus('loading');
    setBulkSyncMessage('Syncing all user data to Airtable...');

    try {
      const result = await executeWithTimeout(
        syncAllUsersToAirtable(),
        API_TIMEOUT * 2 // Double timeout for bulk operation
      );

      if (result.success) {
        setBulkSyncStatus('success');
        setBulkSyncMessage(`Successfully synced ${result.count || 'all'} users to Airtable!`);
        toast({
          title: "Success",
          description: `Successfully synced ${result.count || 'all'} users to Airtable`,
        });
      } else {
        throw new Error(result.message || 'Unknown error occurred');
      }
    } catch (error) {
      setBulkSyncStatus('error');
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setBulkSyncMessage(`Error syncing all users: ${errorMessage}`);
      
      toast({
        title: "Error",
        description: `Failed to sync all users: ${errorMessage}`,
        variant: "destructive"
      });
    }
  };

  // Reset status after a delay when success or error
  React.useEffect(() => {
    if (syncStatus === 'success' || syncStatus === 'error') {
      const timer = setTimeout(() => {
        setSyncStatus('idle');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [syncStatus]);

  React.useEffect(() => {
    if (bulkSyncStatus === 'success' || bulkSyncStatus === 'error') {
      const timer = setTimeout(() => {
        setBulkSyncStatus('idle');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [bulkSyncStatus]);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Airtable Data Synchronization</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Current User Sync Card */}
        <Card>
          <CardHeader>
            <CardTitle>Sync Current User</CardTitle>
            <CardDescription>
              Sync your user profile data to Airtable for analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            {syncStatus === 'success' && (
              <Alert className="mb-4 bg-green-50 border-green-200">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-800">Success</AlertTitle>
                <AlertDescription className="text-green-700">
                  {syncMessage}
                </AlertDescription>
              </Alert>
            )}
            
            {syncStatus === 'error' && (
              <Alert className="mb-4 bg-red-50 border-red-200">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertTitle className="text-red-800">Error</AlertTitle>
                <AlertDescription className="text-red-700">
                  {syncMessage}
                </AlertDescription>
              </Alert>
            )}
            
            <p className="text-sm text-gray-500 mb-4">
              This will sync your complete user profile, including personal information, 
              fear assessment results, and activity history to Airtable.
            </p>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={handleSyncCurrentUser} 
              disabled={syncStatus === 'loading'}
              className="w-full"
            >
              {syncStatus === 'loading' ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Syncing...
                </>
              ) : (
                'Sync My Data'
              )}
            </Button>
          </CardFooter>
        </Card>

        {/* All Users Sync Card */}
        <Card>
          <CardHeader>
            <CardTitle>Sync All Users</CardTitle>
            <CardDescription>
              Sync all user profiles to Airtable (Admin only)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {bulkSyncStatus === 'success' && (
              <Alert className="mb-4 bg-green-50 border-green-200">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-800">Success</AlertTitle>
                <AlertDescription className="text-green-700">
                  {bulkSyncMessage}
                </AlertDescription>
              </Alert>
            )}
            
            {bulkSyncStatus === 'error' && (
              <Alert className="mb-4 bg-red-50 border-red-200">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertTitle className="text-red-800">Error</AlertTitle>
                <AlertDescription className="text-red-700">
                  {bulkSyncMessage}
                </AlertDescription>
              </Alert>
            )}
            
            <p className="text-sm text-gray-500 mb-4">
              This will sync all user profiles ({userCount !== null ? userCount : '...'} users) to Airtable. 
              This operation may take some time to complete.
            </p>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={handleSyncAllUsers} 
              disabled={bulkSyncStatus === 'loading'}
              variant="secondary"
              className="w-full"
            >
              {bulkSyncStatus === 'loading' ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Syncing All Users...
                </>
              ) : (
                'Sync All Users'
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-medium mb-4">About Airtable Synchronization</h3>
        <div className="bg-blue-50 p-4 rounded-md border border-blue-100">
          <p className="text-sm text-blue-800 mb-2">
            <strong>What data is synchronized?</strong>
          </p>
          <ul className="list-disc pl-5 text-sm text-blue-700 space-y-1">
            <li>User profile information (name, email, location, etc.)</li>
            <li>Fear assessment results and scores</li>
            <li>Activity history and completion status</li>
            <li>Account metadata (creation date, last login)</li>
          </ul>
          <p className="text-sm text-blue-800 mt-4 mb-2">
            <strong>Data Privacy</strong>
          </p>
          <p className="text-sm text-blue-700">
            All data is synchronized in compliance with our privacy policy and GDPR requirements.
            Data is only accessible to authorized administrators for analysis and user support purposes.
          </p>
        </div>
      </div>
    </div>
  );
}
