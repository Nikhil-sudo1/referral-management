import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Lottie from 'lottie-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { GraduationCap, Moon, Sun, ArrowLeft, AlertCircle, RefreshCw } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api/client';

// Success animation
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

// Redirect animation
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

type VerificationState = 'verifying' | 'success' | 'redirecting' | 'error';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const token = searchParams.get('token');
  const email = searchParams.get('email');
  
  const [state, setState] = useState<VerificationState>('verifying');
  const [error, setError] = useState<string | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  // Initialize theme
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

  // Verify email on mount
  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setError('Invalid verification link. No token provided.');
        setState('error');
        return;
      }

      try {
        const response = await apiClient.post(`/auth/verify-email?token=${token}`);
        
        if (response.data.success) {
          setState('success');
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
        } else {
          setError(response.data.message || 'Verification failed');
          setState('error');
        }
      } catch (err: any) {
        const message = err.response?.data?.detail || 'Verification failed. The link may have expired.';
        setError(message);
        setState('error');
      }
    };

    verifyEmail();
  }, [token, navigate]);

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
            {/* VERIFYING STATE */}
            {state === 'verifying' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center space-y-6"
              >
                <motion.div 
                  className="flex justify-center mb-4"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200 }}
                >
                  <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center shadow-xl shadow-primary/30">
                    <GraduationCap className="w-8 h-8 text-white" />
                  </div>
                </motion.div>

                <div className="flex justify-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  >
                    <RefreshCw className="w-12 h-12 text-primary" />
                  </motion.div>
                </div>

                <div className="space-y-2">
                  <h2 className="text-2xl font-bold">Verifying Your Email</h2>
                  <p className="text-muted-foreground">Please wait while we verify your email address...</p>
                </div>
              </motion.div>
            )}

            {/* SUCCESS STATE */}
            {state === 'success' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-6"
              >
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

                <p className="text-sm text-primary">Preparing your dashboard...</p>
              </motion.div>
            )}

            {/* REDIRECTING STATE */}
            {state === 'redirecting' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-6"
              >
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
                  <h2 className="text-2xl font-bold">Taking You to Dashboard</h2>
                  <p className="text-muted-foreground">Hold on, we're setting up your workspace...</p>
                </div>

                <div className="w-full bg-muted/30 rounded-full h-2 overflow-hidden">
                  <motion.div
                    className="h-full gradient-primary"
                    initial={{ width: '0%' }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 2.5, ease: 'easeInOut' }}
                  />
                </div>
              </motion.div>
            )}

            {/* ERROR STATE */}
            {state === 'error' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-6"
              >
                <div className="flex justify-center">
                  <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center">
                    <AlertCircle className="w-10 h-10 text-red-500" />
                  </div>
                </div>

                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-red-600 dark:text-red-400">Verification Failed</h2>
                  <p className="text-muted-foreground">{error}</p>
                </div>

                <div className="space-y-3 pt-4">
                  <Link to={`/email-confirmation?email=${email || ''}`}>
                    <Button className="w-full gradient-primary text-white rounded-xl h-12 font-semibold shadow-lg shadow-primary/30 hover:shadow-primary/50 hover:scale-[1.02] transition-all">
                      Request New Verification Link
                    </Button>
                  </Link>

                  <Link to="/login">
                    <Button variant="ghost" className="w-full text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-xl h-12 transition-all">
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back to Login
                    </Button>
                  </Link>
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default VerifyEmail;
