import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { LeaderboardCard } from '@/components/dashboard/LeaderboardCard';
import { ReferralChart } from '@/components/dashboard/ReferralChart';
import { RecentReferrals } from '@/components/dashboard/RecentReferrals';
import { UniversityPieChart } from '@/components/dashboard/UniversityPieChart';
import { ActivityTimeline } from '@/components/dashboard/ActivityTimeline';
import { dashboardStats, leaderboard, counselorLeaderboard } from '@/data/mockData';
import { FileText, Users, Award, Building2, TrendingUp, Clock, Sparkles, Zap } from 'lucide-react';
import { AnimatedCounter } from '@/components/ui/animated-counter';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const Dashboard = () => {
  const currentTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const currentDate = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header with Welcome Message */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
              <Badge className="gradient-primary text-primary-foreground border-0">
                <Sparkles className="w-3 h-3 mr-1" />
                Live
              </Badge>
            </div>
            <p className="text-muted-foreground">Welcome to TeamLease EdTech Referral Management Platform</p>
            <p className="text-sm text-muted-foreground mt-1">{currentDate} • {currentTime}</p>
          </div>
          <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/20">
                  <Zap className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-card-foreground">Quick Actions</p>
                  <p className="text-xs text-muted-foreground">12 tasks pending</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats Grid with Animated Counters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <Card className="relative overflow-hidden group hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/20 gradient-primary">
            <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent opacity-100 group-hover:opacity-90 transition-opacity" />
            <CardContent className="relative p-6">
              <div className="flex items-start justify-between">
                <div className="text-primary-foreground">
                  <p className="text-sm font-medium opacity-90">Total Referrals</p>
                  <p className="text-3xl font-bold mt-2">
                    <AnimatedCounter end={dashboardStats.totalReferrals} duration={2000} />
                  </p>
                  <p className="text-xs mt-2 opacity-80">+12% from last month</p>
                </div>
                <div className="p-3 rounded-xl bg-primary-foreground/20 backdrop-blur-sm">
                  <FileText className="w-6 h-6 text-primary-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-warning/20">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pending Assignment</p>
                  <p className="text-3xl font-bold mt-2 text-card-foreground">
                    <AnimatedCounter end={dashboardStats.pendingAssignment} duration={1500} />
                  </p>
                  <p className="text-xs mt-2 text-warning">Needs attention</p>
                </div>
                <div className="p-3 rounded-xl bg-warning/10">
                  <Clock className="w-6 h-6 text-warning" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden group hover:shadow-xl transition-all duration-300 border-2 hover:border-success/20 gradient-success">
            <div className="absolute inset-0 bg-gradient-to-r from-success to-emerald-500 opacity-100 group-hover:opacity-90 transition-opacity" />
            <CardContent className="relative p-6">
              <div className="flex items-start justify-between">
                <div className="text-success-foreground">
                  <p className="text-sm font-medium opacity-90">Total Admissions</p>
                  <p className="text-3xl font-bold mt-2">
                    <AnimatedCounter end={dashboardStats.totalAdmissions} duration={2000} />
                  </p>
                  <p className="text-xs mt-2 opacity-80">+8% from last month</p>
                </div>
                <div className="p-3 rounded-xl bg-success-foreground/20 backdrop-blur-sm">
                  <Users className="w-6 h-6 text-success-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Conversion Rate</p>
                  <p className="text-3xl font-bold mt-2 text-card-foreground">
                    <AnimatedCounter end={dashboardStats.conversionRate} duration={2000} suffix="%" />
                  </p>
                  <p className="text-xs mt-2 text-success">+2.3% improvement</p>
                </div>
                <div className="p-3 rounded-xl bg-primary/10">
                  <TrendingUp className="w-6 h-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden group hover:shadow-xl transition-all duration-300 border-2 hover:border-warning/20 gradient-warning">
            <div className="absolute inset-0 bg-gradient-to-r from-warning to-orange-500 opacity-100 group-hover:opacity-90 transition-opacity" />
            <CardContent className="relative p-6">
              <div className="flex items-start justify-between">
                <div className="text-warning-foreground">
                  <p className="text-sm font-medium opacity-90">Total Rewards</p>
                  <p className="text-3xl font-bold mt-2">
                    $<AnimatedCounter end={Math.floor(dashboardStats.totalRewards / 1000)} duration={2000} suffix="k" />
                  </p>
                  <p className="text-xs mt-2 opacity-80">This quarter</p>
                </div>
                <div className="p-3 rounded-xl bg-warning-foreground/20 backdrop-blur-sm">
                  <Award className="w-6 h-6 text-warning-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Universities</p>
                  <p className="text-3xl font-bold mt-2 text-card-foreground">
                    <AnimatedCounter end={dashboardStats.activeUniversities} duration={1500} />
                  </p>
                  <p className="text-xs mt-2 text-success">All active</p>
                </div>
                <div className="p-3 rounded-xl bg-primary/10">
                  <Building2 className="w-6 h-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ReferralChart />
          </div>
          <UniversityPieChart />
        </div>

        {/* Leaderboards & Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <LeaderboardCard title="Top Referrers" entries={leaderboard} />
          <LeaderboardCard title="Top Counselors" entries={counselorLeaderboard} />
          <ActivityTimeline />
        </div>

        {/* Recent Referrals */}
        <RecentReferrals />
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
