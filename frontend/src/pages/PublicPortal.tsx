import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users, Gift, ArrowRight, TrendingUp, 
  Building2, GraduationCap, Moon, Sun,
  Zap, Shield, Clock, Star, CheckCircle,
  Menu, X
} from 'lucide-react';
import apiClient from '@/lib/api/client';

// Types
interface PublicStats {
  total_referrers_display: string;
  total_rewards_display: string;
  active_universities_display: string;
  success_rate_display: string;
}

const PublicPortal = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [stats, setStats] = useState<PublicStats>({
    total_referrers_display: '50K+',
    total_rewards_display: '₹2Cr+',
    active_universities_display: '100+',
    success_rate_display: '85%',
  });
  const [loading, setLoading] = useState(true);

  // Initialize theme
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');
    setTheme(initialTheme);
    document.documentElement.classList.toggle('dark', initialTheme === 'dark');
  }, []);

  // Fetch stats from API
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await apiClient.get('/public/stats');
        if (response.data?.success && response.data?.data) {
          setStats(response.data.data);
        }
      } catch (error) {
        console.log('Using default stats');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const navItems = [
    { label: 'How It Works', id: 'how-it-works' },
    { label: 'Features', id: 'features' },
    { label: 'Universities', id: 'universities' },
    { label: 'Leadership', id: 'leadership', isLink: true, href: '/leadership' },
  ];

  const statsData = [
    { label: 'Active Referrers', value: stats.total_referrers_display, icon: Users, color: 'from-blue-500 to-cyan-500' },
    { label: 'Rewards Paid', value: stats.total_rewards_display, icon: Gift, color: 'from-violet-500 to-purple-500' },
    { label: 'Universities', value: stats.active_universities_display, icon: Building2, color: 'from-amber-500 to-orange-500' },
    { label: 'Success Rate', value: stats.success_rate_display, icon: TrendingUp, color: 'from-emerald-500 to-green-500' },
  ];

  const steps = [
    { num: '01', title: 'Sign Up', desc: 'Create your free account in 2 minutes with just your email', icon: Users },
    { num: '02', title: 'Refer Students', desc: 'Share university programs with interested students', icon: GraduationCap },
    { num: '03', title: 'Track Progress', desc: 'Monitor admission status with real-time updates', icon: TrendingUp },
    { num: '04', title: 'Earn Rewards', desc: 'Get paid within 7 days of successful admission', icon: Gift },
  ];

  const features = [
    { icon: Zap, title: 'Instant Tracking', desc: 'Real-time updates on all your referrals with detailed status' },
    { icon: Shield, title: 'Secure Platform', desc: 'Bank-grade security protecting your data and earnings' },
    { icon: Clock, title: 'Fast Payouts', desc: 'Industry-leading 7-day payout guarantee to your bank' },
    { icon: Building2, title: 'Top Universities', desc: '100+ partner institutions including IIMs and IITs' },
  ];

  const universities = [
    'IIM Bangalore', 'IIT Delhi', 'BITS Pilani', 'ISB Hyderabad',
    'Christ University', 'Manipal University', 'Amity University', 'VIT Vellore'
  ];

  const testimonials = [
    { name: 'Priya Sharma', role: 'Career Counselor', quote: 'Earned ₹2.5L in just 3 months. The platform is incredibly easy to use!', rating: 5, avatar: 'PS' },
    { name: 'Rahul Verma', role: 'Education Consultant', quote: 'Best referral platform. Transparent tracking and timely payouts every time.', rating: 5, avatar: 'RV' },
    { name: 'Anita Desai', role: 'Freelancer', quote: 'Helped 50+ students find their dream university while earning great rewards.', rating: 5, avatar: 'AD' },
  ];

  const benefits = [
    'No upfront investment required',
    'Work from anywhere, anytime',
    'Unlimited earning potential',
    'Dedicated support team',
    'Real-time dashboard access',
    'Weekly payouts available',
  ];

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300 overflow-hidden">
      {/* Animated Background with Referral Network Theme */}
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
        <motion.div className="absolute top-[15%] left-[8%]" animate={{ y: [0, -15, 0], opacity: [0.15, 0.25, 0.15] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}>
          <svg className="w-16 h-16 text-primary" fill="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4" /><path d="M12 14c-6 0-8 3-8 5v1h16v-1c0-2-2-5-8-5z" /></svg>
        </motion.div>
        <motion.div className="absolute top-[20%] right-[12%]" animate={{ rotate: [0, 360], opacity: [0.1, 0.2, 0.1] }} transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}>
          <svg className="w-20 h-20 text-violet-500" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><circle cx="12" cy="5" r="2" /><circle cx="5" cy="19" r="2" /><circle cx="19" cy="19" r="2" /><line x1="12" y1="7" x2="12" y2="12" /><line x1="12" y1="12" x2="6" y2="17" /><line x1="12" y1="12" x2="18" y2="17" /></svg>
        </motion.div>
        <motion.div className="absolute top-[45%] left-[5%]" animate={{ y: [0, 10, 0], rotate: [-5, 5, -5] }} transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}>
          <svg className="w-14 h-14 text-emerald-500 opacity-20" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z"/></svg>
        </motion.div>
        <motion.div className="absolute bottom-[25%] right-[8%]" animate={{ scale: [1, 1.15, 1], opacity: [0.12, 0.22, 0.12] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}>
          <svg className="w-16 h-16 text-amber-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.91s4.18 1.39 4.18 3.91c-.01 1.83-1.38 2.83-3.12 3.16z"/></svg>
        </motion.div>
        <motion.div className="absolute bottom-[20%] left-[15%]" animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.18, 0.1] }} transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', delay: 1 }}>
          <svg className="w-20 h-20 text-cyan-500" fill="currentColor" viewBox="0 0 24 24"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>
        </motion.div>
      </div>

      {/* Navigation */}
      <motion.nav 
        className="fixed top-0 w-full z-50 bg-background/80 dark:bg-background/90 backdrop-blur-xl border-b border-border/50"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg gradient-primary flex items-center justify-center shadow-lg shadow-primary/25">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg">TeamLease</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              'isLink' in item && item.isLink ? (
                <Link
                  key={item.id}
                  to={item.href || '/'}
                  className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-all duration-200"
                >
                  {item.label}
                </Link>
              ) : (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-all duration-200"
                >
                  {item.label}
                </button>
              )
            ))}
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-full hover:bg-primary/10 hover:text-primary transition-all"
            >
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </Button>
            <Link to="/login" className="hidden sm:block">
              <Button variant="ghost" size="sm" className="hover:bg-primary/10 hover:text-primary transition-all">
                Sign In
              </Button>
            </Link>
            <Link to="/login?tab=signup">
              <Button size="sm" className="gradient-primary text-white rounded-full px-5 shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-105 transition-all">
                Get Started
              </Button>
            </Link>
            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden rounded-full hover:bg-primary/10"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-border/50 bg-background/95 backdrop-blur-xl"
          >
            <div className="px-6 py-4 space-y-2">
              {navItems.map((item) => (
                'isLink' in item && item.isLink ? (
                  <Link
                    key={item.id}
                    to={item.href || '/'}
                    className="block w-full text-left px-4 py-3 text-sm font-medium text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                ) : (
                  <button
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
                    className="block w-full text-left px-4 py-3 text-sm font-medium text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
                  >
                    {item.label}
                  </button>
                )
              ))}
              <Link to="/login" className="block">
                <Button variant="outline" className="w-full mt-2 hover:bg-primary/10 hover:text-primary hover:border-primary">
                  Sign In
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </motion.nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            className="text-center max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Badge className="bg-primary/10 text-primary border-primary/20 px-4 py-2 text-sm font-medium mb-6">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse mr-2 inline-block" />
                Trusted by 50,000+ Referrers Across India
              </Badge>
            </motion.div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              <span className="bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text">
                Transformm Education
              </span>
              <span className="block mt-2 bg-gradient-to-r from-primary via-primary to-cyan-500 bg-clip-text text-transparent">
                Into Income
              </span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto leading-relaxed">
              Connect ambitious students with India's top universities and earn substantial rewards. 
              No investment needed — just your network and passion for education.
            </p>
            <motion.div 
              className="flex flex-wrap justify-center gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Link to="/login?tab=signup">
                <Button size="lg" className="gradient-primary text-white rounded-full px-8 shadow-xl shadow-primary/30 hover:shadow-primary/50 transition-all hover:scale-105">
                  Start Earning Today <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Button 
                size="lg" 
                variant="outline" 
                className="rounded-full px-8 border-2 hover:bg-primary/10 hover:text-primary hover:border-primary transition-all"
                onClick={() => scrollToSection('how-it-works')}
              >
                Learn More
              </Button>
            </motion.div>

            {/* Quick Benefits */}
            <motion.div 
              className="flex flex-wrap justify-center gap-6 mt-10 text-sm text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <span className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-500" /> Free to Join</span>
              <span className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-500" /> No Investment</span>
              <span className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-500" /> Weekly Payouts</span>
            </motion.div>
          </motion.div>

          {/* Stats */}
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            {statsData.map((stat, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -5, scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <Card className="relative overflow-hidden text-center p-6 bg-card/50 dark:bg-card/30 backdrop-blur-sm border-border/50 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 transition-all group">
                  <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-10 transition-opacity`} />
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mx-auto mb-3 shadow-lg`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-2xl font-bold">{loading ? '...' : stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="relative py-20 px-6">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-muted/30 to-transparent" />
        <div className="max-w-6xl mx-auto relative">
          <motion.div 
            className="text-center mb-14"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Badge className="bg-primary/10 text-primary border-primary/20 mb-4">Simple Process</Badge>
            <h2 className="text-3xl font-bold mb-3">How It Works</h2>
            <p className="text-muted-foreground max-w-lg mx-auto">Start earning in four simple steps. No experience required.</p>
          </motion.div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -8 }}
              >
                <Card className="relative p-6 h-full bg-card/60 dark:bg-card/40 backdrop-blur-sm border-border/50 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10 transition-all group">
                  <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-bold text-primary">{step.num}</span>
                  </div>
                  <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform">
                    <step.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.desc}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="relative py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Badge className="bg-violet-500/10 text-violet-500 border-violet-500/20 mb-4">Why Choose Us</Badge>
              <h2 className="text-3xl font-bold mb-4">Everything You Need to Succeed</h2>
              <p className="text-muted-foreground mb-8">We provide all the tools and support you need to maximize your referral earnings.</p>
              
              <div className="space-y-4">
                {features.map((feature, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex gap-4 p-4 rounded-xl hover:bg-primary/5 transition-colors group"
                  >
                    <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground">{feature.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Card className="p-8 bg-gradient-to-br from-primary/5 via-card to-violet-500/5 border-primary/20">
                <h3 className="text-xl font-bold mb-6">Benefits of Joining</h3>
                <div className="grid grid-cols-1 gap-3">
                  {benefits.map((benefit, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-center gap-3"
                    >
                      <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                      <span className="text-sm">{benefit}</span>
                    </motion.div>
                  ))}
                </div>
                <Link to="/login?tab=signup" className="block mt-6">
                  <Button className="w-full gradient-primary text-white rounded-full hover:scale-[1.02] transition-transform">
                    Join Now - It's Free
                  </Button>
                </Link>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Partner Universities */}
      <section id="universities" className="relative py-20 px-6 bg-muted/20">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 mb-4">Our Partners</Badge>
            <h2 className="text-3xl font-bold mb-3">100+ Partner Universities</h2>
            <p className="text-muted-foreground">Refer students to India's top institutions</p>
          </motion.div>

          <motion.div 
            className="flex flex-wrap justify-center gap-4"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            {universities.map((uni, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ scale: 1.05 }}
              >
                <Badge variant="secondary" className="px-4 py-2 text-sm bg-card hover:bg-primary/10 hover:text-primary border border-border/50 hover:border-primary/50 transition-all cursor-default">
                  {uni}
                </Badge>
              </motion.div>
            ))}
            <Badge variant="secondary" className="px-4 py-2 text-sm bg-primary/10 text-primary border-primary/30">
              + 90 More
            </Badge>
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="relative py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 mb-4">Success Stories</Badge>
            <h2 className="text-3xl font-bold mb-3">What Our Referrers Say</h2>
            <p className="text-muted-foreground">Join thousands of successful referrers</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <Card className="p-6 h-full bg-card/60 backdrop-blur-sm border-border/50 hover:border-primary/50 hover:shadow-lg transition-all">
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, j) => (
                      <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-6 italic">"{testimonial.quote}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-white font-bold text-sm">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{testimonial.name}</p>
                      <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Card className="relative overflow-hidden p-10 md:p-14 text-center bg-gradient-to-br from-primary/10 via-card to-violet-500/10 border-primary/20 backdrop-blur-sm">
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-violet-500/20 to-transparent rounded-full blur-3xl" />
              
              <div className="relative z-10">
                <Badge className="bg-white/10 text-primary border-primary/20 mb-4">Limited Time</Badge>
                <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to Start Your Earning Journey?</h2>
                <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                  Join our community of successful referrers and start earning rewards today. 
                  Sign up takes less than 2 minutes.
                </p>
                <Link to="/login?tab=signup">
                  <Button size="lg" className="gradient-primary text-white rounded-full px-10 shadow-xl shadow-primary/30 hover:shadow-primary/50 hover:scale-105 transition-all">
                    Create Free Account <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <p className="text-xs text-muted-foreground mt-5">
                  ✓ No credit card required &nbsp; ✓ Free forever &nbsp; ✓ Cancel anytime
                </p>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-12 px-6 border-t border-border/50 bg-muted/20">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-9 h-9 rounded-lg gradient-primary flex items-center justify-center shadow-md">
                  <GraduationCap className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold">TeamLease EdTech</span>
              </div>
              <p className="text-sm text-muted-foreground">
                India's leading education referral platform connecting students with top universities.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Quick Links</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <button onClick={() => scrollToSection('how-it-works')} className="block hover:text-primary transition-colors">How It Works</button>
                <button onClick={() => scrollToSection('features')} className="block hover:text-primary transition-colors">Features</button>
                <button onClick={() => scrollToSection('universities')} className="block hover:text-primary transition-colors">Universities</button>
                <button onClick={() => scrollToSection('testimonials')} className="block hover:text-primary transition-colors">Testimonials</button>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Account</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <Link to="/login" className="block hover:text-primary transition-colors">Sign In</Link>
                <Link to="/login?tab=signup" className="block hover:text-primary transition-colors">Sign Up</Link>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Legal</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <a href="#" className="block hover:text-primary transition-colors">Privacy Policy</a>
                <a href="#" className="block hover:text-primary transition-colors">Terms of Service</a>
                <a href="#" className="block hover:text-primary transition-colors">Contact Us</a>
              </div>
            </div>
          </div>
          <div className="pt-8 border-t border-border/50 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © 2024 TeamLease EdTech. All rights reserved.
            </p>
            <p className="text-sm text-muted-foreground">
              Made with ❤️ in India
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicPortal;
