import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ReferrerLayout } from '@/components/layout/ReferrerLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  FileText, CheckCircle, XCircle, Phone, Users, Search,
  Download, Plus, Loader2, RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { referralsAPI } from '@/lib/api';
import { toast } from '@/hooks/use-toast';

interface Referral {
  id: string;
  name: string;
  email: string;
  phone: string;
  university: string;
  program: string;
  status: string;
  date: string;
  reward: number;
  rewardStatus: string;
  counselor: string;
}

const statusConfig = {
  submitted: { label: 'Submitted', color: 'bg-info/10 text-info border-info/20', icon: FileText },
  assigned: { label: 'Assigned', color: 'bg-warning/10 text-warning border-warning/20', icon: Users },
  contacted: { label: 'Contacted', color: 'bg-accent/10 text-accent border-accent/20', icon: Phone },
  admitted: { label: 'Admitted', color: 'bg-success/10 text-success border-success/20', icon: CheckCircle },
  rejected: { label: 'Rejected', color: 'bg-destructive/10 text-destructive border-destructive/20', icon: XCircle },
};

const ReferrerReferrals = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [universityFilter, setUniversityFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [myReferrals, setMyReferrals] = useState<Referral[]>([]);

  // Fetch referrals from API
  const fetchReferrals = async () => {
    setIsLoading(true);
    try {
      // Use getMyReferrals which is already filtered by the current user on backend
      const response = await referralsAPI.getMyReferrals({ page: 1, limit: 100 });
      console.log('My referrals response:', response);
      
      if (response?.items) {
        const formattedReferrals = response.items.map((r: any) => ({
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
          counselor: r.counselor?.name || r.counselorName || '-',
        }));
        setMyReferrals(formattedReferrals);
      } else {
        setMyReferrals([]);
      }
    } catch (error) {
      console.error('Error fetching referrals:', error);
      toast({
        title: 'Error',
        description: 'Failed to load referrals',
        variant: 'destructive',
      });
      setMyReferrals([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReferrals();
  }, []);

  const filteredReferrals = myReferrals.filter(r => {
    const matchesSearch = r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          r.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          r.university.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    const matchesUniversity = universityFilter === 'all' || r.university === universityFilter;
    return matchesSearch && matchesStatus && matchesUniversity;
  });

  const stats = {
    total: myReferrals.length,
    admitted: myReferrals.filter(r => r.status === 'admitted').length,
    pending: myReferrals.filter(r => ['submitted', 'assigned', 'contacted'].includes(r.status)).length,
    rejected: myReferrals.filter(r => r.status === 'rejected').length,
  };

  const universities = Array.from(new Set(myReferrals.map(r => r.university)));

  if (isLoading) {
    return (
      <ReferrerLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </ReferrerLayout>
    );
  }

  return (
    <ReferrerLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center shadow-xl glow-primary">
                <FileText className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-display text-white">My Referrals</h1>
                <p className="text-white/60 mt-1">Track all your referred students</p>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <Button 
              variant="outline"
              onClick={fetchReferrals}
              className="border-white/10 text-white hover:bg-white/5"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button 
              className="gradient-primary text-white shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all"
              onClick={() => navigate('/referrer/add')}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add New Referral
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-5">
              <p className="text-sm text-white/60 mb-2">Total Referrals</p>
              <p className="text-2xl font-display text-white">{stats.total}</p>
            </CardContent>
          </Card>
          <Card className="bg-green-500/10 border-green-500/20">
            <CardContent className="p-5">
              <p className="text-sm text-white/60 mb-2">Admitted</p>
              <p className="text-2xl font-display text-green-400">{stats.admitted}</p>
            </CardContent>
          </Card>
          <Card className="bg-yellow-500/10 border-yellow-500/20">
            <CardContent className="p-5">
              <p className="text-sm text-white/60 mb-2">Pending</p>
              <p className="text-2xl font-display text-yellow-400">{stats.pending}</p>
            </CardContent>
          </Card>
          <Card className="bg-red-500/10 border-red-500/20">
            <CardContent className="p-5">
              <p className="text-sm text-white/60 mb-2">Rejected</p>
              <p className="text-2xl font-display text-red-400">{stats.rejected}</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <Input 
                  placeholder="Search by name, email, or university..." 
                  className="pl-9 bg-white/5 border-white/10 text-white"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select 
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white"
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
              {universities.length > 0 && (
                <select 
                  className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white"
                  value={universityFilter}
                  onChange={(e) => setUniversityFilter(e.target.value)}
                >
                  <option value="all">All Universities</option>
                  {universities.map(uni => (
                    <option key={uni} value={uni}>{uni}</option>
                  ))}
                </select>
              )}
              <Button variant="outline" className="border-white/10 text-white hover:bg-white/5">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Referrals Table */}
        <Card className="bg-white/5 border-white/10">
          <CardHeader className="border-b border-white/10 pb-4">
            <CardTitle className="text-lg font-display text-white">
              All Referrals ({filteredReferrals.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {myReferrals.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-white/40" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">No referrals yet</h3>
                <p className="text-white/60 mb-6">Start referring students to earn rewards!</p>
                <Button 
                  onClick={() => navigate('/referrer/add')}
                  className="gradient-primary text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Referral
                </Button>
              </div>
            ) : filteredReferrals.length === 0 ? (
              <div className="p-8 text-center text-white/60">
                No referrals match your filters
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left p-4 text-sm font-semibold text-white/60">Student</th>
                      <th className="text-left p-4 text-sm font-semibold text-white/60">University</th>
                      <th className="text-left p-4 text-sm font-semibold text-white/60">Counselor</th>
                      <th className="text-left p-4 text-sm font-semibold text-white/60">Status</th>
                      <th className="text-left p-4 text-sm font-semibold text-white/60">Date</th>
                      <th className="text-right p-4 text-sm font-semibold text-white/60">Reward</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredReferrals.map((referral) => {
                      const status = statusConfig[referral.status as keyof typeof statusConfig] || statusConfig.submitted;
                      const StatusIcon = status.icon;
                      return (
                        <tr key={referral.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-xs font-bold text-white">
                                {referral.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                              </div>
                              <div>
                                <p className="font-medium text-white">{referral.name}</p>
                                <p className="text-xs text-white/60">{referral.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <p className="font-medium text-white">{referral.university}</p>
                            <p className="text-xs text-white/60">{referral.program}</p>
                          </td>
                          <td className="p-4">
                            <p className="text-sm text-white">{referral.counselor}</p>
                          </td>
                          <td className="p-4">
                            <Badge className={cn('border font-medium', status.color)}>
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {status.label}
                            </Badge>
                          </td>
                          <td className="p-4 text-sm text-white/60">
                            {new Date(referral.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </td>
                          <td className="p-4 text-right">
                            {referral.rewardStatus === 'paid' ? (
                              <div>
                                <p className="font-bold text-green-400">₹{referral.reward.toLocaleString()}</p>
                                <p className="text-xs text-green-400">Paid</p>
                              </div>
                            ) : referral.reward > 0 ? (
                              <div>
                                <p className="font-bold text-yellow-400">₹{referral.reward.toLocaleString()}</p>
                                <p className="text-xs text-white/60">Pending</p>
                              </div>
                            ) : (
                              <p className="text-white/40">-</p>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </ReferrerLayout>
  );
};

export default ReferrerReferrals;
