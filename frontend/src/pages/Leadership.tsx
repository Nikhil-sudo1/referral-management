import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  GraduationCap, Moon, Sun, ArrowLeft, ArrowRight,
  Lightbulb, Target, Users, Award, BookOpen, Rocket,
  Linkedin, Twitter, Quote, Building2, Briefcase, Globe
} from 'lucide-react';

const Leadership = () => {
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

  // Helper function to get image with fallback
  const getLeaderImage = (name: string, localPath: string, gradient: string) => {
    // Check if local image exists by trying to load it
    // Fallback to professional placeholder
    const initials = name.split(' ').map(n => n[0]).join('');
    const colors: { [key: string]: { bg: string; fg: string } } = {
      'from-primary to-cyan-500': { bg: '6366f1', fg: 'ffffff' },
      'from-violet-500 to-purple-500': { bg: '8b5cf6', fg: 'ffffff' },
      'from-emerald-500 to-teal-500': { bg: '10b981', fg: 'ffffff' },
    };
    const color = colors[gradient] || { bg: '6366f1', fg: 'ffffff' };
    return {
      src: localPath,
      fallback: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=500&background=${color.bg}&color=${color.fg}&bold=true&font-size=0.35`
    };
  };

  const leaders = [
    {
      name: 'Shantanu Rooj',
      role: 'Founder & CEO',
      image: getLeaderImage('Shantanu Rooj', '/images/leadership/shantanu-rooj.png', 'from-primary to-cyan-500'),
      gradient: 'from-primary to-cyan-500',
      badges: ['IIT BHU', 'IIM Calcutta', 'Serial Entrepreneur'],
      quote: "Making Every Learner Employable",
      vision: `With a vision of Making India Employable, Shantanu founded TeamLease EdTech in 2012. He is a passionate business strategy professional and a featured columnist, speaking extensively about University 4.0 - the Future of Higher Education.`,
      bio: `Shantanu is the Founder & CEO of TeamLease EdTech. In his current role, he oversees strategic operations, P&L management, special projects, and is responsible for managing the growth trajectory of the organization.

An IIT (BHU) and IIM Calcutta alumnus, Shantanu is widely recognized as a serial entrepreneur who has successfully led his ventures to successful IPOs/Acquisitions. Post his 3-year stint with HCL, Shantanu took his first step into entrepreneurship with Paradyne Infotech Ltd which had a successful IPO in 2005. Subsequently, he founded Broadllyne Technologies Limited, which swiftly evolved into a significant managed services player in the education industry. Broadllyne was acquired by a large, listed company in India in 2009.`,
      highlights: [
        { icon: Award, text: 'Multiple Successful IPOs & Acquisitions' },
        { icon: BookOpen, text: 'University 4.0 Thought Leader' },
        { icon: Building2, text: 'Founded TeamLease EdTech in 2012' },
        { icon: Target, text: 'Making India Employable Vision' },
      ],
      social: {
        linkedin: 'https://linkedin.com/in/shantanurooj',
        twitter: 'https://twitter.com/shantanurooj',
      }
    },
    {
      name: 'Jaideep Kewalramani',
      role: 'Chief Operating Officer',
      subtitle: 'Head of Employability Business',
      image: getLeaderImage('Jaideep Kewalramani', '/images/leadership/jaideep-kewalramani.png', 'from-violet-500 to-purple-500'),
      gradient: 'from-violet-500 to-purple-500',
      badges: ['Stanford Executive', 'AI Patents Holder', '25+ Years Experience'],
      quote: "Bridging Education with Employment through Innovation",
      vision: `Jaideep brings over 25 years of experience in leading and developing businesses across technology, outsourcing, digital and AI. His vision centers on leveraging cutting-edge technology to transform education into employability.`,
      bio: `Jaideep Kewalramani is the Chief Operating Officer and Head of Employability Business at TeamLease EdTech, where he is responsible for the Degree Apprenticeship Business and overall operations. He has managed multi-million dollar business portfolios, delivering impactful results for several Fortune 500 clients including Thomson Reuters, Zensar Technologies, Datamatics, Aptech-Hexaware and boutique firms like 5F World, Legasis.

He is an executive program graduate from Stanford University, MBA in International Business and BCA in Taxation from Mumbai University. His MBA school, SIMSR, recognized him as a distinguished alumni. Jaideep holds 4 patents in the Artificial Intelligence domain and has been recognized as an ecosystem contributor by IndiaAI (Govt of India Initiative). He is the founding member of UAVAI (Unmanned Autonomous Vehicles Association of India).`,
      highlights: [
        { icon: Award, text: '4 AI Patents & IndiaAI Recognition' },
        { icon: Globe, text: 'Fortune 500 Client Experience' },
        { icon: Rocket, text: 'Founding Member of UAVAI' },
        { icon: Briefcase, text: 'Multi-Million Dollar Portfolio Management' },
      ],
      social: {
        linkedin: 'https://linkedin.com/in/jaideepkewalramani',
        twitter: 'https://twitter.com/jaideepkew',
      }
    },
    {
      name: 'Anmol Mathur',
      role: 'Chief Technology Officer',
      subtitle: 'Head of Product & Innovation',
      image: getLeaderImage('Anmol Mathur', '/images/leadership/anmol-mathur.jfif', 'from-emerald-500 to-teal-500'),
      gradient: 'from-emerald-500 to-teal-500',
      badges: ['Tech Visionary', 'Product Innovator', 'Digital Transformer'],
      quote: "Building Technology that Empowers Every Student's Journey",
      vision: `Anmol leads the technology vision at TeamLease EdTech, driving digital innovation that makes quality education accessible and employment achievable for millions. His focus on scalable, user-centric platforms is transforming how students and institutions connect.`,
      bio: `Anmol Mathur serves as the Chief Technology Officer and Head of Product & Innovation at TeamLease EdTech. He spearheads the development of cutting-edge digital platforms that power the company's referral management, apprenticeship, and employability initiatives.

With a deep passion for leveraging technology to solve real-world problems, Anmol has been instrumental in building scalable systems that handle thousands of student referrals daily. His expertise spans full-stack development, cloud architecture, and AI-driven analytics, enabling TeamLease EdTech to deliver seamless experiences for students, universities, and referral partners alike.

Anmol's approach combines technical excellence with a human-centered design philosophy, ensuring that every product feature directly contributes to the mission of making learners employable. Under his leadership, the platform has achieved significant milestones in user engagement, process efficiency, and data-driven decision making.`,
      highlights: [
        { icon: Rocket, text: 'Scaled Platform to 50K+ Referrers' },
        { icon: Lightbulb, text: 'AI-Driven Analytics Implementation' },
        { icon: Users, text: 'Human-Centered Design Philosophy' },
        { icon: Target, text: 'Digital Transformation Leader' },
      ],
      social: {
        linkedin: 'https://linkedin.com/in/anmolmathur',
        twitter: 'https://twitter.com/anmolmathur',
      }
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' }
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300 overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Network Pattern */}
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

        {/* Floating Gradient Orbs */}
        <motion.div 
          className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-primary/25 to-cyan-500/25 dark:from-primary/15 dark:to-cyan-500/15 blur-[120px]"
          animate={{ x: [0, 40, 0], y: [0, -30, 0], scale: [1, 1.15, 1] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div 
          className="absolute top-1/2 -left-40 w-[450px] h-[450px] rounded-full bg-gradient-to-br from-violet-500/20 to-purple-500/20 dark:from-violet-500/12 dark:to-purple-500/12 blur-[120px]"
          animate={{ x: [0, 30, 0], y: [0, 40, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        />
        <motion.div 
          className="absolute -bottom-20 right-1/3 w-[400px] h-[400px] rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-500/20 dark:from-emerald-500/10 dark:to-teal-500/10 blur-[100px]"
          animate={{ x: [0, -30, 0], y: [0, 25, 0], scale: [1, 1.15, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
        />
      </div>

      {/* Navigation */}
      <motion.nav 
        className="fixed top-0 w-full z-50 bg-background/80 dark:bg-background/90 backdrop-blur-xl border-b border-border/50"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-lg gradient-primary flex items-center justify-center shadow-lg shadow-primary/25 group-hover:scale-110 transition-transform">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg">TeamLease</span>
          </Link>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-full hover:bg-primary/10 hover:text-primary transition-all"
            >
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </Button>
            <Link to="/">
              <Button variant="ghost" size="sm" className="hover:bg-primary/10 hover:text-primary transition-all">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back
              </Button>
            </Link>
            <Link to="/login">
              <Button size="sm" className="gradient-primary text-white rounded-full px-5 shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-105 transition-all">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-16 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Badge className="mb-6 bg-primary/10 text-primary border-primary/20 px-4 py-1.5 text-sm font-medium">
              <Users className="w-4 h-4 mr-2" />
              Our Leadership Team
            </Badge>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Visionaries Shaping the
              <span className="block bg-gradient-to-r from-primary via-violet-500 to-emerald-500 bg-clip-text text-transparent">
                Future of Education
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Meet the passionate leaders driving our mission to make every learner employable. 
              With decades of combined experience in education, technology, and business transformation, 
              our team is committed to revolutionizing how India learns and earns.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Leadership Cards */}
      <section className="relative py-16 px-6">
        <motion.div 
          className="max-w-6xl mx-auto space-y-24"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {leaders.map((leader, index) => (
            <motion.div
              key={leader.name}
              variants={cardVariants}
              className={`flex flex-col ${index % 2 === 1 ? 'lg:flex-row-reverse' : 'lg:flex-row'} gap-8 lg:gap-12 items-center`}
            >
              {/* Image Section */}
              <div className="w-full lg:w-2/5 relative group">
                <motion.div
                  className={`absolute -inset-4 bg-gradient-to-r ${leader.gradient} rounded-3xl opacity-20 blur-2xl group-hover:opacity-30 transition-opacity duration-500`}
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                />
                <div className="relative">
                  <div className={`absolute inset-0 bg-gradient-to-r ${leader.gradient} rounded-3xl transform rotate-3 group-hover:rotate-6 transition-transform duration-500`} />
                  <Card className="relative overflow-hidden rounded-3xl border-0 shadow-2xl">
                    <img 
                      src={leader.image.src} 
                      alt={leader.name}
                      className="w-full aspect-[4/5] object-cover object-top"
                      onError={(e) => {
                        // Fallback to placeholder with initials
                        const target = e.target as HTMLImageElement;
                        target.onerror = null;
                        target.src = leader.image.fallback;
                      }}
                    />
                    <div className={`absolute inset-0 bg-gradient-to-t ${leader.gradient} opacity-10`} />
                  </Card>
                </div>
                
                {/* Social Links */}
                <div className="flex justify-center gap-3 mt-6">
                  {leader.social.linkedin && (
                    <a 
                      href={leader.social.linkedin} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-3 rounded-full bg-card/80 backdrop-blur-sm border border-border/50 hover:bg-primary/10 hover:border-primary/50 hover:text-primary transition-all"
                    >
                      <Linkedin className="w-5 h-5" />
                    </a>
                  )}
                  {leader.social.twitter && (
                    <a 
                      href={leader.social.twitter} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-3 rounded-full bg-card/80 backdrop-blur-sm border border-border/50 hover:bg-primary/10 hover:border-primary/50 hover:text-primary transition-all"
                    >
                      <Twitter className="w-5 h-5" />
                    </a>
                  )}
                </div>
              </div>

              {/* Content Section */}
              <div className="w-full lg:w-3/5 space-y-6">
                {/* Badges */}
                <div className="flex flex-wrap gap-2">
                  {leader.badges.map((badge) => (
                    <Badge 
                      key={badge} 
                      variant="outline" 
                      className={`bg-gradient-to-r ${leader.gradient} bg-clip-text text-transparent border-current/30`}
                    >
                      {badge}
                    </Badge>
                  ))}
                </div>

                {/* Name & Role */}
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold mb-2">{leader.name}</h2>
                  <p className={`text-xl bg-gradient-to-r ${leader.gradient} bg-clip-text text-transparent font-semibold`}>
                    {leader.role}
                  </p>
                  {leader.subtitle && (
                    <p className="text-muted-foreground mt-1">{leader.subtitle}</p>
                  )}
                </div>

                {/* Quote */}
                <Card className="bg-card/50 backdrop-blur-sm border-border/50 overflow-hidden">
                  <CardContent className="p-6 relative">
                    <Quote className={`absolute top-4 left-4 w-8 h-8 text-primary/20`} />
                    <p className="text-lg md:text-xl font-medium italic pl-8 text-foreground/90">
                      "{leader.quote}"
                    </p>
                  </CardContent>
                </Card>

                {/* Vision */}
                <p className="text-muted-foreground leading-relaxed">
                  {leader.vision}
                </p>

                {/* Bio */}
                <p className="text-sm text-muted-foreground/80 leading-relaxed">
                  {leader.bio}
                </p>

                {/* Highlights */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4">
                  {leader.highlights.map((highlight, i) => (
                    <motion.div
                      key={i}
                      className="flex items-center gap-3 p-3 rounded-xl bg-card/50 backdrop-blur-sm border border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-all group"
                      whileHover={{ x: 5 }}
                    >
                      <div className={`p-2 rounded-lg bg-gradient-to-r ${leader.gradient} bg-opacity-10`}>
                        <highlight.icon className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-sm font-medium">{highlight.text}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Mission Section */}
      <section className="relative py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Our Collective Vision
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-8">
              Together, we're building a future where quality education is accessible to all, 
              where every student has a clear path to employment, and where the gap between 
              learning and earning is bridged through technology and innovation.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
              {[
                { icon: Target, title: 'Mission', desc: 'Making every learner employable through quality education and industry partnerships' },
                { icon: Lightbulb, title: 'Innovation', desc: 'Leveraging AI and technology to transform the education-to-employment journey' },
                { icon: Users, title: 'Impact', desc: '600K+ students impacted, 100+ university partners, 50K+ active referrers' },
              ].map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/30 transition-all h-full">
                    <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center mb-4 mx-auto">
                      <item.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-16 px-6">
        <motion.div 
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Card className="relative overflow-hidden border-0">
            <div className="absolute inset-0 gradient-primary opacity-90" />
            <CardContent className="relative p-8 md:p-12 text-center text-white">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                Join Our Mission
              </h2>
              <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
                Be part of India's largest education referral network. Help students find their dream universities 
                while earning rewards for every successful admission.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/login?tab=signup">
                  <Button size="lg" variant="secondary" className="rounded-full px-8 font-semibold shadow-xl hover:scale-105 transition-all">
                    Start Referring Today <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Link to="/">
                  <Button size="lg" variant="outline" className="rounded-full px-8 font-semibold bg-white/10 border-white/30 hover:bg-white/20 text-white">
                    Learn More
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative py-8 px-6 border-t border-border/50">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <GraduationCap className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold">TeamLease EdTech</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} TeamLease EdTech. Making India Employable.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Leadership;

