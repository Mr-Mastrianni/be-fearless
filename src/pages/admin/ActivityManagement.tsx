import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';
import ActivityList from './activity/ActivityList';
import ActivityEditor from './activity/ActivityEditor';
import ActivityStats from './activity/ActivityStats';

/**
 * ActivityManagement component for admin activity management
 * Provides tabs for different activity management functions
 */
const ActivityManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState('list');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(null);

  // Handle tab change
  const handleTabChange = (value: string) => {
    setIsLoading(true);
    setActiveTab(value);
    // Simulate loading for better UX
    setTimeout(() => setIsLoading(false), 300);
  };

  // Handle activity selection for editing
  const handleEditActivity = (activityId: string) => {
    setSelectedActivityId(activityId);
    setActiveTab('edit');
  };

  // Handle new activity creation
  const handleCreateActivity = () => {
    setSelectedActivityId(null);
    setActiveTab('edit');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity Management</CardTitle>
        <CardDescription>
          Create, edit, and manage activities for users
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs 
          defaultValue="list" 
          value={activeTab}
          onValueChange={handleTabChange}
          className="w-full"
        >
          <TabsList className="grid grid-cols-3 mb-8">
            <TabsTrigger value="list">Activity List</TabsTrigger>
            <TabsTrigger value="edit">
              {selectedActivityId ? 'Edit Activity' : 'Create Activity'}
            </TabsTrigger>
            <TabsTrigger value="stats">Activity Stats</TabsTrigger>
          </TabsList>
          
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              <TabsContent value="list" className="space-y-4">
                <ActivityList 
                  onEditActivity={handleEditActivity} 
                  onCreateActivity={handleCreateActivity}
                />
              </TabsContent>
              
              <TabsContent value="edit" className="space-y-4">
                <ActivityEditor 
                  activityId={selectedActivityId} 
                  onSaved={() => setActiveTab('list')}
                />
              </TabsContent>
              
              <TabsContent value="stats" className="space-y-4">
                <ActivityStats />
              </TabsContent>
            </>
          )}
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ActivityManagement;
