import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Lottie from 'lottie-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { GraduationCap, Mail, RefreshCw, Moon, Sun, ArrowLeft, CheckCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api/client';

// Lottie animation data - Email sending animation
const emailAnimation = {
  "v": "5.5.7",
  "fr": 30,
  "ip": 0,
  "op": 60,
  "w": 200,
  "h": 200,
  "nm": "Email",
  "ddd": 0,
  "assets": [],
  "layers": [
    {
      "ddd": 0,
      "ind": 1,
      "ty": 4,
      "nm": "Envelope",
      "sr": 1,
      "ks": {
        "o": { "a": 0, "k": 100 },
        "r": { "a": 1, "k": [{ "t": 0, "s": [0], "e": [5] }, { "t": 15, "s": [5], "e": [-5] }, { "t": 30, "s": [-5], "e": [5] }, { "t": 45, "s": [5], "e": [0] }, { "t": 60, "s": [0] }] },
        "p": { "a": 1, "k": [{ "t": 0, "s": [100, 110, 0], "e": [100, 100, 0] }, { "t": 15, "s": [100, 100, 0], "e": [100, 110, 0] }, { "t": 30, "s": [100, 110, 0], "e": [100, 100, 0] }, { "t": 45, "s": [100, 100, 0], "e": [100, 110, 0] }, { "t": 60, "s": [100, 110, 0] }] },
        "a": { "a": 0, "k": [0, 0, 0] },
        "s": { "a": 0, "k": [100, 100, 100] }
      },
      "ao": 0,
      "shapes": [
        {
          "ty": "gr",
          "it": [
            { "ty": "rc", "d": 1, "s": { "a": 0, "k": [80, 50] }, "p": { "a": 0, "k": [0, 0] }, "r": { "a": 0, "k": 8 } },
            { "ty": "st", "c": { "a": 0, "k": [0.388, 0.4, 0.945, 1] }, "o": { "a": 0, "k": 100 }, "w": { "a": 0, "k": 4 } },
            { "ty": "fl", "c": { "a": 0, "k": [0.878, 0.886, 0.996, 1] }, "o": { "a": 0, "k": 100 } },
            { "ty": "tr", "p": { "a": 0, "k": [0, 5] }, "a": { "a": 0, "k": [0, 0] }, "s": { "a": 0, "k": [100, 100] }, "r": { "a": 0, "k": 0 }, "o": { "a": 0, "k": 100 } }
          ]
        },
        {
          "ty": "gr",
          "it": [
            { "ty": "sh", "d": 1, "ks": { "a": 0, "k": { "c": false, "v": [[-35, -15], [0, 10], [35, -15]], "i": [[0, 0], [0, 0], [0, 0]], "o": [[0, 0], [0, 0], [0, 0]] } } },
            { "ty": "st", "c": { "a": 0, "k": [0.388, 0.4, 0.945, 1] }, "o": { "a": 0, "k": 100 }, "w": { "a": 0, "k": 4 }, "lc": 2, "lj": 2 },
            { "ty": "tr", "p": { "a": 0, "k": [0, -5] }, "a": { "a": 0, "k": [0, 0] }, "s": { "a": 0, "k": [100, 100] }, "r": { "a": 0, "k": 0 }, "o": { "a": 0, "k": 100 } }
          ]
        }
      ],
      "ip": 0,
      "op": 60,
      "st": 0
    },
    {
      "ddd": 0,
      "ind": 2,
      "ty": 4,
      "nm": "Notification",
      "sr": 1,
      "ks": {
        "o": { "a": 1, "k": [{ "t": 0, "s": [0], "e": [100] }, { "t": 10, "s": [100], "e": [100] }, { "t": 50, "s": [100], "e": [0] }, { "t": 60, "s": [0] }] },
        "r": { "a": 0, "k": 0 },
        "p": { "a": 1, "k": [{ "t": 0, "s": [140, 70, 0], "e": [140, 60, 0] }, { "t": 20, "s": [140, 60, 0] }] },
        "a": { "a": 0, "k": [0, 0, 0] },
        "s": { "a": 1, "k": [{ "t": 0, "s": [0, 0, 100], "e": [100, 100, 100] }, { "t": 15, "s": [100, 100, 100] }] }
      },
      "ao": 0,
      "shapes": [
        {
          "ty": "gr",
          "it": [
            { "ty": "el", "s": { "a": 0, "k": [20, 20] }, "p": { "a": 0, "k": [0, 0] } },
            { "ty": "fl", "c": { "a": 0, "k": [0.945, 0.388, 0.388, 1] }, "o": { "a": 0, "k": 100 } },
            { "ty": "tr", "p": { "a": 0, "k": [0, 0] }, "a": { "a": 0, "k": [0, 0] }, "s": { "a": 0, "k": [100, 100] }, "r": { "a": 0, "k": 0 }, "o": { "a": 0, "k": 100 } }
          ]
        }
      ],
      "ip": 0,
      "op": 60,
      "st": 0
    }
  ]
};

