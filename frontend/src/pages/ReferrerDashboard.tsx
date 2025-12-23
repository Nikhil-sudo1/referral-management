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
  Wallet, Target, Star, Award, XCircle, Phone, Loader2,
  Activity, Building2, RefreshCw, ChevronDown, ChevronUp
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { analyticsAPI, referralsAPI, type CRMReferralItem } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

const ReferrerDashboard = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingCRM, setIsLoadingCRM] = useState(false);
  const [myReferrals, setMyReferrals] = useState<CRMReferralItem[]>([]);
  const [expandedActivity, setExpandedActivity] = useState<string | null>(null);
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

  // Fetch CRM referrals data
  const fetchCRMReferrals = async () => {
    setIsLoadingCRM(true);
    try {
      const response = await referralsAPI.getMyReferralsWithCRM({ page: 1, limit: 50 });
      if (response?.items) {
        setMyReferrals(response.items);
      }
    } catch (error) {
      console.error('Error fetching CRM referrals:', error);
      toast({
        title: 'Warning',
        description: 'Could not load CRM data. Showing local data.',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingCRM(false);
    }
  };

  // Fetch data from backend
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        console.log('Fetching referrer dashboard data...');
        
        // Fetch analytics
        const analyticsData = await analyticsAPI.getMyAnalytics().catch(err => {
          console.error('Error fetching my analytics:', err);
          return null;
        });
        
        console.log('My analytics:', analyticsData);
        
        // Get user's actual name from user object
        const userName = user?.full_name || 'Referrer';
        const userEmail = user?.email || '';
        const userPhone = user?.mobile_number || '';
        const userReferralCode = user?.referral_code || '';
        
        // Update referrer data from analytics or default to zero
        setReferrerData({
          name: userName,
          email: userEmail,
          phone: userPhone,
          referralCode: userReferralCode,
          totalReferrals: analyticsData?.total_referrals || 0,
          successfulAdmissions: analyticsData?.successful_admissions || 0,
          pendingReferrals: analyticsData?.pending_referrals || 0,
          rejectedReferrals: analyticsData?.rejected_referrals || 0,
          totalEarnings: Number(analyticsData?.total_earnings) || 0,
          pendingEarnings: Number(analyticsData?.pending_earnings) || 0,
          withdrawnEarnings: Number(analyticsData?.withdrawn_earnings) || 0,
          conversionRate: analyticsData?.conversion_rate || 0,
          rank: analyticsData?.rank || 0,
          tier: analyticsData?.tier || 'Bronze',
        });
        
        // Fetch CRM referrals
        await fetchCRMReferrals();
        
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
    const name = r.full_name || r.referee_name || '';
    const university = r.university_interested?.name || '';
    const status = r.lead_status?.name?.toLowerCase() || '';
    
    const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          university.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (r.email || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || status.includes(statusFilter.toLowerCase());
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

  const toggleActivityExpand = (id: string) => {
    setExpandedActivity(expandedActivity === id ? null : id);
  };

  const getStatusColor = (status: string | null | undefined) => {
    if (!status) return 'bg-gray-500/20 text-gray-400';
    const s = status.toLowerCase();
    if (s.includes('enrolled') || s.includes('admitted')) return 'bg-green-500/20 text-green-400';
    if (s.includes('new') || s.includes('untouch')) return 'bg-blue-500/20 text-blue-400';
    if (s.includes('drop') || s.includes('reject')) return 'bg-red-500/20 text-red-400';
    if (s.includes('contact') || s.includes('follow')) return 'bg-yellow-500/20 text-yellow-400';
    return 'bg-purple-500/20 text-purple-400';
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
                <h1 className="text-4xl font-display text-white">
                  Welcome, {referrerData.name || 'Referrer'}! 👋
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
                  <Badge className="bg-success/20 text-success border-0 text-xs">+{myReferrals.length} total</Badge>
                </div>
                <p className="text-2xl font-display text-foreground">{referrerData.totalReferrals || myReferrals.length}</p>
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

        {/* Quick Actions Row */}
        <div className="flex flex-wrap gap-3">
          <Button 
            className="gradient-primary text-white shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all"
            onClick={() => navigate('/referrer/add')}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New Referral
          </Button>
          <Button variant="outline" onClick={() => navigate('/referrer/analytics')}>
            <TrendingUp className="w-4 h-4 mr-2" />
            View Analytics
          </Button>
          <Button variant="outline" onClick={shareReferralLink}>
            <Share2 className="w-4 h-4 mr-2" />
            Share Link
          </Button>
          <Button variant="outline" onClick={fetchCRMReferrals} disabled={isLoadingCRM}>
            <RefreshCw className={cn("w-4 h-4 mr-2", isLoadingCRM && "animate-spin")} />
            Refresh CRM Data
          </Button>
        </div>

        {/* My Referrals Table - CRM Data */}
        <Card className="card-elevated">
          <CardHeader className="border-b border-border pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <CardTitle className="text-lg font-display flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                My Referrals
                {isLoadingCRM && <Loader2 className="w-4 h-4 animate-spin ml-2" />}
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
                  <option value="new">New</option>
                  <option value="enrolled">Enrolled</option>
                  <option value="contacted">Contacted</option>
                  <option value="drop">Dropped</option>
                </select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Name</th>
                    <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Mobile</th>
                    <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Email</th>
                    <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Status</th>
                    <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Sub Status</th>
                    <th className="text-left p-4 text-sm font-semibold text-muted-foreground">University</th>
                    <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Activity Log</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReferrals.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-muted-foreground">
                        {myReferrals.length === 0 ? (
                          <div className="space-y-4">
                            <p>No referrals found</p>
                            <Button onClick={() => navigate('/referrer/add')} className="gradient-primary text-white">
                              <Plus className="w-4 h-4 mr-2" />
                              Add Your First Referral
                            </Button>
                          </div>
                        ) : (
                          'No referrals match your search'
                        )}
                      </td>
                    </tr>
                  ) : (
                    filteredReferrals.map((referral) => (
                      <tr key={referral.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                        {/* Name */}
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-xs font-bold text-white">
                              {(referral.full_name || referral.referee_name || 'UN').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                            </div>
                            <div>
                              <p className="font-medium text-foreground">{referral.full_name || referral.referee_name}</p>
                              <p className="text-xs text-muted-foreground">ID: {referral.crm_lead_id || 'N/A'}</p>
                            </div>
                          </div>
                        </td>
                        
                        {/* Mobile */}
                        <td className="p-4">
                          <p className="text-sm text-foreground font-mono">
                            {referral.mobile_number || referral.referee_phone || '-'}
                          </p>
                        </td>
                        
                        {/* Email */}
                        <td className="p-4">
                          <p className="text-sm text-foreground truncate max-w-[180px]" title={referral.email || referral.referee_email}>
                            {referral.email || referral.referee_email || '-'}
                          </p>
                        </td>
                        
                        {/* Status */}
                        <td className="p-4">
                          <Badge className={cn('border-0 font-medium', getStatusColor(referral.lead_status?.name))}>
                            {referral.lead_status?.name || referral.local_status || 'Unknown'}
                          </Badge>
                        </td>
                        
                        {/* Sub Status */}
                        <td className="p-4">
                          <Badge variant="outline" className="text-xs">
                            {referral.lead_sub_status?.name || '-'}
                          </Badge>
                        </td>
                        
                        {/* University */}
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-muted-foreground" />
                            <div>
                              <p className="text-sm font-medium text-foreground truncate max-w-[150px]" title={referral.university_interested?.name}>
                                {referral.university_interested?.name || 'N/A'}
                              </p>
                              {referral.university_interested?.short_name && (
                                <p className="text-xs text-muted-foreground">{referral.university_interested.short_name}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        
                        {/* Activity Log */}
                        <td className="p-4">
                          {referral.activity_log && referral.activity_log.length > 0 ? (
                            <div className="space-y-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-auto py-1 px-2 text-xs"
                                onClick={() => toggleActivityExpand(referral.id)}
                              >
                                <Activity className="w-3 h-3 mr-1" />
                                {referral.activity_log.length} {referral.activity_log.length === 1 ? 'activity' : 'activities'}
                                {expandedActivity === referral.id ? (
                                  <ChevronUp className="w-3 h-3 ml-1" />
                                ) : (
                                  <ChevronDown className="w-3 h-3 ml-1" />
                                )}
                              </Button>
                              
                              {expandedActivity === referral.id && (
                                <div className="mt-2 p-2 bg-muted/50 rounded-lg max-h-40 overflow-y-auto">
                                  {referral.activity_log.slice(0, 5).map((activity, idx) => (
                                    <div key={activity.id || idx} className="text-xs py-1 border-b border-border last:border-0">
                                      <p className="font-medium text-foreground">{activity.activity?.name}</p>
                                      <p className="text-muted-foreground">{activity.activity_details?.title}</p>
                                      <p className="text-muted-foreground/70 text-[10px]">
                                        {new Date(activity.created_at).toLocaleString('en-IN')}
                                      </p>
                                    </div>
                                  ))}
                                  {referral.activity_log.length > 5 && (
                                    <p className="text-xs text-muted-foreground pt-1">
                                      +{referral.activity_log.length - 5} more...
                                    </p>
                                  )}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">No activity</span>
                          )}
                        </td>
                      </tr>
                    ))
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
