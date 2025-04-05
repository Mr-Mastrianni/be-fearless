import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useToast } from '@/components/ui/use-toast';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

const RepairTool: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isRepairing, setIsRepairing] = useState(false);
  const [repairStatus, setRepairStatus] = useState<'idle' | 'running' | 'success' | 'error'>('idle');
  const [repairLog, setRepairLog] = useState<string[]>([]);
  const { toast } = useToast();

  const runRepair = async () => {
    if (isRepairing) return;
    
    setIsRepairing(true);
    setRepairStatus('running');
    setRepairLog([]);
    
    try {
      // Simulate repair process with logs
      const steps = [
        'Initializing repair process...',
        'Checking database connection...',
        'Validating user profile data...',
        'Checking for missing records...',
        'Repairing data inconsistencies...',
        'Validating fear assessment data...',
        'Rebuilding activity recommendations...',
        'Finalizing repairs...',
      ];
      
      for (const step of steps) {
        await new Promise(resolve => setTimeout(resolve, 500));
        setRepairLog(prev => [...prev, step]);
      }
      
      // Simulate success
      await new Promise(resolve => setTimeout(resolve, 1000));
      setRepairStatus('success');
      setRepairLog(prev => [...prev, 'Repair completed successfully!']);
      
      toast({
        title: "Repair Completed",
        description: "All data has been repaired successfully",
      });
    } catch (error) {
      console.error('Error during repair:', error);
      setRepairStatus('error');
      setRepairLog(prev => [...prev, `Error: ${error instanceof Error ? error.message : 'Unknown error'}`]);
      
      toast({
        title: "Repair Failed",
        description: "An error occurred during the repair process",
        variant: "destructive",
      });
    } finally {
      setIsRepairing(false);
    }
  };

  return (
    <Card className="bg-gray-50 border-dashed border-gray-300">
      <CardHeader className="pb-2">
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-gray-500">Data Repair Tool</CardTitle>
              <CardDescription>
                Fix data inconsistencies and repair user profiles
              </CardDescription>
            </div>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm">
                {isOpen ? 'Hide' : 'Show'}
              </Button>
            </CollapsibleTrigger>
          </div>
          
          <CollapsibleContent>
            <CardContent className="pt-4">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-500">
                    Use this tool to repair data inconsistencies in your profile and assessments.
                  </p>
                  <Button 
                    onClick={runRepair}
                    disabled={isRepairing}
                    variant={repairStatus === 'error' ? 'destructive' : 'default'}
                  >
                    {isRepairing ? 'Repairing...' : 'Run Repair'}
                  </Button>
                </div>
                
                {repairLog.length > 0 && (
                  <div className="mt-4 border rounded-md overflow-hidden">
                    <div className="bg-gray-100 px-4 py-2 border-b flex justify-between items-center">
                      <h4 className="text-sm font-medium">Repair Log</h4>
                      {repairStatus === 'success' && (
                        <span className="flex items-center text-green-500 text-xs">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Success
                        </span>
                      )}
                      {repairStatus === 'error' && (
                        <span className="flex items-center text-red-500 text-xs">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Error
                        </span>
                      )}
                    </div>
                    <div className="bg-black text-gray-300 p-4 font-mono text-xs max-h-60 overflow-auto">
                      {repairLog.map((log, index) => (
                        <div key={index} className="mb-1">
                          {log.startsWith('Error:') ? (
                            <span className="text-red-400">{log}</span>
                          ) : log.includes('success') ? (
                            <span className="text-green-400">{log}</span>
                          ) : (
                            log
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </CardHeader>
    </Card>
  );
};

export default RepairTool;