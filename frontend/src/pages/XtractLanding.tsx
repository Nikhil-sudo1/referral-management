import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  GraduationCap, ArrowRight, CheckCircle, Zap, Bot, Sparkles,
  TrendingUp, Clock, Users, Shield, BarChart3, Rocket,
  ChevronDown, ChevronUp, Mail, Phone, Linkedin, Twitter,
  Facebook, Instagram, Play, Code, Brain, Target, Star
} from 'lucide-react';
import { cn } from '@/lib/utils';

const XtractLanding = () => {
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95]);

  const testimonials = [
    {
      name: "James Carter",
      role: "CEO at TechFlow Solutions",
      text: "AI automation transformed our operations by eliminating repetitive tasks and improving efficiency. Scaling our workflow has never been easier!",
      avatar: "JC"
    },
    {
      name: "Sophia Martinez",
      role: "Operations Manager at NexaCorp",
      text: "With AI, we cut manual work and improved accuracy. Our team now focuses on high-impact tasks while automation handles the rest!",
      avatar: "SM"
    },
    {
      name: "David Reynolds",
      role: "Head of Sales at GrowthPeak",
      text: "AI-driven insights doubled our sales efficiency. We now engage leads at the right time with smarter, data-backed decisions!",
      avatar: "DR"
    },
    {
      name: "Emily Wong",
      role: "Customer Success Lead at SupportHive",
      text: "Customer support is now seamless. Our response time improved drastically, and satisfaction levels are at an all-time high!",
      avatar: "EW"
    }
  ];

  const faqs = [
    {
      question: "How can AI automation help my business?",
      answer: "AI automation streamlines repetitive tasks, reduces errors, and frees up your team to focus on strategic work. It can handle data entry, customer support, lead generation, and much more."
    },
    {
      question: "Is AI automation difficult to integrate?",
      answer: "Not at all! Our team handles the entire integration process. We work with your existing systems and ensure a smooth transition with minimal disruption to your operations."
    },
    {
      question: "What industries can benefit from AI automation?",
      answer: "AI automation benefits virtually every industry - from healthcare and finance to retail and manufacturing. Any business with repetitive tasks can see significant improvements."
    },
    {
      question: "Do I need technical knowledge to use AI automation?",
      answer: "No technical knowledge required! Our AI solutions are designed to be user-friendly. We provide training and ongoing support to ensure your team can use the tools effectively."
    },
    {
      question: "What kind of support do you offer?",
      answer: "We offer comprehensive support including setup assistance, training sessions, 24/7 technical support, and regular check-ins to ensure your AI automation is performing optimally."
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Animated Navbar */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/95 backdrop-blur-xl supports-[backdrop-filter]:bg-background/80"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center space-x-2 cursor-pointer"
            >
              <div className="relative">
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 bg-gradient-to-r from-primary to-info opacity-20 blur-xl"
                />
                <GraduationCap className="h-8 w-8 text-primary relative z-10" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-info bg-clip-text text-transparent">
                TeamLease EdTech
              </span>
            </motion.div>
            <div className="hidden md:flex items-center space-x-6">
              {['Home', 'About', 'Services', 'Pricing', 'Contact'].map((item, index) => (
                <motion.a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.1, color: 'hsl(var(--primary))' }}
                  className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                >
                  {item}
                </motion.a>
              ))}
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link to="/signup">
                  <Button className="bg-gradient-to-r from-primary to-info hover:from-primary/90 hover:to-info/90">
                    Get Started
                  </Button>
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section with Parallax */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 -z-10">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute top-0 left-1/4 w-96 h-96 bg-primary rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1
            }}
            className="absolute bottom-0 right-1/4 w-96 h-96 bg-info rounded-full blur-3xl"
          />
        </div>

        <motion.div
          style={{ opacity, scale }}
          className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10"
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-6"
          >
            <Badge className="bg-primary/10 text-primary border-primary/20 px-4 py-1">
              <Sparkles className="h-3 w-3 mr-2 inline" />
              New: Intelligent Automation Platform
            </Badge>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight"
          >
            Intelligent Automation
            <br />
            <span className="bg-gradient-to-r from-primary via-info to-accent bg-clip-text text-transparent animate-gradient">
              for Modern Businesses
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto"
          >
            TeamLease EdTech brings AI automation to your fingertips & streamline tasks.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button size="lg" className="bg-gradient-to-r from-primary to-info hover:from-primary/90 hover:to-info/90 text-lg px-8">
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button size="lg" variant="outline" className="text-lg px-8">
                <Play className="mr-2 h-5 w-5" />
                Watch Demo
              </Button>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1 }}
            className="mt-12 flex items-center justify-center gap-8 text-sm text-muted-foreground"
          >
            {['50+ Businesses Trust Us', '99.9% Uptime', '24/7 Support'].map((item, index) => (
              <motion.div
                key={item}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1 + index * 0.1 }}
                className="flex items-center gap-2"
              >
                <CheckCircle className="h-5 w-5 text-success" />
                <span>{item}</span>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="flex flex-col items-center gap-2 text-muted-foreground"
          >
            <span className="text-sm">Scroll to explore</span>
            <ChevronDown className="h-5 w-5" />
          </motion.div>
        </motion.div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 relative">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">
              AI Solutions That Take Your Business to the Next Level
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              We design, develop, and implement automation tools that help you work smarter, not harder
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Bot,
                title: "Workflow Automation",
                description: "Automate repetitive tasks and streamline internal operations",
                color: "from-primary to-info"
              },
              {
                icon: Brain,
                title: "AI Assistant",
                description: "Delegate daily tasks with intelligent AI assistants",
                color: "from-info to-accent"
              },
              {
                icon: TrendingUp,
                title: "Sales & Marketing",
                description: "Accelerate sales growth with AI-powered tools",
                color: "from-accent to-primary"
              },
              {
                icon: Code,
                title: "Custom Projects",
                description: "Build smarter systems tailored to your needs",
                color: "from-primary to-accent"
              }
            ].map((service, index) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -10, scale: 1.02 }}
                className="group"
              >
                <Card className="h-full border-2 hover:border-primary/50 transition-all duration-300 cursor-pointer">
                  <CardContent className="p-6">
                    <motion.div
                      whileHover={{ rotate: [0, -10, 10, 0] }}
                      transition={{ duration: 0.5 }}
                      className={cn(
                        "w-14 h-14 rounded-xl bg-gradient-to-r mb-4 flex items-center justify-center",
                        service.color
                      )}
                    >
                      <service.icon className="h-7 w-7 text-white" />
                    </motion.div>
                    <h3 className="text-xl font-bold mb-2">{service.title}</h3>
                    <p className="text-muted-foreground">{service.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Task Management Demo */}
      <section className="py-20 bg-card/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto"
          >
            <Card className="border-2 border-primary/20">
              <CardContent className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold">All Tasks</h3>
                  <Badge variant="outline">Waiting for approval</Badge>
                </div>
                <div className="space-y-4">
                  {[
                    { name: "Payroll management", status: "Due on 2nd july", progress: null },
                    { name: "Employee Tracking", status: "2 days ago", progress: null },
                    { name: "Social media post", status: "Cancelled by user", progress: null },
                    { name: "Lead list", status: "70% prepared", progress: 70 },
                    { name: "Payment reminder", status: "sent to selected clients", progress: null }
                  ].map((task, index) => (
                    <motion.div
                      key={task.name}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ x: 10 }}
                      className="flex items-center justify-between p-4 rounded-lg border border-border hover:border-primary/50 transition-all cursor-pointer group"
                    >
                      <div className="flex items-center gap-3">
                        <motion.div
                          whileHover={{ scale: 1.2 }}
                          className="w-2 h-2 rounded-full bg-primary"
                        />
                        <div>
                          <p className="font-medium group-hover:text-primary transition-colors">{task.name}</p>
                          <p className="text-sm text-muted-foreground">{task.status}</p>
                        </div>
                      </div>
                      {task.progress && (
                        <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            whileInView={{ width: `${task.progress}%` }}
                            viewport={{ once: true }}
                            transition={{ duration: 1, delay: index * 0.2 }}
                            className="h-full bg-gradient-to-r from-primary to-info"
                          />
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Process Section */}
      <section id="process" className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">Our Simple, Smart, and Scalable Process</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              We design, develop, and implement automation tools that help you work smarter, not harder
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                step: "1",
                title: "Smart Analyzing",
                description: "We assess your needs and identify AI solutions to streamline workflows",
                icon: Target
              },
              {
                step: "2",
                title: "AI Development",
                description: "Our team builds intelligent automation systems tailored to your business",
                icon: Code
              },
              {
                step: "3",
                title: "Implementation",
                description: "We deploy and integrate solutions seamlessly into your existing systems",
                icon: Rocket
              }
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                whileHover={{ scale: 1.05 }}
                className="text-center"
              >
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                  className="w-20 h-20 rounded-full bg-gradient-to-r from-primary to-info mx-auto mb-6 flex items-center justify-center text-3xl font-bold text-white shadow-lg"
                >
                  {item.step}
                </motion.div>
                <h3 className="text-2xl font-bold mb-4">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-card/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">The Best AI Automation, at the Right Price</h2>
            <p className="text-xl text-muted-foreground">Choose a plan that fits your business needs</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                name: "Starter",
                price: "$37",
                popular: false,
                features: [
                  "Basic workflow automation",
                  "AI-powered personal assistant",
                  "Standard analytics & reporting",
                  "Email & chat support",
                  "Up to 3 AI integrations"
                ]
              },
              {
                name: "Professional",
                price: "$75",
                popular: true,
                features: [
                  "Advanced workflow automation",
                  "AI-driven sales & marketing tools",
                  "Enhanced data analytics & insights",
                  "Priority customer support",
                  "Up to 10 AI integrations"
                ]
              },
              {
                name: "Enterprise",
                price: "Custom",
                popular: false,
                features: [
                  "Fully customizable AI automation",
                  "Dedicated AI business consultant",
                  "Enterprise-grade compliance",
                  "24/7 VIP support",
                  "Unlimited AI integrations"
                ]
              }
            ].map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -10, scale: 1.02 }}
                className={cn(
                  "relative",
                  plan.popular && "md:-mt-4 md:mb-4"
                )}
              >
                {plan.popular && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="absolute -top-4 left-1/2 -translate-x-1/2"
                  >
                    <Badge className="bg-gradient-to-r from-primary to-info text-white px-4 py-1">
                      Popular
                    </Badge>
                  </motion.div>
                )}
                <Card className={cn(
                  "h-full border-2 transition-all",
                  plan.popular ? "border-primary shadow-xl" : "border-border hover:border-primary/50"
                )}>
                  <CardContent className="p-8">
                    <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                    <div className="mb-6">
                      <span className="text-4xl font-bold">{plan.price}</span>
                      {plan.price !== "Custom" && <span className="text-muted-foreground">/month</span>}
                    </div>
                    <ul className="space-y-3 mb-8">
                      {plan.features.map((feature, idx) => (
                        <motion.li
                          key={idx}
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: index * 0.1 + idx * 0.05 }}
                          className="flex items-start gap-2"
                        >
                          <CheckCircle className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{feature}</span>
                        </motion.li>
                      ))}
                    </ul>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        className={cn(
                          "w-full",
                          plan.popular && "bg-gradient-to-r from-primary to-info hover:from-primary/90 hover:to-info/90"
                        )}
                        variant={plan.popular ? "default" : "outline"}
                      >
                        {plan.price === "Custom" ? "Schedule a call" : "Choose this plan"}
                      </Button>
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">Why Businesses Love Our AI Solutions</h2>
            <p className="text-xl text-muted-foreground">Real businesses, real results with AI automation</p>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTestimonial}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="border-2 border-primary/20">
                  <CardContent className="p-8">
                    <div className="flex items-start gap-4">
                      <motion.div
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        className="w-16 h-16 rounded-full bg-gradient-to-r from-primary to-info flex items-center justify-center text-white font-bold text-xl"
                      >
                        {testimonials[activeTestimonial].avatar}
                      </motion.div>
                      <div className="flex-1">
                        <div className="flex gap-1 mb-4">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="h-5 w-5 fill-warning text-warning" />
                          ))}
                        </div>
                        <p className="text-lg mb-4 italic">"{testimonials[activeTestimonial].text}"</p>
                        <div>
                          <p className="font-bold">{testimonials[activeTestimonial].name}</p>
                          <p className="text-sm text-muted-foreground">{testimonials[activeTestimonial].role}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </AnimatePresence>

            <div className="flex justify-center gap-2 mt-8">
              {testimonials.map((_, index) => (
                <motion.button
                  key={index}
                  onClick={() => setActiveTestimonial(index)}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  className={cn(
                    "w-2 h-2 rounded-full transition-all",
                    index === activeTestimonial ? "bg-primary w-8" : "bg-muted"
                  )}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-card/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">We've Got the Answers You're Looking For</h2>
            <p className="text-xl text-muted-foreground">Quick answers to your AI automation questions</p>
          </motion.div>

          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="border-2 border-border hover:border-primary/50 transition-all cursor-pointer">
                  <CardContent
                    className="p-6"
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold">{faq.question}</h3>
                      <motion.div
                        animate={{ rotate: openFaq === index ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <ChevronDown className="h-5 w-5 text-muted-foreground" />
                      </motion.div>
                    </div>
                    <AnimatePresence>
                      {openFaq === index && (
                        <motion.p
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="mt-4 text-muted-foreground overflow-hidden"
                        >
                          {faq.answer}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-info/10 to-accent/10" />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10"
        >
          <h2 className="text-4xl font-bold mb-4">Let AI do the Work so you can Scale Faster</h2>
          <p className="text-xl text-muted-foreground mb-8">Book a Call Today and Start Automating</p>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button size="lg" className="bg-gradient-to-r from-primary to-info hover:from-primary/90 hover:to-info/90 text-lg px-8">
              Book a free call
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <GraduationCap className="h-6 w-6 text-primary" />
                <span className="font-bold">TeamLease EdTech</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Automate Smarter, Optimize Faster, and Grow Stronger.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {['Workflow Automation', 'AI Assistant', 'Sales & Marketing', 'Custom Projects'].map((item) => (
                  <li key={item}>
                    <a href="#services" className="hover:text-primary transition-colors">{item}</a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {['Home', 'About', 'Blog', 'Contact'].map((item) => (
                  <li key={item}>
                    <a href={`#${item.toLowerCase()}`} className="hover:text-primary transition-colors">{item}</a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Socials</h4>
              <div className="flex gap-4">
                {[
                  { icon: Linkedin, href: "#" },
                  { icon: Twitter, href: "#" },
                  { icon: Facebook, href: "#" },
                  { icon: Instagram, href: "#" }
                ].map((social, index) => (
                  <motion.a
                    key={index}
                    href={social.href}
                    whileHover={{ scale: 1.2, rotate: 5 }}
                    whileTap={{ scale: 0.9 }}
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    <social.icon className="h-5 w-5" />
                  </motion.a>
                ))}
              </div>
            </div>
          </div>
          <div className="border-t pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2025 TeamLease EdTech. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default XtractLanding;
