import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { useLocation } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// The actual Zeffy donation form URL
const ZEFFY_DONATION_URL = "https://www.zeffy.com/en-US/donation-form/d0849062-4c71-4519-81df-d30348296176";

// This popup will be shown on homepage visits
const GlobalDonationPopup = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  
  useEffect(() => {
    // Only show on home page
    if (location.pathname !== '/') {
      return;
    }

    // Show popup after a short delay
    const timer = setTimeout(() => {
      setOpen(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, [location.pathname]);
  
  const handleClose = () => {
    setOpen(false);
  };

  const handleDonate = () => {
    window.location.href = '/donate';
    handleClose();
  };
  
  // Don't render anything if not on home page
  if (location.pathname !== '/') {
    return null;
  }
  
  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] bg-gray-950 border-gray-800">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-growth-400 via-growth-500 to-growth-700 text-transparent bg-clip-text">
              Support Our Mission
            </DialogTitle>
          </div>
          <DialogDescription className="text-gray-400">
            At Be Courageous, we're dedicated to helping people overcome their fears and build lasting confidence. Your support makes this possible.
          </DialogDescription>
          <div className="space-y-4 mt-4 text-gray-400">
            <div className="bg-gray-900 p-4 rounded-lg space-y-2">
              <h3 className="font-semibold text-growth-400">Your donation helps us:</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-300">
                <li>Develop new tools and resources for fear management</li>
                <li>Create personalized support programs</li>
                <li>Make our platform accessible to more people</li>
                <li>Research and implement evidence-based fear-facing techniques</li>
              </ul>
            </div>
            <div className="text-sm text-gray-500">
              Every contribution, no matter the size, helps someone take their first step towards courage.
            </div>
          </div>
        </DialogHeader>
        <div className="flex flex-col sm:flex-row gap-3 mt-6">
          <Button
            variant="default"
            className="bg-growth-600 hover:bg-growth-700 text-white flex-1"
            onClick={handleDonate}
          >
            Make a Donation
          </Button>
          <Button
            variant="outline"
            className="border-gray-700 text-gray-400 hover:text-white hover:bg-gray-800"
            onClick={handleClose}
          >
            Maybe Later
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GlobalDonationPopup;
