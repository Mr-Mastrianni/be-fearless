import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';

interface ActivityFormData {
  title: string;
  description: string;
  fearType: string;
  difficulty: string;
  date: string;
}

interface SimpleActivityFormProps {
  onSubmit?: (data: ActivityFormData) => void;
  onCancel?: () => void;
}

const SimpleActivityForm: React.FC<SimpleActivityFormProps> = ({ 
  onSubmit,
  onCancel
}) => {
  const [formData, setFormData] = useState<ActivityFormData>({
    title: '',
    description: '',
    fearType: '',
    difficulty: 'beginner',
    date: new Date().toISOString().split('T')[0], // Today's date in YYYY-MM-DD format
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.fearType) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (onSubmit) {
        onSubmit(formData);
      }
      
      toast({
        title: "Activity Logged",
        description: "Your activity has been recorded successfully",
      });
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        fearType: '',
        difficulty: 'beginner',
        date: new Date().toISOString().split('T')[0],
      });
    } catch (error) {
      console.error('Error submitting activity:', error);
      toast({
        title: "Submission Failed",
        description: "There was an error logging your activity",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Activity Title *</Label>
        <Input
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="What did you do?"
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Describe your experience..."
          rows={3}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="fearType">Fear Type *</Label>
          <Select 
            value={formData.fearType} 
            onValueChange={(value) => handleSelectChange('fearType', value)}
          >
            <SelectTrigger id="fearType">
              <SelectValue placeholder="Select a fear type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="public-speaking">Public Speaking</SelectItem>
              <SelectItem value="heights">Heights</SelectItem>
              <SelectItem value="social">Social Situations</SelectItem>
              <SelectItem value="rejection">Rejection</SelectItem>
              <SelectItem value="failure">Failure</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="difficulty">Difficulty Level</Label>
          <Select 
            value={formData.difficulty} 
            onValueChange={(value) => handleSelectChange('difficulty', value)}
          >
            <SelectTrigger id="difficulty">
              <SelectValue placeholder="Select difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="beginner">Beginner</SelectItem>
              <SelectItem value="intermediate">Intermediate</SelectItem>
              <SelectItem value="advanced">Advanced</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="date">Date</Label>
        <Input
          id="date"
          name="date"
          type="date"
          value={formData.date}
          onChange={handleChange}
        />
      </div>
      
      <div className="flex justify-end space-x-2 pt-2">
        {onCancel && (
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
          >
            Cancel
          </Button>
        )}
        <Button 
          type="submit" 
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Submitting...' : 'Log Activity'}
        </Button>
      </div>
    </form>
  );
};

export default SimpleActivityForm;