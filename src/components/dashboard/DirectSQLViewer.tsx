import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useToast } from '@/components/ui/use-toast';

const DirectSQLViewer: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [sqlQuery, setSqlQuery] = useState('SELECT * FROM user_profiles LIMIT 5;');
  const [queryResults, setQueryResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const executeQuery = async () => {
    if (!sqlQuery.trim()) {
      toast({
        title: "Empty Query",
        description: "Please enter a SQL query to execute",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // In a real implementation, this would send the query to a backend API
      // For now, we'll just simulate a response
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock response
      setQueryResults({
        rows: [
          { id: 1, name: 'User 1', email: 'user1@example.com' },
          { id: 2, name: 'User 2', email: 'user2@example.com' },
          { id: 3, name: 'User 3', email: 'user3@example.com' },
        ],
        rowCount: 3,
        duration: '0.123s',
      });
      
      toast({
        title: "Query Executed",
        description: "Query completed successfully",
      });
    } catch (error) {
      console.error('Error executing query:', error);
      toast({
        title: "Query Error",
        description: "Failed to execute SQL query",
        variant: "destructive",
      });
      setQueryResults({ error: 'Failed to execute query' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="bg-gray-50 border-dashed border-gray-300">
      <CardHeader className="pb-2">
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-gray-500">Direct SQL Viewer</CardTitle>
              <CardDescription>
                Execute SQL queries directly (admin only)
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
                <Textarea
                  value={sqlQuery}
                  onChange={(e) => setSqlQuery(e.target.value)}
                  placeholder="Enter SQL query..."
                  className="font-mono text-sm"
                  rows={3}
                />
                
                <div className="flex justify-end">
                  <Button 
                    onClick={executeQuery}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Executing...' : 'Execute Query'}
                  </Button>
                </div>
                
                {queryResults && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium mb-2">Results ({queryResults.rowCount || 0} rows)</h4>
                    {queryResults.error ? (
                      <div className="bg-red-50 text-red-500 p-4 rounded-md">
                        {queryResults.error}
                      </div>
                    ) : (
                      <div className="bg-white border rounded-md overflow-auto max-h-96">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              {queryResults.rows && queryResults.rows.length > 0 && 
                                Object.keys(queryResults.rows[0]).map((key) => (
                                  <th 
                                    key={key}
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                  >
                                    {key}
                                  </th>
                                ))
                              }
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {queryResults.rows && queryResults.rows.map((row: any, i: number) => (
                              <tr key={i}>
                                {Object.values(row).map((value: any, j: number) => (
                                  <td 
                                    key={j}
                                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                                  >
                                    {String(value)}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                    
                    {queryResults.duration && (
                      <p className="text-xs text-gray-500 mt-2">
                        Query executed in {queryResults.duration}
                      </p>
                    )}
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

export default DirectSQLViewer;