import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import GeneralSettings from './GeneralSettings';
import NotificationSettings from './NotificationSettings';
import BackupRestore from './BackupRestore';
import MaintenanceTools from './MaintenanceTools';

/**
 * System Settings component that provides administrative controls for the application
 */
const SystemSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [isLoading, setIsLoading] = useState(false);

  // Handle tab change with loading state
  const handleTabChange = (value: string) => {
    setIsLoading(true);
    setActiveTab(value);
    // Simulate loading for better UX
    setTimeout(() => setIsLoading(false), 300);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>System Settings</CardTitle>
          <CardDescription>
            Configure system-wide settings and maintenance options
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs 
            defaultValue="general" 
            value={activeTab}
            onValueChange={handleTabChange}
            className="w-full"
          >
            <TabsList className="grid grid-cols-4 mb-6">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="backup">Backup & Restore</TabsTrigger>
              <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
            </TabsList>
            
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <>
                <TabsContent value="general" className="space-y-4">
                  <GeneralSettings />
                </TabsContent>
                
                <TabsContent value="notifications" className="space-y-4">
                  <NotificationSettings />
                </TabsContent>
                
                <TabsContent value="backup" className="space-y-4">
                  <BackupRestore />
                </TabsContent>
                
                <TabsContent value="maintenance" className="space-y-4">
                  <MaintenanceTools />
                </TabsContent>
              </>
            )}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemSettings;
