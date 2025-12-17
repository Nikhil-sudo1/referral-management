import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { verifyEmail } from '@/lib/api/auth';
import { toast } from '@/hooks/use-toast';

const VerifyEmail = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [email, setEmail] = useState<string>('');

  useEffect(() => {
    const token = searchParams.get('token');
    const emailParam = searchParams.get('email') || location.state?.email || '';

    setEmail(emailParam);

    if (token) {
      handleVerification(token);
    } else {
      setStatus('error');
    }
  }, [searchParams, location]);

  const handleVerification = async (token: string) => {
    try {
      const response = await verifyEmail(token);
      if (response.success) {
        setStatus('success');
        toast({
          title: 'Email Verified!',
          description: 'Your account has been verified. You can now access the dashboard.',
        });
        // Redirect to login after 2 seconds
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setStatus('error');
        toast({
          title: 'Verification Failed',
          description: response.message || 'Invalid or expired verification link',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      setStatus('error');
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Failed to verify email',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            {status === 'loading' && (
              <Loader2 className="h-12 w-12 text-primary animate-spin" />
            )}
            {status === 'success' && (
              <CheckCircle className="h-12 w-12 text-green-500" />
            )}
            {status === 'error' && (
              <XCircle className="h-12 w-12 text-destructive" />
            )}
          </div>
          <CardTitle className="text-2xl">
            {status === 'loading' && 'Verifying Email...'}
            {status === 'success' && 'Email Verified!'}
            {status === 'error' && 'Verification Failed'}
          </CardTitle>
          <CardDescription>
            {status === 'loading' && 'Please wait while we verify your email address'}
            {status === 'success' && 'Your email has been successfully verified'}
            {status === 'error' && 'The verification link is invalid or has expired'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {email && (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Mail className="h-4 w-4" />
              <span>{email}</span>
            </div>
          )}
          {status === 'success' && (
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-4">
                Redirecting to login page...
              </p>
              <Button onClick={() => navigate('/login')} className="w-full">
                Go to Login
              </Button>
            </div>
          )}
          {status === 'error' && (
            <div className="text-center space-y-4">
              <p className="text-sm text-muted-foreground">
                Please check your email for a new verification link or contact support.
              </p>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => navigate('/signup')} className="flex-1">
                  Sign Up Again
                </Button>
                <Button onClick={() => navigate('/login')} className="flex-1">
                  Go to Login
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default VerifyEmail;

