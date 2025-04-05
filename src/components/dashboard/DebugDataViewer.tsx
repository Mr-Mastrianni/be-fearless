import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

const DebugDataViewer: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [debugData, setDebugData] = useState<any>(null);

  const loadDebugData = async () => {
    try {
      // In a real implementation, this would fetch data from an API
      // For now, we'll just use mock data
      setDebugData({
        user: {
          id: 'user-123',
          email: 'debug@example.com',
          created_at: new Date().toISOString(),
        },
        profile: {
          name: 'Debug User',
          preferences: {
            theme: 'light',
            notifications: true,
          },
        },
        session: {
          active: true,
          last_activity: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error('Error loading debug data:', error);
      setDebugData({ error: 'Failed to load debug data' });
    }
  };

  return (
    <Card className="bg-gray-50 border-dashed border-gray-300">
      <CardHeader className="pb-2">
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-gray-500">Debug Data Viewer</CardTitle>
              <CardDescription>
                View internal data for debugging purposes
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
              <div className="flex justify-end mb-4">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={loadDebugData}
                  disabled={!!debugData}
                >
                  Load Debug Data
                </Button>
              </div>
              
              {debugData ? (
                <pre className="bg-gray-100 p-4 rounded-md overflow-auto max-h-96 text-xs">
                  {JSON.stringify(debugData, null, 2)}
                </pre>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No debug data loaded</p>
                  <p className="text-xs mt-2">Click "Load Debug Data" to view</p>
                </div>
              )}
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </CardHeader>
    </Card>
  );
};

export default DebugDataViewer;