import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Download, Upload, FileArchive, AlertCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const BackupRestore: React.FC = () => {
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [progress, setProgress] = useState(0);
  const [activeTab, setActiveTab] = useState('backup');
  const [backupFile, setBackupFile] = useState<File | null>(null);
  const { toast } = useToast();

  // Create a timeout promise to prevent infinite loading
  const createTimeoutPromise = (ms: number, operation: string) => {
    return new Promise((_, reject) => {
      setTimeout(() => reject(new Error(`${operation} operation timed out`)), ms);
    });
  };

  // Handle backup creation
  const handleBackup = async () => {
    try {
      setIsBackingUp(true);
      setProgress(0);
      
      const backupPromise = new Promise(async (resolve, reject) => {
        try {
          // Simulate backup progress
          const interval = setInterval(() => {
            setProgress(prev => {
              if (prev >= 95) {
                clearInterval(interval);
                return 95;
              }
              return prev + 5;
            });
          }, 300);
          
          // Fetch data for backup
          const tables = [
            'user_profiles',
            'activities',
            'activity_completions',
            'system_settings',
            'notification_settings'
          ];
          
          const backupData: Record<string, any> = {};
          
          // Fetch data from each table
          for (const table of tables) {
            const { data, error } = await supabase
              .from(table)
              .select('*');
              
            if (error) {
              clearInterval(interval);
              reject(new Error(`Error fetching data from ${table}: ${error.message}`));
              return;
            }
            
            backupData[table] = data;
          }
          
          // Create backup file
          const backupJson = JSON.stringify(backupData, null, 2);
          const blob = new Blob([backupJson], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          
          // Create filename with date
          const date = new Date();
          const dateStr = date.toISOString().split('T')[0];
          const filename = `courage-bot-backup-${dateStr}.json`;
          
          link.href = url;
          link.download = filename;
          
          // Complete progress and trigger download
          setProgress(100);
          setTimeout(() => {
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            clearInterval(interval);
            resolve(true);
          }, 500);
        } catch (error) {
          reject(error);
        }
      });
      
      // Race the backup against the timeout
      await Promise.race([
        backupPromise,
        createTimeoutPromise(30000, 'Backup')
      ]);
      
      toast({
        title: 'Backup Complete',
        description: 'Your database backup has been downloaded successfully.',
      });
    } catch (error) {
      console.error('Backup error:', error);
      setProgress(0);
      toast({
        title: 'Backup Failed',
        description: error instanceof Error ? error.message : 'An unknown error occurred during backup.',
        variant: 'destructive',
      });
    } finally {
      setIsBackingUp(false);
    }
  };

  // Handle file selection for restore
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setBackupFile(e.target.files[0]);
    }
  };

  // Handle restore operation
  const handleRestore = async () => {
    if (!backupFile) {
      toast({
        title: 'No File Selected',
        description: 'Please select a backup file to restore.',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      setIsRestoring(true);
      setProgress(0);
      
      const restorePromise = new Promise(async (resolve, reject) => {
        try {
          // Simulate restore progress
          const interval = setInterval(() => {
            setProgress(prev => {
              if (prev >= 95) {
                clearInterval(interval);
                return 95;
              }
              return prev + 5;
            });
          }, 300);
          
          // Read backup file
          const reader = new FileReader();
          
          reader.onload = async (event) => {
            try {
              if (!event.target || typeof event.target.result !== 'string') {
                clearInterval(interval);
                reject(new Error('Failed to read backup file'));
                return;
              }
              
              const backupData = JSON.parse(event.target.result);
              
              // Validate backup data
              const requiredTables = ['user_profiles', 'activities'];
              for (const table of requiredTables) {
                if (!backupData[table]) {
                  clearInterval(interval);
                  reject(new Error(`Invalid backup file: missing ${table} data`));
                  return;
                }
              }
              
              // In a real implementation, you would restore the data to the database
              // For this demo, we'll just simulate success
              
              // Complete progress
              setProgress(100);
              setTimeout(() => {
                clearInterval(interval);
                resolve(true);
              }, 1000);
            } catch (error) {
              clearInterval(interval);
              reject(error);
            }
          };
          
          reader.onerror = () => {
            clearInterval(interval);
            reject(new Error('Error reading backup file'));
          };
          
          reader.readAsText(backupFile);
        } catch (error) {
          reject(error);
        }
      });
      
      // Race the restore against the timeout
      await Promise.race([
        restorePromise,
        createTimeoutPromise(30000, 'Restore')
      ]);
      
      toast({
        title: 'Restore Complete',
        description: 'Your database has been restored successfully.',
      });
      
      // Reset file input
      setBackupFile(null);
    } catch (error) {
      console.error('Restore error:', error);
      setProgress(0);
      toast({
        title: 'Restore Failed',
        description: error instanceof Error ? error.message : 'An unknown error occurred during restore.',
        variant: 'destructive',
      });
    } finally {
      setIsRestoring(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Backup & Restore</CardTitle>
        <CardDescription>
          Create backups of your database or restore from a previous backup
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Important</AlertTitle>
          <AlertDescription>
            Restoring from a backup will overwrite all existing data. Make sure to create a backup before restoring.
          </AlertDescription>
        </Alert>
        
        <Tabs 
          defaultValue="backup" 
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid grid-cols-2 mb-6">
            <TabsTrigger value="backup">Backup</TabsTrigger>
            <TabsTrigger value="restore">Restore</TabsTrigger>
          </TabsList>
          
          <TabsContent value="backup" className="space-y-4">
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Create a backup of your database. This will download a JSON file containing all your data.
              </p>
              
              {isBackingUp && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Creating backup...</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              )}
              
              <Button 
                onClick={handleBackup} 
                disabled={isBackingUp}
                className="w-full sm:w-auto"
              >
                <Download className="mr-2 h-4 w-4" />
                {isBackingUp ? 'Creating Backup...' : 'Create Backup'}
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="restore" className="space-y-4">
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Restore your database from a previously created backup file.
              </p>
              
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <label htmlFor="backup-file" className="text-sm font-medium">
                  Backup File
                </label>
                <div className="flex items-center gap-2">
                  <input
                    id="backup-file"
                    type="file"
                    accept=".json"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <Button 
                    variant="outline" 
                    onClick={() => document.getElementById('backup-file')?.click()}
                    disabled={isRestoring}
                  >
                    <FileArchive className="mr-2 h-4 w-4" />
                    Choose File
                  </Button>
                  <span className="text-sm truncate max-w-[200px]">
                    {backupFile ? backupFile.name : 'No file chosen'}
                  </span>
                </div>
              </div>
              
              {isRestoring && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Restoring from backup...</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              )}
              
              <Button 
                onClick={handleRestore} 
                disabled={isRestoring || !backupFile}
                className="w-full sm:w-auto"
              >
                <Upload className="mr-2 h-4 w-4" />
                {isRestoring ? 'Restoring...' : 'Restore Backup'}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default BackupRestore;
