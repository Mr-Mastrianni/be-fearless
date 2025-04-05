import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Users, Activity, Award, Clock } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface SystemStatsData {
  totalUsers: number;
  newUsers: number;
  activeUsers: number;
  totalActivities: number;
  totalCompletions: number;
  averageCompletionRate: number;
  usersByExperienceLevel: Record<string, number>;
  usersByFearCategory: Record<string, number>;
}

const SystemStats: React.FC = () => {
  const [stats, setStats] = useState<SystemStatsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Fetch system statistics
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        
        // Set a timeout to prevent getting stuck indefinitely
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Stats fetch timed out')), 10000);
        });
        
        const fetchPromise = new Promise(async (resolve) => {
          try {
            // Get total users count
            const { count: totalUsers, error: userCountError } = await supabase
              .from('user_profiles')
              .select('*', { count: 'exact', head: true });
            
            if (userCountError) {
              console.error('Error fetching user count:', userCountError);
            }
            
            // Get new users in the last 30 days
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            
            const { count: newUsers, error: newUserCountError } = await supabase
              .from('user_profiles')
              .select('*', { count: 'exact', head: true })
              .gte('created_at', thirtyDaysAgo.toISOString());
            
            if (newUserCountError) {
              console.error('Error fetching new user count:', newUserCountError);
            }
            
            // Get active users (users who have logged in within the last 30 days)
            const { count: activeUsers, error: activeUserCountError } = await supabase
              .from('auth_users_view')
              .select('*', { count: 'exact', head: true })
              .gte('last_sign_in_at', thirtyDaysAgo.toISOString());
            
            if (activeUserCountError) {
              console.error('Error fetching active user count:', activeUserCountError);
            }
            
            // Get total activities count
            const { count: totalActivities, error: activityCountError } = await supabase
              .from('activities')
              .select('*', { count: 'exact', head: true });
            
            if (activityCountError) {
              console.error('Error fetching activity count:', activityCountError);
            }
            
            // Get user profiles for more detailed stats
            const { data: userProfiles, error: profileError } = await supabase
              .from('user_profiles')
              .select('experience_level, key_fears, progress_tracking');
            
            if (profileError) {
              console.error('Error fetching user profiles:', profileError);
            }
            
            // Process user profiles data
            const experienceLevelCount: Record<string, number> = {};
            const fearCategoryCount: Record<string, number> = {};
            let totalCompletions = 0;
            let usersWithActivities = 0;
            
            (userProfiles || []).forEach(profile => {
              // Count by experience level
              if (profile.experience_level) {
                experienceLevelCount[profile.experience_level] = 
                  (experienceLevelCount[profile.experience_level] || 0) + 1;
              }
              
              // Count by fear categories
              (profile.key_fears || []).forEach(fear => {
                fearCategoryCount[fear] = (fearCategoryCount[fear] || 0) + 1;
              });
              
              // Count activity completions
              const activities = profile.progress_tracking?.activities || [];
              const completedActivities = activities.filter((a: any) => a.status === 'completed');
              
              if (activities.length > 0) {
                usersWithActivities++;
              }
              
              totalCompletions += completedActivities.length;
            });
            
            // Calculate average completion rate
            const averageCompletionRate = usersWithActivities > 0 
              ? Math.round((totalCompletions / usersWithActivities) * 100) / 100
              : 0;
            
            resolve({
              totalUsers: totalUsers || 0,
              newUsers: newUsers || 0,
              activeUsers: activeUsers || 0,
              totalActivities: totalActivities || 0,
              totalCompletions,
              averageCompletionRate,
              usersByExperienceLevel: experienceLevelCount,
              usersByFearCategory: fearCategoryCount,
            });
          } catch (error) {
            console.error('Error in stats fetch:', error);
            resolve(null);
          }
        });
        
        // Race the fetch against the timeout
        const statsData = await Promise.race([fetchPromise, timeoutPromise]) as SystemStatsData | null;
        setStats(statsData);
      } catch (error) {
        console.error('Error fetching system stats:', error);
        toast({
          title: 'Error',
          description: 'Failed to load system statistics. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchStats();
  }, [toast]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Failed to load statistics. Please try again.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              {stats.newUsers} new in the last 30 days
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeUsers}</div>
            <p className="text-xs text-muted-foreground">
              Active in the last 30 days
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Activities</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalActivities}</div>
            <p className="text-xs text-muted-foreground">
              Available in the system
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completions</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCompletions}</div>
            <p className="text-xs text-muted-foreground">
              Avg {stats.averageCompletionRate} per active user
            </p>
          </CardContent>
        </Card>
      </div>

      {/* User Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* By Experience Level */}
        <Card>
          <CardHeader>
            <CardTitle>Users by Experience Level</CardTitle>
            <CardDescription>
              Distribution of users across experience levels
            </CardDescription>
          </CardHeader>
          <CardContent>
            {Object.keys(stats.usersByExperienceLevel).length > 0 ? (
              <div className="space-y-2">
                {Object.entries(stats.usersByExperienceLevel)
                  .sort((a, b) => b[1] - a[1])
                  .map(([level, count]) => (
                    <div key={level} className="flex items-center justify-between">
                      <span className="text-sm">{level}</span>
                      <div className="flex items-center">
                        <div className="w-32 h-2 bg-gray-100 rounded-full mr-2 overflow-hidden">
                          <div 
                            className="h-full bg-primary rounded-full" 
                            style={{ 
                              width: `${Math.min(100, (count / stats.totalUsers) * 100)}%` 
                            }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">{count}</span>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">
                No experience level data available
              </p>
            )}
          </CardContent>
        </Card>

        {/* By Fear Category */}
        <Card>
          <CardHeader>
            <CardTitle>Users by Fear Category</CardTitle>
            <CardDescription>
              Distribution of users across fear categories
            </CardDescription>
          </CardHeader>
          <CardContent>
            {Object.keys(stats.usersByFearCategory).length > 0 ? (
              <div className="space-y-2">
                {Object.entries(stats.usersByFearCategory)
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 10) // Show top 10 categories
                  .map(([category, count]) => (
                    <div key={category} className="flex items-center justify-between">
                      <span className="text-sm">{category}</span>
                      <div className="flex items-center">
                        <div className="w-32 h-2 bg-gray-100 rounded-full mr-2 overflow-hidden">
                          <div 
                            className="h-full bg-primary rounded-full" 
                            style={{ 
                              width: `${Math.min(100, (count / stats.totalUsers) * 100)}%` 
                            }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">{count}</span>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">
                No fear category data available
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle>System Status</CardTitle>
          <CardDescription>
            Current system health and status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Database Status</span>
              <span className="text-sm text-green-600 flex items-center">
                <span className="h-2 w-2 rounded-full bg-green-600 mr-2"></span>
                Operational
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Authentication Service</span>
              <span className="text-sm text-green-600 flex items-center">
                <span className="h-2 w-2 rounded-full bg-green-600 mr-2"></span>
                Operational
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Storage Service</span>
              <span className="text-sm text-green-600 flex items-center">
                <span className="h-2 w-2 rounded-full bg-green-600 mr-2"></span>
                Operational
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Edge Functions</span>
              <span className="text-sm text-green-600 flex items-center">
                <span className="h-2 w-2 rounded-full bg-green-600 mr-2"></span>
                Operational
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemStats;
