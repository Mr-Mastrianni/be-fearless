import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft, User, Mail, Phone, Shield, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import AdminLayout from '@/components/admin/AdminLayout';

interface FearAssessment {
  id: string;
  timestamp: string;
  results: any;
}

interface UserProfile {
  id: string;
  user_id: string;
  full_name: string;
  avatar_url?: string;
  date_of_birth?: string;
  key_fears?: string[];
  experience_level?: string;
  challenge_intensity?: string;
  bio?: string;
  location?: string;
  phone_number?: string;
  email_notifications?: boolean;
  profile_completed: boolean;
  created_at: string;
  updated_at: string;
}

interface UserData {
  id: string;
  email: string;
  phone?: string;
  created_at: string;
  last_sign_in_at: string | null;
  user_metadata: {
    full_name?: string;
    phone?: string;
    avatar_url?: string;
    role?: string;
  };
  profile?: UserProfile;
  assessments?: FearAssessment[];
}

const UserDetailView: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        if (!userId) {
          throw new Error('User ID is required');
        }

        // Fetch user data from auth.users view
        const { data: authUser, error: authError } = await supabase
          .from('auth_users_view')
          .select('*')
          .eq('id', userId)
          .single();

        if (authError) {
          console.error('Error fetching user:', authError);
          throw new Error('Failed to fetch user data');
        }

        if (!authUser) {
          throw new Error('User not found');
        }

        // Fetch user profile
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', userId)
          .single();

        if (profileError && profileError.code !== 'PGRST116') {
          console.error('Error fetching user profile:', profileError);
        }

        // Fetch fear assessments
        const { data: assessments, error: assessmentsError } = await supabase
          .from('fear_assessments')
          .select('*')
          .eq('user_id', userId)
          .order('timestamp', { ascending: false });

        if (assessmentsError) {
          console.error('Error fetching fear assessments:', assessmentsError);
        }

        // Combine all data
        setUserData({
          ...authUser,
          profile: profile || null,
          assessments: assessments || [],
        });
      } catch (error) {
        console.error('Error fetching user data:', error);
        setError(error instanceof Error ? error.message : 'An unknown error occurred');
        toast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'Failed to load user data',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [userId, toast]);

  // Format date for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="container py-6">
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error || !userData) {
    return (
      <AdminLayout>
        <div className="container py-6">
          <Card>
            <CardHeader>
              <CardTitle>Error</CardTitle>
              <CardDescription>Failed to load user data</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center gap-4 py-6">
                <AlertTriangle className="h-12 w-12 text-destructive" />
                <p className="text-destructive">{error || 'User not found'}</p>
                <Button onClick={() => navigate('/admin/users')} variant="outline">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to User Management
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    );
  }

  // Extract fears from profile and assessments
  const userFears = userData.profile?.key_fears || [];
  const latestAssessment = userData.assessments && userData.assessments.length > 0 
    ? userData.assessments[0].results 
    : null;

  // Find phone number from multiple possible sources
  const phoneNumber = 
    userData.profile?.phone_number || 
    userData.user_metadata?.phone ||
    userData.phone ||
    'Not provided';

  return (
    <AdminLayout>
      <div className="container py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/admin/users')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h1 className="text-2xl font-bold">User Details</h1>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-7">
          {/* Main user info */}
          <Card className="md:col-span-3">
            <CardHeader>
              <CardTitle>User Information</CardTitle>
              <CardDescription>
                Basic account information and contact details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Name</span>
                  </div>
                  <span className="text-lg">
                    {userData.profile?.full_name || userData.user_metadata?.full_name || 'Unnamed User'}
                  </span>
                </div>

                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Email</span>
                  </div>
                  <span className="text-lg">{userData.email}</span>
                </div>

                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Phone</span>
                  </div>
                  <span className="text-lg">{phoneNumber}</span>
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium">Created</span>
                    <span>{formatDate(userData.created_at)}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium">Last Sign In</span>
                    <span>{formatDate(userData.last_sign_in_at)}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {userData.user_metadata?.role === 'admin' && (
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      <Shield className="h-3 w-3 mr-1" />
                      Admin
                    </Badge>
                  )}
                  {userData.profile?.profile_completed ? (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      Profile Complete
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                      Profile Incomplete
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Fears and assessments */}
          <Card className="md:col-span-4">
            <CardHeader>
              <CardTitle>Fears & Assessments</CardTitle>
              <CardDescription>
                User's fears and assessment results
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Selected Fears</h3>
                  {userFears.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {userFears.map((fear, index) => (
                        <Badge key={index} variant="secondary">
                          {fear}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No fears selected</p>
                  )}
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-medium mb-2">Latest Assessment</h3>
                  {latestAssessment ? (
                    <div className="space-y-3">
                      <p className="text-sm text-muted-foreground">
                        Taken on {formatDate(userData.assessments?.[0].timestamp || '')}
                      </p>
                      
                      {typeof latestAssessment === 'object' && latestAssessment !== null ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {Object.entries(latestAssessment).map(([key, value]) => (
                            <div key={key} className="bg-muted p-3 rounded-md">
                              <p className="font-medium capitalize">{key.replace(/_/g, ' ')}</p>
                              <p className="text-sm">{typeof value === 'object' ? JSON.stringify(value) : value}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <pre className="bg-muted p-3 rounded-md overflow-auto text-sm">
                          {JSON.stringify(latestAssessment, null, 2)}
                        </pre>
                      )}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No assessments taken</p>
                  )}
                </div>

                {userData.assessments && userData.assessments.length > 1 && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="text-lg font-medium mb-2">Assessment History</h3>
                      <div className="space-y-2">
                        {userData.assessments.slice(1).map((assessment) => (
                          <div key={assessment.id} className="bg-muted/50 p-3 rounded-md">
                            <p className="font-medium">
                              {formatDate(assessment.timestamp)}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {Object.keys(assessment.results).length} data points
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default UserDetailView;