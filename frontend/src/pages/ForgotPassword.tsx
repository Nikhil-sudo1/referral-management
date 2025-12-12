import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GraduationCap, Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast({ title: 'Validation Error', description: 'Please enter your email address', variant: 'destructive' });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({ title: 'Validation Error', description: 'Please enter a valid email address', variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setEmailSent(true);
      setIsLoading(false);
      toast({ title: 'Email Sent', description: 'Password reset instructions have been sent to your email' });
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-primary/20 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '4s' }} />
        <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-accent/20 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '4s', animationDelay: '1s' }} />
      </div>

      <div className="w-full max-w-md relative z-10">
        <Card className="bg-white/5 border-white/10 backdrop-blur-xl rounded-3xl overflow-hidden">
          <CardHeader className="text-center pb-6">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-cyan-400 flex items-center justify-center shadow-xl shadow-primary/30">
                <GraduationCap className="w-8 h-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-white">
              {emailSent ? 'Check Your Email' : 'Forgot Password?'}
            </CardTitle>
            <CardDescription className="text-white/50 mt-2">
              {emailSent 
                ? "We've sent password reset instructions to your email address"
                : "Enter your email address and we'll send you instructions to reset your password"
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            {!emailSent ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-white/70">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-xl h-12 focus:border-primary"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoFocus
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-primary to-cyan-400 hover:opacity-90 text-white rounded-xl h-12 text-base font-semibold shadow-lg shadow-primary/30"
                  disabled={isLoading}
                >
                  {isLoading ? 'Sending...' : 'Send Reset Instructions'}
                </Button>

                <div className="text-center">
                  <Link
                    to="/login"
                    className="text-sm text-primary hover:text-primary/80 inline-flex items-center gap-2 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Login
                  </Link>
                </div>
              </form>
            ) : (
              <div className="space-y-6 text-center py-4">
                <div className="flex justify-center">
                  <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-success" />
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm text-white/50">We've sent an email to:</p>
                  <p className="font-semibold text-white">{email}</p>
                </div>

                <div className="space-y-4 pt-4">
                  <p className="text-sm text-white/50">
                    Click the link in the email to reset your password. If you don't see the email, check your spam folder.
                  </p>

                  <Button
                    variant="outline"
                    className="w-full border-white/20 text-white hover:bg-white/10 rounded-xl h-12"
                    onClick={() => {
                      setEmailSent(false);
                      setEmail('');
                    }}
                  >
                    Try Another Email
                  </Button>

                  <Link to="/login">
                    <Button variant="ghost" className="w-full text-white/70 hover:text-white hover:bg-white/5 rounded-xl h-12">
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back to Login
                    </Button>
                  </Link>
                </div>
              </div>
            )}

            <div className="mt-6 text-center">
              <Link to="/" className="text-sm text-white/50 hover:text-white transition-colors">
                ← Back to Home
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <p className="text-sm text-white/40">
            Need help? Contact{' '}
            <a href="mailto:edtech@teamlease.com" className="text-primary hover:text-primary/80">
              edtech@teamlease.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
