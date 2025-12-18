import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { LeaderboardCard } from '@/components/dashboard/LeaderboardCard';
import { ReferralChart } from '@/components/dashboard/ReferralChart';
import { RecentReferrals } from '@/components/dashboard/RecentReferrals';
import { UniversityPieChart } from '@/components/dashboard/UniversityPieChart';
import { ActivityTimeline } from '@/components/dashboard/ActivityTimeline';
import { dashboardStats, leaderboard, referrals } from '@/data/mockData';
import { FileText, Users, Award, Building2, TrendingUp, Clock, Plus, BarChart3, Target, CheckCircle, ArrowUpRight, Zap } from 'lucide-react';
import { AnimatedCounter } from '@/components/ui/animated-counter';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { analyticsAPI, leaderboardAPI, referralsAPI } from '@/lib/api';
import { SkeletonCard } from '@/components/dashboard/SkeletonCard';
import { motion } from 'framer-motion';

const Dashboard = () => {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
  const currentDate = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  
  // State for API data
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [referrerLeaderboard, setReferrerLeaderboard] = useState<any[]>([]);
  const [recentReferrals, setRecentReferrals] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Calculate pending tasks from actual data
  const pendingReferrals = dashboardData?.dashboard_stats?.pending_referrals || 0;

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        console.log('Fetching dashboard data...');
        // Fetch all dashboard data in parallel - use fast endpoints
        const [stats, referrerLB, referralsData] = await Promise.all([
          analyticsAPI.getDashboardStats(), // Fast endpoint - just stats
          leaderboardAPI.getReferrerLeaderboard({ limit: 5 }),
          referralsAPI.getReferrals({ page: 1, limit: 5 }),
        ]);

        console.log('Dashboard stats received:', stats);
        console.log('Referrer leaderboard:', referrerLB.entries?.length || 0, 'entries');
        console.log('Recent referrals:', referralsData.items?.length || 0, 'items');

        // Wrap stats in analytics response format for compatibility
        setDashboardData({ dashboard_stats: stats });
        setReferrerLeaderboard(referrerLB.entries || []);
        setRecentReferrals(referralsData.items || []);
        console.log('Dashboard loaded successfully');
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        // Keep using mock data as fallback
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const stats = dashboardData?.dashboard_stats || dashboardStats;
  
  const statsCards = [
    {
      label: 'Total Referrals',
      value: stats.total_referrals || stats.totalReferrals || 0,
      suffix: '',
      change: stats.monthly_referrals ? `+${stats.monthly_referrals} this month` : '+12%',
      changeType: 'positive',
      icon: FileText,
      gradient: 'from-primary to-info',
      path: '/referrals',
    },
    {
      label: 'Pending',
      value: stats.pending_referrals || stats.pendingAssignment || 0,
      suffix: '',
      change: 'Action needed',
      changeType: 'warning',
      icon: Clock,
      gradient: 'from-warning to-orange-500',
      path: '/referrals',
    },
    {
      label: 'Admissions',
      value: stats.total_admissions || stats.totalAdmissions || 0,
      suffix: '',
      change: stats.monthly_admissions ? `+${stats.monthly_admissions} this month` : '+8%',
      changeType: 'positive',
      icon: Users,
      gradient: 'from-success to-emerald-500',
      path: '/referrals',
    },
    {
      label: 'Conversion',
      value: Math.round((stats.conversion_rate || stats.conversionRate || 0) * 100) / 100,
      suffix: '%',
      change: '+2.3%',
      changeType: 'positive',
      icon: Target,
      gradient: 'from-accent to-purple-500',
      path: '/analytics',
    },
    {
      label: 'Rewards',
      value: Math.floor((stats.total_rewards || stats.totalRewards || 0) / 1000),
      prefix: '₹',
      suffix: 'k',
      change: stats.monthly_rewards ? `+₹${Math.floor(stats.monthly_rewards / 1000)}k this month` : 'This quarter',
      changeType: 'neutral',
      icon: Award,
      gradient: 'from-warning to-amber-500',
      path: '/rewards',
    },
    {
      label: 'Universities',
      value: stats.active_universities || stats.activeUniversities || 0,
      suffix: '',
      change: 'All active',
      changeType: 'positive',
      icon: Building2,
      gradient: 'from-info to-cyan-500',
      path: '/universities',
    },
  ];

  return (
    <DashboardLayout>
      <motion.div 
        className="space-y-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <motion.div 
          className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="space-y-2">
            <div className="flex items-center gap-4">
              <motion.div 
                className="relative"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
              >
                <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center shadow-xl glow-primary">
                  <BarChart3 className="w-7 h-7 text-white" />
                </div>
                <Badge className="absolute -top-2 -right-2 h-6 px-2 bg-success text-white border-2 border-background text-[10px] font-bold animate-pulse-soft">
                  LIVE
                </Badge>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <h1 className="text-4xl font-display text-foreground">
                  Dashboard
                </h1>
                <p className="text-muted-foreground mt-1">Welcome to TeamLease EdTech Platform</p>
              </motion.div>
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground mt-4">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50">
                <Clock className="w-4 h-4" />
                <span>{currentDate}</span>
              </div>
              <div className="px-3 py-1.5 rounded-full bg-primary/10 text-primary font-mono font-semibold">
                {currentTime}
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <Card 
              className="card-interactive border-dashed border-2 bg-transparent hover:bg-muted/50"
              onClick={() => navigate('/referrals')}
            >
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-warning" />
                </div>
                <div>
                  <p className="text-sm font-semibold">{pendingReferrals} Tasks</p>
                  <p className="text-xs text-muted-foreground">Need attention</p>
                </div>
              </CardContent>
            </Card>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                size="lg"
                className="gradient-primary text-white shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all h-auto py-4 px-6"
                onClick={() => navigate('/referees/add')}
              >
                <Plus className="w-5 h-5 mr-2" />
                New Referral
              </Button>
            </motion.div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : (
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.08, delayChildren: 0.2 }
              }
            }}
          >
            {statsCards.map((stat, index) => (
            <motion.div
              key={stat.label}
              variants={{
                hidden: { opacity: 0, y: 20, scale: 0.95 },
                visible: { 
                  opacity: 1, 
                  y: 0, 
                  scale: 1,
                  transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] }
                }
              }}
              whileHover={{ y: -5, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
            <Card 
              className="card-interactive group overflow-hidden cursor-pointer h-full"
              onClick={() => navigate(stat.path)}
            >
              <CardContent className="p-5 relative">
                {/* Background gradient on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
                
                <div className="relative">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:shadow-xl transition-all duration-300`}>
                      <stat.icon className="w-5 h-5 text-white" />
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all -translate-x-1 group-hover:translate-x-0" />
                  </div>
                  
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                    {stat.label}
                  </p>
                  
                  <p className="text-2xl font-display text-foreground">
                    {stat.prefix}
                    <AnimatedCounter end={stat.value} duration={2000} />
                    {stat.suffix}
                  </p>
                  
                  <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${
                    stat.changeType === 'positive' ? 'text-success' : 
                    stat.changeType === 'warning' ? 'text-warning' : 
                    'text-muted-foreground'
                  }`}>
                    {stat.changeType === 'positive' && <TrendingUp className="w-3 h-3" />}
                    {stat.changeType === 'warning' && <Clock className="w-3 h-3" />}
                    {stat.changeType === 'positive' && <CheckCircle className="w-3 h-3" />}
                    <span>{stat.change}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            </motion.div>
            ))}
          </motion.div>
        )}

        {/* Charts Row */}
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="lg:col-span-2">
            <ReferralChart data={dashboardData?.time_series} />
          </div>
          <UniversityPieChart data={dashboardData?.university_performance} />
        </motion.div>

        {/* Leaderboards & Activity */}
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <LeaderboardCard title="Top Referees" entries={referrerLeaderboard.length > 0 ? referrerLeaderboard : leaderboard} />
          <ActivityTimeline />
        </motion.div>

        {/* Recent Referrals */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <RecentReferrals referrals={recentReferrals.length > 0 ? recentReferrals : referrals} />
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
};

export default Dashboard;
