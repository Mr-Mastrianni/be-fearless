import React from 'react';
import { Link } from 'react-router-dom';

/**
 * LinkWithRef component - a wrapper around react-router Link component
 * to handle routing within the application.
 */
interface LinkWithRefProps {
  children?: React.ReactNode;
  href?: string;
  className?: string;
  text?: string;
  [key: string]: any;
}

const LinkWithRef: React.FC<LinkWithRefProps> = ({ 
  children, 
  href = '/', 
  className = '', 
  text = '',
  ...props 
}) => {
  // Render a Link component that works with the router
  return (
    <Link 
      to={href} 
      className={className}
      {...props}
    >
      {children || text}
    </Link>
  );
};

export default LinkWithRef;
