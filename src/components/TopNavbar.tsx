import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

// Very simple navbar with no dependencies on other components
const TopNavbar = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Add a class to highlight the active link
  const isActive = (path: string) => {
    return location.pathname === path ? "font-bold underline" : "";
  };
  
  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Force navbar to be visible with a style tag
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      #top-navbar {
        display: block !important;
        visibility: visible !important;
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        width: 100% !important;
        z-index: 9999 !important;
        background-color: white !important;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1) !important;
        padding: 10px 0 !important;
      }
      
      #top-navbar a, #top-navbar button {
        display: inline-block !important;
        visibility: visible !important;
        opacity: 1 !important;
      }
      
      body {
        padding-top: 60px !important;
      }
      
      .mobile-menu-button {
        display: none;
      }
      
      @media (max-width: 768px) {
        .nav-links {
          display: none !important;
        }
        
        .mobile-menu-button {
          display: block !important;
        }
        
        .nav-links.open {
          display: flex !important;
          flex-direction: column !important;
          position: absolute !important;
          top: 60px !important;
          left: 0 !important;
          width: 100% !important;
          background-color: white !important;
          padding: 20px !important;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1) !important;
          z-index: 9998 !important;
        }
        
        .nav-links.open a, .nav-links.open button {
          margin: 8px 0 !important;
        }
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);
  
  return (
    <div id="top-navbar">
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto', 
        padding: '0 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        {/* Logo and site name */}
        <div>
          <Link to="/" style={{
            fontWeight: 'bold',
            fontSize: '1.25rem',
            color: '#000',
            textDecoration: 'none',
            display: 'inline-block'
          }}>Be Courageous</Link>
        </div>
        
        {/* Mobile menu button */}
        <button 
          onClick={toggleMobileMenu}
          className="mobile-menu-button"
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '5px'
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 12H21" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M3 6H21" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M3 18H21" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        
        {/* Navigation links */}
        <div className={`nav-links ${mobileMenuOpen ? 'open' : ''}`} style={{
          display: 'flex',
          gap: '24px',
          alignItems: 'center'
        }}>
          <Link to="/" className={isActive("/")} style={{
            color: '#000',
            textDecoration: 'none'
          }}>Home</Link>
          
          <Link to="/activities" className={isActive("/activities")} style={{
            color: '#000',
            textDecoration: 'none'
          }}>Activity Explorer</Link>
          
          {user && (
            <Link to="/dashboard" className={isActive("/dashboard")} style={{
              color: '#000',
              textDecoration: 'none'
            }}>Dashboard</Link>
          )}
          
          {user && (
            <Link to="/profile" className={isActive("/profile")} style={{
              color: '#000',
              textDecoration: 'none'
            }}>Profile</Link>
          )}
          
          {user?.app_metadata?.role === 'admin' && (
            <Link to="/admin" className={isActive("/admin")} style={{
              color: '#000',
              textDecoration: 'none'
            }}>Admin</Link>
          )}
          
          {!user ? (
            <>
              <Link to="/login" className={isActive("/login")} style={{
                color: '#000',
                textDecoration: 'none'
              }}>Log In</Link>
              
              <Link to="/register" style={{
                backgroundColor: '#4F46E5',
                color: 'white',
                padding: '8px 16px',
                borderRadius: '4px',
                fontWeight: 'bold',
                textDecoration: 'none'
              }}>Get Started</Link>
            </>
          ) : (
            <button
              onClick={handleLogout}
              style={{
                backgroundColor: 'transparent',
                border: '1px solid #ccc',
                color: '#000',
                padding: '8px 16px',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TopNavbar;