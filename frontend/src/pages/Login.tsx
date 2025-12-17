import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Mail, Lock, User, Phone, Building2, ArrowRight, Eye, EyeOff, GraduationCap } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { login, signup, isLoading: authLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [signupData, setSignupData] = useState({
    name: '', email: '', phone: '', organization: '', password: '', confirmPassword: '',
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Login attempt started...');
    if (!loginData.email || !loginData.password) {
      toast({ title: 'Validation Error', description: 'Please fill in all fields', variant: 'destructive' });
      return;
    }
    setIsLoading(true);
    try {
      console.log('Calling login API...');
      const success = await login(loginData.email, loginData.password);
      console.log('Login API response:', success);
      if (success) {
        // Wait a moment for the user state to update
        await new Promise(resolve => setTimeout(resolve, 200));
        
        // Get the updated user from context after login
        // The login function in AuthContext already sets the user with their role from backend
        const storedUser = localStorage.getItem('user');
        console.log('Stored user:', storedUser);
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          const userRole = userData.role;
          console.log('User role from backend:', userRole);
          
          // Navigate based on actual role from backend
          if (userRole === 'referrer') {
            console.log('Navigating to /referrer/referrals');
            navigate('/referrer/referrals');
          } else {
            // super_admin, admin, or any other role goes to dashboard
            console.log('Navigating to /dashboard');
            navigate('/dashboard');
          }
        } else {
          // Fallback to dashboard
          console.log('No stored user, fallback to dashboard');
          navigate('/dashboard');
        }
      } else {
        console.log('Login failed - success was false');
      }
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupData.name || !signupData.email || !signupData.phone || !signupData.password) {
      toast({ title: 'Validation Error', description: 'Please fill in all required fields', variant: 'destructive' });
      return;
    }
    if (signupData.password !== signupData.confirmPassword) {
      toast({ title: 'Validation Error', description: 'Passwords do not match', variant: 'destructive' });
      return;
    }
    if (signupData.password.length < 6) {
      toast({ title: 'Validation Error', description: 'Password must be at least 6 characters', variant: 'destructive' });
      return;
    }
    setIsLoading(true);
    try {
      const success = await signup({
        name: signupData.name,
        email: signupData.email,
        phone: signupData.phone,
        password: signupData.password,
        confirmPassword: signupData.confirmPassword,
        organization: signupData.organization,
      });
      if (success) {
        navigate('/dashboard');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '4s' }} />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-accent/20 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '4s', animationDelay: '1s' }} />
      </div>

      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-12 items-center relative z-10">
        {/* Left Side - Branding */}
        <div className="hidden lg:flex flex-col justify-center space-y-8">
          <div className="space-y-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-cyan-400 flex items-center justify-center shadow-2xl shadow-primary/30">
                <GraduationCap className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">TeamLease EdTech</h1>
                <p className="text-sm text-white/50">Referral Management Platform</p>
              </div>
            </div>
            
            <h2 className="text-5xl font-bold leading-tight">
              Making Every
              <br />
              <span className="bg-gradient-to-r from-primary via-cyan-400 to-accent bg-clip-text text-transparent">
                Learner Employable
              </span>
            </h2>
            <p className="text-lg text-white/60 leading-relaxed max-w-lg">
              Connect education with employment through our comprehensive referral management platform. Streamline student referrals, track admissions, and measure outcomes.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { value: '600K+', label: 'Students Impacted', gradient: 'from-primary/20 to-cyan-500/20' },
              { value: '60+', label: 'Partner Universities', gradient: 'from-success/20 to-emerald-500/20' },
              { value: '50K+', label: 'Active Referrers', gradient: 'from-warning/20 to-orange-500/20' },
              { value: '85%', label: 'Success Rate', gradient: 'from-accent/20 to-purple-500/20' },
            ].map((stat) => (
              <div 
                key={stat.label}
                className={`p-5 rounded-2xl bg-gradient-to-br ${stat.gradient} border border-white/10 hover:border-white/20 transition-all`}
              >
                <p className="text-3xl font-bold text-white mb-1">{stat.value}</p>
                <p className="text-sm text-white/50">{stat.label}</p>
              </div>
            ))}
          </div>

          <Link to="/" className="text-sm text-primary hover:text-primary/80 font-medium inline-flex items-center gap-2 transition-colors group">
            <ArrowRight className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </Link>
        </div>

        {/* Right Side - Login/Signup Forms */}
        <div className="flex items-center justify-center">
          <Card className="w-full max-w-md bg-white/5 border-white/10 backdrop-blur-xl rounded-3xl overflow-hidden">
            <CardHeader className="border-b border-white/10 pb-6">
              <div className="flex items-center gap-3 mb-4 lg:hidden">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-cyan-400 flex items-center justify-center shadow-lg">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold text-white">TeamLease</CardTitle>
                  <p className="text-xs text-white/50">EdTech Referrals</p>
                </div>
              </div>
              <CardTitle className="text-2xl font-bold text-white">Welcome Back</CardTitle>
              <CardDescription className="text-white/50">
                Sign in to access your dashboard
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6 bg-white/5 p-1 rounded-xl">
                  <TabsTrigger value="login" className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/50 rounded-lg font-semibold">
                    Login
                  </TabsTrigger>
                  <TabsTrigger value="signup" className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/50 rounded-lg font-semibold">
                    Sign Up
                  </TabsTrigger>
                </TabsList>

                {/* Login Tab */}
                <TabsContent value="login">
                  <form onSubmit={handleLogin} className="space-y-4">
                    {/* Quick Login Buttons for Testing */}
                    <div className="space-y-2">
                      <Label className="text-white/70">Quick Login (Testing Only)</Label>
                      <div className="grid grid-cols-3 gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setLoginData({ email: 'admin@teamlease.com', password: 'Password123!' });
                            setTimeout(() => document.querySelector('form')?.requestSubmit(), 100);
                          }}
                          className="text-xs py-2 bg-primary/10 border-primary/30 text-primary hover:bg-primary/20"
                        >
                          Super Admin
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setLoginData({ email: 'rajesh.kumar@teamlease.com', password: 'Password123!' });
                            setTimeout(() => document.querySelector('form')?.requestSubmit(), 100);
                          }}
                          className="text-xs py-2 bg-warning/10 border-warning/30 text-warning hover:bg-warning/20"
                        >
                          Manager
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setLoginData({ email: 'arjun.mehta@gmail.com', password: 'Password123!' });
                            setTimeout(() => document.querySelector('form')?.requestSubmit(), 100);
                          }}
                          className="text-xs py-2 bg-success/10 border-success/30 text-success hover:bg-success/20"
                        >
                          Referrer
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-white/70">Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                        <Input
                          type="email"
                          placeholder="you@example.com"
                          className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-xl h-12 focus:border-primary"
                          value={loginData.email}
                          onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-white/70">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          className="pl-10 pr-10 bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-xl h-12 focus:border-primary"
                          value={loginData.password}
                          onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <label className="flex items-center gap-2 cursor-pointer text-white/50">
                        <input type="checkbox" className="rounded border-white/20 bg-white/5" />
                        <span>Remember me</span>
                      </label>
                      <Link to="/forgot-password" className="text-primary hover:text-primary/80">
                        Forgot password?
                      </Link>
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-primary to-cyan-400 hover:opacity-90 text-white rounded-xl h-12 text-base font-semibold shadow-lg shadow-primary/30"
                      disabled={isLoading || authLoading}
                    >
                      {isLoading ? (
                        <span className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Signing in...
                        </span>
                      ) : (
                        <>Sign In <ArrowRight className="w-4 h-4 ml-2" /></>
                      )}
                    </Button>
                  </form>
                </TabsContent>

                {/* Signup Tab */}
                <TabsContent value="signup">
                  <form onSubmit={handleSignup} className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-white/70">Full Name *</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                        <Input
                          placeholder="John Doe"
                          className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-xl h-12"
                          value={signupData.name}
                          onChange={(e) => setSignupData({ ...signupData, name: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-white/70">Email Address *</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                        <Input
                          type="email"
                          placeholder="you@example.com"
                          className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-xl h-12"
                          value={signupData.email}
                          onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-white/70">Phone Number *</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                        <Input
                          type="tel"
                          placeholder="+91 1234567890"
                          className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-xl h-12"
                          value={signupData.phone}
                          onChange={(e) => setSignupData({ ...signupData, phone: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-white/70">Organization</Label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                        <Input
                          placeholder="University or Company Name"
                          className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-xl h-12"
                          value={signupData.organization}
                          onChange={(e) => setSignupData({ ...signupData, organization: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-white/70">Password *</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                          <Input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="••••••••"
                            className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-xl h-12"
                            value={signupData.password}
                            onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-white/70">Confirm *</Label>
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          className="bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-xl h-12"
                          value={signupData.confirmPassword}
                          onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-primary to-cyan-400 hover:opacity-90 text-white rounded-xl h-12 text-base font-semibold shadow-lg shadow-primary/30"
                      disabled={isLoading || authLoading}
                    >
                      {isLoading ? (
                        <span className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Creating...
                        </span>
                      ) : (
                        <>Create Account <ArrowRight className="w-4 h-4 ml-2" /></>
                      )}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>

              <div className="mt-6 text-center">
                <Link to="/" className="text-sm text-white/50 hover:text-white transition-colors lg:hidden">
                  ← Back to Home
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Login;
