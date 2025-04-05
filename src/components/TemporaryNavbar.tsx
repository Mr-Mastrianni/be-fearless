import React from 'react';
import { Link } from 'react-router-dom';

// Minimal navbar component for testing
const TemporaryNavbar = () => {
  return (
    <nav className="bg-teal-800 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="font-bold text-xl">Be Courageous</Link>
        <div className="flex space-x-4">
          <Link to="/" className="hover:text-teal-200">Home</Link>
          <Link to="/activities" className="hover:text-teal-200">Activities</Link>
        </div>
      </div>
    </nav>
  );
};

export default TemporaryNavbar;
