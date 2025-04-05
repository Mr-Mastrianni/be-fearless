import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity } from '@/models/ActivityTypes';
import { Star, Clock, MapPin, CircleDollarSign, MessagesSquare, Heart } from 'lucide-react';
import { FearCategoryIcon } from '@/components/fear-category-icon';
import { Button } from '@/components/ui/button';
import { getColorForDifficulty } from '@/lib/utils';

interface ActivityCardProps {
  activity: Activity;
  className?: string;
  viewMode?: 'grid' | 'list';
  onViewDetails?: (activity: Activity) => void;
}

const ActivityCard: React.FC<ActivityCardProps> = ({ 
  activity, 
  className = '',
  viewMode = 'grid',
  onViewDetails
}) => {
  const isListView = viewMode === 'list';
  const difficultyColor = getColorForDifficulty(activity.difficultyLevel);
  
  // Handle recommendation score display
  const matchScore = activity.matchScore !== undefined ? activity.matchScore : 0;
  const hasRecommendation = matchScore > 0;
  const recommendationPercentage = Math.round(matchScore * 100);
  
  return (
    <Card className={`h-full transition-all duration-200 hover:shadow-md 
      ${isListView ? 'flex flex-row' : 'flex flex-col'} ${className}`}>
      
      {/* Card Image Section */}
      <div 
        className={`${isListView ? 'w-1/3 min-w-[120px]' : 'w-full aspect-[4/3]'} 
                   bg-muted relative overflow-hidden`}
      >
        {activity.imageUrl ? (
          <img 
            src={activity.imageUrl || activity.alternateImageUrl} 
            alt={activity.title} 
            className="object-cover w-full h-full"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted/80 to-muted">
            <FearCategoryIcon 
              category={activity.fearCategories[0]} 
              className="w-12 h-12 text-muted-foreground/40" 
            />
          </div>
        )}
        
        {/* Recommendation badge, if score exists */}
        {hasRecommendation && (
          <div className="absolute top-2 right-2">
            <Badge 
              variant="default" 
              className="bg-primary text-primary-foreground font-medium flex items-center gap-1"
            >
              <Star className="h-3 w-3 fill-primary-foreground" />
              {recommendationPercentage}% Match
            </Badge>
          </div>
        )}
      </div>
      
      {/* Card Content Section */}
      <div className={`flex flex-col flex-1 ${isListView ? 'max-w-[70%]' : ''}`}>
        <CardHeader className={`${isListView ? 'p-3 pb-2' : 'p-4 pb-2'}`}>
          <div className="flex flex-wrap gap-1 mb-2">
            {activity.fearCategories.map((category) => (
              <Badge 
                key={category} 
                variant="outline" 
                className="text-xs font-normal flex items-center gap-1"
              >
                <FearCategoryIcon category={category} className="h-3 w-3" />
                {category}
              </Badge>
            ))}
          </div>
          
          <CardTitle className={`${isListView ? 'text-base' : 'text-lg'} line-clamp-1`}>
            {activity.title}
          </CardTitle>
          
          <CardDescription className="line-clamp-2">
            {activity.description}
          </CardDescription>
        </CardHeader>
        
        <CardContent className={`${isListView ? 'p-3 pt-0' : 'p-4 pt-0'} space-y-3 flex-1`}>
          <div className="flex flex-wrap gap-x-3 gap-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Badge 
                variant="outline" 
                className={`font-medium ${difficultyColor}`}
              >
                {activity.difficultyLevel}
              </Badge>
            </div>
            
            <div className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {activity.timeCommitment}
            </div>
            
            <div className="flex items-center gap-1">
              <CircleDollarSign className="h-3.5 w-3.5" />
              {activity.costRange}
            </div>
            
            <div className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {activity.location}
            </div>
          </div>
        </CardContent>
        
        <CardFooter className={`${isListView ? 'p-3 pt-0' : 'p-4 pt-0'} mt-auto flex justify-between border-t pt-3`}>
          <Button variant="secondary" size="sm" className="w-full" onClick={() => onViewDetails?.(activity)}>View Details</Button>
        </CardFooter>
      </div>
    </Card>
  );
};

export default ActivityCard;
