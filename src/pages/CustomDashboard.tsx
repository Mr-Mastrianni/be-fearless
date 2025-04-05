import React, { useState, useEffect, Fragment } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserPreferences } from '@/contexts/UserPreferencesContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import ThemeSwitcher from '@/components/personalization/ThemeSwitcher';
import DashboardPreferences from '@/components/personalization/DashboardPreferences';
import ExperienceSettings from '@/components/personalization/ExperienceSettings';
import ProfileCompletionCheck from '@/components/ProfileCompletionCheck';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Settings } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

// Define interfaces to match what's expected in UserPreferencesContext
interface DashboardLayout {
  viewMode: 'grid' | 'list';
  widgets: {
    activity: { visible: boolean, position: number, size: 'small' | 'medium' | 'large' };
    progress: { visible: boolean, position: number, size: 'small' | 'medium' | 'large' };
    journal: { visible: boolean, position: number, size: 'small' | 'medium' | 'large' };
    recommended: { visible: boolean, position: number, size: 'small' | 'medium' | 'large' };
    personalized: { visible: boolean, position: number, size: 'small' | 'medium' | 'large' };
  };
}

const defaultDashboardLayout: DashboardLayout = {
  viewMode: 'grid',
  widgets: {
    activity: { visible: true, position: 0, size: 'medium' },
    progress: { visible: false, position: 1, size: 'large' },  // Set to not visible
    journal: { visible: false, position: 2, size: 'medium' },  // Set to not visible
    recommended: { visible: false, position: 3, size: 'medium' }, // Set to not visible
    personalized: { visible: false, position: 4, size: 'large' }, // Set to not visible
  },
};

const CustomDashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { preferences, dashboardLayout, setUserPreferences, updateDashboardLayout } = useUserPreferences();
  const { theme } = useTheme();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    console.log("Dashboard mounted with:", { 
      user,
      dashboardLayout: dashboardLayout || 'undefined',
      preferences: preferences || 'undefined'
    });
    
    // If we have a user but no preferences, create default ones
    if (user && (!preferences || !dashboardLayout)) {
      console.log("No preferences found for user, initializing defaults");
      setUserPreferences({
        dashboardLayout: defaultDashboardLayout,
        experiencePreferences: {
          difficulty: 'beginner',
          focus: ['general'],
          pacing: 'moderate',
          guidance: 'balanced',
        },
        notificationPreferences: {
          email: true,
          push: true,
          frequency: 'weekly',
        }
      });
    }
  }, [user, preferences, dashboardLayout, setUserPreferences]);

  // Load user data
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setIsLoading(true);
        
        // Simple timeout to simulate loading
        setTimeout(() => {
          setIsLoading(false);
        }, 1000);
        
      } catch (error) {
        console.error("Error loading dashboard data:", error);
        setIsLoading(false);
        toast({
          title: "Error loading dashboard",
          description: "There was a problem loading your data. Please try refreshing the page.",
          variant: "destructive",
        });
      }
    };
    
    loadDashboardData();
  }, [toast]);

  // Fallback if profile data or preferences haven't loaded yet
  useEffect(() => {
    if (!isLoading && (!preferences || !preferences.experiencePreferences)) {
      console.log("Dashboard loaded but preferences not found, initializing defaults");
      
      // Create default preferences if they don't exist
      setUserPreferences({
        dashboardLayout: defaultDashboardLayout,
        experiencePreferences: {
          focus: [],
          difficulty: 'beginner',
          pacing: 'moderate',
          guidance: 'balanced'
        },
        notificationPreferences: {
          email: true,
          push: true,
          frequency: 'weekly'
        }
      });
      
      toast({
        title: "Using default settings",
        description: "We've set up some default preferences for you. You can customize them in your profile.",
      });
    }
  }, [isLoading, preferences, setUserPreferences, toast]);

  // Render a "Content Removed" widget when needed
  const renderContentRemovedWidget = (title) => {
    return (
      <Card className="min-h-[300px]">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>This content has been removed</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[200px]">
            <p className="text-muted-foreground text-center">
              This dashboard section has been removed as requested.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Get visible widgets
  const getVisibleWidgets = () => {
    try {
      // If we don't have a dashboardLayout yet, use the default
      if (!dashboardLayout || !dashboardLayout.widgets) {
        console.log('Using default dashboard layout for widgets');
        return Object.entries(defaultDashboardLayout.widgets)
          .filter(([_, widget]) => widget.visible)
          .sort(([_, a], [__, b]) => a.position - b.position)
          .map(([key, widget]) => ({ key, ...widget }));
      }
      
      // Use the user's dashboard layout
      console.log('Using user dashboard layout for widgets');
      return Object.entries(dashboardLayout.widgets)
        .filter(([_, widget]) => widget && widget.visible)
        .sort(([_, a], [__, b]) => {
          // Ensure positions are numbers and provide fallbacks
          const posA = typeof a.position === 'number' ? a.position : 0;
          const posB = typeof b.position === 'number' ? b.position : 0;
          return posA - posB;
        })
        .map(([key, widget]) => ({ key, ...widget }));
    } catch (error) {
      console.error('Error in getVisibleWidgets:', error);
      return [];
    }
  };
  
  // Get widgets when needed (not on every render)
  const visibleWidgets = getVisibleWidgets();

  return (
    <div className="min-h-screen bg-background">
      <ProfileCompletionCheck>
        <main className="container mx-auto px-4 pt-8 pb-16">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
            <div>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigate('/profile')}
                className="flex items-center gap-2"
              >
                <User className="h-4 w-4" /> Profile
              </Button>
              
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <Settings className="h-4 w-4" /> Settings
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <h4 className="font-medium leading-none">Dashboard Preferences</h4>
                      <p className="text-sm text-muted-foreground">Customize your dashboard layout</p>
                      <Separator />
                      <DashboardPreferences />
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium leading-none">Experience</h4>
                      <p className="text-sm text-muted-foreground">Adjust your experience settings</p>
                      <Separator />
                      <ExperienceSettings />
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium leading-none">Theme</h4>
                      <p className="text-sm text-muted-foreground">Change the theme</p>
                      <Separator />
                      <ThemeSwitcher />
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Dashboard content */}
          <div className="space-y-6">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Skeleton className="h-[300px] w-full" />
                <Skeleton className="h-[300px] w-full" />
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {/* Welcome Card */}
                <Card className="border-t-4 border-t-amber-500">
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center text-center md:items-start md:text-left">
                      <p className="text-muted-foreground mb-4">
                        {new Date().toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </p>
                      <p className="max-w-2xl text-lg mb-6">
                        Ready to continue your courage journey today?
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Navigation Buttons */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="hover:border-amber-500 hover:shadow-md transition-all duration-200">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Explore Activities</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-4">
                        Discover new challenges to build your courage muscles.
                      </p>
                      <Button 
                        className="w-full" 
                        onClick={() => navigate('/activities')}
                      >
                        Browse Activities
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="hover:border-amber-500 hover:shadow-md transition-all duration-200">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Your Profile</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-4">
                        Update your information and track your progress.
                      </p>
                      <Button 
                        className="w-full" 
                        variant="outline" 
                        onClick={() => navigate('/profile')}
                      >
                        View Profile
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="hover:border-amber-500 hover:shadow-md transition-all duration-200">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Community</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-4">
                        Connect with others on their courage journey.
                      </p>
                      <Button 
                        className="w-full" 
                        variant="outline" 
                        onClick={() => navigate('/community')}
                      >
                        Join Community
                      </Button>
                    </CardContent>
                  </Card>
                </div>
                
                {/* Daily Courage Tip */}
                <Card className="bg-indigo-50 dark:bg-indigo-950/20">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-md flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-500">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="16" x2="12" y2="12"></line>
                        <line x1="12" y1="8" x2="12.01" y2="8"></line>
                      </svg>
                      Daily Courage Tip
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="italic">
                      "Courage doesn't always roar. Sometimes courage is the quiet voice at the end of the day saying, 'I will try again tomorrow.'" — Mary Anne Radmacher
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </main>
      </ProfileCompletionCheck>
    </div>
  );
};

export default CustomDashboard;
