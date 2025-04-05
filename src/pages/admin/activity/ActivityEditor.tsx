import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Save, ArrowLeft, Trash2, Upload } from 'lucide-react';
import { Activity } from './ActivityList';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

// Fear categories for selection
const FEAR_CATEGORIES = [
  'Social Anxiety',
  'Public Speaking',
  'Heights',
  'Spiders',
  'Darkness',
  'Failure',
  'Rejection',
  'Confined Spaces',
  'Flying',
  'Water',
  'Dogs',
  'Needles',
  'Driving',
  'Germs',
  'Crowds',
];

// Difficulty levels
const DIFFICULTY_LEVELS = [
  'Beginner',
  'Easy',
  'Moderate',
  'Challenging',
  'Advanced',
];

interface ActivityEditorProps {
  activityId: string | null;
  onSaved: () => void;
}

const ActivityEditor: React.FC<ActivityEditorProps> = ({ activityId, onSaved }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  // Form state
  const [activity, setActivity] = useState<Partial<Activity>>({
    title: '',
    description: '',
    imageUrl: '',
    difficulty: 'Moderate',
    fearCategories: [],
    status: 'draft',
  });
  
  // New fear category input
  const [newCategory, setNewCategory] = useState('');

  // Fetch activity if editing
  useEffect(() => {
    const fetchActivity = async () => {
      if (!activityId) return;
      
      try {
        setIsLoading(true);
        
        const { data, error } = await supabase
          .from('activities')
          .select('*')
          .eq('id', activityId)
          .single();
        
        if (error) {
          console.error('Error fetching activity:', error);
          toast({
            title: 'Error',
            description: 'Failed to load activity. Please try again.',
            variant: 'destructive',
          });
          return;
        }
        
        if (data) {
          setActivity({
            ...data,
            // Ensure compatibility with different field names
            imageUrl: data.imageUrl || data.image,
            difficultyLevel: data.difficultyLevel || data.difficulty,
          });
        }
      } catch (error) {
        console.error('Error in fetchActivity:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchActivity();
  }, [activityId, toast]);

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setActivity(prev => ({ ...prev, [name]: value }));
  };

  // Handle select changes
  const handleSelectChange = (name: string, value: string) => {
    setActivity(prev => ({ ...prev, [name]: value }));
  };

  // Add a fear category
  const addFearCategory = (category: string) => {
    if (!category) return;
    
    // Don't add duplicates
    if (activity.fearCategories?.includes(category)) {
      toast({
        title: 'Already Added',
        description: `"${category}" is already in the list.`,
      });
      return;
    }
    
    setActivity(prev => ({
      ...prev,
      fearCategories: [...(prev.fearCategories || []), category],
    }));
    
    // Clear input if it was a custom category
    if (category === newCategory) {
      setNewCategory('');
    }
  };

  // Remove a fear category
  const removeFearCategory = (category: string) => {
    setActivity(prev => ({
      ...prev,
      fearCategories: (prev.fearCategories || []).filter(c => c !== category),
    }));
  };

  // Handle image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    try {
      setIsUploading(true);
      
      const file = files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `activity-images/${fileName}`;
      
      // Upload file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('public')
        .upload(filePath, file);
      
      if (uploadError) {
        throw uploadError;
      }
      
      // Get public URL
      const { data } = supabase.storage
        .from('public')
        .getPublicUrl(filePath);
      
      // Update activity with image URL
      setActivity(prev => ({
        ...prev,
        imageUrl: data.publicUrl,
      }));
      
      toast({
        title: 'Image Uploaded',
        description: 'Image has been uploaded successfully.',
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: 'Upload Failed',
        description: 'Failed to upload image. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Save activity
  const saveActivity = async () => {
    // Validate required fields
    if (!activity.title || !activity.description) {
      toast({
        title: 'Missing Fields',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      setIsSaving(true);
      
      const now = new Date().toISOString();
      const activityData = {
        ...activity,
        // Ensure consistent field names
        difficulty: activity.difficultyLevel || activity.difficulty,
        image: activity.imageUrl,
        updated_at: now,
      };
      
      if (activityId) {
        // Update existing activity
        const { error } = await supabase
          .from('activities')
          .update(activityData)
          .eq('id', activityId);
        
        if (error) throw error;
        
        toast({
          title: 'Activity Updated',
          description: 'Activity has been updated successfully.',
        });
      } else {
        // Create new activity
        const { error } = await supabase
          .from('activities')
          .insert([{
            ...activityData,
            created_at: now,
            created_by: user?.id,
          }]);
        
        if (error) throw error;
        
        toast({
          title: 'Activity Created',
          description: 'Activity has been created successfully.',
        });
      }
      
      // Notify parent component
      onSaved();
    } catch (error) {
      console.error('Error saving activity:', error);
      toast({
        title: 'Save Failed',
        description: 'Failed to save activity. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex justify-between items-center mb-6">
          <Button variant="outline" onClick={onSaved}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to List
          </Button>
          <div className="flex gap-2">
            <Button 
              variant="default" 
              onClick={saveActivity} 
              disabled={isSaving}
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save Activity
            </Button>
          </div>
        </div>

        <div className="grid gap-6">
          {/* Title */}
          <div className="grid gap-2">
            <Label htmlFor="title">Title <span className="text-red-500">*</span></Label>
            <Input
              id="title"
              name="title"
              value={activity.title}
              onChange={handleChange}
              placeholder="Enter activity title"
              required
            />
          </div>

          {/* Description */}
          <div className="grid gap-2">
            <Label htmlFor="description">Description <span className="text-red-500">*</span></Label>
            <Textarea
              id="description"
              name="description"
              value={activity.description}
              onChange={handleChange}
              placeholder="Enter activity description"
              rows={4}
              required
            />
          </div>

          {/* Image Upload */}
          <div className="grid gap-2">
            <Label htmlFor="image">Image</Label>
            <div className="flex flex-col gap-4">
              {activity.imageUrl && (
                <div className="relative w-full max-w-xs">
                  <img 
                    src={activity.imageUrl} 
                    alt={activity.title} 
                    className="rounded-md object-cover h-40 w-full"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-8 w-8"
                    onClick={() => setActivity(prev => ({ ...prev, imageUrl: '' }))}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  onClick={() => document.getElementById('image-upload')?.click()}
                  disabled={isUploading}
                  className="w-fit"
                >
                  {isUploading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4 mr-2" />
                  )}
                  {activity.imageUrl ? 'Change Image' : 'Upload Image'}
                </Button>
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                {isUploading && <span className="text-sm text-muted-foreground">Uploading...</span>}
              </div>
            </div>
          </div>

          {/* Difficulty */}
          <div className="grid gap-2">
            <Label htmlFor="difficulty">Difficulty Level</Label>
            <Select
              value={activity.difficultyLevel || activity.difficulty}
              onValueChange={(value) => handleSelectChange('difficulty', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select difficulty" />
              </SelectTrigger>
              <SelectContent>
                {DIFFICULTY_LEVELS.map((level) => (
                  <SelectItem key={level} value={level}>
                    {level}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Fear Categories */}
          <div className="grid gap-2">
            <Label>Fear Categories</Label>
            <div className="flex flex-wrap gap-2 mb-4">
              {activity.fearCategories?.map((category) => (
                <Badge key={category} variant="secondary" className="pl-2 pr-1 py-1">
                  {category}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 ml-1"
                    onClick={() => removeFearCategory(category)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
              {activity.fearCategories?.length === 0 && (
                <span className="text-sm text-muted-foreground">No categories selected</span>
              )}
            </div>
            <div className="flex gap-2">
              <Select
                onValueChange={(value) => addFearCategory(value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Add fear category" />
                </SelectTrigger>
                <SelectContent>
                  {FEAR_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex gap-2">
                <Input
                  placeholder="Custom category"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                />
                <Button
                  variant="outline"
                  onClick={() => {
                    if (newCategory.trim()) {
                      addFearCategory(newCategory.trim());
                    }
                  }}
                  disabled={!newCategory.trim()}
                >
                  Add
                </Button>
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="grid gap-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={activity.status}
              onValueChange={(value) => handleSelectChange('status', value as 'published' | 'draft' | 'archived')}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ActivityEditor;