// Lottie animation data - Success/Checkmark animation
const successAnimation = {
  "v": "5.5.7",
  "fr": 30,
  "ip": 0,
  "op": 60,
  "w": 200,
  "h": 200,
  "nm": "Success",
  "ddd": 0,
  "assets": [],
  "layers": [
    {
      "ddd": 0,
      "ind": 1,
      "ty": 4,
      "nm": "Check",
      "sr": 1,
      "ks": {
        "o": { "a": 0, "k": 100 },
        "r": { "a": 0, "k": 0 },
        "p": { "a": 0, "k": [100, 100, 0] },
        "a": { "a": 0, "k": [0, 0, 0] },
        "s": { "a": 1, "k": [{ "t": 0, "s": [0, 0, 100], "e": [110, 110, 100] }, { "t": 15, "s": [110, 110, 100], "e": [100, 100, 100] }, { "t": 25, "s": [100, 100, 100] }] }
      },
      "ao": 0,
      "shapes": [
        {
          "ty": "gr",
          "it": [
            { "ty": "el", "s": { "a": 0, "k": [80, 80] }, "p": { "a": 0, "k": [0, 0] } },
            { "ty": "fl", "c": { "a": 0, "k": [0.204, 0.78, 0.349, 1] }, "o": { "a": 0, "k": 100 } },
            { "ty": "tr", "p": { "a": 0, "k": [0, 0] }, "a": { "a": 0, "k": [0, 0] }, "s": { "a": 0, "k": [100, 100] }, "r": { "a": 0, "k": 0 }, "o": { "a": 0, "k": 100 } }
          ]
        },
        {
          "ty": "gr",
          "it": [
            {
              "ty": "sh",
              "d": 1,
              "ks": {
                "a": 0,
                "k": {
                  "c": false,
                  "v": [[-20, 0], [-8, 12], [20, -12]],
                  "i": [[0, 0], [0, 0], [0, 0]],
                  "o": [[0, 0], [0, 0], [0, 0]]
                }
              }
            },
            { "ty": "st", "c": { "a": 0, "k": [1, 1, 1, 1] }, "o": { "a": 0, "k": 100 }, "w": { "a": 0, "k": 6 }, "lc": 2, "lj": 2 },
            {
              "ty": "tm",
              "s": { "a": 0, "k": 0 },
              "e": { "a": 1, "k": [{ "t": 15, "s": [0], "e": [100] }, { "t": 35, "s": [100] }] },
              "o": { "a": 0, "k": 0 }
            },
            { "ty": "tr", "p": { "a": 0, "k": [0, 0] }, "a": { "a": 0, "k": [0, 0] }, "s": { "a": 0, "k": [100, 100] }, "r": { "a": 0, "k": 0 }, "o": { "a": 0, "k": 100 } }
          ]
        }
      ],
      "ip": 0,
      "op": 60,
      "st": 0
    }
  ]
};

