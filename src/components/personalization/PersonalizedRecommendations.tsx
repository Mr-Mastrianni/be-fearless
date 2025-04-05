import React, { useEffect, useState, useCallback } from 'react';
import { useUserPreferences } from '@/contexts/UserPreferencesContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/AuthContext';
import { Compass, Lightbulb, RefreshCw } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface Recommendation {
  id: string;
  title: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  fearType: string;
  tags: string[];
}

const PersonalizedRecommendations = () => {
  const { user } = useAuth();
  const { preferences } = useUserPreferences();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);

  // Log component state on mount
  useEffect(() => {
    console.log('PersonalizedRecommendations mounted with:', {
      user: user?.id,
      hasPreferences: !!preferences,
      experiencePreferences: preferences?.experiencePreferences,
    });
  }, []);

  // Mock recommendations - in a real app, these would come from an API
  const mockRecommendations: Recommendation[] = [
    {
      id: '1',
      title: 'Speaking Up in Meetings',
      description: 'Practice contributing at least once in your next meeting',
      difficulty: 'Beginner',
      fearType: 'social',
      tags: ['work', 'speaking', 'social']
    },
    {
      id: '2',
      title: 'Solo Restaurant Visit',
      description: 'Go to a café or restaurant by yourself',
      difficulty: 'Intermediate',
      fearType: 'social',
      tags: ['public', 'independence']
    },
    {
      id: '3',
      title: 'Spontaneous Conversation',
      description: 'Strike up a conversation with a stranger',
      difficulty: 'Advanced',
      fearType: 'social',
      tags: ['public', 'speaking', 'spontaneous']
    },
    {
      id: '4',
      title: 'Schedule a Medical Checkup',
      description: 'Book that appointment you have been putting off',
      difficulty: 'Beginner',
      fearType: 'health',
      tags: ['health', 'responsibility']
    },
    {
      id: '5',
      title: 'Try a New Exercise Routine',
      description: 'Join a new fitness class you have never tried before',
      difficulty: 'Intermediate',
      fearType: 'fitness',
      tags: ['health', 'fitness', 'new experience']
    },
    {
      id: '6',
      title: 'Ask for Feedback',
      description: 'Request direct feedback on a recent project',
      difficulty: 'Intermediate',
      fearType: 'rejection',
      tags: ['work', 'professional', 'growth']
    },
    {
      id: '7',
      title: 'Learn a New Skill',
      description: 'Begin learning something you have no experience with',
      difficulty: 'Beginner',
      fearType: 'failure',
      tags: ['growth', 'learning', 'skills']
    },
    {
      id: '8',
      title: 'Public Performance',
      description: 'Sing, speak, or perform in front of others',
      difficulty: 'Advanced',
      fearType: 'embarrassment',
      tags: ['public', 'performance', 'expression']
    }
  ];

  const refreshRecommendations = useCallback(() => {
    setIsLoading(true);
    
    try {
      setTimeout(() => {
        // Filter recommendations based on user preferences
        let filtered = [...mockRecommendations];
        
        try {
          // Filter by focus areas if specified
          if (preferences?.experiencePreferences?.focus?.length > 0 && 
              !preferences.experiencePreferences.focus.includes('general')) {
            filtered = filtered.filter(rec => 
              preferences.experiencePreferences.focus.includes(rec.fearType)
            );
          }
          
          // Filter by difficulty preference
          const difficultyMap = {
            'beginner': ['Beginner'],
            'intermediate': ['Beginner', 'Intermediate'],
            'advanced': ['Beginner', 'Intermediate', 'Advanced'],
            'expert': ['Intermediate', 'Advanced']
          };
          
          if (preferences?.experiencePreferences?.difficulty) {
            filtered = filtered.filter(rec => 
              difficultyMap[preferences.experiencePreferences.difficulty]?.includes(rec.difficulty)
            );
          }
          
          // Sort based on user's preferences and add some randomness
          filtered.sort(() => Math.random() - 0.5);
        } catch (error) {
          console.error("Error during recommendation filtering:", error);
          // Use all recommendations in case of error
          filtered = [...mockRecommendations].sort(() => Math.random() - 0.5);
        }
        
        // Take top 3 items
        setRecommendations(filtered.slice(0, 3));
        setIsLoading(false);
      }, 800);
    } catch (error) {
      console.error("Critical error in refreshRecommendations:", error);
      setRecommendations(mockRecommendations.slice(0, 3));
      setIsLoading(false);
    }
  }, [preferences?.experiencePreferences]);

  // Load recommendations
  useEffect(() => {
    refreshRecommendations();
  }, [refreshRecommendations]);

  // Handle accepting a recommendation
  const acceptRecommendation = (id: string) => {
    toast({
      title: "Challenge Accepted!",
      description: "This courage-building activity has been added to your plan.",
    });
    // In a real app, this would add the recommendation to the user's plan
  };

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-xl">Personalized For You</CardTitle>
          <CardDescription>
            Activities tailored to your preferences
          </CardDescription>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={refreshRecommendations}
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : recommendations.length > 0 ? (
          <div className="space-y-4">
            {recommendations.map((rec) => (
              <div 
                key={rec.id} 
                className="p-4 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium">{rec.title}</h3>
                  <Badge 
                    variant="outline" 
                    className={`
                      ${rec.difficulty === 'Beginner' ? 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20' : 
                        rec.difficulty === 'Intermediate' ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20' : 
                        'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20'}
                    `}
                  >
                    {rec.difficulty}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{rec.description}</p>
                <div className="flex justify-between items-center">
                  <div className="flex flex-wrap gap-1">
                    {rec.tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <Button 
                    size="sm" 
                    className="gap-1"
                    onClick={() => acceptRecommendation(rec.id)}
                  >
                    <Lightbulb className="h-3.5 w-3.5" />
                    Try this
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <Compass className="h-12 w-12 mx-auto mb-3 text-muted-foreground/60" />
            <h3 className="font-medium mb-1">No matching recommendations</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Try adjusting your preferences or focus areas
            </p>
            <Button onClick={() => refreshRecommendations()}>
              Show General Recommendations
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PersonalizedRecommendations;
