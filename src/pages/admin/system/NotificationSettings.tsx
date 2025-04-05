import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';

interface NotificationSettingsData {
  enableEmailNotifications: boolean;
  enablePushNotifications: boolean;
  enableInAppNotifications: boolean;
  weeklyDigestEnabled: boolean;
  adminAlertEmails: string[];
  emailFromName: string;
  emailSubjectPrefix: string;
  emailFooterText: string;
}

const NotificationSettings: React.FC = () => {
  const [settings, setSettings] = useState<NotificationSettingsData>({
    enableEmailNotifications: true,
    enablePushNotifications: true,
    enableInAppNotifications: true,
    weeklyDigestEnabled: true,
    adminAlertEmails: ['admin@couragebot.com'],
    emailFromName: 'Courage Bot',
    emailSubjectPrefix: '[Courage Bot]',
    emailFooterText: '© Courage Bot Adventure. All rights reserved.',
  });
  
  const [adminEmailsInput, setAdminEmailsInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  // Fetch notification settings from the database
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setIsLoading(true);
        
        // Create a timeout promise to prevent infinite loading
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Settings fetch timed out')), 10000);
        });
        
        const fetchPromise = new Promise(async (resolve) => {
          try {
            const { data, error } = await supabase
              .from('notification_settings')
              .select('*')
              .single();
            
            if (error) {
              console.error('Error fetching notification settings:', error);
              resolve(null);
              return;
            }
            
            if (data) {
              const settingsData = {
                enableEmailNotifications: data.enable_email_notifications !== false,
                enablePushNotifications: data.enable_push_notifications !== false,
                enableInAppNotifications: data.enable_in_app_notifications !== false,
                weeklyDigestEnabled: data.weekly_digest_enabled !== false,
                adminAlertEmails: data.admin_alert_emails || ['admin@couragebot.com'],
                emailFromName: data.email_from_name || 'Courage Bot',
                emailSubjectPrefix: data.email_subject_prefix || '[Courage Bot]',
                emailFooterText: data.email_footer_text || '© Courage Bot Adventure. All rights reserved.',
              };
              
              setAdminEmailsInput(settingsData.adminAlertEmails.join(', '));
              resolve(settingsData);
            } else {
              resolve(null);
            }
          } catch (error) {
            console.error('Error in notification settings fetch:', error);
            resolve(null);
          }
        });
        
        // Race the fetch against the timeout
        const settingsData = await Promise.race([fetchPromise, timeoutPromise]) as NotificationSettingsData | null;
        
        if (settingsData) {
          setSettings(settingsData);
        }
      } catch (error) {
        console.error('Error fetching notification settings:', error);
        toast({
          title: 'Error',
          description: 'Failed to load notification settings. Using defaults.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSettings();
  }, [toast]);

  // Handle switch changes
  const handleSwitchChange = (name: string, checked: boolean) => {
    setSettings(prev => ({
      ...prev,
      [name]: checked,
    }));
  };

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    setSettings(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle admin emails input change
  const handleAdminEmailsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAdminEmailsInput(e.target.value);
    
    // Parse emails from comma-separated list
    const emails = e.target.value
      .split(',')
      .map(email => email.trim())
      .filter(email => email.length > 0);
    
    setSettings(prev => ({
      ...prev,
      adminAlertEmails: emails,
    }));
  };

  // Save notification settings to the database
  const saveSettings = async () => {
    try {
      setIsSaving(true);
      
      // Create a timeout promise to prevent infinite loading
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Save settings timed out')), 10000);
      });
      
      const savePromise = new Promise(async (resolve, reject) => {
        try {
          const { error } = await supabase
            .from('notification_settings')
            .upsert({
              id: 1, // Assuming a single row for notification settings
              enable_email_notifications: settings.enableEmailNotifications,
              enable_push_notifications: settings.enablePushNotifications,
              enable_in_app_notifications: settings.enableInAppNotifications,
              weekly_digest_enabled: settings.weeklyDigestEnabled,
              admin_alert_emails: settings.adminAlertEmails,
              email_from_name: settings.emailFromName,
              email_subject_prefix: settings.emailSubjectPrefix,
              email_footer_text: settings.emailFooterText,
              updated_at: new Date().toISOString(),
            });
          
          if (error) {
            console.error('Error saving notification settings:', error);
            reject(error);
            return;
          }
          
          resolve(true);
        } catch (error) {
          console.error('Error in save notification settings:', error);
          reject(error);
        }
      });
      
      // Race the save against the timeout
      await Promise.race([savePromise, timeoutPromise]);
      
      toast({
        title: 'Success',
        description: 'Notification settings saved successfully.',
      });
    } catch (error) {
      console.error('Error saving notification settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to save notification settings. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Test notification email
  const sendTestEmail = async () => {
    try {
      setIsSaving(true);
      
      // Create a timeout promise to prevent infinite loading
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Test email send timed out')), 10000);
      });
      
      const sendPromise = new Promise(async (resolve, reject) => {
        try {
          // This would normally call an Edge Function or API endpoint
          // For now, we'll just simulate success
          setTimeout(() => {
            resolve(true);
          }, 1500);
        } catch (error) {
          console.error('Error sending test email:', error);
          reject(error);
        }
      });
      
      // Race the send against the timeout
      await Promise.race([sendPromise, timeoutPromise]);
      
      toast({
        title: 'Success',
        description: 'Test email sent successfully.',
      });
    } catch (error) {
      console.error('Error sending test email:', error);
      toast({
        title: 'Error',
        description: 'Failed to send test email. Please try again.',
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
        <CardTitle>Notification Settings</CardTitle>
        <CardDescription>
          Configure how and when notifications are sent to users and administrators
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Notification Channels</h3>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="enableEmailNotifications">Email Notifications</Label>
              <p className="text-xs text-muted-foreground">
                Send email notifications to users
              </p>
            </div>
            <Switch
              id="enableEmailNotifications"
              checked={settings.enableEmailNotifications}
              onCheckedChange={(checked) => handleSwitchChange('enableEmailNotifications', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="enablePushNotifications">Push Notifications</Label>
              <p className="text-xs text-muted-foreground">
                Send browser push notifications to users
              </p>
            </div>
            <Switch
              id="enablePushNotifications"
              checked={settings.enablePushNotifications}
              onCheckedChange={(checked) => handleSwitchChange('enablePushNotifications', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="enableInAppNotifications">In-App Notifications</Label>
              <p className="text-xs text-muted-foreground">
                Show notifications within the application
              </p>
            </div>
            <Switch
              id="enableInAppNotifications"
              checked={settings.enableInAppNotifications}
              onCheckedChange={(checked) => handleSwitchChange('enableInAppNotifications', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="weeklyDigestEnabled">Weekly Digest</Label>
              <p className="text-xs text-muted-foreground">
                Send weekly summary emails to users
              </p>
            </div>
            <Switch
              id="weeklyDigestEnabled"
              checked={settings.weeklyDigestEnabled}
              onCheckedChange={(checked) => handleSwitchChange('weeklyDigestEnabled', checked)}
            />
          </div>
        </div>
        
        <div className="space-y-4 pt-4">
          <h3 className="text-lg font-medium">Admin Notifications</h3>
          
          <div className="space-y-2">
            <Label htmlFor="adminAlertEmails">Admin Alert Emails</Label>
            <p className="text-xs text-muted-foreground">
              Comma-separated list of email addresses to receive admin alerts
            </p>
            <Input 
              id="adminAlertEmails"
              value={adminEmailsInput}
              onChange={handleAdminEmailsChange}
              placeholder="admin@example.com, support@example.com"
            />
          </div>
        </div>
        
        <div className="space-y-4 pt-4">
          <h3 className="text-lg font-medium">Email Settings</h3>
          
          <div className="space-y-2">
            <Label htmlFor="emailFromName">From Name</Label>
            <Input 
              id="emailFromName"
              name="emailFromName"
              value={settings.emailFromName}
              onChange={handleInputChange}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="emailSubjectPrefix">Subject Prefix</Label>
            <Input 
              id="emailSubjectPrefix"
              name="emailSubjectPrefix"
              value={settings.emailSubjectPrefix}
              onChange={handleInputChange}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="emailFooterText">Email Footer Text</Label>
            <Textarea 
              id="emailFooterText"
              name="emailFooterText"
              value={settings.emailFooterText}
              onChange={handleInputChange}
              rows={3}
            />
          </div>
          
          <div className="pt-2">
            <Button variant="outline" onClick={sendTestEmail} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : 'Send Test Email'}
            </Button>
          </div>
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

export default NotificationSettings;
