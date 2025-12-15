import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { 
  CheckCircle, Users, Gift, ArrowRight, TrendingUp, Star, Zap, Shield, 
  Clock, Building2, GraduationCap, Target, Mail, Phone, MapPin, 
  Linkedin, Twitter, Sparkles, Globe, Rocket, FileText, Menu, X, 
  ChevronDown, Play, Award, Heart
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { universitiesAPI, referralsAPI } from '@/lib/api';

const PublicPortal = () => {
  const [universities, setUniversities] = useState<any[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);
  const [formStep, setFormStep] = useState(1);
  const [selectedUniversity, setSelectedUniversity] = useState('');
  const [trackingCode, setTrackingCode] = useState('');
  const [submittedCode, setSubmittedCode] = useState('');
  const [scrollY, setScrollY] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Fetch universities on mount
  useEffect(() => {
    const fetchUniversities = async () => {
      try {
        const response = await universitiesAPI.getUniversities({ status: 'active', limit: 100 });
        setUniversities(response.items || []);
      } catch (error) {
        console.error('Error fetching universities:', error);
      }
    };
    fetchUniversities();
  }, []);

  // Fetch programs when university changes
  useEffect(() => {
    const fetchPrograms = async () => {
      if (!selectedUniversity) {
        setPrograms([]);
        return;
      }
      try {
        const programsList = await universitiesAPI.getUniversityPrograms(selectedUniversity);
        setPrograms(programsList || []);
      } catch (error) {
        console.error('Error fetching programs:', error);
        setPrograms([]);
      }
    };
    fetchPrograms();
  }, [selectedUniversity]);

  const filteredPrograms = programs.filter((p: any) => p.status === 'active');

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const generateCode = () => {
    const uni = universities.find((u) => u.id === selectedUniversity);
    return `${uni?.code || 'REF'}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
  };

  const validateForm = (step: number): boolean => {
    const errors: Record<string, string> = {};
    
    if (step === 1) {
      const name = (document.getElementById('referrerName') as HTMLInputElement)?.value;
      const phone = (document.getElementById('referrerPhone') as HTMLInputElement)?.value;
      const email = (document.getElementById('referrerEmail') as HTMLInputElement)?.value;
      if (!name || name.length < 2) errors.referrerName = 'Please enter a valid name';
      if (!phone || !/^\+?[\d\s-]{10,}$/.test(phone)) errors.referrerPhone = 'Please enter a valid phone';
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.referrerEmail = 'Please enter a valid email';
    }
    
    if (step === 2) {
      const name = (document.getElementById('refereeName') as HTMLInputElement)?.value;
      const phone = (document.getElementById('refereePhone') as HTMLInputElement)?.value;
      const email = (document.getElementById('refereeEmail') as HTMLInputElement)?.value;
      if (!name || name.length < 2) errors.refereeName = 'Please enter a valid name';
      if (!phone || !/^\+?[\d\s-]{10,}$/.test(phone)) errors.refereePhone = 'Please enter a valid phone';
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.refereeEmail = 'Please enter a valid email';
    }
    
    if (step === 3 && !selectedUniversity) {
      errors.university = 'Please select a university';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm(3)) {
      toast({ title: 'Please fill all fields', variant: 'destructive' });
      return;
    }
    setIsSubmitting(true);
    
    try {
      // Get form values
      const referrerName = (document.getElementById('referrerName') as HTMLInputElement)?.value;
      const referrerEmail = (document.getElementById('referrerEmail') as HTMLInputElement)?.value;
      const referrerPhone = (document.getElementById('referrerPhone') as HTMLInputElement)?.value;
      const refereeName = (document.getElementById('refereeName') as HTMLInputElement)?.value;
      const refereeEmail = (document.getElementById('refereeEmail') as HTMLInputElement)?.value;
      const refereePhone = (document.getElementById('refereePhone') as HTMLInputElement)?.value;
      const programId = (document.getElementById('program') as HTMLSelectElement)?.value;
      
      // Submit to backend
      const response = await referralsAPI.createReferral({
        referrer_name: referrerName,
        referrer_email: referrerEmail,
        referrer_phone: referrerPhone,
        referee_name: refereeName,
        referee_email: refereeEmail,
        referee_phone: refereePhone,
        university_id: selectedUniversity,
        program_id: programId || undefined,
      });
      
      const code = response.referral_code || generateCode();
      setSubmittedCode(code);
      setFormStep(4);
      toast({ title: 'Referral Submitted!', description: `Code: ${code}` });
    } catch (error) {
      console.error('Error submitting referral:', error);
      toast({ title: 'Error', description: 'Failed to submit referral. Please try again.', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const stats = [
    { value: '50K+', label: 'Active Referrers', icon: Users },
    { value: '₹2Cr+', label: 'Rewards Distributed', icon: Gift },
    { value: '85%', label: 'Success Rate', icon: TrendingUp },
    { value: '100+', label: 'Partner Universities', icon: Building2 },
  ];

  const howItWorks = [
    { step: '01', title: 'Sign Up', desc: 'Register as a referrer in under 2 minutes', icon: FileText, color: 'from-primary to-cyan-400' },
    { step: '02', title: 'Refer Friends', desc: 'Share university programs with interested students', icon: Users, color: 'from-accent to-pink-400' },
    { step: '03', title: 'Track Progress', desc: 'Monitor admission status in real-time', icon: Target, color: 'from-success to-emerald-400' },
    { step: '04', title: 'Earn Rewards', desc: 'Get paid for every successful admission', icon: Gift, color: 'from-warning to-orange-400' },
  ];

  const features = [
    { title: 'Instant Tracking', desc: 'Real-time updates on referral status', icon: Zap, gradient: 'from-primary/20 to-cyan-500/20' },
    { title: 'Secure Platform', desc: 'Bank-grade security for your data', icon: Shield, gradient: 'from-success/20 to-emerald-500/20' },
    { title: 'Fast Payouts', desc: 'Receive rewards within 7 days', icon: Clock, gradient: 'from-warning/20 to-orange-500/20' },
    { title: 'Global Network', desc: '100+ universities worldwide', icon: Globe, gradient: 'from-accent/20 to-purple-500/20' },
  ];

  const testimonials = [
    { name: 'Priya Sharma', role: 'MBA Student', quote: 'Earned ₹50,000 by referring just 5 friends. The process was incredibly smooth!', avatar: 'PS', rating: 5 },
    { name: 'Rahul Kumar', role: 'Engineering Graduate', quote: 'Best referral platform I\'ve used. Transparent tracking and fast payouts.', avatar: 'RK', rating: 5 },
    { name: 'Anita Desai', role: 'Career Counselor', quote: 'Helped 20+ students find the right university while earning substantial rewards.', avatar: 'AD', rating: 5 },
  ];

  const faqs = [
    { q: 'How much can I earn per referral?', a: 'Rewards range from ₹2,000 to ₹50,000 depending on the program. Premium MBA programs offer the highest rewards.' },
    { q: 'When do I receive my payment?', a: 'Payments are processed within 7 working days after the referred student\'s admission is confirmed.' },
    { q: 'Is there a limit on referrals?', a: 'No limits! The more students you refer, the more you earn. Top referrers earn lakhs monthly.' },
    { q: 'How do I track my referrals?', a: 'Use your unique referral code or email to track all referrals in real-time through our dashboard.' },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[128px] animate-pulse-soft" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-accent/20 rounded-full blur-[128px] animate-pulse-soft" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-success/10 rounded-full blur-[150px]" />
      </div>

      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${scrollY > 50 ? 'bg-[#0a0a0f]/90 backdrop-blur-xl border-b border-white/5' : ''}`}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-cyan-400 flex items-center justify-center shadow-lg shadow-primary/30">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="font-bold text-xl text-white">TeamLease</span>
                <p className="text-xs text-white/50">EdTech Referrals</p>
              </div>
            </div>
            
            <div className="hidden md:flex items-center gap-8">
              {['How It Works', 'Features', 'Testimonials', 'FAQ'].map((item) => (
                <button
                  key={item}
                  onClick={() => scrollToSection(item.toLowerCase().replace(' ', '-'))}
                  className="text-sm text-white/70 hover:text-white transition-colors font-medium"
                >
                  {item}
                </button>
              ))}
              <Link to="/login">
                <Button className="bg-white text-black hover:bg-white/90 rounded-full px-6 font-semibold">
                  Login <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>

            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2">
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {mobileMenuOpen && (
            <div className="md:hidden py-6 border-t border-white/10 animate-fade-in">
              {['How It Works', 'Features', 'Testimonials', 'FAQ'].map((item) => (
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
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <Badge className="bg-white/10 text-white border-0 px-4 py-2 text-sm font-medium rounded-full">
                <Sparkles className="w-4 h-4 mr-2 text-primary" />
                #1 Education Referral Platform
              </Badge>
              
              <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
                Earn While You
                <span className="block bg-gradient-to-r from-primary via-cyan-400 to-accent bg-clip-text text-transparent">
                  Help Others Learn
                </span>
              </h1>
              
              <p className="text-xl text-white/60 max-w-lg leading-relaxed">
                Join 50,000+ referrers earning rewards by connecting students with top universities. No limits, instant tracking, fast payouts.
              </p>
              
              <div className="flex flex-wrap gap-4">
                <Button 
                  size="lg" 
                  onClick={() => scrollToSection('referral-form')}
                  className="bg-gradient-to-r from-primary to-cyan-400 hover:opacity-90 text-white rounded-full px-8 py-6 text-lg shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all"
                >
                  Start Referring <Rocket className="w-5 h-5 ml-2" />
                </Button>
                <Link to="/register/referee">
                  <Button 
                    size="lg" 
                    className="bg-gradient-to-r from-accent to-pink-400 hover:opacity-90 text-white rounded-full px-8 py-6 text-lg shadow-lg shadow-accent/30 hover:shadow-xl hover:shadow-accent/40 transition-all"
                  >
                    Join as Student <GraduationCap className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Button 
                  size="lg" 
                  variant="outline"
                  onClick={() => scrollToSection('how-it-works')}
                  className="border-white/30 bg-white/5 text-white hover:bg-white/10 rounded-full px-8 py-6 text-lg backdrop-blur-sm"
                >
                  <Play className="w-5 h-5 mr-2 fill-white" /> Watch Demo
                </Button>
              </div>

              {/* Trust Badges */}
              <div className="flex items-center gap-6 pt-4">
                <div className="flex -space-x-3">
                  {['PS', 'RK', 'AD', 'MN'].map((initials, i) => (
                    <div key={i} className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-xs font-bold border-2 border-[#0a0a0f]">
                      {initials}
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-warning text-warning" />)}
                  </div>
                  <p className="text-sm text-white/50">Trusted by 50,000+ referrers</p>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              {stats.map((stat, index) => (
                <div 
                  key={stat.label}
                  className="group relative p-6 rounded-3xl bg-white/5 border border-white/10 hover:border-primary/50 transition-all duration-500 hover:-translate-y-1"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <stat.icon className="w-8 h-8 text-primary mb-4" />
                  <p className="text-4xl font-bold text-white mb-1">{stat.value}</p>
                  <p className="text-sm text-white/50">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <ChevronDown className="w-6 h-6 text-white/30" />
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 relative">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="bg-primary/20 text-primary border-0 px-4 py-2 mb-4 rounded-full">Simple Process</Badge>
            <h2 className="text-4xl lg:text-5xl font-bold mb-4">How It Works</h2>
            <p className="text-xl text-white/50 max-w-2xl mx-auto">Start earning in 4 simple steps</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {howItWorks.map((item, index) => (
              <div 
                key={item.step}
                className="group relative p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-white/20 transition-all duration-500"
              >
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg`}>
                  <item.icon className="w-8 h-8 text-white" />
                </div>
                <span className="text-6xl font-bold text-white/5 absolute top-4 right-4">{item.step}</span>
                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-white/50">{item.desc}</p>
                {index < 3 && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">
                    <ArrowRight className="w-3 h-3 text-white/50" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 relative">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <Badge className="bg-accent/20 text-accent border-0 px-4 py-2 mb-4 rounded-full">Why Choose Us</Badge>
              <h2 className="text-4xl lg:text-5xl font-bold mb-6">
                Built for
                <span className="block text-accent">Serious Earners</span>
              </h2>
              <p className="text-xl text-white/50 mb-8">
                Everything you need to maximize your referral earnings in one powerful platform.
              </p>
              
              <div className="space-y-4">
                {features.map((feature) => (
                  <div key={feature.title} className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-all group">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-1">{feature.title}</h3>
                      <p className="text-white/50 text-sm">{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Reward Calculator Card */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-accent/30 rounded-3xl blur-3xl" />
              <Card className="relative bg-white/5 border-white/10 rounded-3xl overflow-hidden">
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-warning to-orange-400 flex items-center justify-center">
                      <Award className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Reward Calculator</h3>
                      <p className="text-sm text-white/50">See your potential earnings</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="p-6 rounded-2xl bg-white/5">
                      <p className="text-sm text-white/50 mb-2">Average per referral</p>
                      <p className="text-4xl font-bold text-warning">₹10,000</p>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      {[5, 10, 20].map((num) => (
                        <div key={num} className="p-4 rounded-xl bg-white/5 text-center">
                          <p className="text-2xl font-bold text-white">{num}</p>
                          <p className="text-xs text-white/50">referrals</p>
                          <p className="text-lg font-bold text-success mt-2">₹{(num * 10000).toLocaleString()}</p>
                        </div>
                      ))}
                    </div>
                    <p className="text-center text-sm text-white/40">*Actual rewards vary by program</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 relative">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="bg-success/20 text-success border-0 px-4 py-2 mb-4 rounded-full">Success Stories</Badge>
            <h2 className="text-4xl lg:text-5xl font-bold mb-4">What Referrers Say</h2>
            <p className="text-xl text-white/50">Real people, real earnings</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, index) => (
              <Card key={t.name} className="bg-white/5 border-white/10 rounded-3xl overflow-hidden hover:border-white/20 transition-all group">
                <CardContent className="p-8">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-warning text-warning" />
                    ))}
                  </div>
                  <p className="text-lg text-white/80 mb-6 leading-relaxed">"{t.quote}"</p>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center font-bold">
                      {t.avatar}
                    </div>
                    <div>
                      <p className="font-semibold">{t.name}</p>
                      <p className="text-sm text-white/50">{t.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Referral Form */}
      <section id="referral-form" className="py-24 relative">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <Card className="bg-white/5 border-white/10 rounded-3xl overflow-hidden">
            <CardContent className="p-8 lg:p-12">
              <div className="text-center mb-10">
                <Badge className="bg-primary/20 text-primary border-0 px-4 py-2 mb-4 rounded-full">Get Started</Badge>
                <h2 className="text-3xl lg:text-4xl font-bold mb-4">Submit Your Referral</h2>
                <p className="text-white/50">Fill in the details below to start earning</p>
              </div>

              {/* Progress Steps */}
              <div className="flex items-center justify-center gap-4 mb-10">
                {[1, 2, 3].map((step) => (
                  <div key={step} className="flex items-center gap-2">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                      formStep >= step 
                        ? 'bg-gradient-to-br from-primary to-cyan-400 text-white' 
                        : 'bg-white/10 text-white/50'
                    }`}>
                      {formStep > step ? <CheckCircle className="w-5 h-5" /> : step}
                    </div>
                    {step < 3 && <div className={`w-12 h-1 rounded-full ${formStep > step ? 'bg-primary' : 'bg-white/10'}`} />}
                  </div>
                ))}
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {formStep === 1 && (
                  <div className="space-y-4 animate-fade-in">
                    <h3 className="text-xl font-semibold mb-4">Your Details (Referrer)</h3>
                    <div>
                      <Label className="text-white/70">Full Name</Label>
                      <Input id="referrerName" placeholder="Enter your name" className="mt-2 bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-xl h-12" />
                      {formErrors.referrerName && <p className="text-destructive text-sm mt-1">{formErrors.referrerName}</p>}
                    </div>
                    <div>
                      <Label className="text-white/70">Phone Number</Label>
                      <Input id="referrerPhone" placeholder="+91 XXXXX XXXXX" className="mt-2 bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-xl h-12" />
                      {formErrors.referrerPhone && <p className="text-destructive text-sm mt-1">{formErrors.referrerPhone}</p>}
                    </div>
                    <div>
                      <Label className="text-white/70">Email Address</Label>
                      <Input id="referrerEmail" type="email" placeholder="you@email.com" className="mt-2 bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-xl h-12" />
                      {formErrors.referrerEmail && <p className="text-destructive text-sm mt-1">{formErrors.referrerEmail}</p>}
                    </div>
                    <Button 
                      type="button"
                      onClick={() => validateForm(1) && setFormStep(2)}
                      className="w-full bg-gradient-to-r from-primary to-cyan-400 hover:opacity-90 rounded-xl h-12 text-lg"
                    >
                      Continue <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </div>
                )}

                {formStep === 2 && (
                  <div className="space-y-4 animate-fade-in">
                    <h3 className="text-xl font-semibold mb-4">Student Details (Referee)</h3>
                    <div>
                      <Label className="text-white/70">Student Name</Label>
                      <Input id="refereeName" placeholder="Enter student name" className="mt-2 bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-xl h-12" />
                      {formErrors.refereeName && <p className="text-destructive text-sm mt-1">{formErrors.refereeName}</p>}
                    </div>
                    <div>
                      <Label className="text-white/70">Student Phone</Label>
                      <Input id="refereePhone" placeholder="+91 XXXXX XXXXX" className="mt-2 bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-xl h-12" />
                      {formErrors.refereePhone && <p className="text-destructive text-sm mt-1">{formErrors.refereePhone}</p>}
                    </div>
                    <div>
                      <Label className="text-white/70">Student Email</Label>
                      <Input id="refereeEmail" type="email" placeholder="student@email.com" className="mt-2 bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-xl h-12" />
                      {formErrors.refereeEmail && <p className="text-destructive text-sm mt-1">{formErrors.refereeEmail}</p>}
                    </div>
                    <div className="flex gap-4">
                      <Button type="button" variant="outline" onClick={() => setFormStep(1)} className="flex-1 border-white/20 text-white hover:bg-white/10 rounded-xl h-12">
                        Back
                      </Button>
                      <Button 
                        type="button"
                        onClick={() => validateForm(2) && setFormStep(3)}
                        className="flex-1 bg-gradient-to-r from-primary to-cyan-400 hover:opacity-90 rounded-xl h-12"
                      >
                        Continue <ArrowRight className="w-5 h-5 ml-2" />
                      </Button>
                    </div>
                  </div>
                )}

                {formStep === 3 && (
                  <div className="space-y-4 animate-fade-in">
                    <h3 className="text-xl font-semibold mb-4">Select Program</h3>
                    <div>
                      <Label className="text-white/70">University</Label>
                      <Select value={selectedUniversity} onValueChange={setSelectedUniversity}>
                        <SelectTrigger className="mt-2 bg-white/5 border-white/10 text-white rounded-xl h-12">
                          <SelectValue placeholder="Select university" />
                        </SelectTrigger>
                        <SelectContent>
                          {universities.filter(u => u.status === 'active').map((u) => (
                            <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {selectedUniversity && (
                      <div>
                        <Label className="text-white/70">Program</Label>
                        <Select>
                          <SelectTrigger className="mt-2 bg-white/5 border-white/10 text-white rounded-xl h-12">
                            <SelectValue placeholder="Select program" />
                          </SelectTrigger>
                          <SelectContent>
                            {filteredPrograms.map((p) => (
                              <SelectItem key={p.id} value={p.id}>
                                {p.name} - ₹{p.rewardAmount.toLocaleString()} reward
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    <div className="flex gap-4 pt-4">
                      <Button type="button" variant="outline" onClick={() => setFormStep(2)} className="flex-1 border-white/20 text-white hover:bg-white/10 rounded-xl h-12">
                        Back
                      </Button>
                      <Button 
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 bg-gradient-to-r from-success to-emerald-400 hover:opacity-90 rounded-xl h-12"
                      >
                        {isSubmitting ? 'Submitting...' : 'Submit Referral'}
                      </Button>
                    </div>
                  </div>
                )}

                {formStep === 4 && (
                  <div className="text-center py-8 animate-fade-in">
                    <div className="w-20 h-20 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-6">
                      <CheckCircle className="w-10 h-10 text-success" />
                    </div>
                    <h3 className="text-2xl font-bold mb-2">Referral Submitted!</h3>
                    <p className="text-white/50 mb-6">Your referral code:</p>
                    <div className="bg-white/10 rounded-xl p-4 mb-6">
                      <p className="text-3xl font-mono font-bold text-primary">{submittedCode}</p>
                    </div>
                    <p className="text-sm text-white/50 mb-6">Save this code to track your referral status</p>
                    <Button onClick={() => { setFormStep(1); setSubmittedCode(''); }} variant="outline" className="border-white/20 text-white hover:bg-white/10 rounded-xl">
                      Submit Another Referral
                    </Button>
                  </div>
                )}
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 relative">
        <div className="max-w-3xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="bg-warning/20 text-warning border-0 px-4 py-2 mb-4 rounded-full">FAQ</Badge>
            <h2 className="text-4xl lg:text-5xl font-bold mb-4">Common Questions</h2>
          </div>

          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="bg-white/5 border border-white/10 rounded-2xl px-6 overflow-hidden">
                <AccordionTrigger className="text-left font-semibold hover:no-underline py-6">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-white/60 pb-6">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 relative">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <div className="relative p-12 rounded-3xl bg-gradient-to-br from-primary/20 to-accent/20 border border-white/10 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10" />
            <div className="relative">
              <h2 className="text-4xl lg:text-5xl font-bold mb-4">Ready to Start Earning?</h2>
              <p className="text-xl text-white/60 mb-8 max-w-2xl mx-auto">
                Join thousands of referrers who are already earning rewards by helping students find their dream universities.
              </p>
              <Button 
                size="lg" 
                onClick={() => scrollToSection('referral-form')}
                className="bg-white text-black hover:bg-white/90 rounded-full px-10 py-6 text-lg shadow-xl"
              >
                Get Started Now <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-cyan-400 flex items-center justify-center">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <span className="font-bold text-xl">TeamLease EdTech</span>
                  <p className="text-xs text-white/50">Referral Platform</p>
                </div>
              </div>
              <p className="text-white/50 max-w-md mb-6">
                Empowering education through referrals. Connect students with top universities and earn rewards.
              </p>
              <div className="flex gap-4">
                {[Linkedin, Twitter, Mail].map((Icon, i) => (
                  <a key={i} href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
                    <Icon className="w-5 h-5 text-white/70" />
                  </a>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <div className="space-y-3">
                {['How It Works', 'Features', 'Testimonials', 'FAQ'].map((link) => (
                  <button key={link} onClick={() => scrollToSection(link.toLowerCase().replace(' ', '-'))} className="block text-white/50 hover:text-white transition-colors text-sm">
                    {link}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <div className="space-y-3 text-sm text-white/50">
                <p className="flex items-center gap-2"><Mail className="w-4 h-4" /> edtech@teamlease.com</p>
                <p className="flex items-center gap-2"><Phone className="w-4 h-4" /> +91 1800 123 4567</p>
                <p className="flex items-center gap-2"><MapPin className="w-4 h-4" /> Bangalore, India</p>
              </div>
            </div>
          </div>
          <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-white/40">© 2024 TeamLease EdTech. All rights reserved.</p>
            <div className="flex gap-6 text-sm text-white/40">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicPortal;