// Lottie animation data - Redirect/Rocket animation
const redirectAnimation = {
  "v": "5.5.7",
  "fr": 30,
  "ip": 0,
  "op": 60,
  "w": 200,
  "h": 200,
  "nm": "Redirect",
  "ddd": 0,
  "assets": [],
  "layers": [
    {
      "ddd": 0,
      "ind": 1,
      "ty": 4,
      "nm": "Rocket",
      "sr": 1,
      "ks": {
        "o": { "a": 0, "k": 100 },
        "r": { "a": 0, "k": -45 },
        "p": { "a": 1, "k": [{ "t": 0, "s": [140, 140, 0], "e": [60, 60, 0] }, { "t": 60, "s": [60, 60, 0] }] },
        "a": { "a": 0, "k": [0, 0, 0] },
        "s": { "a": 0, "k": [100, 100, 100] }
      },
      "ao": 0,
      "shapes": [
        {
          "ty": "gr",
          "it": [
            { "ty": "sh", "d": 1, "ks": { "a": 0, "k": { "c": true, "v": [[0, -25], [15, 15], [0, 10], [-15, 15]], "i": [[8, 0], [0, 0], [0, 0], [0, 0]], "o": [[-8, 0], [0, 0], [0, 0], [0, 0]] } } },
            { "ty": "fl", "c": { "a": 0, "k": [0.388, 0.4, 0.945, 1] }, "o": { "a": 0, "k": 100 } },
            { "ty": "tr", "p": { "a": 0, "k": [0, 0] }, "a": { "a": 0, "k": [0, 0] }, "s": { "a": 0, "k": [100, 100] }, "r": { "a": 0, "k": 0 }, "o": { "a": 0, "k": 100 } }
          ]
        },
        {
          "ty": "gr",
          "it": [
            { "ty": "el", "s": { "a": 0, "k": [10, 10] }, "p": { "a": 0, "k": [0, -5] } },
            { "ty": "fl", "c": { "a": 0, "k": [0.878, 0.886, 0.996, 1] }, "o": { "a": 0, "k": 100 } },
            { "ty": "tr", "p": { "a": 0, "k": [0, 0] }, "a": { "a": 0, "k": [0, 0] }, "s": { "a": 0, "k": [100, 100] }, "r": { "a": 0, "k": 0 }, "o": { "a": 0, "k": 100 } }
          ]
        }
      ],
      "ip": 0,
      "op": 60,
      "st": 0
    },
    {
      "ddd": 0,
      "ind": 2,
      "ty": 4,
      "nm": "Trail",
      "sr": 1,
      "ks": {
        "o": { "a": 1, "k": [{ "t": 0, "s": [100], "e": [0] }, { "t": 30, "s": [0], "e": [100] }, { "t": 60, "s": [100] }] },
        "r": { "a": 0, "k": -45 },
        "p": { "a": 1, "k": [{ "t": 0, "s": [150, 150, 0], "e": [100, 100, 0] }, { "t": 60, "s": [100, 100, 0] }] },
        "a": { "a": 0, "k": [0, 0, 0] },
        "s": { "a": 0, "k": [100, 100, 100] }
      },
      "ao": 0,
      "shapes": [
        {
          "ty": "gr",
          "it": [
            { "ty": "sh", "d": 1, "ks": { "a": 0, "k": { "c": false, "v": [[0, 0], [0, 30]], "i": [[0, 0], [0, 0]], "o": [[0, 0], [0, 0]] } } },
            { "ty": "st", "c": { "a": 0, "k": [0.945, 0.545, 0.388, 1] }, "o": { "a": 0, "k": 100 }, "w": { "a": 0, "k": 8 }, "lc": 2 },
            { "ty": "tr", "p": { "a": 0, "k": [0, 0] }, "a": { "a": 0, "k": [0, 0] }, "s": { "a": 0, "k": [100, 100] }, "r": { "a": 0, "k": 0 }, "o": { "a": 0, "k": 100 } }
          ]
        }
      ],
      "ip": 0,
      "op": 60,
      "st": 0
    }
  ]
};

