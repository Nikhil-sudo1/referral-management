import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ReferralChart } from '@/components/dashboard/ReferralChart';
import { UniversityPieChart } from '@/components/dashboard/UniversityPieChart';
import { universityWiseData, monthlyReferralData, referrals, universities, programs } from '@/data/mockData';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, BarChart3, PieChart, Activity, Target, Zap, TrendingDown } from 'lucide-react';
import { AnimatedCounter } from '@/components/ui/animated-counter';
import { Badge } from '@/components/ui/badge';
import { useMemo } from 'react';

const Analytics = () => {
  // Calculate metrics from actual referral data
  const analyticsData = useMemo(() => {
    const totalReferrals = referrals.length;
    const submittedCount = referrals.filter(r => r.status === 'submitted').length;
    const assignedCount = referrals.filter(r => r.status === 'assigned').length;
    const contactedCount = referrals.filter(r => r.status === 'contacted').length;
    const admittedCount = referrals.filter(r => r.status === 'admitted').length;
    
    // Calculate average conversion time (days from submission to admission)
    const admittedReferrals = referrals.filter(r => r.status === 'admitted' && r.admissionDate);
    const avgConversionTime = admittedReferrals.length > 0
      ? Math.round(
          admittedReferrals.reduce((sum, r) => {
            const days = Math.floor((r.admissionDate!.getTime() - r.submissionDate.getTime()) / (1000 * 60 * 60 * 24));
            return sum + days;
          }, 0) / admittedReferrals.length
        )
      : 0;

    // Find best university (by admission count)
    const universityStats = universities.map(uni => {
      const uniReferrals = referrals.filter(r => r.universityId === uni.id);
      const admissions = uniReferrals.filter(r => r.status === 'admitted').length;
      const conversionRate = uniReferrals.length > 0 ? (admissions / uniReferrals.length) * 100 : 0;
      return { ...uni, referrals: uniReferrals.length, admissions, conversionRate };
    });
    const bestUniversity = universityStats.sort((a, b) => b.conversionRate - a.conversionRate)[0];

    // Find peak month (from submission dates)
    const monthCounts = referrals.reduce((acc, r) => {
      const month = r.submissionDate.toLocaleString('default', { month: 'long' });
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const peakMonth = Object.entries(monthCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

    // Find top program (by referral count)
    const programStats = programs.map(prog => {
      const progReferrals = referrals.filter(r => r.programId === prog.id);
      return { ...prog, count: progReferrals.length };
    });
    const topProgram = programStats.sort((a, b) => b.count - a.count)[0];

    return {
      totalReferrals,
      submittedCount,
      assignedCount,
      contactedCount,
      admittedCount,
      avgConversionTime,
      bestUniversity: bestUniversity?.name || 'N/A',
      bestUniversityRate: bestUniversity?.conversionRate || 0,
      peakMonth,
      peakMonthCount: monthCounts[peakMonth] || 0,
      topProgram: topProgram?.name || 'N/A',
      topProgramPercent: totalReferrals > 0 ? Math.round((topProgram?.count || 0 / totalReferrals) * 100) : 0,
    };
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl gradient-primary shadow-lg">
              <BarChart3 className="w-8 h-8 text-primary-foreground" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
                <Badge variant="outline" className="text-xs">
                  <Activity className="w-3 h-3 mr-1" />
                  Calculated
                </Badge>
              </div>
              <p className="text-muted-foreground">Detailed insights and performance metrics</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="px-3 py-1">
              <Target className="w-3 h-3 mr-1" />
              Goal: 200 referrals
            </Badge>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/20 bg-gradient-to-br from-primary/10 to-primary/5">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Avg. Conversion Time</p>
                  <p className="text-3xl font-bold text-card-foreground">
                    <AnimatedCounter end={analyticsData.avgConversionTime} duration={1500} suffix=" days" />
                  </p>
                  <div className="flex items-center gap-1 mt-2">
                    <TrendingDown className="w-3 h-3 text-success" />
                    <span className="text-xs text-success">-2 days faster</span>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-primary/20 group-hover:scale-110 transition-transform">
                  <Activity className="w-7 h-7 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-success/20 bg-gradient-to-br from-success/10 to-success/5">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Best University</p>
                  <p className="text-2xl font-bold text-card-foreground">{analyticsData.bestUniversity}</p>
                  <div className="flex items-center gap-1 mt-2">
                    <TrendingUp className="w-3 h-3 text-success" />
                    <span className="text-xs text-success">{analyticsData.bestUniversityRate.toFixed(1)}% success rate</span>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-success/20 group-hover:scale-110 transition-transform">
                  <Zap className="w-7 h-7 text-success" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-warning/20 bg-gradient-to-br from-warning/10 to-warning/5">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Peak Month</p>
                  <p className="text-2xl font-bold text-card-foreground">{analyticsData.peakMonth}</p>
                  <div className="flex items-center gap-1 mt-2">
                    <TrendingUp className="w-3 h-3 text-success" />
                    <span className="text-xs text-success">{analyticsData.peakMonthCount} referrals</span>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-warning/20 group-hover:scale-110 transition-transform">
                  <BarChart3 className="w-7 h-7 text-warning" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-accent/20 bg-gradient-to-br from-accent/10 to-accent/5">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Top Program</p>
                  <p className="text-2xl font-bold text-card-foreground">{analyticsData.topProgram}</p>
                  <div className="flex items-center gap-1 mt-2">
                    <TrendingUp className="w-3 h-3 text-success" />
                    <span className="text-xs text-success">{analyticsData.topProgramPercent}% of total</span>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-accent/20 group-hover:scale-110 transition-transform">
                  <PieChart className="w-7 h-7 text-accent" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ReferralChart />
          <UniversityPieChart />
        </div>

        {/* University Comparison */}
        <Card className="hover:shadow-xl transition-shadow border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              University Performance Comparison
              <Badge variant="outline" className="text-xs">Live Data</Badge>
            </CardTitle>
            <CardDescription>Compare referrals and admissions across universities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={universityWiseData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <defs>
                    <linearGradient id="colorReferrals" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(226, 70%, 45%)" stopOpacity={0.9}/>
                      <stop offset="95%" stopColor="hsl(226, 70%, 45%)" stopOpacity={0.6}/>
                    </linearGradient>
                    <linearGradient id="colorAdmissions" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0.9}/>
                      <stop offset="95%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0.6}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 32%, 91%)" />
                  <XAxis dataKey="name" stroke="hsl(215, 16%, 47%)" style={{ fontSize: '12px' }} />
                  <YAxis stroke="hsl(215, 16%, 47%)" style={{ fontSize: '12px' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(0, 0%, 100%)',
                      border: '1px solid hsl(214, 32%, 91%)',
                      borderRadius: '12px',
                      fontSize: '12px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    }}
                  />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} />
                  <Bar dataKey="referrals" fill="url(#colorReferrals)" name="Referrals" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="admissions" fill="url(#colorAdmissions)" name="Admissions" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Conversion Funnel */}
        <Card className="hover:shadow-xl transition-shadow border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Conversion Funnel
              <Badge variant="outline" className="text-xs">
                <Activity className="w-3 h-3 mr-1" />
                42.9% overall
              </Badge>
            </CardTitle>
            <CardDescription>Track referral progress through each stage</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {[
                { stage: 'Submitted', count: analyticsData.submittedCount, color: 'bg-info', gradient: 'from-info to-blue-500' },
                { stage: 'Assigned', count: analyticsData.assignedCount, color: 'bg-warning', gradient: 'from-warning to-orange-500' },
                { stage: 'Contacted', count: analyticsData.contactedCount, color: 'bg-accent', gradient: 'from-accent to-purple-500' },
                { stage: 'Admitted', count: analyticsData.admittedCount, color: 'bg-success', gradient: 'from-success to-emerald-500' },
              ].map((item, idx) => {
                const percentage = analyticsData.totalReferrals > 0 
                  ? ((item.count / analyticsData.totalReferrals) * 100).toFixed(0)
                  : 0;
                return (
                  <div key={item.stage} className="group">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${item.color}`} />
                        <span className="text-sm font-semibold text-card-foreground">{item.stage}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-lg text-card-foreground">
                          <AnimatedCounter end={item.count} duration={2000} />
                        </span>
                        <span className="text-xs text-muted-foreground ml-2">
                          ({percentage}%)
                        </span>
                      </div>
                    </div>
                    <div className="flex-1 h-12 bg-muted rounded-xl overflow-hidden shadow-inner">
                      <div
                        className={`h-full bg-gradient-to-r ${item.gradient} transition-all duration-1000 ease-out group-hover:opacity-90 flex items-center justify-end px-4`}
                        style={{ width: `${percentage}%` }}
                      >
                        <span className="text-xs font-medium text-white opacity-0 group-hover:opacity-100 transition-opacity">
                          {item.count} referrals
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Analytics;
