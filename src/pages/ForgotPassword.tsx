import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
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
import { Loader2, Check } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { resetPassword } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: 'Email required',
        description: 'Please enter your email address.',
        variant: 'destructive',
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { success, error } = await resetPassword(email);
      
      if (success) {
        setIsSuccess(true);
        toast({
          title: 'Reset email sent',
          description: 'Check your email for the password reset link.',
        });
      } else {
        toast({
          title: 'Error',
          description: error || 'An error occurred. Please try again.',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'An unexpected error occurred.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

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
            <CardTitle className="text-2xl">Reset Password</CardTitle>
            <CardDescription>
              Enter your email to receive a password reset link
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {isSuccess ? (
                <div className="bg-green-50 p-4 rounded-md text-center">
                  <div className="flex items-center justify-center mb-2">
                    <div className="rounded-full bg-green-100 p-2">
                      <Check className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                  <h3 className="text-lg font-medium text-green-800">Email Sent</h3>
                  <p className="text-sm text-green-700 mt-1">
                    We've sent a password reset link to {email}
                  </p>
                  <p className="text-xs text-green-600 mt-4">
                    Don't see it? Check your spam folder or try again.
                  </p>
                </div>
              ) : (
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
              )}
            </CardContent>
            <CardFooter className="flex flex-col">
              {isSuccess ? (
                <div className="w-full space-y-2">
                  <Link to="/login">
                    <Button
                      className="w-full bg-courage-600 hover:bg-courage-700"
                      type="button"
                    >
                      Return to Login
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    className="w-full"
                    type="button"
                    onClick={() => {
                      setIsSuccess(false);
                      setEmail('');
                    }}
                  >
                    Try a different email
                  </Button>
                </div>
              ) : (
                <Button
                  type="submit"
                  className="w-full bg-courage-600 hover:bg-courage-700"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    'Send Reset Link'
                  )}
                </Button>
              )}
              {!isSuccess && (
                <div className="mt-4 text-center text-sm">
                  <Link
                    to="/login"
                    className="text-courage-600 hover:text-courage-800"
                  >
                    Back to login
                  </Link>
                </div>
              )}
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default ForgotPassword;
