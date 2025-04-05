import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, TrendingUp, Users, Award, Clock } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Activity } from './ActivityList';

interface ActivityStatsData {
  totalActivities: number;
  publishedActivities: number;
  draftActivities: number;
  archivedActivities: number;
  totalCompletions: number;
  mostPopularActivities: Activity[];
  activityByFearCategory: Record<string, number>;
  activityByDifficulty: Record<string, number>;
  recentActivities: Activity[];
}

const ActivityStats: React.FC = () => {
  const [stats, setStats] = useState<ActivityStatsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Fetch activity statistics
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
            // Fetch all activities
            const { data: activities, error } = await supabase
              .from('activities')
              .select('*')
              .order('created_at', { ascending: false });
            
            if (error) {
              console.error('Error fetching activities:', error);
              resolve(null);
              return;
            }
            
            // Calculate stats
            const activitiesData = activities || [];
            const publishedActivities = activitiesData.filter(a => a.status === 'published');
            const draftActivities = activitiesData.filter(a => a.status === 'draft');
            const archivedActivities = activitiesData.filter(a => a.status === 'archived');
            
            // Count activities by fear category
            const categoryCount: Record<string, number> = {};
            activitiesData.forEach(activity => {
              (activity.fearCategories || []).forEach(category => {
                categoryCount[category] = (categoryCount[category] || 0) + 1;
              });
            });
            
            // Count activities by difficulty
            const difficultyCount: Record<string, number> = {};
            activitiesData.forEach(activity => {
              const difficulty = activity.difficultyLevel || activity.difficulty;
              difficultyCount[difficulty] = (difficultyCount[difficulty] || 0) + 1;
            });
            
            // Get most popular activities (using completion_count or a default value)
            const sortedByPopularity = [...activitiesData].sort((a, b) => 
              (b.completion_count || 0) - (a.completion_count || 0)
            );
            
            // Get recent activities
            const recentActivities = activitiesData.slice(0, 5);
            
            // Fetch user activity completions (from user_profiles.progress_tracking)
            const { data: userProfiles, error: profileError } = await supabase
              .from('user_profiles')
              .select('progress_tracking');
            
            if (profileError) {
              console.error('Error fetching user profiles:', profileError);
            }
            
            // Count total activity completions
            let totalCompletions = 0;
            (userProfiles || []).forEach(profile => {
              const activities = profile.progress_tracking?.activities || [];
              const completedActivities = activities.filter((a: any) => a.status === 'completed');
              totalCompletions += completedActivities.length;
            });
            
            resolve({
              totalActivities: activitiesData.length,
              publishedActivities: publishedActivities.length,
              draftActivities: draftActivities.length,
              archivedActivities: archivedActivities.length,
              totalCompletions,
              mostPopularActivities: sortedByPopularity.slice(0, 5),
              activityByFearCategory: categoryCount,
              activityByDifficulty: difficultyCount,
              recentActivities,
            });
          } catch (error) {
            console.error('Error in stats fetch:', error);
            resolve(null);
          }
        });
        
        // Race the fetch against the timeout
        const statsData = await Promise.race([fetchPromise, timeoutPromise]) as ActivityStatsData | null;
        setStats(statsData);
      } catch (error) {
        console.error('Error fetching activity stats:', error);
        toast({
          title: 'Error',
          description: 'Failed to load activity statistics. Please try again.',
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
            <CardTitle className="text-sm font-medium">Total Activities</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalActivities}</div>
            <p className="text-xs text-muted-foreground">
              {stats.publishedActivities} published, {stats.draftActivities} drafts
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Activity Completions</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCompletions}</div>
            <p className="text-xs text-muted-foreground">
              Total user completions
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fear Categories</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Object.keys(stats.activityByFearCategory).length}</div>
            <p className="text-xs text-muted-foreground">
              Unique fear categories
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Activities</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.recentActivities.length}</div>
            <p className="text-xs text-muted-foreground">
              Added in the last 30 days
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Popular Activities */}
      <Card>
        <CardHeader>
          <CardTitle>Most Popular Activities</CardTitle>
          <CardDescription>
            Activities with the highest completion rates
          </CardDescription>
        </CardHeader>
        <CardContent>
          {stats.mostPopularActivities.length > 0 ? (
            <div className="space-y-4">
              {stats.mostPopularActivities.map((activity, index) => (
                <div key={activity.id} className="flex items-center">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                    <span className="text-sm font-medium">{index + 1}</span>
                  </div>
                  <div className="flex-grow">
                    <h4 className="text-sm font-medium">{activity.title}</h4>
                    <p className="text-xs text-muted-foreground">
                      {activity.fearCategories?.join(', ')}
                    </p>
                  </div>
                  <div className="text-sm font-medium">
                    {activity.completion_count || 0} completions
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-4">
              No activity completion data available yet
            </p>
          )}
        </CardContent>
      </Card>

      {/* Activity Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* By Fear Category */}
        <Card>
          <CardHeader>
            <CardTitle>Activities by Fear Category</CardTitle>
            <CardDescription>
              Distribution of activities across fear categories
            </CardDescription>
          </CardHeader>
          <CardContent>
            {Object.keys(stats.activityByFearCategory).length > 0 ? (
              <div className="space-y-2">
                {Object.entries(stats.activityByFearCategory)
                  .sort((a, b) => b[1] - a[1])
                  .map(([category, count]) => (
                    <div key={category} className="flex items-center justify-between">
                      <span className="text-sm">{category}</span>
                      <div className="flex items-center">
                        <div className="w-32 h-2 bg-gray-100 rounded-full mr-2 overflow-hidden">
                          <div 
                            className="h-full bg-primary rounded-full" 
                            style={{ 
                              width: `${Math.min(100, (count / stats.totalActivities) * 100)}%` 
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

        {/* By Difficulty */}
        <Card>
          <CardHeader>
            <CardTitle>Activities by Difficulty</CardTitle>
            <CardDescription>
              Distribution of activities across difficulty levels
            </CardDescription>
          </CardHeader>
          <CardContent>
            {Object.keys(stats.activityByDifficulty).length > 0 ? (
              <div className="space-y-2">
                {Object.entries(stats.activityByDifficulty)
                  .sort((a, b) => b[1] - a[1])
                  .map(([difficulty, count]) => (
                    <div key={difficulty} className="flex items-center justify-between">
                      <span className="text-sm">{difficulty}</span>
                      <div className="flex items-center">
                        <div className="w-32 h-2 bg-gray-100 rounded-full mr-2 overflow-hidden">
                          <div 
                            className="h-full bg-primary rounded-full" 
                            style={{ 
                              width: `${Math.min(100, (count / stats.totalActivities) * 100)}%` 
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
                No difficulty data available
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ActivityStats;
