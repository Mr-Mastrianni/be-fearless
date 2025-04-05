import { useEffect, useState } from "react";
import { X } from "lucide-react";

// The most basic popup implementation for debugging
const DonationPopup = () => {
  // Start with it visible
  const [isVisible, setIsVisible] = useState(true);

  const closePopup = () => {
    setIsVisible(false);
  };

  // Debug styles directly inline for maximum reliability
  if (!isVisible) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        width: '80%',
        maxWidth: '600px',
        position: 'relative',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        overflow: 'hidden'
      }}>
        {/* Close button */}
        <button 
          onClick={closePopup}
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            backgroundColor: 'white',
            border: 'none',
            borderRadius: '50%',
            width: '30px',
            height: '30px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 1
          }}
        >
          <X size={20} />
        </button>
        
        {/* Content */}
        <div style={{
          padding: '20px',
          textAlign: 'center'
        }}>
          <h2 style={{
            fontSize: '24px',
            fontWeight: 'bold',
            marginBottom: '10px'
          }}>
            Support Our Mission
          </h2>
          <p style={{
            marginBottom: '20px'
          }}>
            This is a test donation popup. It should appear immediately when you load the page.
          </p>
          
          <button 
            onClick={closePopup}
            style={{
              padding: '10px 20px',
              backgroundColor: '#4B5563',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Close This Popup
          </button>
        </div>
      </div>
    </div>
  );
};

export default DonationPopup;
