import React, { useState, useEffect } from 'react';
import { useActivityMatcher } from '@/contexts/ActivityMatcherContext';
import ActivityFilters from './ActivityFilters';
import ActivityList from './ActivityList';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Grid, List, Search, FolderHeart, Filter, X, Folder } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';

interface ActivityMatcherProps {
  className?: string;
}

const ActivityMatcher: React.FC<ActivityMatcherProps> = ({ className = '' }) => {
  const { 
    filteredActivities, 
    matchedActivities, 
    setSortOrder, 
    sortOrder, 
    searchTerm, 
    setSearchTerm,
    setViewMode,
    viewMode,
    fearAssessmentData,
    refreshUserPreferences
  } = useActivityMatcher();
  
  const [activeTab, setActiveTab] = useState('all');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Refresh recommendations based on latest assessment
  const handleRefreshRecommendations = async () => {
    toast({
      title: "Refreshing Activities",
      description: "Updating your activity recommendations based on your latest assessment."
    });
    await refreshUserPreferences();
  };
  
  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  
  // Handle search clear
  const handleSearchClear = () => {
    setSearchTerm('');
  };
  
  // Handle sort order change
  const handleSortChange = (value: string) => {
    setSortOrder(value as 'alphabetical' | 'difficulty_asc' | 'difficulty_desc' | 'recommended');
  };
  
  // Check if user has taken the assessment and show prompt if not
  useEffect(() => {
    if (user && !fearAssessmentData) {
      setFiltersOpen(true);
    } else {
      setFiltersOpen(false);
    }
  }, [user, fearAssessmentData]);
  
  return (
    <div className={`container mx-auto px-4 pt-6 pb-20 ${className}`}>
      <div className="bg-card rounded-xl shadow-sm border mb-8">
        {/* Header area */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <h1 className="text-2xl md:text-3xl font-bold">
              Find Your Next Courage Adventure
            </h1>
            
            {/* Sort and View Controls */}
            <div className="flex items-center space-x-3">
              <Select 
                value={sortOrder}
                onValueChange={(value) => setSortOrder(value as typeof sortOrder)}
              >
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recommended">Recommended</SelectItem>
                  <SelectItem value="alphabetical">Alphabetical</SelectItem>
                  <SelectItem value="difficulty_asc">Easiest First</SelectItem>
                  <SelectItem value="difficulty_desc">Hardest First</SelectItem>
                </SelectContent>
              </Select>
              
              <div className="border rounded-md overflow-hidden flex">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="icon"
                  onClick={() => setViewMode('grid')}
                  className="rounded-none"
                >
                  <Grid size={16} />
                  <span className="sr-only">Grid View</span>
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="icon"
                  onClick={() => setViewMode('list')}
                  className="rounded-none"
                >
                  <List size={16} />
                  <span className="sr-only">List View</span>
                </Button>
              </div>
            </div>
          </div>
          
          {/* Assessment Prompt for users without assessment */}
          {filtersOpen && (
            <div className="bg-muted/40 border rounded-lg p-4 mb-4 flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <Folder className="h-5 w-5 text-primary" />
                <p className="text-sm">
                  Take the Fear Assessment Quiz to get personalized activity recommendations!
                </p>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  navigate('/');
                  setTimeout(() => {
                    const heroSection = document.getElementById('hero');
                    if (heroSection) {
                      heroSection.scrollIntoView({ behavior: 'smooth' });
                      // Trigger assessment modal via local storage
                      localStorage.setItem('openAssessment', 'true');
                    }
                  }, 100);
                }}
              >
                Take Quiz
              </Button>
            </div>
          )}
          
          {/* Recently taken assessment message */}
          {fearAssessmentData && (
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <FolderHeart className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium">
                    We've personalized your activities based on your fear assessment
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {fearAssessmentData.timestamp ? (
                      `Taken on: ${new Date(fearAssessmentData.timestamp).toLocaleDateString()}`
                    ) : (
                      "Your preferences have been saved"
                    )}
                  </p>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleRefreshRecommendations}
              >
                Refresh
              </Button>
            </div>
          )}

          {/* Search and filter controls */}
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search activities..."
              className="pl-9"
              value={searchTerm}
              onChange={handleSearchChange}
            />
            {searchTerm && (
              <button 
                className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground hover:text-foreground"
                onClick={handleSearchClear}
              >
                <X size={16} />
              </button>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {/* Mobile filters */}
            <div className="block lg:hidden">
              <ActivityFilters viewType="sheet" />
            </div>
          </div>
        </div>

        {/* Activity content area */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar filters (desktop) */}
          <div className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-6">
              <ActivityFilters viewType="sidebar" />
            </div>
          </div>
          
          {/* Main content */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
            </div>
            
            {/* Tabs */}
            <Tabs
              defaultValue="all"
              value={activeTab}
              onValueChange={setActiveTab}
              className="mb-6"
            >
              <TabsList>
                <TabsTrigger value="all">
                  All Activities
                  <Badge variant="secondary" className="ml-2">
                    {filteredActivities.length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="recommended">
                  <FolderHeart size={14} className="mr-1" />
                  Recommended For You
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="all" className="mt-6">
                <ActivityList className="pb-8" viewMode={viewMode} listType="all" />
              </TabsContent>
              
              <TabsContent value="recommended" className="mt-6">
                {fearAssessmentData ? (
                  <ActivityList 
                    className="pb-8" 
                    viewMode={viewMode} 
                    listType="recommended"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center p-12 text-center">
                    <FolderHeart size={48} className="text-muted-foreground mb-4" />
                    <h3 className="text-xl font-medium mb-2">
                      Complete your profile to get personalized recommendations
                    </h3>
                    <p className="text-muted-foreground mb-6 max-w-md">
                      We'll provide activities tailored to your fear profile and preferences.
                    </p>
                    <Button>Complete Your Profile</Button>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityMatcher;
