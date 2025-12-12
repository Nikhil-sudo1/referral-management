import { ReferrerLayout } from '@/components/layout/ReferrerLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, Users, CheckCircle, Wallet, Target, Award,
  ArrowUp, ArrowDown, BarChart3
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const monthlyData = [
  { month: 'Jan', referrals: 2, admissions: 1, earnings: 15000 },
  { month: 'Feb', referrals: 3, admissions: 2, earnings: 30000 },
  { month: 'Mar', referrals: 1, admissions: 1, earnings: 15000 },
  { month: 'Apr', referrals: 4, admissions: 2, earnings: 30000 },
  { month: 'May', referrals: 2, admissions: 1, earnings: 15000 },
  { month: 'Jun', referrals: 3, admissions: 2, earnings: 30000 },
];

const statusData = [
  { name: 'Admitted', value: 8, color: 'hsl(158 65% 40%)' },
  { name: 'Pending', value: 5, color: 'hsl(35 95% 55%)' },
  { name: 'Rejected', value: 2, color: 'hsl(0 84% 60%)' },
];

const universityData = [
  { name: 'MIT', referrals: 6, admissions: 4 },
  { name: 'Harvard', referrals: 4, admissions: 2 },
  { name: 'Stanford', referrals: 2, admissions: 1 },
  { name: 'Oxford', referrals: 3, admissions: 1 },
];

