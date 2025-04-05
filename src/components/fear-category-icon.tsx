import React from 'react';
import { 
  ArrowUp,
  Waves,
  Ship,
  HeartPulse,
  Gauge,
  Dog,
  Users,
  Box,
  CircleDot
} from 'lucide-react';
import { FearCategory } from '@/models/ActivityTypes';

interface FearCategoryIconProps {
  category: FearCategory;
  className?: string;
}

export const FearCategoryIcon: React.FC<FearCategoryIconProps> = ({ 
  category, 
  className = ""
}) => {
  // Map fear categories to appropriate icons
  switch (category) {
    case 'heights':
      return <ArrowUp className={className} />;
    case 'water':
      return <Ship className={className} />;
    case 'social':
      return <Users className={className} />;
    case 'confined':
      return <Box className={className} />;
    default:
      return <CircleDot className={className} />;
  }
};
