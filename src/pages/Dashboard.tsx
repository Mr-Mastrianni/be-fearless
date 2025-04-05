import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import ProfileCompletionCheck from '@/components/ProfileCompletionCheck';

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      // Call the signOut function from the AuthContext
      await supabase.auth.signOut();
      
      toast({
        title: "Logged out successfully",
        description: "Redirecting to home page...",
      });
      
      setTimeout(() => navigate('/'), 1500);
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        title: "Error signing out",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <ProfileCompletionCheck redirectTo="/onboarding">
        <></>
      </ProfileCompletionCheck>
      
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <p className="text-gray-500">Your personal dashboard</p>
          </div>
          <Button variant="outline" onClick={handleLogout}>Logout</Button>
        </div>

        <div className="bg-white p-8 rounded-lg shadow-sm">
          <div className="text-center py-12">
            <p className="text-gray-500 max-w-md mx-auto">
              The dashboard content has been removed as requested.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;