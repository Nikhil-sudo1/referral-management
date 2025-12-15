import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ReferrerLayout } from '@/components/layout/ReferrerLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Users, Gift, TrendingUp, FileText, Clock, CheckCircle, 
  ArrowRight, Plus, Search, Copy, Share2, ChevronRight, 
  Wallet, Target, Star, Award, XCircle, Phone, Loader2
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { analyticsAPI, referralsAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

const statusConfig = {
  submitted: { label: 'Submitted', color: 'bg-info/10 text-info', icon: FileText },
  assigned: { label: 'Assigned', color: 'bg-warning/10 text-warning', icon: Users },
  contacted: { label: 'Contacted', color: 'bg-accent/10 text-accent', icon: Phone },
  admitted: { label: 'Admitted', color: 'bg-success/10 text-success', icon: CheckCircle },
  rejected: { label: 'Rejected', color: 'bg-destructive/10 text-destructive', icon: XCircle },
};

const ReferrerDashboard = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [myReferrals, setMyReferrals] = useState<any[]>([]);
  const [referrerData, setReferrerData] = useState({
    name: '',
    email: '',
    phone: '',
    referralCode: '',
    totalReferrals: 0,
    successfulAdmissions: 0,
    pendingReferrals: 0,
    rejectedReferrals: 0,
    totalEarnings: 0,
    pendingEarnings: 0,
    withdrawnEarnings: 0,
    conversionRate: 0,
    rank: 0,
    tier: 'Bronze',
  });
  
  const { user } = useAuth();
  const navigate = useNavigate();

  // Fetch data from backend
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        console.log('Fetching referrer dashboard data...');
        
        // Fetch analytics and referrals in parallel
        const [analyticsData, referralsData] = await Promise.all([
          analyticsAPI.getMyAnalytics().catch(err => {
            console.error('Error fetching my analytics:', err);
            return null;
          }),
          referralsAPI.getMyReferrals({ page: 1, limit: 20 }).catch(err => {
            console.error('Error fetching my referrals:', err);
            return { items: [] };
          }),
        ]);
        
        console.log('My analytics:', analyticsData);
        console.log('My referrals:', referralsData);
        
        // Update referrer data from analytics
        if (analyticsData) {
          setReferrerData({
            name: user?.name || 'Referrer',
            email: user?.email || '',
            phone: user?.phone || '',
            referralCode: user?.referral_code || user?.referralCode || 'REF-CODE',
            totalReferrals: analyticsData.total_referrals || 0,
            successfulAdmissions: analyticsData.successful_admissions || 0,
            pendingReferrals: analyticsData.pending_referrals || 0,
            rejectedReferrals: analyticsData.rejected_referrals || 0,
            totalEarnings: Number(analyticsData.total_earnings) || 0,
            pendingEarnings: Number(analyticsData.pending_earnings) || 0,
            withdrawnEarnings: Number(analyticsData.withdrawn_earnings) || 0,
            conversionRate: analyticsData.conversion_rate || 0,
            rank: analyticsData.rank || 0,
            tier: analyticsData.tier || 'Bronze',
          });
        } else if (user) {
          // Fallback to user data
          setReferrerData(prev => ({
            ...prev,
            name: user.name || 'Referrer',
            email: user.email || '',
            phone: user.phone || '',
            referralCode: user.referral_code || user.referralCode || 'REF-CODE',
            tier: user.tier || 'Bronze',
          }));
        }
        
        // Update referrals list
        if (referralsData?.items) {
          const formattedReferrals = referralsData.items.map((r: any) => ({
            id: r.id,
            name: r.referee_name || r.refereeName || 'Unknown',
            email: r.referee_email || r.refereeEmail || '',
            phone: r.referee_phone || r.refereePhone || '',
            university: r.university?.name || r.universityName || 'Unknown',
            program: r.program?.name || r.programName || 'Unknown',
            status: r.status || 'submitted',
            date: r.created_at || r.createdAt || new Date().toISOString(),
            reward: r.expected_reward || r.expectedReward || 0,
            rewardStatus: r.status === 'admitted' ? 'paid' : 'pending',
          }));
          setMyReferrals(formattedReferrals);
        }
        
        console.log('Referrer dashboard data loaded');
      } catch (error) {
        console.error('Error fetching referrer dashboard:', error);
        toast({
          title: 'Error',
          description: 'Failed to load dashboard data',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const filteredReferrals = myReferrals.filter(r => {
    const matchesSearch = r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          r.university.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const copyReferralCode = () => {
    navigator.clipboard.writeText(referrerData.referralCode);
    toast({ title: 'Copied!', description: 'Referral code copied to clipboard' });
  };

  const shareReferralLink = () => {
    const link = `https://teamlease.edu/refer/${referrerData.referralCode}`;
    navigator.clipboard.writeText(link);
    toast({ title: 'Link Copied!', description: 'Share this link with students' });
  };

  if (isLoading) {
    return (
      <ReferrerLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </ReferrerLayout>
    );
  }

  return (
    <ReferrerLayout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center shadow-xl glow-primary">
                  <Users className="w-7 h-7 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-4xl font-display text-foreground">
                  Welcome back, {referrerData.name.split(' ')[0]}! 👋
                </h1>
                <p className="text-muted-foreground mt-1">Track your referrals and earnings</p>
              </div>
            </div>
          </div>
          
          {/* Referral Code Card */}
          <Card className="card-elevated bg-gradient-to-br from-primary/10 to-info/10 border-primary/30">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground mb-2">Your Referral Code</p>
              <div className="flex items-center gap-3">
                <code className="text-xl font-mono font-bold text-primary">{referrerData.referralCode}</code>
                <Button size="icon" variant="ghost" onClick={copyReferralCode} className="h-8 w-8">
                  <Copy className="w-4 h-4" />
                </Button>
                <Button size="icon" variant="ghost" onClick={shareReferralLink} className="h-8 w-8">
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <Card className="card-interactive group">
            <CardContent className="p-5 relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary to-info opacity-0 group-hover:opacity-5 transition-opacity duration-500" />
              <div className="relative">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-11 h-11 rounded-xl gradient-primary flex items-center justify-center shadow-lg group-hover:scale-110 transition-all duration-300">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <Badge className="bg-success/20 text-success border-0 text-xs">+3 this month</Badge>
                </div>
                <p className="text-2xl font-display text-foreground">{referrerData.totalReferrals}</p>
                <p className="text-sm text-muted-foreground mt-1">Total Referrals</p>
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
                  <span className="text-xs text-success font-semibold">{referrerData.conversionRate}%</span>
                </div>
                <p className="text-2xl font-display text-foreground">{referrerData.successfulAdmissions}</p>
                <p className="text-sm text-muted-foreground mt-1">Successful Admissions</p>
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
                </div>
                <p className="text-2xl font-display text-foreground">₹{(referrerData.totalEarnings / 1000).toFixed(0)}k</p>
                <p className="text-sm text-muted-foreground mt-1">Total Earnings</p>
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
                  <Badge className="bg-warning/20 text-warning border-0 text-xs">Rank #{referrerData.rank}</Badge>
                </div>
                <p className="text-2xl font-display text-foreground">{referrerData.tier}</p>
                <p className="text-sm text-muted-foreground mt-1">Referrer Tier</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Earnings Breakdown */}
        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 card-elevated">
            <CardHeader className="border-b border-border pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-display flex items-center gap-2">
                  <Gift className="w-5 h-5 text-warning" />
                  Earnings Overview
                </CardTitle>
                <Button variant="outline" size="sm">
                  Withdraw <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-3 gap-6">
                <div className="text-center p-4 rounded-2xl bg-success/10 border border-success/20">
                  <p className="text-sm text-muted-foreground mb-1">Withdrawn</p>
                  <p className="text-2xl font-display text-success">₹{referrerData.withdrawnEarnings.toLocaleString()}</p>
                </div>
                <div className="text-center p-4 rounded-2xl bg-warning/10 border border-warning/20">
                  <p className="text-sm text-muted-foreground mb-1">Pending</p>
                  <p className="text-2xl font-display text-warning">₹{referrerData.pendingEarnings.toLocaleString()}</p>
                </div>
                <div className="text-center p-4 rounded-2xl bg-primary/10 border border-primary/20">
                  <p className="text-sm text-muted-foreground mb-1">Total</p>
                  <p className="text-2xl font-display text-primary">₹{referrerData.totalEarnings.toLocaleString()}</p>
                </div>
              </div>
              
              {/* Progress to next tier */}
              <div className="mt-6 p-4 rounded-2xl bg-muted/50 border border-border">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-foreground">Progress to Platinum Tier</p>
                  <p className="text-sm text-muted-foreground">8/10 admissions</p>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full w-4/5 gradient-primary rounded-full" />
                </div>
                <p className="text-xs text-muted-foreground mt-2">2 more successful admissions to reach Platinum!</p>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="card-elevated">
            <CardHeader className="border-b border-border pb-4">
              <CardTitle className="text-lg font-display">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <Button 
                className="w-full justify-between gradient-primary text-white shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all h-12"
                onClick={() => navigate('/referrer/add')}
              >
                <span className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Add New Referral
                </span>
                <ChevronRight className="w-4 h-4" />
              </Button>
              <Button variant="outline" className="w-full justify-between h-12" onClick={() => navigate('/referrer/analytics')}>
                <span className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  View Analytics
                </span>
                <ChevronRight className="w-4 h-4" />
              </Button>
              <Button variant="outline" className="w-full justify-between h-12" onClick={shareReferralLink}>
                <span className="flex items-center gap-2">
                  <Share2 className="w-4 h-4" />
                  Share Referral Link
                </span>
                <ChevronRight className="w-4 h-4" />
              </Button>
              <Button variant="outline" className="w-full justify-between h-12" onClick={() => navigate('/referrer/leaderboard')}>
                <span className="flex items-center gap-2">
                  <Award className="w-4 h-4" />
                  View Leaderboard
                </span>
                <ChevronRight className="w-4 h-4" />
              </Button>
              <Button variant="outline" className="w-full justify-between h-12">
                <span className="flex items-center gap-2">
                  <Wallet className="w-4 h-4" />
                  Withdraw Earnings
                </span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* My Referrals Table */}
        <Card className="card-elevated">
          <CardHeader className="border-b border-border pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <CardTitle className="text-lg font-display flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                My Referrals
              </CardTitle>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search referrals..." 
                    className="pl-9 w-48"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <select 
                  className="bg-background border border-border rounded-xl px-3 py-2 text-sm text-foreground"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="submitted">Submitted</option>
                  <option value="assigned">Assigned</option>
                  <option value="contacted">Contacted</option>
                  <option value="admitted">Admitted</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Student</th>
                    <th className="text-left p-4 text-sm font-semibold text-muted-foreground">University</th>
                    <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Status</th>
                    <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Date</th>
                    <th className="text-right p-4 text-sm font-semibold text-muted-foreground">Reward</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReferrals.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-muted-foreground">
                        No referrals found
                      </td>
                    </tr>
                  ) : (
                    filteredReferrals.map((referral) => {
                      const status = statusConfig[referral.status as keyof typeof statusConfig];
                      const StatusIcon = status.icon;
                      return (
                        <tr key={referral.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-xs font-bold text-white">
                                {referral.name.split(' ').map(n => n[0]).join('')}
                              </div>
                              <div>
                                <p className="font-medium text-foreground">{referral.name}</p>
                                <p className="text-xs text-muted-foreground">{referral.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <p className="font-medium text-foreground">{referral.university}</p>
                            <p className="text-xs text-muted-foreground">{referral.program}</p>
                          </td>
                          <td className="p-4">
                            <Badge className={cn('border-0 font-medium', status.color)}>
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {status.label}
                            </Badge>
                          </td>
                          <td className="p-4 text-sm text-muted-foreground">
                            {new Date(referral.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </td>
                          <td className="p-4 text-right">
                            {referral.rewardStatus === 'paid' ? (
                              <div>
                                <p className="font-bold text-success">₹{referral.reward.toLocaleString()}</p>
                                <p className="text-xs text-success">Paid</p>
                              </div>
                            ) : referral.rewardStatus === 'pending' ? (
                              <div>
                                <p className="font-bold text-warning">₹{referral.reward.toLocaleString()}</p>
                                <p className="text-xs text-muted-foreground">Pending</p>
                              </div>
                            ) : (
                              <p className="text-muted-foreground">-</p>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Tips Section */}
        <Card className="card-elevated bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center flex-shrink-0 shadow-lg glow-primary">
                <Star className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-display text-lg mb-2 text-foreground">Pro Tip: Maximize Your Earnings!</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Share your referral link on social media and student groups. Top referrers earn ₹1 Lakh+ monthly by referring students to premium MBA programs.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-muted text-foreground border-0">MBA: ₹15,000-20,000</Badge>
                  <Badge className="bg-muted text-foreground border-0">MS: ₹10,000-15,000</Badge>
                  <Badge className="bg-muted text-foreground border-0">Executive: ₹20,000-30,000</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ReferrerLayout>
  );
};

export default ReferrerDashboard;

