import { useAuth } from '@/contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import logo from '@/assets/images/Print_Transparent.svg';

const SimpleNavbar = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <nav className="bg-indigo-950 w-full border-b border-amber-500 py-2 shadow-md">
      <div className="container mx-auto px-4">
        {/* Desktop and Mobile Header */}
        <div className="flex justify-between items-center py-2">
          <Link to="/" className="flex items-center">
            <img src={logo} alt="Be Courageous Logo" className="h-12 w-auto mr-3" />
            <span className="text-xl font-bold text-amber-400">Be Courageous</span>
          </Link>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMobileMenu}
              className="text-white hover:text-amber-300 focus:outline-none"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {!user ? (
              <>
                <Link to="/login" className="text-white hover:text-amber-300 font-medium">
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-amber-500 hover:bg-amber-600 text-indigo-950 font-bold py-2 px-4 rounded-md shadow-sm transition-colors duration-200"
                >
                  Sign Up
                </Link>
                <Link to="/videos" className="text-white hover:text-amber-300 font-medium">
                  Videos
                </Link>
                <Link
                  to="/donate"
                  className="bg-growth-600 hover:bg-growth-700 text-white font-bold py-2 px-4 rounded-md shadow-sm transition-colors duration-200"
                >
                  Donate
                </Link>
              </>
            ) : (
              <>
                <Link to="/" className="text-white hover:text-amber-300 font-medium">
                  Home
                </Link>
                <Link to="/activities" className="text-white hover:text-amber-300 font-medium">
                  Activities
                </Link>
                <Link to="/videos" className="text-white hover:text-amber-300 font-medium">
                  Videos
                </Link>
                <Link to="/profile" className="text-white hover:text-amber-300 font-medium">
                  Profile
                </Link>
                <Link
                  to="/donate"
                  className="bg-growth-600 hover:bg-growth-700 text-white font-bold py-2 px-4 rounded-md shadow-sm transition-colors duration-200"
                >
                  Donate
                </Link>
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="bg-amber-500 hover:bg-amber-600 text-indigo-950 font-bold py-2 px-4 rounded-md shadow-sm transition-colors duration-200"
                >
                  {isLoggingOut ? 'Logging out...' : 'Logout'}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-amber-500/30">
            <div className="flex flex-col space-y-3">
              {!user ? (
                <>
                  <Link
                    to="/login"
                    className="text-white hover:text-amber-300 font-medium py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="text-white hover:text-amber-300 font-medium py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                  <Link
                    to="/videos"
                    className="text-white hover:text-amber-300 font-medium py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Videos
                  </Link>
                  <Link
                    to="/donate"
                    className="text-white hover:text-amber-300 font-medium py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Donate
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/"
                    className="text-white hover:text-amber-300 font-medium py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Home
                  </Link>
                  <Link
                    to="/activities"
                    className="text-white hover:text-amber-300 font-medium py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Activities
                  </Link>
                  <Link
                    to="/videos"
                    className="text-white hover:text-amber-300 font-medium py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Videos
                  </Link>
                  <Link
                    to="/profile"
                    className="text-white hover:text-amber-300 font-medium py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  <Link
                    to="/donate"
                    className="text-white hover:text-amber-300 font-medium py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Donate
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    disabled={isLoggingOut}
                    className="text-white hover:text-amber-300 font-medium py-2 text-left"
                  >
                    {isLoggingOut ? 'Logging out...' : 'Logout'}
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default SimpleNavbar;