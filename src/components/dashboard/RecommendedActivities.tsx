import React from 'react';

interface Recommendation {
  id: string;
  title?: string;
  activity?: string;
  description?: string;
  fearType: string;
  difficulty: string;
  tags?: string[];
}

interface RecommendedActivitiesProps {
  recommendations: Recommendation[];
}

const RecommendedActivities: React.FC<RecommendedActivitiesProps> = ({ recommendations }) => {
  if (!recommendations || recommendations.length === 0) {
    return (
      <div className="text-center p-4">
        <p className="text-gray-500">No recommendations to display</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {recommendations.map((rec) => (
        <div key={rec.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
          <h3 className="font-medium mb-1">{rec.title || rec.activity}</h3>
          <div className="flex gap-2">
            <span className="px-2 py-1 bg-teal-100 text-teal-800 rounded text-xs">
              {rec.fearType}
            </span>
            <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs">
              {rec.difficulty}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RecommendedActivities;
