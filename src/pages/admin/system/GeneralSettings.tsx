import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';

interface GeneralSettingsData {
  appName: string;
  supportEmail: string;
  maintenanceMode: boolean;
  allowNewRegistrations: boolean;
  maxUploadSizeMB: number;
  defaultUserExperienceLevel: string;
}

const GeneralSettings: React.FC = () => {
  const [settings, setSettings] = useState<GeneralSettingsData>({
    appName: 'Courage Bot Adventure',
    supportEmail: 'support@couragebot.com',
    maintenanceMode: false,
    allowNewRegistrations: true,
    maxUploadSizeMB: 5,
    defaultUserExperienceLevel: 'beginner',
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  // Fetch settings from the database
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setIsLoading(true);
        
        // Set a timeout to prevent getting stuck indefinitely
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Settings fetch timed out')), 10000);
        });
        
        const fetchPromise = new Promise(async (resolve) => {
          try {
            const { data, error } = await supabase
              .from('system_settings')
              .select('*')
              .single();
            
            if (error) {
              console.error('Error fetching system settings:', error);
              resolve(null);
              return;
            }
            
            if (data) {
              resolve({
                appName: data.app_name || 'Courage Bot Adventure',
                supportEmail: data.support_email || 'support@couragebot.com',
                maintenanceMode: data.maintenance_mode || false,
                allowNewRegistrations: data.allow_new_registrations !== false,
                maxUploadSizeMB: data.max_upload_size_mb || 5,
                defaultUserExperienceLevel: data.default_user_experience_level || 'beginner',
              });
            } else {
              resolve(null);
            }
          } catch (error) {
            console.error('Error in settings fetch:', error);
            resolve(null);
          }
        });
        
        // Race the fetch against the timeout
        const settingsData = await Promise.race([fetchPromise, timeoutPromise]) as GeneralSettingsData | null;
        
        if (settingsData) {
          setSettings(settingsData);
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
        toast({
          title: 'Error',
          description: 'Failed to load settings. Using defaults.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSettings();
  }, [toast]);

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    
    setSettings(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) : value,
    }));
  };

  // Handle switch changes
  const handleSwitchChange = (name: string, checked: boolean) => {
    setSettings(prev => ({
      ...prev,
      [name]: checked,
    }));
  };

  // Save settings to the database
  const saveSettings = async () => {
    try {
      setIsSaving(true);
      
      // Set a timeout to prevent getting stuck indefinitely
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Save settings timed out')), 10000);
      });
      
      const savePromise = new Promise(async (resolve, reject) => {
        try {
          const { error } = await supabase
            .from('system_settings')
            .upsert({
              id: 1, // Assuming a single row for system settings
              app_name: settings.appName,
              support_email: settings.supportEmail,
              maintenance_mode: settings.maintenanceMode,
              allow_new_registrations: settings.allowNewRegistrations,
              max_upload_size_mb: settings.maxUploadSizeMB,
              default_user_experience_level: settings.defaultUserExperienceLevel,
              updated_at: new Date().toISOString(),
            });
          
          if (error) {
            console.error('Error saving settings:', error);
            reject(error);
            return;
          }
          
          resolve(true);
        } catch (error) {
          console.error('Error in save settings:', error);
          reject(error);
        }
      });
      
      // Race the save against the timeout
      await Promise.race([savePromise, timeoutPromise]);
      
      toast({
        title: 'Success',
        description: 'Settings saved successfully.',
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to save settings. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>General Settings</CardTitle>
        <CardDescription>
          Configure basic application settings
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="appName">Application Name</Label>
          <Input 
            id="appName"
            name="appName"
            value={settings.appName}
            onChange={handleInputChange}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="supportEmail">Support Email</Label>
          <Input 
            id="supportEmail"
            name="supportEmail"
            type="email"
            value={settings.supportEmail}
            onChange={handleInputChange}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="maxUploadSizeMB">Maximum Upload Size (MB)</Label>
          <Input 
            id="maxUploadSizeMB"
            name="maxUploadSizeMB"
            type="number"
            min="1"
            max="50"
            value={settings.maxUploadSizeMB}
            onChange={handleInputChange}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="defaultUserExperienceLevel">Default User Experience Level</Label>
          <Input 
            id="defaultUserExperienceLevel"
            name="defaultUserExperienceLevel"
            value={settings.defaultUserExperienceLevel}
            onChange={handleInputChange}
          />
        </div>
        
        <div className="flex items-center justify-between pt-2">
          <div className="space-y-0.5">
            <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
            <p className="text-xs text-muted-foreground">
              When enabled, only admins can access the site
            </p>
          </div>
          <Switch
            id="maintenanceMode"
            checked={settings.maintenanceMode}
            onCheckedChange={(checked) => handleSwitchChange('maintenanceMode', checked)}
          />
        </div>
        
        <div className="flex items-center justify-between pt-2">
          <div className="space-y-0.5">
            <Label htmlFor="allowNewRegistrations">Allow New Registrations</Label>
            <p className="text-xs text-muted-foreground">
              When disabled, new users cannot register
            </p>
          </div>
          <Switch
            id="allowNewRegistrations"
            checked={settings.allowNewRegistrations}
            onCheckedChange={(checked) => handleSwitchChange('allowNewRegistrations', checked)}
          />
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button onClick={saveSettings} disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : 'Save Changes'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default GeneralSettings;
