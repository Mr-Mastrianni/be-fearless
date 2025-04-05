import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

const BasicNavbar = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  // Ensure navbar is always visible
  useEffect(() => {
    // Create a style element to forcibly show our navbar
    const style = document.createElement('style');
    style.textContent = `
      #always-visible-navbar {
        display: block !important;
        visibility: visible !important;
        opacity: 1 !important;
        height: auto !important;
        width: 100% !important;
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        z-index: 9999 !important;
      }
      #always-visible-navbar * {
        visibility: visible !important;
        display: inherit !important;
        opacity: 1 !important;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div id="always-visible-navbar" style={{
      position: 'fixed', 
      top: 0, 
      left: 0, 
      width: '100%', 
      backgroundColor: 'white', 
      zIndex: 9999,
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      display: 'block !important',
      visibility: 'visible !important',
      opacity: 1,
      height: 'auto',
      minHeight: '60px',
      overflow: 'visible'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '1rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{display: 'flex', alignItems: 'center'}}>
          <Link to="/" style={{fontSize: '1.25rem', fontWeight: 'bold', color: '#000'}}>
            Be Courageous
          </Link>
        </div>
        
        <div style={{display: 'flex', gap: '1.5rem', alignItems: 'center'}}>
          <Link to="/" style={{color: '#000'}}>Home</Link>
          <Link to="/activities" style={{color: '#000'}}>Activities</Link>
          
          {user && (
            <Link to="/dashboard" style={{color: '#000'}}>Dashboard</Link>
          )}

          {user?.app_metadata?.role === 'admin' && (
            <Link to="/admin" style={{color: '#000'}}>Admin</Link>
          )}
          
          {!user ? (
            <>
              <Link to="/login" style={{color: '#000'}}>
                Login
              </Link>
              <Link to="/register">
                <Button variant="default">
                  Sign Up
                </Button>
              </Link>
            </>
          ) : (
            <Button
              variant="outline"
              onClick={handleLogout}
            >
              Logout
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BasicNavbar;