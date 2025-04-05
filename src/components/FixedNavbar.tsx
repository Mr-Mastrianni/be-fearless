import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Menu, X, LogOut } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

// This implements a navbar that follows the exact pattern that works in this codebase
const FixedNavbar = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <nav className="bg-teal-800 text-white p-4 shadow-md">
      <div className="container mx-auto">
        <div className="flex justify-between items-center">
          {/* Logo and brand */}
          <Link to="/" className="font-bold text-xl">
            Be Courageous
          </Link>

          {/* Desktop Navigation - hidden on small screens */}
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/" className="hover:text-teal-200">
              Home
            </Link>
            <Link to="/activities" className="hover:text-teal-200">
              Activity Explorer
            </Link>
            {user && (
              <Link to="/dashboard" className="hover:text-teal-200">
                Dashboard
              </Link>
            )}
            {user && (
              <Link to="/profile" className="hover:text-teal-200">
                Profile
              </Link>
            )}

            {!user ? (
              <div className="flex items-center space-x-2">
                <Link to="/login" className="hover:text-teal-200">
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="bg-teal-600 hover:bg-teal-500 px-3 py-2 rounded text-white"
                >
                  Get Started
                </Link>
              </div>
            ) : (
              <Button
                variant="ghost"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="text-white hover:text-teal-200"
              >
                {isLoggingOut ? 'Logging out...' : 'Log out'}
              </Button>
            )}
          </div>

          {/* Mobile menu button - visible only on small screens */}
          <div className="flex md:hidden">
            <Button variant="ghost" size="icon" onClick={toggleMenu} className="text-white">
              {isOpen ? <X /> : <Menu />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation - visible only when menu is open */}
      {isOpen && (
        <div className="md:hidden mt-2 bg-teal-700 rounded-md">
          <div className="flex flex-col space-y-2 p-2">
            <Link to="/" className="px-3 py-2 rounded hover:bg-teal-600">
              Home
            </Link>
            <Link to="/activities" className="px-3 py-2 rounded hover:bg-teal-600">
              Activity Explorer
            </Link>
            {user && (
              <Link to="/dashboard" className="px-3 py-2 rounded hover:bg-teal-600">
                Dashboard
              </Link>
            )}
            {user && (
              <Link to="/profile" className="px-3 py-2 rounded hover:bg-teal-600">
                Profile
              </Link>
            )}

            {!user ? (
              <div className="space-y-2 pt-2 border-t border-teal-600">
                <Link to="/login" className="block px-3 py-2 rounded hover:bg-teal-600 text-center">
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="block px-3 py-2 rounded bg-teal-600 hover:bg-teal-500 text-center"
                >
                  Get Started
                </Link>
              </div>
            ) : (
              <button
                onClick={handleLogout}
                className="w-full text-left px-3 py-2 rounded hover:bg-teal-600 mt-2 border-t border-teal-600 pt-4"
                disabled={isLoggingOut}
              >
                {isLoggingOut ? 'Logging out...' : 'Log out'}
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default FixedNavbar;