import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, Search, UserPlus, Shield, ShieldAlert, Eye, EyeOff, UserX } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';

// User type definition
interface UserData {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  user_metadata: {
    full_name?: string;
    avatar_url?: string;
    role?: string;
  };
  is_admin: boolean;
  profile_completed: boolean;
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [actionType, setActionType] = useState<'promote' | 'demote' | 'delete'>('promote');
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();

  // Fetch users from the database
  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      
      // Set a timeout to prevent getting stuck indefinitely
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('User fetch timed out')), 10000);
      });
      
      const fetchPromise = new Promise(async (resolve) => {
        try {
          // Fetch users from auth.users view (requires admin access)
          const { data: authUsers, error: authError } = await supabase
            .from('auth_users_view')
            .select('*');
          
          if (authError) {
            console.error('Error fetching auth users:', authError);
            resolve([]);
            return;
          }
          
          // Fetch admin users to determine admin status
          const { data: adminUsers, error: adminError } = await supabase
            .from('admin_users')
            .select('user_id');
          
          if (adminError) {
            console.error('Error fetching admin users:', adminError);
          }
          
          // Create a set of admin user IDs for quick lookup
          const adminUserIds = new Set((adminUsers || []).map(admin => admin.user_id));
          
          // Fetch user profiles to get additional user data
          const { data: userProfiles, error: profileError } = await supabase
            .from('user_profiles')
            .select('user_id, profile_completed');
          
          if (profileError) {
            console.error('Error fetching user profiles:', profileError);
          }
          
          // Create a map of user profiles for quick lookup
          const profileMap = new Map();
          (userProfiles || []).forEach(profile => {
            profileMap.set(profile.user_id, profile);
          });
          
          // Combine data from all sources
          const combinedUsers = (authUsers || []).map(user => ({
            ...user,
            is_admin: adminUserIds.has(user.id) || user.user_metadata?.role === 'admin',
            profile_completed: profileMap.get(user.id)?.profile_completed || false
          }));
          
          resolve(combinedUsers);
        } catch (error) {
          console.error('Error in user fetch:', error);
          resolve([]);
        }
      });
      
      // Race the fetch against the timeout
      const usersData = await Promise.race([fetchPromise, timeoutPromise]) as UserData[];
      setUsers(usersData);
      setFilteredUsers(usersData);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: 'Error',
        description: 'Failed to load users. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Filter users based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredUsers(users);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = users.filter(
        user => 
          user.email.toLowerCase().includes(query) || 
          user.user_metadata?.full_name?.toLowerCase().includes(query) ||
          user.id.toLowerCase().includes(query)
      );
      setFilteredUsers(filtered);
    }
  }, [searchQuery, users]);

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  // Handle user action (promote, demote, delete)
  const handleUserAction = async () => {
    if (!selectedUser) return;
    
    setShowConfirmDialog(false);
    
    try {
      if (actionType === 'promote') {
        // Add user to admin_users table
        const { error } = await supabase
          .from('admin_users')
          .insert([{ user_id: selectedUser.id }]);
        
        if (error) throw error;
        
        toast({
          title: 'Success',
          description: `${selectedUser.email} has been promoted to admin.`,
        });
      } else if (actionType === 'demote') {
        // Remove user from admin_users table
        const { error } = await supabase
          .from('admin_users')
          .delete()
          .eq('user_id', selectedUser.id);
        
        if (error) throw error;
        
        toast({
          title: 'Success',
          description: `${selectedUser.email} has been demoted from admin.`,
        });
      } else if (actionType === 'delete') {
        // Call Supabase Edge Function to delete user (requires admin access)
        const { data: sessionData } = await supabase.auth.getSession();
        
        if (!sessionData.session?.access_token) {
          throw new Error('No access token found');
        }
        
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-delete-user`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${sessionData.session.access_token}`
            },
            body: JSON.stringify({ user_id: selectedUser.id })
          }
        );
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to delete user');
        }
        
        toast({
          title: 'Success',
          description: `${selectedUser.email} has been deleted.`,
        });
      }
      
      // Refresh user list
      fetchUsers();
    } catch (error) {
      console.error(`Error ${actionType} user:`, error);
      toast({
        title: 'Error',
        description: `Failed to ${actionType} user. ${error instanceof Error ? error.message : ''}`,
        variant: 'destructive',
      });
    }
  };

  // Format date for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>
            View and manage all users in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-4">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search users..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" className="ml-2" disabled>
              <UserPlus className="h-4 w-4 mr-2" />
              Invite User
            </Button>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Last Sign In</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                        {searchQuery ? 'No users match your search' : 'No users found'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">
                          <div className="flex flex-col">
                            <span>{user.user_metadata?.full_name || 'Unnamed User'}</span>
                            <span className="text-sm text-muted-foreground">{user.email}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {user.is_admin && (
                              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                <Shield className="h-3 w-3 mr-1" />
                                Admin
                              </Badge>
                            )}
                            {user.profile_completed ? (
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                Complete
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                                Incomplete
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{formatDate(user.created_at)}</TableCell>
                        <TableCell>{formatDate(user.last_sign_in_at)}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="h-4 w-4"
                                >
                                  <circle cx="12" cy="12" r="1" />
                                  <circle cx="12" cy="5" r="1" />
                                  <circle cx="12" cy="19" r="1" />
                                </svg>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => navigate(`/admin/users/${user.id}`)}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              
                              {!user.is_admin ? (
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedUser(user);
                                    setActionType('promote');
                                    setShowConfirmDialog(true);
                                  }}
                                >
                                  <Shield className="h-4 w-4 mr-2" />
                                  Make Admin
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedUser(user);
                                    setActionType('demote');
                                    setShowConfirmDialog(true);
                                  }}
                                  disabled={user.id === currentUser?.id}
                                >
                                  <ShieldAlert className="h-4 w-4 mr-2" />
                                  Remove Admin
                                </DropdownMenuItem>
                              )}
                              
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedUser(user);
                                  setActionType('delete');
                                  setShowConfirmDialog(true);
                                }}
                                disabled={user.id === currentUser?.id}
                                className="text-red-600 focus:text-red-600"
                              >
                                <UserX className="h-4 w-4 mr-2" />
                                Delete User
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === 'promote' ? 'Promote User to Admin' : 
               actionType === 'demote' ? 'Remove Admin Privileges' : 
               'Delete User'}
            </DialogTitle>
            <DialogDescription>
              {actionType === 'promote' ? 
                'This will grant admin privileges to this user. They will be able to access all admin features.' : 
               actionType === 'demote' ? 
                'This will remove admin privileges from this user. They will no longer have access to admin features.' : 
                'This will permanently delete this user and all their data. This action cannot be undone.'}
            </DialogDescription>
          </DialogHeader>
          
          {selectedUser && (
            <div className="py-4">
              <p className="font-medium">{selectedUser.user_metadata?.full_name || 'Unnamed User'}</p>
              <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
              Cancel
            </Button>
            <Button 
              variant={actionType === 'delete' ? 'destructive' : 'default'}
              onClick={handleUserAction}
            >
              {actionType === 'promote' ? 'Promote' : 
               actionType === 'demote' ? 'Remove Admin' : 
               'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default UserManagement;
