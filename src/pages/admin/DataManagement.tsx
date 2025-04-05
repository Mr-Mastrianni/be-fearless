import React from 'react';
import { Helmet } from 'react-helmet';
import AdminLayout from '@/components/admin/AdminLayout';
import AirtableSync from '@/components/admin/AirtableSync';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function DataManagement() {
  return (
    <AdminLayout>
      <Helmet>
        <title>Data Management | Courage Bot Admin</title>
      </Helmet>

      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Data Management</h1>
        </div>

        <Tabs defaultValue="airtable" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="airtable">Airtable Integration</TabsTrigger>
            <TabsTrigger value="export">Data Export</TabsTrigger>
            <TabsTrigger value="backup">Backup & Restore</TabsTrigger>
          </TabsList>
          
          <TabsContent value="airtable">
            <AirtableSync />
          </TabsContent>
          
          <TabsContent value="export">
            <Card>
              <CardHeader>
                <CardTitle>Data Export</CardTitle>
                <CardDescription>
                  Export user data and analytics in various formats
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="p-6 text-center text-gray-500">
                  <p>Data export functionality will be available in a future update.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="backup">
            <Card>
              <CardHeader>
                <CardTitle>Backup & Restore</CardTitle>
                <CardDescription>
                  Create and manage database backups
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="p-6 text-center text-gray-500">
                  <p>Backup and restore functionality will be available in a future update.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
