import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  GraduationCap, Users, Gift, TrendingUp, ArrowRight, Star, 
  Sparkles, Rocket, CheckCircle, Menu, X, ChevronDown,
  Shield, Clock, Globe, Zap, Award, Play
} from 'lucide-react';
import { 
  FadeInUp, StaggerContainer, StaggerItem, AnimatedCard,
  fadeInUp, staggerContainer, staggerItem
} from '@/lib/framer';

const Landing = () => {
  const [scrollY, setScrollY] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const stats = [
    { value: '50K+', label: 'Active Referrers', icon: Users, color: 'from-blue-500 to-cyan-500' },
    { value: '₹2Cr+', label: 'Rewards Paid', icon: Gift, color: 'from-purple-500 to-pink-500' },
    { value: '85%', label: 'Success Rate', icon: TrendingUp, color: 'from-green-500 to-emerald-500' },
    { value: '100+', label: 'Universities', icon: GraduationCap, color: 'from-orange-500 to-red-500' },
  ];

  const steps = [
    { step: '01', title: 'Sign Up', desc: 'Create your free account in under 2 minutes', icon: Users, color: 'from-primary to-cyan-400' },
    { step: '02', title: 'Refer Students', desc: 'Share university programs with interested students', icon: Rocket, color: 'from-purple-500 to-pink-500' },
    { step: '03', title: 'Track Progress', desc: 'Monitor admission status in real-time', icon: TrendingUp, color: 'from-green-500 to-emerald-500' },
    { step: '04', title: 'Earn Rewards', desc: 'Get paid for every successful admission', icon: Gift, color: 'from-orange-500 to-yellow-500' },
  ];

  const features = [
    { title: 'Instant Tracking', desc: 'Real-time updates on all your referrals', icon: Zap, gradient: 'from-primary/20 to-cyan-500/20' },
    { title: 'Secure Platform', desc: 'Bank-grade security for your data', icon: Shield, gradient: 'from-green-500/20 to-emerald-500/20' },
    { title: 'Fast Payouts', desc: 'Receive rewards within 7 days', icon: Clock, gradient: 'from-orange-500/20 to-yellow-500/20' },
    { title: 'Global Network', desc: '100+ partner universities', icon: Globe, gradient: 'from-purple-500/20 to-pink-500/20' },
  ];

  const testimonials = [
    { name: 'Priya Sharma', role: 'MBA Student', quote: 'Earned ₹50,000 by referring just 5 friends!', avatar: 'PS', rating: 5 },
    { name: 'Rahul Kumar', role: 'Engineer', quote: 'Best referral platform with transparent tracking.', avatar: 'RK', rating: 5 },
    { name: 'Anita Desai', role: 'Counselor', quote: 'Helped 20+ students while earning great rewards.', avatar: 'AD', rating: 5 },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div 
          className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[150px]"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div 
          className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-[150px]"
          animate={{ 
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        />
        <motion.div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-green-500/10 rounded-full blur-[180px]"
          animate={{ 
            rotate: [0, 360],
          }}
          transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
        />
      </div>

      {/* Navigation */}
      <motion.nav 
        className={`fixed top-0 w-full z-50 transition-all duration-500 ${
          scrollY > 50 ? 'bg-[#0a0a0f]/90 backdrop-blur-xl border-b border-white/5' : ''
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
              whileTap={{ scale: 0.98 }}
            >
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-cyan-400 flex items-center justify-center shadow-lg shadow-primary/30">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="font-bold text-xl text-white">TeamLease</span>
                <p className="text-xs text-white/50">EdTech Referrals</p>
              </div>
            </motion.div>

            <div className="hidden md:flex items-center gap-8">
              {['How It Works', 'Features', 'Testimonials'].map((item, index) => (
                <motion.button
                  key={item}
                  onClick={() => scrollToSection(item.toLowerCase().replace(' ', '-'))}
                  className="text-sm text-white/70 hover:text-white transition-colors font-medium"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index, duration: 0.5 }}
                  whileHover={{ y: -2 }}
                >
                  {item}
                </motion.button>
              ))}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                <Link to="/login">
                  <Button className="bg-white text-black hover:bg-white/90 rounded-full px-6 font-semibold">
                    Login <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </motion.div>
            </div>

            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2">
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
                transition={{ duration: 0.3 }}
              >
                {['How It Works', 'Features', 'Testimonials'].map((item) => (
                  <button
                    key={item}
                    onClick={() => scrollToSection(item.toLowerCase().replace(' ', '-'))}
                    className="block w-full text-left py-3 text-white/70 hover:text-white transition-colors font-medium"
                  >
                    {item}
                  </button>
                ))}
                <Link to="/login" className="block mt-4">
                  <Button className="w-full bg-white text-black hover:bg-white/90 rounded-full">Login</Button>
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 min-h-screen flex items-center">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div 
              className="space-y-8"
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
            >
              <motion.div variants={staggerItem}>
                <Badge className="bg-white/10 text-white border-0 px-4 py-2 text-sm font-medium rounded-full backdrop-blur-sm">
                  <Sparkles className="w-4 h-4 mr-2 text-yellow-400" />
                  #1 Education Referral Platform in India
                </Badge>
              </motion.div>

              <motion.h1 
                className="text-5xl lg:text-7xl font-bold leading-tight"
                variants={staggerItem}
              >
                Earn While You
                <motion.span 
                  className="block bg-gradient-to-r from-primary via-cyan-400 to-purple-500 bg-clip-text text-transparent"
                  animate={{ 
                    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                  }}
                  transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
                  style={{ backgroundSize: '200% 200%' }}
                >
                  Help Others Learn
                </motion.span>
              </motion.h1>

              <motion.p 
                className="text-xl text-white/60 max-w-lg leading-relaxed"
                variants={staggerItem}
              >
                Join 50,000+ referrers earning rewards by connecting students with top universities. 
                No limits, instant tracking, fast payouts.
              </motion.p>

              <motion.div 
                className="flex flex-wrap gap-4"
                variants={staggerItem}
              >
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link to="/register">
                    <Button 
                      size="lg" 
                      className="bg-gradient-to-r from-primary to-cyan-400 hover:opacity-90 text-white rounded-full px-8 py-6 text-lg shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all"
                    >
                      Start Earning <Rocket className="w-5 h-5 ml-2" />
                    </Button>
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button 
                    size="lg" 
                    variant="outline"
                    onClick={() => scrollToSection('how-it-works')}
                    className="border-white/30 bg-white/5 text-white hover:bg-white/10 rounded-full px-8 py-6 text-lg backdrop-blur-sm"
                  >
                    <Play className="w-5 h-5 mr-2 fill-white" /> Watch Demo
                  </Button>
                </motion.div>
              </motion.div>

              {/* Trust Badges */}
              <motion.div 
                className="flex items-center gap-6 pt-4"
                variants={staggerItem}
              >
                <div className="flex -space-x-3">
                  {['PS', 'RK', 'AD', 'MN'].map((initials, i) => (
                    <motion.div 
                      key={i} 
                      className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center text-xs font-bold border-2 border-[#0a0a0f]"
                      initial={{ scale: 0, x: -20 }}
                      animate={{ scale: 1, x: 0 }}
                      transition={{ delay: 0.8 + i * 0.1, type: 'spring', stiffness: 200 }}
                    >
                      {initials}
                    </motion.div>
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 1 + i * 0.1, type: 'spring' }}
                      >
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      </motion.div>
                    ))}
                  </div>
                  <p className="text-sm text-white/50">Trusted by 50,000+ referrers</p>
                </div>
              </motion.div>
            </motion.div>

            {/* Stats Grid */}
            <motion.div 
              className="grid grid-cols-2 gap-4"
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
            >
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  variants={staggerItem}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="group relative p-6 rounded-3xl bg-white/5 border border-white/10 hover:border-primary/50 transition-all duration-500 overflow-hidden"
                >
                  <motion.div 
                    className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}
                  />
                  <stat.icon className="w-8 h-8 text-primary mb-4 relative z-10" />
                  <motion.p 
                    className="text-4xl font-bold text-white mb-1 relative z-10"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                  >
                    {stat.value}
                  </motion.p>
                  <p className="text-sm text-white/50 relative z-10">{stat.label}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <motion.div 
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <ChevronDown className="w-6 h-6 text-white/30" />
        </motion.div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 relative">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <FadeInUp>
            <div className="text-center mb-16">
              <Badge className="bg-primary/20 text-primary border-0 px-4 py-2 mb-4 rounded-full">
                Simple Process
              </Badge>
              <h2 className="text-4xl lg:text-5xl font-bold mb-4">How It Works</h2>
              <p className="text-xl text-white/50 max-w-2xl mx-auto">Start earning in 4 simple steps</p>
            </div>
          </FadeInUp>

          <motion.div 
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={staggerContainer}
          >
            {steps.map((item, index) => (
              <motion.div
                key={item.step}
                variants={staggerItem}
                whileHover={{ y: -10 }}
                className="group relative p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-white/20 transition-all duration-500"
              >
                <motion.div 
                  className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-6 shadow-lg`}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <item.icon className="w-8 h-8 text-white" />
                </motion.div>
                <span className="text-6xl font-bold text-white/5 absolute top-4 right-4">{item.step}</span>
                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-white/50">{item.desc}</p>
                {index < 3 && (
                  <div className="hidden lg:flex absolute top-1/2 -right-3 w-6 h-6 rounded-full bg-white/10 items-center justify-center z-10">
                    <ArrowRight className="w-3 h-3 text-white/50" />
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 relative">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <FadeInUp>
              <Badge className="bg-purple-500/20 text-purple-400 border-0 px-4 py-2 mb-4 rounded-full">
                Why Choose Us
              </Badge>
              <h2 className="text-4xl lg:text-5xl font-bold mb-6">
                Built for
                <span className="block text-purple-400">Serious Earners</span>
              </h2>
              <p className="text-xl text-white/50 mb-8">
                Everything you need to maximize your referral earnings.
              </p>

              <div className="space-y-4">
                {features.map((feature, index) => (
                  <motion.div 
                    key={feature.title}
                    className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-all group"
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    whileHover={{ x: 10 }}
                  >
                    <motion.div 
                      className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center flex-shrink-0`}
                      whileHover={{ scale: 1.1, rotate: 10 }}
                    >
                      <feature.icon className="w-6 h-6 text-white" />
                    </motion.div>
                    <div>
                      <h3 className="font-semibold text-lg mb-1">{feature.title}</h3>
                      <p className="text-white/50 text-sm">{feature.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </FadeInUp>

            {/* Reward Calculator */}
            <FadeInUp delay={0.2}>
              <div className="relative">
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-br from-primary/30 to-purple-500/30 rounded-3xl blur-3xl"
                  animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                />
                <Card className="relative bg-white/5 border-white/10 rounded-3xl overflow-hidden backdrop-blur-sm">
                  <CardContent className="p-8">
                    <div className="flex items-center gap-3 mb-8">
                      <motion.div 
                        className="w-12 h-12 rounded-2xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center"
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                      >
                        <Award className="w-6 h-6 text-white" />
                      </motion.div>
                      <div>
                        <h3 className="text-xl font-bold">Reward Calculator</h3>
                        <p className="text-sm text-white/50">See your potential earnings</p>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="p-6 rounded-2xl bg-white/5">
                        <p className="text-sm text-white/50 mb-2">Average per referral</p>
                        <motion.p 
                          className="text-4xl font-bold text-yellow-400"
                          initial={{ scale: 0 }}
                          whileInView={{ scale: 1 }}
                          viewport={{ once: true }}
                          transition={{ type: 'spring', stiffness: 200, delay: 0.3 }}
                        >
                          ₹10,000
                        </motion.p>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        {[5, 10, 20].map((num, i) => (
                          <motion.div 
                            key={num}
                            className="p-4 rounded-xl bg-white/5 text-center"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.4 + i * 0.1 }}
                            whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.1)' }}
                          >
                            <p className="text-2xl font-bold text-white">{num}</p>
                            <p className="text-xs text-white/50">referrals</p>
                            <p className="text-lg font-bold text-green-400 mt-2">₹{(num * 10000).toLocaleString()}</p>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </FadeInUp>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 relative">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <FadeInUp>
            <div className="text-center mb-16">
              <Badge className="bg-green-500/20 text-green-400 border-0 px-4 py-2 mb-4 rounded-full">
                Success Stories
              </Badge>
              <h2 className="text-4xl lg:text-5xl font-bold mb-4">What Referrers Say</h2>
              <p className="text-xl text-white/50">Real people, real earnings</p>
            </div>
          </FadeInUp>

          <motion.div 
            className="grid md:grid-cols-3 gap-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={staggerContainer}
          >
            {testimonials.map((t) => (
              <motion.div
                key={t.name}
                variants={staggerItem}
                whileHover={{ y: -10, scale: 1.02 }}
              >
                <Card className="bg-white/5 border-white/10 rounded-3xl overflow-hidden hover:border-white/20 transition-all h-full">
                  <CardContent className="p-8">
                    <div className="flex items-center gap-1 mb-4">
                      {[...Array(t.rating)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <p className="text-lg text-white/80 mb-6 leading-relaxed">"{t.quote}"</p>
                    <div className="flex items-center gap-4">
                      <motion.div 
                        className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center font-bold"
                        whileHover={{ scale: 1.1 }}
                      >
                        {t.avatar}
                      </motion.div>
                      <div>
                        <p className="font-semibold">{t.name}</p>
                        <p className="text-sm text-white/50">{t.role}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <motion.div 
            className="relative p-12 rounded-3xl bg-gradient-to-br from-primary/20 to-purple-500/20 border border-white/10 overflow-hidden"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <motion.div 
              className="absolute inset-0 bg-gradient-to-br from-primary/10 to-purple-500/10"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            />
            <div className="relative z-10">
              <motion.h2 
                className="text-4xl lg:text-5xl font-bold mb-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
              >
                Ready to Start Earning?
              </motion.h2>
              <motion.p 
                className="text-xl text-white/60 mb-8 max-w-2xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
              >
                Join thousands of referrers who are already earning rewards.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4, type: 'spring', stiffness: 200 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link to="/register">
                  <Button 
                    size="lg" 
                    className="bg-white text-black hover:bg-white/90 rounded-full px-10 py-6 text-lg shadow-xl"
                  >
                    Get Started Now <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-cyan-400 flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg">TeamLease EdTech</span>
            </div>
            <p className="text-sm text-white/40">© 2024 TeamLease EdTech. All rights reserved.</p>
            <div className="flex gap-6 text-sm text-white/40">
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
