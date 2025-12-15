import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, BarChart3, PieChart as PieChartIcon, Activity, Target, Zap, TrendingDown, Loader2 } from 'lucide-react';
import { AnimatedCounter } from '@/components/ui/animated-counter';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { analyticsAPI, type AnalyticsResponse } from '@/lib/api';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const Analytics = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      console.log('Fetching analytics data...');
      const data = await analyticsAPI.getDashboardAnalytics();
      console.log('Analytics data received:', data);
      console.log('Dashboard stats:', data?.dashboard_stats);
      console.log('Time series data points:', data?.time_series?.length || 0);
      console.log('University performance:', data?.university_performance?.length || 0);
      setAnalyticsData(data);
      console.log('Analytics loaded successfully');
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast({
        title: 'Error',
        description: 'Failed to load analytics data',
        variant: 'destructive',
      });
      setAnalyticsData(null);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!analyticsData) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <BarChart3 className="w-16 h-16 mx-auto text-muted-foreground mb-4 opacity-50" />
          <h3 className="text-xl font-bold text-card-foreground mb-2">No Analytics Data</h3>
          <p className="text-muted-foreground">Analytics data will appear here once available.</p>
        </div>
      </DashboardLayout>
    );
  }

  const { dashboard_stats, time_series, university_performance, conversion_funnel } = analyticsData;

  // Ensure all dashboard_stats values are valid numbers with defaults
  const stats = {
    total_referrals: Number(dashboard_stats?.total_referrals) || 0,
    total_admissions: Number(dashboard_stats?.total_admissions) || 0,
    conversion_rate: Number(dashboard_stats?.conversion_rate) || 0,
    total_rewards: Number(dashboard_stats?.total_rewards) || 0,
    monthly_referrals: Number(dashboard_stats?.monthly_referrals) || 0,
    monthly_admissions: Number(dashboard_stats?.monthly_admissions) || 0,
    monthly_rewards: Number(dashboard_stats?.monthly_rewards) || 0,
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Analytics Dashboard</h1>
          <p className="text-muted-foreground mt-1">Comprehensive insights and performance metrics</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Referrals</p>
                  <p className="text-3xl font-bold text-card-foreground">
                    <AnimatedCounter value={stats.total_referrals} />
                  </p>
                  <div className="flex items-center gap-1 mt-2">
                    <TrendingUp className="w-4 h-4 text-success" />
                    <span className="text-xs text-success font-medium">
                      {stats.monthly_referrals} this month
                    </span>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-primary/10">
                  <Activity className="w-6 h-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Admissions</p>
                  <p className="text-3xl font-bold text-card-foreground">
                    <AnimatedCounter value={stats.total_admissions} />
                  </p>
                  <div className="flex items-center gap-1 mt-2">
                    <TrendingUp className="w-4 h-4 text-success" />
                    <span className="text-xs text-success font-medium">
                      {stats.monthly_admissions} this month
                    </span>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-success/10">
                  <Target className="w-6 h-6 text-success" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Conversion Rate</p>
                  <p className="text-3xl font-bold text-card-foreground">
                    {stats.conversion_rate.toFixed(1)}%
                  </p>
                  <div className="flex items-center gap-1 mt-2">
                    <Badge variant="outline" className="text-xs">
                      {stats.conversion_rate >= 50 ? 'Excellent' : stats.conversion_rate >= 30 ? 'Good' : 'Needs Improvement'}
                    </Badge>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-info/10">
                  <Zap className="w-6 h-6 text-info" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Rewards</p>
                  <p className="text-3xl font-bold text-card-foreground">
                    ₹<AnimatedCounter value={stats.total_rewards} />
                  </p>
                  <div className="flex items-center gap-1 mt-2">
                    <TrendingUp className="w-4 h-4 text-warning" />
                    <span className="text-xs text-warning font-medium">
                      ₹{stats.monthly_rewards.toLocaleString()} this month
                    </span>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-warning/10">
                  <TrendingUp className="w-6 h-6 text-warning" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Time Series Chart */}
        {time_series && time_series.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Referral Trends Over Time
              </CardTitle>
              <CardDescription>Track referrals and admissions over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={time_series}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="referrals" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    name="Referrals"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="admissions" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    name="Admissions"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* University Performance */}
          {university_performance && university_performance.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChartIcon className="w-5 h-5" />
                  University Performance
                </CardTitle>
                <CardDescription>Performance by university</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={university_performance}
                      dataKey="total_admissions"
                      nameKey="university_name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label
                    >
                      {university_performance.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  {university_performance.slice(0, 5).map((uni, idx) => (
                    <div key={uni.university_id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                        />
                        <span className="text-sm font-medium">{uni.university_name}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-muted-foreground">
                          {uni.total_admissions} admissions
                        </span>
                        <Badge variant="outline">
                          {uni.conversion_rate.toFixed(1)}%
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Conversion Funnel */}
          {conversion_funnel && conversion_funnel.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Conversion Funnel
                </CardTitle>
                <CardDescription>Referral journey stages</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={conversion_funnel} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis type="number" className="text-xs" />
                    <YAxis dataKey="stage" type="category" className="text-xs" width={100} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  {conversion_funnel.map((stage, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                      <span className="text-sm font-medium capitalize">{stage.stage}</span>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-muted-foreground">
                          {stage.count} referrals
                        </span>
                        <Badge variant="outline">
                          {stage.percentage.toFixed(1)}%
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Analytics;
