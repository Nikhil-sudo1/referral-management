import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { 
  Users, Gift, ArrowRight, TrendingUp, Star, Zap, Shield, 
  Building2, GraduationCap, Target, Mail, Phone, MapPin, 
  Sparkles, Globe, Rocket, FileText, Menu, X, 
  ChevronDown, Play, Check
} from 'lucide-react';

const PublicPortal = () => {
  const [scrollY, setScrollY] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  const { scrollYProgress } = useScroll();
  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const stats = [
    { value: '50K+', label: 'Active Referrers', icon: Users, color: 'from-blue-500 to-cyan-500' },
    { value: '₹2Cr+', label: 'Rewards Paid', icon: Gift, color: 'from-purple-500 to-pink-500' },
    { value: '85%', label: 'Success Rate', icon: TrendingUp, color: 'from-green-500 to-emerald-500' },
    { value: '100+', label: 'Universities', icon: Building2, color: 'from-orange-500 to-red-500' },
  ];

  const process = [
    { 
      step: '01', 
      title: 'Sign Up', 
      desc: 'Create your free account in under 2 minutes with just your email',
      icon: FileText, 
      color: 'from-primary to-cyan-400',
      code: `const user = await register({
  email: "you@email.com",
  role: "referrer"
});`
    },
    { 
      step: '02', 
      title: 'Refer Students', 
      desc: 'Share opportunities with students interested in higher education',
      icon: Users, 
      color: 'from-purple-500 to-pink-500',
      code: `await createReferral({
  student: studentInfo,
  university: selectedUni
});`
    },
    { 
      step: '03', 
      title: 'Track Progress', 
      desc: 'Monitor admission status with real-time updates and notifications',
      icon: Target, 
      color: 'from-green-500 to-emerald-500',
      code: `const status = await track({
  code: "REF-ABC123"
}); // → "Admitted ✓"`
    },
    { 
      step: '04', 
      title: 'Earn Rewards', 
      desc: 'Get paid within 7 days of successful admission confirmation',
      icon: Gift, 
      color: 'from-orange-500 to-yellow-500',
      code: `await claimReward({
  amount: "₹10,000",
  method: "bank_transfer"
});`
    },
  ];

  const services = [
    { 
      title: 'Smart Matching', 
      desc: 'AI-powered student-university matching for higher conversion rates',
      icon: Sparkles, 
      gradient: 'from-violet-500 to-purple-600',
      stat: '3x Higher Match Rate'
    },
    { 
      title: 'Real-time Tracking', 
      desc: 'Live updates on every referral from submission to admission',
      icon: Target, 
      gradient: 'from-cyan-500 to-blue-600',
      stat: 'Instant Notifications'
    },
    { 
      title: 'Fast Payouts', 
      desc: 'Industry-leading 7-day payout guarantee with secure transfers',
      icon: Zap, 
      gradient: 'from-amber-500 to-orange-600',
      stat: '7-Day Guarantee'
    },
    { 
      title: 'Premium Support', 
      desc: 'Dedicated relationship managers for top performers',
      icon: Shield, 
      gradient: 'from-emerald-500 to-green-600',
      stat: '24/7 Available'
    },
  ];

  const testimonials = [
    { 
      name: 'Priya Sharma', 
      role: 'Career Counselor', 
      company: 'EduGuide India',
      quote: 'Earned over ₹2 lakhs in 3 months. The platform is incredibly intuitive and the payouts are always on time.',
      avatar: 'PS', 
      rating: 5,
      earnings: '₹2.4L'
    },
    { 
      name: 'Rahul Verma', 
      role: 'Education Consultant', 
      company: 'StudyAbroad Pro',
      quote: 'Best referral platform I have used. The tracking system is transparent and support is exceptional.',
      avatar: 'RV', 
      rating: 5,
      earnings: '₹1.8L'
    },
    { 
      name: 'Anita Desai', 
      role: 'University Liaison', 
      company: 'Academic Connect',
      quote: 'Helped 50+ students find their dream university while building a sustainable income stream.',
      avatar: 'AD', 
      rating: 5,
      earnings: '₹5.2L'
    },
    { 
      name: 'Vikram Singh', 
      role: 'Independent Referrer', 
      company: 'Self-employed',
      quote: 'Started part-time, now it is my primary income. The commission structure is unmatched in the industry.',
      avatar: 'VS', 
      rating: 5,
      earnings: '₹8.1L'
    },
  ];

  const faqs = [
    { q: 'How much can I earn per referral?', a: 'Rewards range from ₹2,000 to ₹50,000 depending on the university and program. Premium MBA programs offer the highest rewards.' },
    { q: 'When do I receive my payment?', a: 'Standard payouts are processed within 14 days. Professional members get 7-day payouts, and Enterprise gets instant transfers.' },
    { q: 'Is there a limit on referrals?', a: 'Free tier allows 10 referrals/month. Professional and Enterprise tiers have unlimited referrals.' },
    { q: 'How do I track my referrals?', a: 'Use your unique referral code or login to the dashboard for real-time tracking with detailed status updates.' },
    { q: 'What universities are available?', a: 'We partner with 100+ top universities across India including IIMs, IITs, and leading private institutions.' },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white overflow-x-hidden">
      {/* Animated Background - Netflix/Radison inspired */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div 
          className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-primary/30 via-transparent to-transparent rounded-full blur-[120px]"
          animate={{ 
            rotate: [0, 360],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        />
        <motion.div 
          className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-purple-600/20 via-transparent to-transparent rounded-full blur-[120px]"
          animate={{ 
            rotate: [360, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
        />
        {/* Grid overlay like Radison */}
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)`,
            backgroundSize: '100px 100px'
          }}
        />
      </div>

      {/* Navigation - LinkedIn inspired clean nav */}
      <motion.nav 
        className={`fixed top-0 w-full z-50 transition-all duration-500 ${
          scrollY > 50 ? 'bg-[#0a0a0f]/95 backdrop-blur-xl border-b border-white/10 shadow-2xl' : ''
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <motion.div 
              className="flex items-center gap-3"
              whileHover={{ scale: 1.02 }}
            >
              <div className="relative">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary to-cyan-400 flex items-center justify-center shadow-lg shadow-primary/30">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <motion.div 
                  className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-[#0a0a0f]"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>
              <div>
                <span className="font-bold text-lg text-white tracking-tight">TeamLease</span>
                <p className="text-[10px] text-white/50 font-medium tracking-wider uppercase">EdTech Referrals</p>
              </div>
            </motion.div>
            
            <div className="hidden md:flex items-center gap-1">
              {['Process', 'Services', 'Testimonials', 'How to Refer', 'FAQ'].map((item, index) => (
                <motion.button
                  key={item}
                  onClick={() => scrollToSection(item.toLowerCase().replace(/ /g, '-'))}
                  className="px-4 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5 rounded-lg transition-all font-medium"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  whileHover={{ y: -2 }}
                >
                  {item}
                </motion.button>
              ))}
            </div>

            <div className="hidden md:flex items-center gap-3">
              <Link to="/login">
                <Button variant="ghost" className="text-white/70 hover:text-white hover:bg-white/5">
                  Sign In
                </Button>
              </Link>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link to="/login?tab=signup">
                  <Button className="bg-gradient-to-r from-primary to-cyan-500 hover:opacity-90 text-white rounded-full px-6 shadow-lg shadow-primary/25">
                    Sign Up <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </motion.div>
            </div>

            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 hover:bg-white/5 rounded-lg">
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div 
                className="md:hidden py-6 border-t border-white/10"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                {['Process', 'Services', 'Testimonials', 'How to Refer', 'FAQ'].map((item) => (
                  <button
                    key={item}
                    onClick={() => scrollToSection(item.toLowerCase().replace(/ /g, '-'))}
                    className="block w-full text-left py-3 px-4 text-white/70 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                  >
                    {item}
                  </button>
                ))}
                <div className="flex gap-3 mt-4 pt-4 border-t border-white/10">
                  <Link to="/login" className="flex-1">
                    <Button variant="outline" className="w-full border-white/20 text-white">Sign In</Button>
                  </Link>
                  <Link to="/login?tab=signup" className="flex-1">
                    <Button className="w-full bg-primary">Sign Up</Button>
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.nav>

      {/* Hero Section - Netflix + LinkedIn inspired */}
      <section className="relative min-h-screen flex items-center pt-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div 
              className="space-y-8"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Badge className="bg-gradient-to-r from-primary/20 to-cyan-500/20 text-primary border border-primary/30 px-4 py-2 text-sm font-medium rounded-full backdrop-blur-sm">
                  <Sparkles className="w-4 h-4 mr-2" />
                  #1 Education Referral Platform in India
                </Badge>
              </motion.div>
              
              <motion.h1 
                className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.1] tracking-tight"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                Transform Education
                <span className="block mt-2">
                  <span className="bg-gradient-to-r from-primary via-cyan-400 to-purple-500 bg-clip-text text-transparent">
                    Into Income
                  </span>
                </span>
              </motion.h1>
              
              <motion.p 
                className="text-xl text-white/60 max-w-lg leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                Join 50,000+ referrers earning substantial rewards by connecting ambitious students with India's top universities. No limits. Real-time tracking. Fast payouts.
              </motion.p>
              
              <motion.div 
                className="flex flex-wrap gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}>
                  <Link to="/login?tab=signup">
                    <Button 
                      size="lg" 
                      className="bg-gradient-to-r from-primary to-cyan-500 hover:opacity-90 text-white rounded-full px-8 py-7 text-lg shadow-2xl shadow-primary/30 hover:shadow-primary/50 transition-all"
                    >
                      Sign Up Now <Rocket className="w-5 h-5 ml-2" />
                    </Button>
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}>
                  <Button 
                    size="lg" 
                    variant="outline"
                    onClick={() => scrollToSection('process')}
                    className="border-white/20 bg-white/5 text-white hover:bg-white/10 rounded-full px-8 py-7 text-lg backdrop-blur-sm"
                  >
                    <Play className="w-5 h-5 mr-2 fill-current" /> See How It Works
                  </Button>
                </motion.div>
              </motion.div>

              {/* Trust indicators - LinkedIn style */}
              <motion.div 
                className="flex items-center gap-8 pt-8 border-t border-white/10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                <div>
                  <p className="text-3xl font-bold text-white">₹2Cr+</p>
                  <p className="text-sm text-white/50">Rewards Paid</p>
                </div>
                <div className="w-px h-12 bg-white/10" />
                <div>
                  <p className="text-3xl font-bold text-white">50K+</p>
                  <p className="text-sm text-white/50">Active Referrers</p>
                </div>
                <div className="w-px h-12 bg-white/10" />
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {['PS', 'RV', 'AD'].map((initials, i) => (
                      <motion.div 
                        key={i}
                        className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center text-xs font-bold border-2 border-[#0a0a0f]"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.8 + i * 0.1, type: 'spring' }}
                      >
                        {initials}
                      </motion.div>
                    ))}
                  </div>
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                </div>
              </motion.div>
            </motion.div>

            {/* Stats Cards - Radison inspired floating cards */}
            <motion.div 
              className="relative hidden lg:block"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <div className="grid grid-cols-2 gap-4">
                {stats.map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
                    whileHover={{ y: -8, scale: 1.02 }}
                    className={`relative p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm overflow-hidden group ${
                      index === 0 ? 'col-span-2' : ''
                    }`}
                  >
                    <motion.div 
                      className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}
                    />
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-4 shadow-lg`}>
                      <stat.icon className="w-6 h-6 text-white" />
                    </div>
                    <p className="text-4xl font-bold text-white mb-1">{stat.value}</p>
                    <p className="text-sm text-white/50">{stat.label}</p>
                  </motion.div>
                ))}
              </div>
              
              {/* Floating badge */}
              <motion.div
                className="absolute -top-4 -right-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              >
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  Live Payouts
                </span>
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div 
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <ChevronDown className="w-6 h-6 text-white/30" />
        </motion.div>
      </section>

      {/* Process Section - Radison inspired with code blocks */}
      <section id="process" className="py-32 relative">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div 
            className="text-center mb-20"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Badge className="bg-primary/10 text-primary border-0 px-4 py-2 mb-6 rounded-full">
              Simple Process
            </Badge>
            <h2 className="text-4xl sm:text-5xl font-bold mb-6">
              Your Path to <span className="text-primary">Excellence</span>
            </h2>
            <p className="text-xl text-white/50 max-w-2xl mx-auto">
              A simple, effective approach to start earning with referrals
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {process.map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -10 }}
                className="group relative"
              >
                <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all h-full">
                  <motion.div 
                    className={`w-14 h-14 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-6 shadow-lg`}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                  >
                    <item.icon className="w-7 h-7 text-white" />
                  </motion.div>
                  <span className="text-6xl font-bold text-white/5 absolute top-4 right-4">{item.step}</span>
                  <h3 className="text-xl font-bold mb-2 text-white">{item.title}</h3>
                  <p className="text-white/50 mb-4 text-sm">{item.desc}</p>
                  
                  {/* Code block - Radison inspired */}
                  <div className="bg-black/40 rounded-lg p-3 font-mono text-xs overflow-hidden">
                    <pre className="text-green-400/80 whitespace-pre-wrap">{item.code}</pre>
                  </div>
                </div>
                
                {index < 3 && (
                  <div className="hidden lg:flex absolute top-1/2 -right-3 w-6 h-6 rounded-full bg-white/10 items-center justify-center z-10">
                    <ArrowRight className="w-3 h-3 text-white/50" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section - Netflix card style */}
      <section id="services" className="py-32 relative bg-gradient-to-b from-transparent via-primary/5 to-transparent">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div 
            className="text-center mb-20"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Badge className="bg-purple-500/10 text-purple-400 border-0 px-4 py-2 mb-6 rounded-full">
              Why Choose Us
            </Badge>
            <h2 className="text-4xl sm:text-5xl font-bold mb-6">
              Innovative Services for <span className="text-purple-400">Growth</span>
            </h2>
            <p className="text-xl text-white/50 max-w-2xl mx-auto">
              Tailored solutions to streamline, innovate, and maximize your earnings
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, index) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -10, scale: 1.02 }}
                className="group"
              >
                <div className="h-full p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all relative overflow-hidden">
                  <motion.div 
                    className={`absolute inset-0 bg-gradient-to-br ${service.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}
                  />
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${service.gradient} flex items-center justify-center mb-4 shadow-lg relative z-10`}>
                    <service.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold mb-2 text-white relative z-10">{service.title}</h3>
                  <p className="text-white/50 text-sm mb-4 relative z-10">{service.desc}</p>
                  <Badge className="bg-white/10 text-white/70 border-0 text-xs relative z-10">
                    {service.stat}
                  </Badge>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials - Netflix carousel style */}
      <section id="testimonials" className="py-32 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Badge className="bg-green-500/10 text-green-400 border-0 px-4 py-2 mb-6 rounded-full">
              Success Stories
            </Badge>
            <h2 className="text-4xl sm:text-5xl font-bold mb-6">
              Trusted by <span className="text-green-400">Satisfied Clients</span>
            </h2>
            <p className="text-xl text-white/50">Real people, real earnings, real success</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {testimonials.map((t, index) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className={`p-6 rounded-2xl border transition-all ${
                  activeTestimonial === index 
                    ? 'bg-gradient-to-br from-primary/20 to-purple-500/20 border-primary/50' 
                    : 'bg-white/5 border-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-white/80 mb-6 text-sm leading-relaxed">"{t.quote}"</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center font-bold text-sm">
                      {t.avatar}
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-white">{t.name}</p>
                      <p className="text-xs text-white/50">{t.role}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-green-400">{t.earnings}</p>
                    <p className="text-[10px] text-white/40 uppercase tracking-wider">Earned</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>


      {/* How to Refer Section - Step by Step Guide */}
      <section id="how-to-refer" className="py-32 relative bg-gradient-to-b from-transparent via-purple-500/5 to-transparent">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Badge className="bg-primary/20 text-primary border-0 px-4 py-2 mb-6 rounded-full">
              Quick Guide
            </Badge>
            <h2 className="text-4xl sm:text-5xl font-bold mb-6">
              How to <span className="text-primary">Submit a Referral</span>
            </h2>
            <p className="text-xl text-white/50 max-w-2xl mx-auto">
              Follow these simple steps to start earning rewards by referring students
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Step 1 */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="relative"
            >
              <Card className="bg-white/5 border-white/10 backdrop-blur-sm overflow-hidden h-full">
                <CardContent className="p-8">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-cyan-500 flex items-center justify-center flex-shrink-0">
                      <span className="text-2xl font-bold text-white">1</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">Create Your Account</h3>
                      <p className="text-white/60 mb-4">
                        Sign up for free using your email and phone number. Complete your profile with basic details to get started.
                      </p>
                      <ul className="space-y-2">
                        <li className="flex items-center gap-2 text-sm text-white/50">
                          <Check className="w-4 h-4 text-green-400" />
                          Takes less than 2 minutes
                        </li>
                        <li className="flex items-center gap-2 text-sm text-white/50">
                          <Check className="w-4 h-4 text-green-400" />
                          No documents required initially
                        </li>
                        <li className="flex items-center gap-2 text-sm text-white/50">
                          <Check className="w-4 h-4 text-green-400" />
                          Instant access to dashboard
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Step 2 */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="relative"
            >
              <Card className="bg-white/5 border-white/10 backdrop-blur-sm overflow-hidden h-full">
                <CardContent className="p-8">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                      <span className="text-2xl font-bold text-white">2</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">Add Student Details</h3>
                      <p className="text-white/60 mb-4">
                        Enter the student's information including name, contact details, and their preferred university and program.
                      </p>
                      <ul className="space-y-2">
                        <li className="flex items-center gap-2 text-sm text-white/50">
                          <Check className="w-4 h-4 text-green-400" />
                          Student name and contact info
                        </li>
                        <li className="flex items-center gap-2 text-sm text-white/50">
                          <Check className="w-4 h-4 text-green-400" />
                          Choose from 100+ universities
                        </li>
                        <li className="flex items-center gap-2 text-sm text-white/50">
                          <Check className="w-4 h-4 text-green-400" />
                          Select preferred program
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Step 3 */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="relative"
            >
              <Card className="bg-white/5 border-white/10 backdrop-blur-sm overflow-hidden h-full">
                <CardContent className="p-8">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center flex-shrink-0">
                      <span className="text-2xl font-bold text-white">3</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">Track Your Referral</h3>
                      <p className="text-white/60 mb-4">
                        Get a unique tracking code and monitor the student's admission journey in real-time through your dashboard.
                      </p>
                      <ul className="space-y-2">
                        <li className="flex items-center gap-2 text-sm text-white/50">
                          <Check className="w-4 h-4 text-green-400" />
                          Unique referral tracking code
                        </li>
                        <li className="flex items-center gap-2 text-sm text-white/50">
                          <Check className="w-4 h-4 text-green-400" />
                          Real-time status updates
                        </li>
                        <li className="flex items-center gap-2 text-sm text-white/50">
                          <Check className="w-4 h-4 text-green-400" />
                          Email & SMS notifications
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Step 4 */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="relative"
            >
              <Card className="bg-white/5 border-white/10 backdrop-blur-sm overflow-hidden h-full">
                <CardContent className="p-8">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-yellow-500 flex items-center justify-center flex-shrink-0">
                      <span className="text-2xl font-bold text-white">4</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">Receive Your Reward</h3>
                      <p className="text-white/60 mb-4">
                        Once the student is successfully admitted, your reward is processed and transferred directly to your bank account.
                      </p>
                      <ul className="space-y-2">
                        <li className="flex items-center gap-2 text-sm text-white/50">
                          <Check className="w-4 h-4 text-green-400" />
                          Rewards from ₹2,000 to ₹50,000
                        </li>
                        <li className="flex items-center gap-2 text-sm text-white/50">
                          <Check className="w-4 h-4 text-green-400" />
                          Direct bank transfer
                        </li>
                        <li className="flex items-center gap-2 text-sm text-white/50">
                          <Check className="w-4 h-4 text-green-400" />
                          Processed within 7 days
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* CTA */}
          <motion.div 
            className="text-center mt-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
          >
            <Link to="/login?tab=signup">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-primary to-cyan-500 hover:opacity-90 text-white rounded-full px-10 py-7 text-lg shadow-2xl shadow-primary/30"
                >
                  Sign Up & Start Referring <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </motion.div>
            </Link>
            <p className="text-white/40 text-sm mt-4">Free to join • No credit card required</p>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-32 relative">
        <div className="max-w-3xl mx-auto px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Badge className="bg-cyan-500/10 text-cyan-400 border-0 px-4 py-2 mb-6 rounded-full">
              FAQ
            </Badge>
            <h2 className="text-4xl sm:text-5xl font-bold mb-6">
              We're Here to <span className="text-cyan-400">Help</span>
            </h2>
            <p className="text-xl text-white/50">FAQs designed to provide the information you need</p>
          </motion.div>

          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <AccordionItem value={`faq-${index}`} className="bg-white/5 border border-white/10 rounded-xl px-6 overflow-hidden">
                  <AccordionTrigger className="text-white hover:text-primary py-6 text-left">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-white/60 pb-6">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 relative">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <motion.div 
            className="relative p-12 md:p-16 rounded-3xl bg-gradient-to-br from-primary/20 via-purple-500/20 to-cyan-500/20 border border-white/10 overflow-hidden"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <motion.div 
              className="absolute inset-0 bg-gradient-to-r from-primary/10 to-purple-500/10"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 3, repeat: Infinity }}
            />
            <div className="relative z-10">
              <h2 className="text-4xl sm:text-5xl font-bold mb-6">
                Ready to Start <span className="text-primary">Earning?</span>
              </h2>
              <p className="text-xl text-white/60 mb-8 max-w-2xl mx-auto">
                Join thousands of referrers who are already transforming education into income.
              </p>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link to="/login?tab=signup">
                  <Button 
                    size="lg" 
                    className="bg-white text-black hover:bg-white/90 rounded-full px-10 py-7 text-lg shadow-2xl"
                  >
                    Sign Up Now <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
              </motion.div>
              <p className="text-white/40 text-sm mt-4">Free to join • No credit card required</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-cyan-400 flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-lg">TeamLease EdTech</span>
              </div>
              <p className="text-white/50 text-sm leading-relaxed">
                Your trusted partner in education referrals, creating pathways for students and rewards for referrers.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-white">Sections</h4>
              <ul className="space-y-3 text-sm text-white/50">
                <li><button onClick={() => scrollToSection('process')} className="hover:text-white transition-colors">Process</button></li>
                <li><button onClick={() => scrollToSection('services')} className="hover:text-white transition-colors">Services</button></li>
                <li><button onClick={() => scrollToSection('testimonials')} className="hover:text-white transition-colors">Testimonials</button></li>
                <li><button onClick={() => scrollToSection('how-to-refer')} className="hover:text-white transition-colors">How to Refer</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-white">Pages</h4>
              <ul className="space-y-3 text-sm text-white/50">
                <li><Link to="/login" className="hover:text-white transition-colors">Login</Link></li>
                <li><Link to="/login?tab=signup" className="hover:text-white transition-colors">Sign Up</Link></li>
                <li><Link to="/register/referee" className="hover:text-white transition-colors">Student Sign Up</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-white">Contact</h4>
              <ul className="space-y-3 text-sm text-white/50">
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  teamlease@edtech.com
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  +91 80 4545 4545
                </li>
                <li className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Bangalore, India
                </li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-white/40">© 2024 TeamLease EdTech. All rights reserved.</p>
            <div className="flex gap-6 text-sm text-white/40">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-white transition-colors">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicPortal;
