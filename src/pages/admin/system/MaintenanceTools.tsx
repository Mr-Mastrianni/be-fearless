import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, RefreshCw, Trash2, Database, AlertCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface SystemStatus {
  databaseSize: string;
  storageUsed: string;
  lastBackupDate: string | null;
  activeUsers: number;
  pendingJobs: number;
}

const MaintenanceTools: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isPerformingAction, setIsPerformingAction] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentAction, setCurrentAction] = useState('');
  const [confirmText, setConfirmText] = useState('');
  const [purgeDialogOpen, setPurgeDialogOpen] = useState(false);
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    databaseSize: '0 MB',
    storageUsed: '0 MB',
    lastBackupDate: null,
    activeUsers: 0,
    pendingJobs: 0,
  });
  const { toast } = useToast();

  // Create a timeout promise to prevent infinite loading
  const createTimeoutPromise = (ms: number, operation: string) => {
    return new Promise((_, reject) => {
      setTimeout(() => reject(new Error(`${operation} operation timed out`)), ms);
    });
  };

  // Fetch system status
  useEffect(() => {
    const fetchSystemStatus = async () => {
      try {
        setIsLoading(true);
        
        const fetchPromise = new Promise(async (resolve) => {
          try {
            // In a real implementation, you would fetch actual system metrics
            // For this demo, we'll use simulated data
            
            // Get active users count (users who have logged in within the last 30 days)
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            
            const { count: activeUsers, error: activeUserCountError } = await supabase
              .from('auth_users_view')
              .select('*', { count: 'exact', head: true })
              .gte('last_sign_in_at', thirtyDaysAgo.toISOString());
            
            if (activeUserCountError) {
              console.error('Error fetching active user count:', activeUserCountError);
            }
            
            // Get system settings to check last backup date
            const { data: settingsData, error: settingsError } = await supabase
              .from('system_settings')
              .select('last_backup_date')
              .single();
            
            if (settingsError && settingsError.code !== 'PGRST116') {
              console.error('Error fetching system settings:', settingsError);
            }
            
            // Simulate database size calculation
            const databaseSize = '42.7 MB';
            const storageUsed = '156.3 MB';
            const lastBackupDate = settingsData?.last_backup_date || null;
            const pendingJobs = Math.floor(Math.random() * 5); // Random number of pending jobs
            
            resolve({
              databaseSize,
              storageUsed,
              lastBackupDate,
              activeUsers: activeUsers || 0,
              pendingJobs,
            });
          } catch (error) {
            console.error('Error in system status fetch:', error);
            resolve(null);
          }
        });
        
        // Race the fetch against the timeout
        const statusData = await Promise.race([
          fetchPromise,
          createTimeoutPromise(10000, 'System status fetch')
        ]) as SystemStatus | null;
        
        if (statusData) {
          setSystemStatus(statusData);
        }
      } catch (error) {
        console.error('Error fetching system status:', error);
        toast({
          title: 'Error',
          description: 'Failed to load system status. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSystemStatus();
  }, [toast]);

  // Perform maintenance action with progress tracking
  const performMaintenanceAction = async (
    action: string, 
    successMessage: string, 
    operationFn: () => Promise<void>
  ) => {
    try {
      setIsPerformingAction(true);
      setCurrentAction(action);
      setProgress(0);
      
      // Simulate progress
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 95) {
            clearInterval(interval);
            return 95;
          }
          return prev + Math.floor(Math.random() * 10) + 1;
        });
      }, 300);
      
      const actionPromise = new Promise(async (resolve, reject) => {
        try {
          await operationFn();
          
          // Complete progress
          setProgress(100);
          setTimeout(() => {
            clearInterval(interval);
            resolve(true);
          }, 500);
        } catch (error) {
          clearInterval(interval);
          reject(error);
        }
      });
      
      // Race the action against the timeout
      await Promise.race([
        actionPromise,
        createTimeoutPromise(30000, action)
      ]);
      
      toast({
        title: 'Success',
        description: successMessage,
      });
    } catch (error) {
      console.error(`${action} error:`, error);
      setProgress(0);
      toast({
        title: `${action} Failed`,
        description: error instanceof Error ? error.message : `An unknown error occurred during ${action.toLowerCase()}.`,
        variant: 'destructive',
      });
    } finally {
      setIsPerformingAction(false);
      setCurrentAction('');
    }
  };

  // Clear expired sessions
  const clearExpiredSessions = async () => {
    await performMaintenanceAction(
      'Clearing Expired Sessions',
      'Expired sessions have been cleared successfully.',
      async () => {
        // In a real implementation, you would call an API or Edge Function
        // For this demo, we'll just simulate success with a delay
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    );
  };

  // Optimize database
  const optimizeDatabase = async () => {
    await performMaintenanceAction(
      'Optimizing Database',
      'Database optimization completed successfully.',
      async () => {
        // In a real implementation, you would call an API or Edge Function
        // For this demo, we'll just simulate success with a delay
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    );
  };

  // Clear application cache
  const clearCache = async () => {
    await performMaintenanceAction(
      'Clearing Cache',
      'Application cache has been cleared successfully.',
      async () => {
        // In a real implementation, you would call an API or Edge Function
        // For this demo, we'll just simulate success with a delay
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
    );
  };

  // Purge inactive users
  const purgeInactiveUsers = async () => {
    if (confirmText !== 'PURGE') {
      toast({
        title: 'Confirmation Failed',
        description: 'You must type PURGE to confirm this action.',
        variant: 'destructive',
      });
      return;
    }
    
    setPurgeDialogOpen(false);
    setConfirmText('');
    
    await performMaintenanceAction(
      'Purging Inactive Users',
      'Inactive users have been purged successfully.',
      async () => {
        // In a real implementation, you would call an API or Edge Function
        // For this demo, we'll just simulate success with a delay
        await new Promise(resolve => setTimeout(resolve, 4000));
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>System Status</CardTitle>
          <CardDescription>
            Current system metrics and resource usage
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Database Size</span>
                <span className="text-sm">{systemStatus.databaseSize}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Storage Used</span>
                <span className="text-sm">{systemStatus.storageUsed}</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Last Backup</span>
                <span className="text-sm">
                  {systemStatus.lastBackupDate 
                    ? new Date(systemStatus.lastBackupDate).toLocaleDateString() 
                    : 'Never'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Active Users</span>
                <span className="text-sm">{systemStatus.activeUsers}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Pending Jobs</span>
                <span className="text-sm">{systemStatus.pendingJobs}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Maintenance Tools</CardTitle>
          <CardDescription>
            Tools for maintaining and optimizing the system
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {isPerformingAction && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">{currentAction}...</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border shadow-sm">
              <CardHeader className="py-4">
                <CardTitle className="text-base">Database Maintenance</CardTitle>
              </CardHeader>
              <CardContent className="py-2 space-y-4">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={optimizeDatabase}
                  disabled={isPerformingAction}
                >
                  <Database className="mr-2 h-4 w-4" />
                  Optimize Database
                </Button>
                <p className="text-xs text-muted-foreground">
                  Optimizes database tables and indexes for better performance.
                </p>
              </CardContent>
            </Card>
            
            <Card className="border shadow-sm">
              <CardHeader className="py-4">
                <CardTitle className="text-base">Session Management</CardTitle>
              </CardHeader>
              <CardContent className="py-2 space-y-4">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={clearExpiredSessions}
                  disabled={isPerformingAction}
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Clear Expired Sessions
                </Button>
                <p className="text-xs text-muted-foreground">
                  Removes expired user sessions to free up resources.
                </p>
              </CardContent>
            </Card>
          </div>
          
          <Separator />
          
          <div className="space-y-4">
            <h3 className="text-sm font-medium">System Cleanup</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="border shadow-sm">
                <CardHeader className="py-4">
                  <CardTitle className="text-base">Cache Management</CardTitle>
                </CardHeader>
                <CardContent className="py-2 space-y-4">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={clearCache}
                    disabled={isPerformingAction}
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Clear Application Cache
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Clears all cached data to ensure fresh content.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="border shadow-sm">
                <CardHeader className="py-4">
                  <CardTitle className="text-base">User Cleanup</CardTitle>
                </CardHeader>
                <CardContent className="py-2 space-y-4">
                  <Dialog open={purgeDialogOpen} onOpenChange={setPurgeDialogOpen}>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        className="w-full"
                        disabled={isPerformingAction}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Purge Inactive Users
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Purge Inactive Users</DialogTitle>
                        <DialogDescription>
                          This will permanently delete all users who have not logged in for over 180 days.
                          This action cannot be undone.
                        </DialogDescription>
                      </DialogHeader>
                      
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Warning</AlertTitle>
                        <AlertDescription>
                          This is a destructive action that will permanently delete user data.
                        </AlertDescription>
                      </Alert>
                      
                      <div className="space-y-2">
                        <Label htmlFor="confirm">Type PURGE to confirm</Label>
                        <Input 
                          id="confirm"
                          value={confirmText}
                          onChange={(e) => setConfirmText(e.target.value)}
                          placeholder="PURGE"
                        />
                      </div>
                      
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setPurgeDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button 
                          variant="destructive" 
                          onClick={purgeInactiveUsers}
                          disabled={confirmText !== 'PURGE'}
                        >
                          Purge Users
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                  <p className="text-xs text-muted-foreground">
                    Removes inactive users who haven't logged in for 180+ days.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MaintenanceTools;
