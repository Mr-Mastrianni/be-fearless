import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

interface JournalEntry {
  id: string;
  date: string;
  title: string;
  content: string;
  mood?: string;
}

interface JournalEntryFormProps {
  onSubmit: (entry: Omit<JournalEntry, 'id' | 'date'>) => void;
  isLoading?: boolean;
}

const moods = [
  'Anxious',
  'Brave',
  'Calm',
  'Confident',
  'Excited',
  'Fearful',
  'Hopeful',
  'Nervous',
  'Proud',
  'Relieved'
];

const JournalEntryForm: React.FC<JournalEntryFormProps> = ({ onSubmit, isLoading = false }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mood, setMood] = useState<string | undefined>(undefined);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast({
        title: "Title required",
        description: "Please enter a title for your journal entry",
        variant: "destructive",
      });
      return;
    }

    if (!content.trim()) {
      toast({
        title: "Content required",
        description: "Please enter some content for your journal entry",
        variant: "destructive",
      });
      return;
    }

    onSubmit({
      title,
      content,
      mood
    });

    // Reset form
    setTitle('');
    setContent('');
    setMood(undefined);

    toast({
      title: "Journal entry added",
      description: "Your journal entry has been saved successfully",
    });
  };

  return (
    <Card className="bg-white text-black">
      <CardHeader>
        <CardTitle>New Journal Entry</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-black">Title</Label>
            <Input
              id="title"
              placeholder="Enter a title for your journal entry"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isLoading}
              style={{ color: 'black', backgroundColor: 'white' }}
              className="border-gray-300"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="content" className="text-black">Content</Label>
            <Textarea
              id="content"
              placeholder="Write your thoughts, reflections, or experiences..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[150px]"
              disabled={isLoading}
              style={{ color: 'black', backgroundColor: 'white' }}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="mood" className="text-black">Mood (Optional)</Label>
            <Select value={mood} onValueChange={setMood} disabled={isLoading}>
              <SelectTrigger id="mood" style={{ color: 'black', backgroundColor: 'white' }}>
                <SelectValue placeholder="Select your mood" />
              </SelectTrigger>
              <SelectContent>
                {moods.map((m) => (
                  <SelectItem key={m} value={m}>{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
        
        <CardFooter>
          <Button 
            type="submit" 
            disabled={isLoading || !title.trim() || !content.trim()}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Journal Entry'
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default JournalEntryForm;
