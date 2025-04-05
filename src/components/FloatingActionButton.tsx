import React, { useState } from 'react';
import '../styles/micro-interactions.css';

interface FloatingActionButtonProps {
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  position?: 'left' | 'right';
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({ 
  onClick, 
  icon, 
  label,
  position = 'left' // Default to left position
}) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div className={`fab-container ${position === 'right' ? 'right-positioned' : 'left-positioned'}`}>
      <div 
        className={`fab fab-pulse ${isHovered ? 'hovered' : ''}`}
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        role="button"
        aria-label={label}
        tabIndex={0}
      >
        {icon}
        
        {/* Label tooltip that appears on hover */}
        <span className={`fab-tooltip ${isHovered ? 'visible' : ''}`}>
          {label}
        </span>
      </div>
    </div>
  );
};

export default FloatingActionButton;
