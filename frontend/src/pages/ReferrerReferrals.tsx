import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ReferrerLayout } from '@/components/layout/ReferrerLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  FileText, Search, Download, Plus, Loader2, RefreshCw, 
  Activity, X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { referralsAPI, type CRMReferralItem } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';


const ReferrerReferrals = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingCRM, setIsLoadingCRM] = useState(false);
  const [myReferrals, setMyReferrals] = useState<CRMReferralItem[]>([]);
  const [selectedActivityReferral, setSelectedActivityReferral] = useState<CRMReferralItem | null>(null);
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);

  // Fetch referrals with CRM data from API
  const fetchReferrals = async () => {
    setIsLoading(true);
    setIsLoadingCRM(true);
    try {
      // Use getMyReferralsWithCRM to get CRM data
      const response = await referralsAPI.getMyReferralsWithCRM({ page: 1, limit: 100 });
      console.log('My referrals with CRM response:', response);
      
      if (response?.items && Array.isArray(response.items)) {
        setMyReferrals(response.items);
      } else {
        setMyReferrals([]);
      }
    } catch (error: any) {
      console.error('Error fetching referrals:', error);
      const errorMessage = error?.response?.data?.detail || 
                          error?.response?.data?.message || 
                          error?.message ||
                          'Failed to load referrals. Please try again.';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      setMyReferrals([]);
    } finally {
      setIsLoading(false);
      setIsLoadingCRM(false);
    }
  };

  const openActivityModal = (referral: CRMReferralItem) => {
    setSelectedActivityReferral(referral);
    setIsActivityModalOpen(true);
  };

  const closeActivityModal = () => {
    setIsActivityModalOpen(false);
    setSelectedActivityReferral(null);
  };

  const getStatusColor = (status: string | null | undefined) => {
    if (!status) return 'bg-gray-500/20 text-gray-400 border-gray-500/20';
    const s = status.toLowerCase();
    if (s.includes('enrolled') || s.includes('admitted')) return 'bg-green-500/20 text-green-400 border-green-500/20';
    if (s.includes('new') || s.includes('untouch')) return 'bg-blue-500/20 text-blue-400 border-blue-500/20';
    if (s.includes('drop') || s.includes('reject')) return 'bg-red-500/20 text-red-400 border-red-500/20';
    if (s.includes('contact') || s.includes('follow')) return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/20';
    return 'bg-purple-500/20 text-purple-400 border-purple-500/20';
  };

  useEffect(() => {
    let isMounted = true;
    
    const loadData = async () => {
      if (isMounted) {
        await fetchReferrals();
      }
    };
    
    loadData();
    
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredReferrals = myReferrals.filter(r => {
    const name = r.full_name || r.referee_name || '';
    const university = r.university_interested?.name || '';
    const status = r.lead_status?.name?.toLowerCase() || '';
    
    const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          university.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (r.email || r.referee_email || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || status.includes(statusFilter.toLowerCase());
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: myReferrals.length,
    admitted: myReferrals.filter(r => r.lead_status?.name?.toLowerCase().includes('enrolled')).length,
    pending: myReferrals.filter(r => {
      const status = r.lead_status?.name?.toLowerCase() || '';
      return status.includes('new') || status.includes('untouch') || status.includes('contact');
    }).length,
    rejected: myReferrals.filter(r => r.lead_status?.name?.toLowerCase().includes('drop') || r.lead_status?.name?.toLowerCase().includes('reject')).length,
  };

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
              disabled={isLoadingCRM}
            >
              <RefreshCw className={cn("w-4 h-4 mr-2", isLoadingCRM && "animate-spin")} />
              Refresh CRM Data
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
              My Referrals ({filteredReferrals.length})
              {isLoadingCRM && <Loader2 className="w-4 h-4 animate-spin ml-2 inline" />}
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
                    <tr className="border-b border-white/10 bg-white/5">
                      <th className="text-left p-4 text-sm font-semibold text-white/60">Name</th>
                      <th className="text-left p-4 text-sm font-semibold text-white/60">Mobile</th>
                      <th className="text-left p-4 text-sm font-semibold text-white/60">Email</th>
                      <th className="text-left p-4 text-sm font-semibold text-white/60">Status</th>
                      <th className="text-left p-4 text-sm font-semibold text-white/60">Sub Status</th>
                      <th className="text-left p-4 text-sm font-semibold text-white/60">Activity Log</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredReferrals.map((referral) => (
                      <tr key={referral.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        {/* Name */}
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-xs font-bold text-white">
                              {(referral.full_name || referral.referee_name || 'UN').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                            </div>
                            <div>
                              <p className="font-medium text-white">{referral.full_name || referral.referee_name}</p>
                            </div>
                          </div>
                        </td>
                        
                        {/* Mobile */}
                        <td className="p-4">
                          <p className="text-sm text-white font-mono">
                            {referral.mobile_number || referral.referee_phone || '-'}
                          </p>
                        </td>
                        
                        {/* Email */}
                        <td className="p-4">
                          <p className="text-sm text-white truncate max-w-[180px]" title={referral.email || referral.referee_email}>
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
                          <Badge variant="outline" className="text-xs border-white/20 text-white/80">
                            {referral.lead_sub_status?.name || '-'}
                          </Badge>
                        </td>
                        
                        {/* Activity Log */}
                        <td className="p-4">
                          {referral.activity_log && referral.activity_log.length > 0 ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-auto py-1 px-2 text-xs text-white/80 hover:text-white"
                              onClick={() => openActivityModal(referral)}
                            >
                              <Activity className="w-3 h-3 mr-1" />
                              {referral.activity_log.length} {referral.activity_log.length === 1 ? 'activity' : 'activities'}
                            </Button>
                          ) : (
                            <span className="text-xs text-white/40">No activity</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Activity Log Modal */}
      <Dialog open={isActivityModalOpen} onOpenChange={setIsActivityModalOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] bg-[#1a1a24] border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-display text-white flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Activity Log
              {selectedActivityReferral && (
                <span className="text-white/60 text-base font-normal">
                  - {selectedActivityReferral.full_name || selectedActivityReferral.referee_name}
                </span>
              )}
            </DialogTitle>
          </DialogHeader>
          
          {selectedActivityReferral && selectedActivityReferral.activity_log && selectedActivityReferral.activity_log.length > 0 ? (
            <ScrollArea className="max-h-[60vh] pr-4">
              <div className="space-y-4">
                {selectedActivityReferral.activity_log.map((activity, idx) => (
                  <div 
                    key={activity.id || idx} 
                    className="p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                          <Activity className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold text-white">{activity.activity?.name || 'Unknown Activity'}</p>
                          <p className="text-sm text-white/60">{activity.activity_details?.title || 'No details'}</p>
                        </div>
                      </div>
                      <p className="text-xs text-white/40">
                        {new Date(activity.created_at).toLocaleString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    
                    {activity.activity_details && Object.keys(activity.activity_details).length > 1 && (
                      <div className="mt-3 pt-3 border-t border-white/10">
                        <p className="text-xs text-white/60 mb-2">Details:</p>
                        <div className="space-y-1">
                          {Object.entries(activity.activity_details).map(([key, value]) => {
                            if (key === 'title' || !value) return null;
                            return (
                              <div key={key} className="text-xs">
                                <span className="text-white/60 capitalize">{key.replace(/_/g, ' ')}:</span>{' '}
                                <span className="text-white">
                                  {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                    
                    {(activity as any).created_by && (
                      <div className="mt-2 text-xs text-white/40">
                        By: {(activity as any).created_by.first_name} {(activity as any).created_by.last_name}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="p-8 text-center text-white/60">
              <Activity className="w-12 h-12 mx-auto mb-4 text-white/20" />
              <p>No activity logs available</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </ReferrerLayout>
  );
};

export default ReferrerReferrals;