const ReferrerAnalytics = () => {
  const currentMonth = monthlyData[monthlyData.length - 1];
  const previousMonth = monthlyData[monthlyData.length - 2];
  
  const referralsChange = ((currentMonth.referrals - previousMonth.referrals) / previousMonth.referrals * 100).toFixed(1);
  const admissionsChange = ((currentMonth.admissions - previousMonth.admissions) / previousMonth.admissions * 100).toFixed(1);
  const earningsChange = ((currentMonth.earnings - previousMonth.earnings) / previousMonth.earnings * 100).toFixed(1);

  return (
    <ReferrerLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center shadow-xl glow-primary">
              <TrendingUp className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-display text-foreground">Analytics</h1>
              <p className="text-muted-foreground mt-1">Track your performance and insights</p>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="card-interactive group">
            <CardContent className="p-5 relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary to-info opacity-0 group-hover:opacity-5 transition-opacity duration-500" />
              <div className="relative">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-11 h-11 rounded-xl gradient-primary flex items-center justify-center shadow-lg group-hover:scale-110 transition-all duration-300">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <div className={cn('flex items-center gap-1 text-xs', parseFloat(referralsChange) >= 0 ? 'text-success' : 'text-destructive')}>
                    {parseFloat(referralsChange) >= 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                    {Math.abs(parseFloat(referralsChange))}%
                  </div>
                </div>
                <p className="text-2xl font-display text-foreground">{currentMonth.referrals}</p>
                <p className="text-sm text-muted-foreground mt-1">Referrals This Month</p>
              </div>
            </CardContent>
          </Card>

          <Card className="card-interactive group">
            <CardContent className="p-5 relative">
              <div className="absolute inset-0 bg-gradient-to-br from-success to-emerald-500 opacity-0 group-hover:opacity-5 transition-opacity duration-500" />
              <div className="relative">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-11 h-11 rounded-xl gradient-success flex items-center justify-center shadow-lg group-hover:scale-110 transition-all duration-300">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <div className={cn('flex items-center gap-1 text-xs', parseFloat(admissionsChange) >= 0 ? 'text-success' : 'text-destructive')}>
                    {parseFloat(admissionsChange) >= 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                    {Math.abs(parseFloat(admissionsChange))}%
                  </div>
                </div>
                <p className="text-2xl font-display text-foreground">{currentMonth.admissions}</p>
                <p className="text-sm text-muted-foreground mt-1">Admissions This Month</p>
              </div>
            </CardContent>
          </Card>

          <Card className="card-interactive group">
            <CardContent className="p-5 relative">
              <div className="absolute inset-0 bg-gradient-to-br from-warning to-orange-500 opacity-0 group-hover:opacity-5 transition-opacity duration-500" />
              <div className="relative">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-11 h-11 rounded-xl gradient-warning flex items-center justify-center shadow-lg group-hover:scale-110 transition-all duration-300">
                    <Wallet className="w-5 h-5 text-white" />
                  </div>
                  <div className={cn('flex items-center gap-1 text-xs', parseFloat(earningsChange) >= 0 ? 'text-success' : 'text-destructive')}>
                    {parseFloat(earningsChange) >= 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                    {Math.abs(parseFloat(earningsChange))}%
                  </div>
                </div>
                <p className="text-2xl font-display text-foreground">₹{(currentMonth.earnings / 1000).toFixed(0)}k</p>
                <p className="text-sm text-muted-foreground mt-1">Earnings This Month</p>
              </div>
            </CardContent>
          </Card>

          <Card className="card-interactive group">
            <CardContent className="p-5 relative">
              <div className="absolute inset-0 bg-gradient-to-br from-accent to-purple-500 opacity-0 group-hover:opacity-5 transition-opacity duration-500" />
              <div className="relative">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-11 h-11 rounded-xl gradient-accent flex items-center justify-center shadow-lg group-hover:scale-110 transition-all duration-300">
                    <Target className="w-5 h-5 text-white" />
                  </div>
                  <Badge className="bg-success/20 text-success border-0">53.3%</Badge>
                </div>
                <p className="text-2xl font-display text-foreground">53.3%</p>
                <p className="text-sm text-muted-foreground mt-1">Conversion Rate</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Trends */}
          <Card className="card-elevated">
            <CardHeader className="border-b border-border pb-4">
              <CardTitle className="text-lg font-display flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Monthly Trends
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={monthlyData}>
                  <defs>
                    <linearGradient id="colorReferrals" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(168 80% 35%)" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="hsl(168 80% 35%)" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorAdmissions" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(158 65% 40%)" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="hsl(158 65% 40%)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="month" stroke="rgba(255,255,255,0.5)" />
                  <YAxis stroke="rgba(255,255,255,0.5)" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(10, 10, 15, 0.95)', 
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                  />
                  <Area type="monotone" dataKey="referrals" stroke="hsl(168 80% 35%)" fillOpacity={1} fill="url(#colorReferrals)" />
                  <Area type="monotone" dataKey="admissions" stroke="hsl(158 65% 40%)" fillOpacity={1} fill="url(#colorAdmissions)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Status Distribution */}
          <Card className="card-elevated">
            <CardHeader className="border-b border-border pb-4">
              <CardTitle className="text-lg font-display flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-accent" />
                Status Distribution
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(10, 10, 15, 0.95)', 
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-3 gap-4 mt-4">
                {statusData.map((item) => (
                  <div key={item.name} className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <p className="text-sm font-medium">{item.name}</p>
                    </div>
                    <p className="text-2xl font-bold">{item.value}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* University Performance */}
        <Card className="card-elevated">
          <CardHeader className="border-b border-border pb-4">
            <CardTitle className="text-lg font-display flex items-center gap-2">
              <Award className="w-5 h-5 text-warning" />
              University Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={universityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" />
                <YAxis stroke="rgba(255,255,255,0.5)" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(10, 10, 15, 0.95)', 
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                />
                <Bar dataKey="referrals" fill="hsl(168 80% 35%)" radius={[8, 8, 0, 0]} />
                <Bar dataKey="admissions" fill="hsl(158 65% 40%)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="card-elevated bg-gradient-to-br from-primary/10 to-info/10 border-primary/20">
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground mb-2">Total Referrals</p>
              <p className="text-2xl font-display text-foreground">15</p>
              <p className="text-xs text-muted-foreground mt-1">All time</p>
            </CardContent>
          </Card>
          <Card className="card-elevated bg-gradient-to-br from-success/10 to-emerald-500/10 border-success/20">
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground mb-2">Total Earnings</p>
              <p className="text-2xl font-display text-foreground">₹85,000</p>
              <p className="text-xs text-muted-foreground mt-1">All time</p>
            </CardContent>
          </Card>
          <Card className="card-elevated bg-gradient-to-br from-warning/10 to-orange-500/10 border-warning/20">
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground mb-2">Average Reward</p>
              <p className="text-2xl font-display text-foreground">₹10,625</p>
              <p className="text-xs text-muted-foreground mt-1">Per admission</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </ReferrerLayout>
  );
};

export default ReferrerAnalytics;

