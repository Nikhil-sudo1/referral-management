import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Mail, Lock, User, Phone, Building2, ArrowRight, Eye, EyeOff, GraduationCap, Moon, Sun, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { validateLoginForm, validateSignupForm, hasErrors, FormErrors } from '@/lib/validations';

const Login = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, signup, isLoading: authLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('login');
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  // Initialize theme from localStorage (persists from landing page)
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');
    setTheme(initialTheme);
    document.documentElement.classList.toggle('dark', initialTheme === 'dark');
  }, []);

  // Check for tab query parameter
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'signup') {
      setActiveTab('signup');
    }
  }, [searchParams]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [signupData, setSignupData] = useState({
    name: '', email: '', phone: '', organization: '', password: '', confirmPassword: '',
  });
  const [loginErrors, setLoginErrors] = useState<FormErrors>({});
  const [signupErrors, setSignupErrors] = useState<FormErrors>({});

  // Clear errors when switching tabs
  useEffect(() => {
    setLoginErrors({});
    setSignupErrors({});
  }, [activeTab]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const errors = validateLoginForm(loginData);
    setLoginErrors(errors);
    
    if (hasErrors(errors)) {
      toast({ title: 'Validation Error', description: 'Please correct the errors below', variant: 'destructive' });
      return;
    }
    
    setIsLoading(true);
    try {
      const success = await login(loginData.email, loginData.password);
      if (success) {
        await new Promise(resolve => setTimeout(resolve, 200));
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          const userRole = userData.role;
          if (userRole === 'referrer') {
            navigate('/referrer/referrals');
          } else {
            navigate('/dashboard');
          }
        } else {
          navigate('/dashboard');
        }
      }
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const errors = validateSignupForm(signupData);
    setSignupErrors(errors);
    
    if (hasErrors(errors)) {
      toast({ title: 'Validation Error', description: 'Please correct the errors below', variant: 'destructive' });
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
        // Redirect to email confirmation page instead of dashboard
        navigate(`/email-confirmation?email=${encodeURIComponent(signupData.email)}&from=signup`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to render field error
  const FieldError = ({ error }: { error?: string }) => {
    if (!error) return null;
    return (
      <div className="flex items-center gap-1 text-red-500 text-xs mt-1">
        <AlertCircle className="w-3 h-3" />
        <span>{error}</span>
      </div>
    );
  };

  const stats = [
    { value: '600K+', label: 'Students Impacted', color: 'from-primary to-cyan-500' },
    { value: '60+', label: 'Partner Universities', color: 'from-emerald-500 to-green-500' },
    { value: '50K+', label: 'Active Referrers', color: 'from-amber-500 to-orange-500' },
    { value: '85%', label: 'Success Rate', color: 'from-violet-500 to-purple-500' },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background - Same as Landing Page */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Network Connection Lines SVG */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.07] dark:opacity-[0.05]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="network-pattern" x="0" y="0" width="200" height="200" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="100" y2="100" stroke="currentColor" strokeWidth="0.5" className="text-primary" />
              <line x1="200" y1="0" x2="100" y2="100" stroke="currentColor" strokeWidth="0.5" className="text-primary" />
              <line x1="100" y1="100" x2="100" y2="200" stroke="currentColor" strokeWidth="0.5" className="text-primary" />
              <line x1="0" y1="200" x2="100" y2="100" stroke="currentColor" strokeWidth="0.5" className="text-primary" />
              <line x1="200" y1="200" x2="100" y2="100" stroke="currentColor" strokeWidth="0.5" className="text-primary" />
              <circle cx="0" cy="0" r="3" fill="currentColor" className="text-primary" />
              <circle cx="200" cy="0" r="3" fill="currentColor" className="text-primary" />
              <circle cx="100" cy="100" r="5" fill="currentColor" className="text-primary" />
              <circle cx="0" cy="200" r="3" fill="currentColor" className="text-primary" />
              <circle cx="200" cy="200" r="3" fill="currentColor" className="text-primary" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#network-pattern)" />
        </svg>

        {/* Floating Gradient Orbs */}
        <motion.div 
          className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-primary/25 to-cyan-500/25 dark:from-primary/15 dark:to-cyan-500/15 blur-[120px]"
          animate={{ x: [0, 40, 0], y: [0, -30, 0], scale: [1, 1.15, 1] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div 
          className="absolute top-1/3 -left-40 w-[450px] h-[450px] rounded-full bg-gradient-to-br from-violet-500/20 to-purple-500/20 dark:from-violet-500/12 dark:to-purple-500/12 blur-[120px]"
          animate={{ x: [0, 30, 0], y: [0, 40, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        />
        <motion.div 
          className="absolute -bottom-20 right-1/4 w-[400px] h-[400px] rounded-full bg-gradient-to-br from-emerald-500/20 to-green-500/20 dark:from-emerald-500/10 dark:to-green-500/10 blur-[100px]"
          animate={{ x: [0, -30, 0], y: [0, 25, 0], scale: [1, 1.15, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
        />

        {/* Animated Icons */}
        <motion.div className="absolute top-[15%] left-[8%]" animate={{ y: [0, -15, 0], opacity: [0.1, 0.2, 0.1] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}>
          <svg className="w-16 h-16 text-primary" fill="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4" /><path d="M12 14c-6 0-8 3-8 5v1h16v-1c0-2-2-5-8-5z" /></svg>
        </motion.div>
        <motion.div className="absolute top-[20%] right-[12%]" animate={{ rotate: [0, 360], opacity: [0.08, 0.15, 0.08] }} transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}>
          <svg className="w-20 h-20 text-violet-500" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><circle cx="12" cy="5" r="2" /><circle cx="5" cy="19" r="2" /><circle cx="19" cy="19" r="2" /><line x1="12" y1="7" x2="12" y2="12" /><line x1="12" y1="12" x2="6" y2="17" /><line x1="12" y1="12" x2="18" y2="17" /></svg>
        </motion.div>
        <motion.div className="absolute bottom-[25%] right-[8%]" animate={{ scale: [1, 1.15, 1], opacity: [0.1, 0.18, 0.1] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}>
          <svg className="w-16 h-16 text-amber-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.91s4.18 1.39 4.18 3.91c-.01 1.83-1.38 2.83-3.12 3.16z"/></svg>
        </motion.div>
        <motion.div className="absolute bottom-[20%] left-[10%]" animate={{ scale: [1, 1.1, 1], opacity: [0.08, 0.15, 0.08] }} transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', delay: 1 }}>
          <svg className="w-14 h-14 text-emerald-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z"/></svg>
        </motion.div>
      </div>

      {/* Theme Toggle - Fixed Position */}
      <motion.div 
        className="fixed top-4 right-4 z-50"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Button
          variant="outline"
          size="icon"
          onClick={toggleTheme}
          className="rounded-full bg-card/50 backdrop-blur-sm border-border/50 hover:bg-primary/10 hover:text-primary hover:border-primary/50 transition-all"
        >
          {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
        </Button>
      </motion.div>

      {/* Back to Home - Fixed Position */}
      <motion.div 
        className="fixed top-4 left-4 z-50"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Link to="/">
          <Button
            variant="outline"
            size="sm"
            className="rounded-full bg-card/50 backdrop-blur-sm border-border/50 hover:bg-primary/10 hover:text-primary hover:border-primary/50 transition-all"
          >
            <ArrowRight className="w-4 h-4 mr-2 rotate-180" /> Home
          </Button>
        </Link>
      </motion.div>

      <motion.div 
        className="w-full max-w-6xl grid lg:grid-cols-2 gap-12 items-center relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Left Side - Branding */}
        <motion.div 
          className="hidden lg:flex flex-col justify-center space-y-8"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="space-y-6">
            <div className="flex items-center gap-4 mb-6">
              <motion.div 
                className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center shadow-2xl shadow-primary/30"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <GraduationCap className="w-8 h-8 text-white" />
              </motion.div>
              <div>
                <h1 className="text-3xl font-bold">TeamLease EdTech</h1>
                <p className="text-sm text-muted-foreground">Referral Management Platform</p>
              </div>
            </div>
            
            <h2 className="text-4xl lg:text-5xl font-bold leading-tight">
              Making Every
              <br />
              <span className="bg-gradient-to-r from-primary via-cyan-400 to-violet-500 bg-clip-text text-transparent">
                Learner Employable
              </span>
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-lg">
              Connect education with employment through our comprehensive referral management platform. 
              Streamline student referrals, track admissions, and maximize your earnings.
            </p>

            {/* Benefits */}
            <div className="flex flex-wrap gap-4 text-sm">
              <span className="flex items-center gap-2 text-muted-foreground"><CheckCircle className="w-4 h-4 text-emerald-500" /> Free to Join</span>
              <span className="flex items-center gap-2 text-muted-foreground"><CheckCircle className="w-4 h-4 text-emerald-500" /> Weekly Payouts</span>
              <span className="flex items-center gap-2 text-muted-foreground"><CheckCircle className="w-4 h-4 text-emerald-500" /> 24/7 Support</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {stats.map((stat, index) => (
              <motion.div 
                key={stat.label}
                className="p-5 rounded-2xl bg-card/50 dark:bg-card/30 backdrop-blur-sm border border-border/50 hover:border-primary/50 transition-all"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                whileHover={{ scale: 1.03, y: -3 }}
              >
                <p className={`text-3xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent mb-1`}>{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Right Side - Login/Signup Forms */}
        <motion.div 
          className="flex items-center justify-center"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Card className="w-full max-w-md bg-card/60 dark:bg-card/40 backdrop-blur-xl border-border/50 rounded-3xl overflow-hidden shadow-2xl">
            <CardHeader className="border-b border-border/50 pb-6">
              <div className="flex items-center gap-3 mb-4 lg:hidden">
                <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center shadow-lg">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold">TeamLease</CardTitle>
                  <p className="text-xs text-muted-foreground">EdTech Referrals</p>
                </div>
              </div>
              <CardTitle className="text-2xl font-bold">
                {activeTab === 'login' ? 'Welcome Back' : 'Create Account'}
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                {activeTab === 'login' ? 'Sign in to access your dashboard' : 'Join our referral network today'}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6 bg-muted/50 p-1 rounded-xl">
                  <TabsTrigger 
                    value="login" 
                    className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm rounded-lg font-semibold transition-all"
                  >
                    Login
                  </TabsTrigger>
                  <TabsTrigger 
                    value="signup" 
                    className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm rounded-lg font-semibold transition-all"
                  >
                    Sign Up
                  </TabsTrigger>
                </TabsList>

                {/* Login Tab */}
                <TabsContent value="login">
                  <form onSubmit={handleLogin} className="space-y-4">
                    {/* Quick Login Buttons for Testing */}
                    <div className="space-y-2">
                      <Label className="text-muted-foreground text-xs">Quick Login (Demo)</Label>
                      <div className="grid grid-cols-3 gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setLoginData({ email: 'admin@teamlease.com', password: 'Password123!' });
                            setTimeout(() => document.querySelector('form')?.requestSubmit(), 100);
                          }}
                          className="text-xs bg-primary/10 border-primary/30 text-primary hover:bg-primary/20 hover:border-primary/50"
                        >
                          Admin
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setLoginData({ email: 'rajesh.kumar@teamlease.com', password: 'Password123!' });
                            setTimeout(() => document.querySelector('form')?.requestSubmit(), 100);
                          }}
                          className="text-xs bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 hover:border-amber-500/50"
                        >
                          Counselor
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setLoginData({ email: 'arjun.mehta@gmail.com', password: 'Password123!' });
                            setTimeout(() => document.querySelector('form')?.requestSubmit(), 100);
                          }}
                          className="text-xs bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 hover:border-emerald-500/50"
                        >
                          Referrer
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-muted-foreground">Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          type="email"
                          placeholder="you@example.com"
                          className={`pl-10 bg-muted/50 border-border/50 rounded-xl h-12 focus:border-primary focus:ring-primary/20 transition-all ${loginErrors.email ? 'border-red-500 focus:border-red-500' : ''}`}
                          value={loginData.email}
                          onChange={(e) => {
                            setLoginData({ ...loginData, email: e.target.value });
                            if (loginErrors.email) setLoginErrors({ ...loginErrors, email: '' });
                          }}
                        />
                      </div>
                      <FieldError error={loginErrors.email} />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-muted-foreground">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          className={`pl-10 pr-10 bg-muted/50 border-border/50 rounded-xl h-12 focus:border-primary focus:ring-primary/20 transition-all ${loginErrors.password ? 'border-red-500 focus:border-red-500' : ''}`}
                          value={loginData.password}
                          onChange={(e) => {
                            setLoginData({ ...loginData, password: e.target.value });
                            if (loginErrors.password) setLoginErrors({ ...loginErrors, password: '' });
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      <FieldError error={loginErrors.password} />
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <label className="flex items-center gap-2 cursor-pointer text-muted-foreground hover:text-foreground transition-colors">
                        <input type="checkbox" className="rounded border-border bg-muted/50" />
                        <span>Remember me</span>
                      </label>
                      <Link to="/forgot-password" className="text-primary hover:text-primary/80 hover:underline transition-colors">
                        Forgot password?
                      </Link>
                    </div>

                    <Button
                      type="submit"
                      className="w-full gradient-primary text-white rounded-xl h-12 text-base font-semibold shadow-lg shadow-primary/30 hover:shadow-primary/50 hover:scale-[1.02] transition-all"
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
                      <Label className="text-muted-foreground">Full Name *</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          placeholder="John Doe"
                          className={`pl-10 bg-muted/50 border-border/50 rounded-xl h-12 focus:border-primary transition-all ${signupErrors.name ? 'border-red-500 focus:border-red-500' : ''}`}
                          value={signupData.name}
                          onChange={(e) => {
                            setSignupData({ ...signupData, name: e.target.value });
                            if (signupErrors.name) setSignupErrors({ ...signupErrors, name: '' });
                          }}
                        />
                      </div>
                      <FieldError error={signupErrors.name} />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-muted-foreground">Email Address *</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          type="email"
                          placeholder="you@example.com"
                          className={`pl-10 bg-muted/50 border-border/50 rounded-xl h-12 focus:border-primary transition-all ${signupErrors.email ? 'border-red-500 focus:border-red-500' : ''}`}
                          value={signupData.email}
                          onChange={(e) => {
                            setSignupData({ ...signupData, email: e.target.value });
                            if (signupErrors.email) setSignupErrors({ ...signupErrors, email: '' });
                          }}
                        />
                      </div>
                      <FieldError error={signupErrors.email} />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-muted-foreground">Phone Number *</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          type="tel"
                          placeholder="+91 9876543210"
                          className={`pl-10 bg-muted/50 border-border/50 rounded-xl h-12 focus:border-primary transition-all ${signupErrors.phone ? 'border-red-500 focus:border-red-500' : ''}`}
                          value={signupData.phone}
                          onChange={(e) => {
                            setSignupData({ ...signupData, phone: e.target.value });
                            if (signupErrors.phone) setSignupErrors({ ...signupErrors, phone: '' });
                          }}
                        />
                      </div>
                      <FieldError error={signupErrors.phone} />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-muted-foreground">Organization</Label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          placeholder="University or Company Name"
                          className={`pl-10 bg-muted/50 border-border/50 rounded-xl h-12 focus:border-primary transition-all ${signupErrors.organization ? 'border-red-500 focus:border-red-500' : ''}`}
                          value={signupData.organization}
                          onChange={(e) => setSignupData({ ...signupData, organization: e.target.value })}
                        />
                      </div>
                      <FieldError error={signupErrors.organization} />
                    </div>

                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-muted-foreground">Password *</Label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                              type={showPassword ? 'text' : 'password'}
                              placeholder="••••••••"
                              className={`pl-10 bg-muted/50 border-border/50 rounded-xl h-12 focus:border-primary transition-all ${signupErrors.password ? 'border-red-500 focus:border-red-500' : ''}`}
                              value={signupData.password}
                              onChange={(e) => {
                                setSignupData({ ...signupData, password: e.target.value });
                                if (signupErrors.password) setSignupErrors({ ...signupErrors, password: '' });
                              }}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-muted-foreground">Confirm *</Label>
                          <Input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="••••••••"
                            className={`bg-muted/50 border-border/50 rounded-xl h-12 focus:border-primary transition-all ${signupErrors.confirmPassword ? 'border-red-500 focus:border-red-500' : ''}`}
                            value={signupData.confirmPassword}
                            onChange={(e) => {
                              setSignupData({ ...signupData, confirmPassword: e.target.value });
                              if (signupErrors.confirmPassword) setSignupErrors({ ...signupErrors, confirmPassword: '' });
                            }}
                          />
                        </div>
                      </div>
                      {(signupErrors.password || signupErrors.confirmPassword) && (
                        <FieldError error={signupErrors.password || signupErrors.confirmPassword} />
                      )}
                    </div>

                    {/* Password requirements hint */}
                    <div className="text-xs text-muted-foreground bg-muted/30 rounded-lg p-3 space-y-1">
                      <p className="font-medium mb-1">Password must contain:</p>
                      <div className="grid grid-cols-2 gap-1">
                        <span className={signupData.password.length >= 6 ? 'text-emerald-500' : ''}>✓ 6+ characters</span>
                        <span className={/[A-Z]/.test(signupData.password) ? 'text-emerald-500' : ''}>✓ Uppercase letter</span>
                        <span className={/[a-z]/.test(signupData.password) ? 'text-emerald-500' : ''}>✓ Lowercase letter</span>
                        <span className={/[0-9]/.test(signupData.password) ? 'text-emerald-500' : ''}>✓ Number</span>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full gradient-primary text-white rounded-xl h-12 text-base font-semibold shadow-lg shadow-primary/30 hover:shadow-primary/50 hover:scale-[1.02] transition-all"
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

                    <p className="text-xs text-center text-muted-foreground">
                      By signing up, you agree to our{' '}
                      <a href="#" className="text-primary hover:underline">Terms</a> and{' '}
                      <a href="#" className="text-primary hover:underline">Privacy Policy</a>
                    </p>
                  </form>
                </TabsContent>
              </Tabs>

              <div className="mt-6 text-center lg:hidden">
                <Link to="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  ← Back to Home
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Login;