type ConfirmationState = 'pending' | 'verified' | 'redirecting';

const EmailConfirmation = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const email = searchParams.get('email') || '';
  const fromSignup = searchParams.get('from') === 'signup';
  
  const [state, setState] = useState<ConfirmationState>('pending');
  const [isResending, setIsResending] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [pollCount, setPollCount] = useState(0);

  // Initialize theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');
    setTheme(initialTheme);
    document.documentElement.classList.toggle('dark', initialTheme === 'dark');
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  // Check verification status
  const checkVerification = useCallback(async () => {
    if (!email || state !== 'pending') return;
    
    try {
      const response = await apiClient.get(`/auth/check-verification?email=${encodeURIComponent(email)}`);
      
      if (response.data.success && response.data.data?.is_verified) {
        setState('verified');
        toast({
          title: 'Email Verified! ✓',
          description: 'Your email has been successfully verified.',
        });
        
        // Show redirecting state after 2 seconds
        setTimeout(() => {
          setState('redirecting');
          
          // Redirect to dashboard after showing redirect animation
          setTimeout(() => {
            navigate('/dashboard');
          }, 2500);
        }, 2000);
      }
    } catch (error) {
      // Silently fail - will retry
      console.log('Verification check failed, will retry...');
    }
  }, [email, state, navigate]);

  // Poll for verification status every 3 seconds
  useEffect(() => {
    if (state !== 'pending' || !email) return;
    
    const interval = setInterval(() => {
      checkVerification();
      setPollCount(prev => prev + 1);
    }, 3000);
    
    // Initial check
    checkVerification();
    
    return () => clearInterval(interval);
  }, [checkVerification, state, email]);

  const handleResendEmail = async () => {
    if (!email) return;
    
    setIsResending(true);
    try {
      await apiClient.post('/auth/resend-verification', { email });
      toast({
        title: 'Email Sent',
        description: 'A new verification email has been sent to your inbox.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to resend verification email. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <svg className="absolute inset-0 w-full h-full opacity-[0.07] dark:opacity-[0.05]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="network-pattern" x="0" y="0" width="200" height="200" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="100" y2="100" stroke="currentColor" strokeWidth="0.5" className="text-primary" />
              <line x1="200" y1="0" x2="100" y2="100" stroke="currentColor" strokeWidth="0.5" className="text-primary" />
              <line x1="100" y1="100" x2="100" y2="200" stroke="currentColor" strokeWidth="0.5" className="text-primary" />
              <circle cx="100" cy="100" r="5" fill="currentColor" className="text-primary" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#network-pattern)" />
        </svg>

        <motion.div 
          className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-gradient-to-br from-primary/20 to-cyan-500/20 dark:from-primary/15 dark:to-cyan-500/15 rounded-full blur-[120px]"
          animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.7, 0.5] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div 
          className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-gradient-to-br from-violet-500/20 to-purple-500/20 dark:from-violet-500/15 dark:to-purple-500/15 rounded-full blur-[120px]"
          animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.6, 0.4] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        />
      </div>

      {/* Theme Toggle */}
      <motion.div 
        className="fixed top-4 right-4 z-50"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
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

      {/* Back to Home */}
      <motion.div 
        className="fixed top-4 left-4 z-50"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Link to="/">
          <Button
            variant="outline"
            size="sm"
            className="rounded-full bg-card/50 backdrop-blur-sm border-border/50 hover:bg-primary/10 hover:text-primary hover:border-primary/50 transition-all"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Home
          </Button>
        </Link>
      </motion.div>

      <motion.div 
        className="w-full max-w-md relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="bg-card/60 dark:bg-card/40 backdrop-blur-xl border-border/50 rounded-3xl overflow-hidden shadow-2xl">
          <CardContent className="p-8">
            <AnimatePresence mode="wait">
              {/* PENDING STATE - Waiting for email verification */}
              {state === 'pending' && (
                <motion.div
                  key="pending"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="text-center space-y-6"
                >
                  {/* Logo */}
                  <motion.div 
                    className="flex justify-center mb-4"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                  >
                    <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center shadow-xl shadow-primary/30">
                      <GraduationCap className="w-8 h-8 text-white" />
                    </div>
                  </motion.div>

                  {/* Email Animation */}
                  <div className="flex justify-center">
                    <div className="w-40 h-40">
                      <Lottie 
                        animationData={emailAnimation} 
                        loop={true}
                        style={{ width: '100%', height: '100%' }}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold">Confirm Your Email</h2>
                    <p className="text-muted-foreground">
                      We've sent a verification link to:
                    </p>
                    <p className="font-semibold text-primary">{email}</p>
                  </div>

                  <div className="bg-muted/30 rounded-xl p-4 text-sm text-muted-foreground space-y-2">
                    <p>📧 Check your inbox for the verification email</p>
                    <p>🔗 Click the link in the email to verify</p>
                    <p>⏱️ This page will automatically update once verified</p>
                  </div>

                  {/* Checking indicator */}
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    >
                      <RefreshCw className="w-4 h-4" />
                    </motion.div>
                    <span>Checking for verification...</span>
                  </div>

                  <div className="space-y-3 pt-4">
                    <Button
                      variant="outline"
                      className="w-full border-border/50 hover:bg-primary/10 hover:text-primary hover:border-primary/50 rounded-xl h-12 transition-all"
                      onClick={handleResendEmail}
                      disabled={isResending}
                    >
                      {isResending ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Mail className="w-4 h-4 mr-2" />
                          Resend Verification Email
                        </>
                      )}
                    </Button>

                    <Link to="/login">
                      <Button variant="ghost" className="w-full text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-xl h-12 transition-all">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Login
                      </Button>
                    </Link>
                  </div>
                </motion.div>
              )}

              {/* VERIFIED STATE - Email confirmed */}
              {state === 'verified' && (
                <motion.div
                  key="verified"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="text-center space-y-6"
                >
                  {/* Success Animation */}
                  <div className="flex justify-center">
                    <div className="w-48 h-48">
                      <Lottie 
                        animationData={successAnimation} 
                        loop={false}
                        style={{ width: '100%', height: '100%' }}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                      Email Verified! 🎉
                    </h2>
                    <p className="text-muted-foreground">
                      Your email has been successfully verified.
                    </p>
                  </div>

                  <div className="flex items-center justify-center gap-2 text-sm text-primary">
                    <CheckCircle className="w-5 h-5" />
                    <span>Preparing your dashboard...</span>
                  </div>
                </motion.div>
              )}

              {/* REDIRECTING STATE - Going to dashboard */}
              {state === 'redirecting' && (
                <motion.div
                  key="redirecting"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="text-center space-y-6"
                >
                  {/* Redirect Animation */}
                  <div className="flex justify-center">
                    <div className="w-48 h-48">
                      <Lottie 
                        animationData={redirectAnimation} 
                        loop={true}
                        style={{ width: '100%', height: '100%' }}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold">
                      Taking You to Dashboard
                    </h2>
                    <p className="text-muted-foreground">
                      Hold on, we're setting up your workspace...
                    </p>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-muted/30 rounded-full h-2 overflow-hidden">
                    <motion.div
                      className="h-full gradient-primary"
                      initial={{ width: '0%' }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 2.5, ease: 'easeInOut' }}
                    />
                  </div>

                  <p className="text-sm text-muted-foreground">
                    Redirecting in a moment...
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Need help? Contact{' '}
            <a href="mailto:edtech@teamlease.com" className="text-primary hover:text-primary/80 hover:underline transition-colors">
              edtech@teamlease.com
            </a>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default EmailConfirmation;

