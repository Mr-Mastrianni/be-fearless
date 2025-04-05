import React from 'react';
import { Progress } from '@/components/ui/progress';

interface FearStatusCardProps {
  fearType: string;
  score: number;
  label?: string;
}

const FearStatusCard: React.FC<FearStatusCardProps> = ({ fearType, score, label }) => {
  // Calculate progress percentage (assuming score is 0-10)
  const progressPercentage = Math.max(0, Math.min(100, (score / 10) * 100));
  
  return (
    <div className="p-4 border rounded-lg bg-white shadow-sm">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-medium">{fearType}</h3>
        <span className="text-sm text-gray-500">{label || `Level ${score}/10`}</span>
      </div>
      <Progress value={progressPercentage} className="h-2" />
    </div>
  );
};

export default FearStatusCard;