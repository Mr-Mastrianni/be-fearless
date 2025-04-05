import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';
import { syncUserToAirtable } from '@/lib/airtable-sync';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Loader2, Mail, ArrowRight } from 'lucide-react';

const Register = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!fullName || !email || !password || !confirmPassword) {
      toast({
        title: 'Missing fields',
        description: 'Please fill in all fields.',
        variant: 'destructive',
      });
      return;
    }
    
    if (password !== confirmPassword) {
      toast({
        title: 'Password mismatch',
        description: 'Passwords do not match.',
        variant: 'destructive',
      });
      return;
    }
    
    if (password.length < 8) {
      toast({
        title: 'Password too short',
        description: 'Password must be at least 8 characters long.',
        variant: 'destructive',
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      console.log("Starting signup process for:", email);
      
      // Check if we should bypass email verification in development
      const skipEmailVerification = import.meta.env.VITE_SKIP_EMAIL_VERIFICATION === 'true';
      
      console.log('Creating account with email verification', skipEmailVerification ? 'DISABLED' : 'ENABLED');
      
      // Create the user with appropriate options based on environment
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            phone: phone,
            is_new_user: true
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          // Skip email verification in development if configured
          ...(skipEmailVerification ? { emailConfirmationStrategy: 'trusted_email' } : {})
        }
      });

      if (error) {
        console.error("Signup error:", error);
        toast({
          title: 'Registration failed',
          description: error.message || 'An error occurred during registration.',
          variant: 'destructive',
        });
        setIsLoading(false);
        return;
      }

      console.log("Signup successful, user data:", data);
      
      // Now create a profile in the user_profiles table
      if (data.user) {
        try {
          const profileData = {
            user_id: data.user.id,
            full_name: fullName,
            phone_number: phone,
            created_at: new Date().toISOString(),
            profile_completed: false,
          };
          
          console.log("Creating user profile with data:", profileData);
          
          const { error: profileError } = await supabase
            .from('user_profiles')
            .insert(profileData);
            
          if (profileError) {
            console.error("Error creating profile:", profileError);
            // Just log this error but don't show to user since signup succeeded
          } else {
            console.log("Profile created successfully");
            
            // Sync user data to Airtable
            try {
              console.log("Syncing user data to Airtable");
              await syncUserToAirtable(data.user.id);
            } catch (syncError) {
              console.error("Error syncing to Airtable:", syncError);
              // Continue despite error
            }
          }
        } catch (profileError) {
          console.error("Exception creating profile:", profileError);
          // Just log this error but don't show to user since signup succeeded
        }
      }
      
      // Show success message - always confirmed in development
      toast({
        title: 'Registration successful',
        description: 'Your account has been created successfully!',
      });
      
      // Set the registered email and mark registration as complete
      setRegisteredEmail(email);
      setRegistrationComplete(true);
    } catch (error: any) {
      console.error("Unexpected error during signup:", error);
      toast({
        title: 'Registration error',
        description: error.message || 'An unexpected error occurred.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Removed auto-login effect

  // If registration is complete, show confirmation screen
  if (registrationComplete) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="w-full max-w-md p-4">
          <div className="text-center mb-8">
            <Link to="/" className="inline-block">
              <h1 className="text-3xl font-bold text-courage-800">Be Courageous</h1>
            </Link>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Registration Complete</CardTitle>
              <CardDescription>
                Your account has been created successfully
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-center">
              <div className="flex justify-center my-6">
                <div className="bg-courage-100 p-4 rounded-full">
                  <Mail className="h-12 w-12 text-courage-600" />
                </div>
              </div>
              
              <p>You've successfully created an account with:</p>
              <p className="font-medium text-lg">{registeredEmail}</p>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button
                onClick={() => navigate('/login')}
                className="w-full bg-courage-600 hover:bg-courage-700"
              >
                Go to Login
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-4">
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <h1 className="text-3xl font-bold text-courage-800">Be Courageous</h1>
          </Link>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Create an Account</CardTitle>
            <CardDescription>
              Join Be Courageous to track your progress and overcome your fears
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number (optional)</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="(123) 456-7890"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  required
                />
                <p className="text-xs text-gray-500">
                  Must be at least 8 characters long
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col">
              <Button
                type="submit"
                className="w-full bg-courage-600 hover:bg-courage-700"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  'Sign Up'
                )}
              </Button>
              <p className="mt-4 text-center text-sm text-gray-600">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="font-medium text-courage-600 hover:text-courage-800"
                >
                  Log in
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Register;