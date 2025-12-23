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

  // Status mapping based on CRM lead_status IDs
  const getStatusCategory = (statusId: number | null | undefined, statusName: string | null | undefined): 'admitted' | 'rejected' | 'pending' => {
    if (!statusId) return 'pending';
    
    // ID 34 = Enrolled -> admitted
    if (statusId === 34) return 'admitted';
    
    // IDs 36-50 = Drop category -> rejected
    if (statusId >= 36 && statusId <= 50) return 'rejected';
    
    // All other statuses = pending
    return 'pending';
  };

  const getStatusColor = (statusId: number | null | undefined, statusName: string | null | undefined) => {
    const category = getStatusCategory(statusId, statusName);
    
    if (category === 'admitted') return 'bg-green-500/20 text-green-400 border-green-500/20';
    if (category === 'rejected') return 'bg-red-500/20 text-red-400 border-red-500/20';
    return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/20';
  };

  const getStatusDisplay = (statusId: number | null | undefined, statusName: string | null | undefined): string => {
    const category = getStatusCategory(statusId, statusName);
    
    if (category === 'admitted') return 'Admitted';
    if (category === 'rejected') return 'Rejected';
    return 'Pending';
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
    const statusCategory = getStatusCategory(r.lead_status?.id, r.lead_status?.name);
    
    const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          university.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (r.email || r.referee_email || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || statusCategory === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: myReferrals.length,
    admitted: myReferrals.filter(r => getStatusCategory(r.lead_status?.id, r.lead_status?.name) === 'admitted').length,
    pending: myReferrals.filter(r => getStatusCategory(r.lead_status?.id, r.lead_status?.name) === 'pending').length,
    rejected: myReferrals.filter(r => getStatusCategory(r.lead_status?.id, r.lead_status?.name) === 'rejected').length,
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
                <option value="pending">Pending</option>
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
                          <Badge className={cn('border-0 font-medium', getStatusColor(referral.lead_status?.id, referral.lead_status?.name))}>
                            {getStatusDisplay(referral.lead_status?.id, referral.lead_status?.name) || referral.local_status || 'Unknown'}
                          </Badge>
                          {referral.lead_status?.name && (
                            <p className="text-xs text-white/60 mt-1">{referral.lead_status.name}</p>
                          )}
                        </td>
                        
                        {/* Sub Status */}
                        <td className="p-4">
                          {referral.lead_sub_status?.name ? (
                            <div>
                              <Badge variant="outline" className="text-xs border-white/20 text-white/80">
                                {referral.lead_sub_status.name}
                              </Badge>
                              {referral.lead_sub_status.id && (
                                <p className="text-xs text-white/40 mt-1">ID: {referral.lead_sub_status.id}</p>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-white/40">-</span>
                          )}
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
                {selectedActivityReferral.activity_log.map((activity, idx) => {
                  const details: any = activity.activity_details || {};
                  const activityName = activity.activity?.name || 'Unknown Activity';
                  const createdDate = new Date(activity.created_at);
                  
                  // Helper function to format nested objects
                  const formatValue = (key: string, value: any): string => {
                    if (value === null || value === undefined) return '';
                    if (typeof value === 'object' && value !== null) {
                      if (value.name) return value.name;
                      if (value.id && value.name) return `${value.name} (ID: ${value.id})`;
                      if (value.first_name || value.last_name) {
                        const name = `${value.first_name || ''} ${value.last_name || ''}`.trim();
                        return name || 'Unassigned';
                      }
                      return JSON.stringify(value);
                    }
                    return String(value);
                  };

                  // Helper to format date-time
                  const formatDateTime = (dateStr: string, timeStr?: string) => {
                    if (!dateStr) return '';
                    try {
                      if (timeStr) {
                        const [hours, minutes] = timeStr.split(':');
                        const date = new Date(dateStr);
                        date.setHours(parseInt(hours || '0'), parseInt(minutes || '0'));
                        return date.toLocaleString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        });
                      }
                      return new Date(dateStr).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      });
                    } catch {
                      return dateStr;
                    }
                  };

                  return (
                    <div 
                      key={activity.id || idx} 
                      className="p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors"
                    >
                      {/* Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Activity className="w-5 h-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-white text-base mb-1">{activityName}</p>
                            {details.title && (
                              <p className="text-sm text-white/70 mb-2">{details.title}</p>
                            )}
                            {details.details && (
                              <p className="text-sm text-white/80 mb-2">{details.details}</p>
                            )}
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0 ml-4">
                          <p className="text-xs text-white/60 font-medium">
                            {createdDate.toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </p>
                          <p className="text-xs text-white/50">
                            {createdDate.toLocaleTimeString('en-IN', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>

                      {/* Special handling for Follow-up Created */}
                      {activityName === 'Follow-up Created' && (
                        <div className="mt-3 pt-3 border-t border-white/10 space-y-2.5">
                          {details.details && (
                            <div className="flex gap-3">
                              <span className="text-xs text-white/60 w-28 flex-shrink-0">Details:</span>
                              <span className="text-xs text-white flex-1">{details.details}</span>
                            </div>
                          )}
                          {details['follow up mode'] && (
                            <div className="flex gap-3">
                              <span className="text-xs text-white/60 w-28 flex-shrink-0">Follow-up Mode:</span>
                              <span className="text-xs text-white flex-1">{formatValue('follow up mode', details['follow up mode'])}</span>
                            </div>
                          )}
                          {details['follow up date time'] && (
                            <div className="flex gap-3">
                              <span className="text-xs text-white/60 w-28 flex-shrink-0">Follow-up Date:</span>
                              <span className="text-xs text-white flex-1">
                                {formatDateTime(details['follow up date time'], details.time)}
                              </span>
                            </div>
                          )}
                          {details.time && !details['follow up date time'] && (
                            <div className="flex gap-3">
                              <span className="text-xs text-white/60 w-28 flex-shrink-0">Time:</span>
                              <span className="text-xs text-white flex-1">{details.time}</span>
                            </div>
                          )}
                          {details.reminder && (
                            <div className="flex gap-3">
                              <span className="text-xs text-white/60 w-28 flex-shrink-0">Reminder:</span>
                              <span className="text-xs text-white flex-1">{formatValue('reminder', details.reminder)}</span>
                            </div>
                          )}
                          {details['follow status'] && (
                            <div className="flex gap-3">
                              <span className="text-xs text-white/60 w-28 flex-shrink-0">Follow Status:</span>
                              <span className="text-xs text-white flex-1">{formatValue('follow status', details['follow status'])}</span>
                            </div>
                          )}
                          {details.status && (
                            <div className="flex gap-3">
                              <span className="text-xs text-white/60 w-28 flex-shrink-0">Status:</span>
                              <span className="text-xs text-white flex-1">
                                <Badge variant="outline" className="text-xs border-white/20 text-white/80">
                                  {details.status}
                                </Badge>
                              </span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Special handling for Stage Transfer / Lead status changed */}
                      {(activityName === 'Stage Transfer' || activityName === 'Lead status changed') && (
                        <div className="mt-3 pt-3 border-t border-white/10 space-y-2.5">
                          {details['old stage'] && (
                            <div className="flex gap-3">
                              <span className="text-xs text-white/60 w-28 flex-shrink-0">Old Stage:</span>
                              <span className="text-xs text-white flex-1">
                                <Badge variant="outline" className="text-xs border-red-500/30 text-red-400">
                                  {formatValue('old stage', details['old stage'])}
                                </Badge>
                              </span>
                            </div>
                          )}
                          {details['new stage'] && (
                            <div className="flex gap-3">
                              <span className="text-xs text-white/60 w-28 flex-shrink-0">New Stage:</span>
                              <span className="text-xs text-white flex-1">
                                <Badge variant="outline" className="text-xs border-green-500/30 text-green-400">
                                  {formatValue('new stage', details['new stage'])}
                                </Badge>
                              </span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Special handling for Change Ownership */}
                      {activityName === 'Change Ownership' && details.old_owner && details.new_owner && (
                        <div className="mt-3 pt-3 border-t border-white/10 space-y-2.5">
                          <div className="flex gap-3">
                            <span className="text-xs text-white/60 w-28 flex-shrink-0">From:</span>
                            <span className="text-xs text-white flex-1">
                              {details.old_owner.first_name === 'un-assigned' 
                                ? 'Unassigned' 
                                : formatValue('old_owner', details.old_owner)}
                            </span>
                          </div>
                          <div className="flex gap-3">
                            <span className="text-xs text-white/60 w-28 flex-shrink-0">To:</span>
                            <span className="text-xs text-white font-medium flex-1">
                              {formatValue('new_owner', details.new_owner)}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Generic activity details (for other activities) */}
                      {activityName !== 'Follow-up Created' && 
                       activityName !== 'Stage Transfer' && 
                       activityName !== 'Lead status changed' &&
                       activityName !== 'Change Ownership' &&
                       details && 
                       Object.keys(details).length > 0 && (
                        <div className="mt-3 pt-3 border-t border-white/10 space-y-2">
                          {Object.entries(details).map(([key, value]) => {
                            if (key === 'title' || !value || value === null) return null;
                            if (key === 'details' && activityName !== 'Follow-up Created') return null;
                            
                            const displayKey = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                            const displayValue = formatValue(key, value);
                            
                            if (!displayValue) return null;
                            
                            return (
                              <div key={key} className="flex gap-3">
                                <span className="text-xs text-white/60 w-28 flex-shrink-0">{displayKey}:</span>
                                <span className="text-xs text-white flex-1 break-words">{displayValue}</span>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Created By */}
                      {(activity as any).created_by && (
                        <div className="mt-3 pt-3 border-t border-white/10">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-white/60">Created by:</span>
                            <span className="text-xs text-white font-medium">
                              {(activity as any).created_by.first_name} {(activity as any).created_by.last_name || ''}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
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
