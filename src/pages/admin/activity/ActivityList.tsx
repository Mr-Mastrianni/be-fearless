import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Loader2, 
  Search, 
  Plus, 
  Edit2, 
  Copy, 
  Eye, 
  Trash2, 
  MoreHorizontal 
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

// Activity interface
export interface Activity {
  id: string;
  title: string;
  description: string;
  image?: string;
  imageUrl?: string;
  difficulty: string;
  difficultyLevel?: string;
  fearCategories: string[];
  status: 'published' | 'draft' | 'archived';
  created_at: string;
  updated_at: string;
  created_by?: string;
  popularity?: number;
  completion_count?: number;
}

interface ActivityListProps {
  onEditActivity: (activityId: string) => void;
  onCreateActivity: () => void;
}

const ActivityList: React.FC<ActivityListProps> = ({ 
  onEditActivity, 
  onCreateActivity 
}) => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [filteredActivities, setFilteredActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { toast } = useToast();

  // Fetch activities from the database
  const fetchActivities = async () => {
    try {
      setIsLoading(true);
      
      // Set a timeout to prevent getting stuck indefinitely
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Activity fetch timed out')), 10000);
      });
      
      const fetchPromise = new Promise(async (resolve) => {
        try {
          const { data, error } = await supabase
            .from('activities')
            .select('*')
            .order('created_at', { ascending: false });
          
          if (error) {
            console.error('Error fetching activities:', error);
            resolve([]);
            return;
          }
          
          resolve(data || []);
        } catch (error) {
          console.error('Error in activity fetch:', error);
          resolve([]);
        }
      });
      
      // Race the fetch against the timeout
      const activitiesData = await Promise.race([fetchPromise, timeoutPromise]) as Activity[];
      setActivities(activitiesData);
      setFilteredActivities(activitiesData);
    } catch (error) {
      console.error('Error fetching activities:', error);
      toast({
        title: 'Error',
        description: 'Failed to load activities. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Filter activities based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredActivities(activities);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = activities.filter(
        activity => 
          activity.title.toLowerCase().includes(query) || 
          activity.description.toLowerCase().includes(query) ||
          activity.fearCategories.some(category => category.toLowerCase().includes(query))
      );
      setFilteredActivities(filtered);
    }
  }, [searchQuery, activities]);

  // Fetch activities on component mount
  useEffect(() => {
    fetchActivities();
  }, []);

  // Handle activity deletion
  const handleDeleteActivity = async () => {
    if (!selectedActivity) return;
    
    setShowDeleteDialog(false);
    
    try {
      const { error } = await supabase
        .from('activities')
        .delete()
        .eq('id', selectedActivity.id);
      
      if (error) throw error;
      
      toast({
        title: 'Success',
        description: `"${selectedActivity.title}" has been deleted.`,
      });
      
      // Refresh activity list
      fetchActivities();
    } catch (error) {
      console.error('Error deleting activity:', error);
      toast({
        title: 'Error',
        description: `Failed to delete activity. ${error instanceof Error ? error.message : ''}`,
        variant: 'destructive',
      });
    }
  };

  // Handle activity duplication
  const handleDuplicateActivity = async (activity: Activity) => {
    try {
      // Create a new activity based on the selected one
      const newActivity = {
        ...activity,
        id: undefined, // Remove ID to let Supabase generate a new one
        title: `${activity.title} (Copy)`,
        status: 'draft' as const,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      const { error } = await supabase
        .from('activities')
        .insert([newActivity]);
      
      if (error) throw error;
      
      toast({
        title: 'Success',
        description: `"${activity.title}" has been duplicated.`,
      });
      
      // Refresh activity list
      fetchActivities();
    } catch (error) {
      console.error('Error duplicating activity:', error);
      toast({
        title: 'Error',
        description: `Failed to duplicate activity. ${error instanceof Error ? error.message : ''}`,
        variant: 'destructive',
      });
    }
  };

  // Get status badge for activity
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Published
          </Badge>
        );
      case 'draft':
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
            Draft
          </Badge>
        );
      case 'archived':
        return (
          <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
            Archived
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            {status}
          </Badge>
        );
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search activities..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button onClick={onCreateActivity} className="ml-2">
          <Plus className="h-4 w-4 mr-2" />
          Create Activity
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Activity</TableHead>
                <TableHead>Fear Categories</TableHead>
                <TableHead>Difficulty</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredActivities.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                    {searchQuery ? 'No activities match your search' : 'No activities found'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredActivities.map((activity) => (
                  <TableRow key={activity.id}>
                    <TableCell className="font-medium">
                      <div className="flex flex-col">
                        <span>{activity.title}</span>
                        <span className="text-sm text-muted-foreground truncate max-w-[200px]">
                          {activity.description}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {activity.fearCategories.slice(0, 3).map((category, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {category}
                          </Badge>
                        ))}
                        {activity.fearCategories.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{activity.fearCategories.length - 3}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {activity.difficultyLevel || activity.difficulty}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(activity.status)}
                    </TableCell>
                    <TableCell>{formatDate(activity.created_at)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => onEditActivity(activity.id)}>
                            <Edit2 className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDuplicateActivity(activity)}>
                            <Copy className="h-4 w-4 mr-2" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => window.open(`/activities/${activity.id}`, '_blank')}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedActivity(activity);
                              setShowDeleteDialog(true);
                            }}
                            className="text-red-600 focus:text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Activity</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this activity. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          {selectedActivity && (
            <div className="py-4">
              <p className="font-medium">{selectedActivity.title}</p>
              <p className="text-sm text-muted-foreground truncate">{selectedActivity.description}</p>
            </div>
          )}
          
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteActivity} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ActivityList;
