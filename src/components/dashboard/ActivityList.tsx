import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Activity {
  id: string | number;
  name: string;
  category?: string;
  difficulty?: string;
  completed?: boolean;
  date?: string;
}

interface ActivityListProps {
  activities?: Activity[];
  onActivityClick?: (activity: Activity) => void;
}

const ActivityList: React.FC<ActivityListProps> = ({ 
  activities = [], 
  onActivityClick 
}) => {
  if (activities.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-gray-500 mb-2">No activities to display</p>
        <p className="text-sm text-gray-400">Complete your profile to get personalized activities</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <div 
          key={activity.id} 
          className="p-4 border rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-medium">{activity.name}</h3>
              <div className="flex gap-2 mt-1">
                {activity.category && (
                  <Badge variant="outline">{activity.category}</Badge>
                )}
                {activity.difficulty && (
                  <Badge variant="secondary">{activity.difficulty}</Badge>
                )}
              </div>
            </div>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => onActivityClick && onActivityClick(activity)}
            >
              View
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ActivityList;