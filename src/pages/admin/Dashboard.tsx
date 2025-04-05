import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { Helmet } from 'react-helmet';
import UserManagement from './UserManagement';
import ActivityManagement from './ActivityManagement';
import SystemStats from './SystemStats';
import SystemSettings from './system/SystemSettings';
import { Loader2 } from 'lucide-react';

/**
 * Admin Dashboard component that serves as the main interface for admin features
 * Includes tabs for different admin functions
 */
const AdminDashboard: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(false);

  // Handle tab change
  const handleTabChange = (value: string) => {
    setIsLoading(true);
    setActiveTab(value);
    // Simulate loading for better UX
    setTimeout(() => setIsLoading(false), 300);
  };

  return (
    <>
      <Helmet>
        <title>Admin Dashboard | Courage Bot Adventure</title>
      </Helmet>

      <div className="container mx-auto py-6 space-y-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage users, activities, and system settings
          </p>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Admin Controls</CardTitle>
            <CardDescription>
              Welcome, {user?.user_metadata?.full_name || user?.email}. You have admin privileges.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs 
              defaultValue="overview" 
              value={activeTab}
              onValueChange={handleTabChange}
              className="w-full"
            >
              <TabsList className="grid grid-cols-4 mb-8">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="users">User Management</TabsTrigger>
                <TabsTrigger value="activities">Activities</TabsTrigger>
                <TabsTrigger value="system">System</TabsTrigger>
              </TabsList>
              
              {isLoading ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <>
                  <TabsContent value="overview" className="space-y-4">
                    <SystemStats />
                  </TabsContent>
                  
                  <TabsContent value="users" className="space-y-4">
                    <UserManagement />
                  </TabsContent>
                  
                  <TabsContent value="activities" className="space-y-4">
                    <ActivityManagement />
                  </TabsContent>
                  
                  <TabsContent value="system" className="space-y-4">
                    <SystemSettings />
                  </TabsContent>
                </>
              )}
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default AdminDashboard;
