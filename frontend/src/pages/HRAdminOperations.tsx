import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HRAdminLayout } from '@/components/layout/HRAdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription
} from '@/components/ui/dialog';
import {
  Search, Users, DollarSign, RefreshCw, ChevronLeft, ChevronRight,
  UserCheck, UserX, AlertTriangle, Clock, TrendingUp, Shield
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api/client';

interface Referrer {
  id: string;
  name: string;
  email: string;
  phone: string;
  referral_code: string;
  is_active: boolean;
  total_referrals: number;
  successful_hires: number;
  pending_earnings: number;
  paid_earnings: number;
  created_at: string;
  last_referral_date: string | null;
}

const HRAdminOperations = () => {
  const [referrers, setReferrers] = useState<Referrer[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Confirmation dialog
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    referrer: Referrer | null;
    action: 'activate' | 'deactivate';
  }>({ open: false, referrer: null, action: 'activate' });

  useEffect(() => {
    fetchReferrers();
  }, [page, statusFilter, searchQuery]);

  const fetchReferrers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        per_page: '10',
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(searchQuery && { search: searchQuery })
      });
      const response = await apiClient.get(`/hr-admin/operations/referrers?${params}`);
      setReferrers(response.data.data);
      setTotalPages(response.data.pagination.pages);
      setTotal(response.data.pagination.total);
    } catch (error) {
      console.error('Error fetching referrers:', error);
      toast({ title: 'Error', description: 'Failed to load referrers', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!confirmDialog.referrer) return;
    
    try {
      await apiClient.put(`/hr-admin/operations/referrers/${confirmDialog.referrer.id}/toggle-status`);
      toast({ 
        title: 'Success', 
        description: `Referrer ${confirmDialog.action === 'activate' ? 'activated' : 'deactivated'} successfully` 
      });
      setConfirmDialog({ open: false, referrer: null, action: 'activate' });
      fetchReferrers();
    } catch (error) {
      console.error('Error toggling status:', error);
      toast({ title: 'Error', description: 'Failed to update referrer status', variant: 'destructive' });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Calculate summary stats
  const activeCount = referrers.filter(r => r.is_active).length;
  const totalEarnings = referrers.reduce((sum, r) => sum + r.paid_earnings, 0);
  const pendingEarnings = referrers.reduce((sum, r) => sum + r.pending_earnings, 0);

  if (loading && referrers.length === 0) {
    return (
      <HRAdminLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </HRAdminLayout>
    );
  }

  return (
    <HRAdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <motion.h1 
            className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Operations
          </motion.h1>
          <p className="text-white/60 mt-1">
            Manage referrers, control access, and monitor performance
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Referrers', value: total, icon: Users, color: 'blue' },
            { label: 'Active', value: activeCount, icon: UserCheck, color: 'emerald' },
            { label: 'Pending Earnings', value: formatCurrency(pendingEarnings), icon: Clock, color: 'amber' },
            { label: 'Paid Out', value: formatCurrency(totalEarnings), icon: DollarSign, color: 'green' },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="bg-white/5 border-white/10">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-${stat.color}-500/20`}>
                      <stat.icon className={`w-5 h-5 text-${stat.color}-400`} />
                    </div>
                    <div>
                      <p className="text-xl font-bold text-white">{stat.value}</p>
                      <p className="text-xs text-white/60">{stat.label}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Referrers Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Shield className="w-5 h-5 text-blue-400" />
                    Referrer Management
                  </CardTitle>
                  <CardDescription className="text-white/60">
                    Control referrer access and view performance metrics
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                    <Input
                      placeholder="Search..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 bg-white/5 border-white/10 text-white w-48"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-32 bg-white/5 border-white/10 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={fetchReferrers}
                    className="border-white/10 hover:bg-white/10"
                  >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-3 px-4 text-white/60 text-sm font-medium">Referrer</th>
                      <th className="text-left py-3 px-4 text-white/60 text-sm font-medium">Code</th>
                      <th className="text-center py-3 px-4 text-white/60 text-sm font-medium">Referrals</th>
                      <th className="text-center py-3 px-4 text-white/60 text-sm font-medium">Hires</th>
                      <th className="text-right py-3 px-4 text-white/60 text-sm font-medium">Earnings</th>
                      <th className="text-center py-3 px-4 text-white/60 text-sm font-medium">Status</th>
                      <th className="text-center py-3 px-4 text-white/60 text-sm font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {referrers.map((referrer) => (
                      <tr key={referrer.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                              referrer.is_active 
                                ? 'bg-gradient-to-br from-blue-500 to-indigo-500 text-white' 
                                : 'bg-white/10 text-white/50'
                            }`}>
                              {referrer.name.charAt(0)}
                            </div>
                            <div>
                              <p className="text-white font-medium">{referrer.name}</p>
                              <p className="text-white/50 text-xs">{referrer.email}</p>
                              <p className="text-white/40 text-xs">{referrer.phone}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <code className={`text-sm px-2 py-1 rounded ${
                            referrer.is_active 
                              ? 'bg-blue-500/20 text-blue-400' 
                              : 'bg-white/10 text-white/40 line-through'
                          }`}>
                            {referrer.referral_code}
                          </code>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <span className="text-blue-400 font-medium">{referrer.total_referrals}</span>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <span className="text-emerald-400 font-medium">{referrer.successful_hires}</span>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <div>
                            <p className="text-white font-medium">{formatCurrency(referrer.paid_earnings)}</p>
                            {referrer.pending_earnings > 0 && (
                              <p className="text-amber-400 text-xs">
                                +{formatCurrency(referrer.pending_earnings)} pending
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-4 text-center">
                          {referrer.is_active ? (
                            <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="border-red-500/30 text-red-400">
                              Inactive
                            </Badge>
                          )}
                        </td>
                        <td className="py-4 px-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Switch
                              checked={referrer.is_active}
                              onCheckedChange={() => {
                                setConfirmDialog({
                                  open: true,
                                  referrer,
                                  action: referrer.is_active ? 'deactivate' : 'activate'
                                });
                              }}
                              className="data-[state=checked]:bg-emerald-500"
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                    {referrers.length === 0 && (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-white/50">
                          No referrers found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
                  <p className="text-sm text-white/60">
                    Page {page} of {totalPages} • {total} total referrers
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="border-white/10"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="border-white/10"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Info Card */}
        <Card className="bg-amber-500/10 border-amber-500/20">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-400 mt-0.5" />
              <div>
                <p className="text-amber-400 font-medium">Access Control</p>
                <p className="text-white/60 text-sm mt-1">
                  When a referrer is deactivated, their login will be restricted and their referral code will be disabled.
                  Any pending referrals will remain in the system but new referrals cannot be made.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {confirmDialog.action === 'deactivate' ? (
                <UserX className="w-5 h-5 text-red-500" />
              ) : (
                <UserCheck className="w-5 h-5 text-emerald-500" />
              )}
              {confirmDialog.action === 'deactivate' ? 'Deactivate' : 'Activate'} Referrer
            </DialogTitle>
            <DialogDescription>
              {confirmDialog.action === 'deactivate' ? (
                <>
                  Are you sure you want to deactivate <strong>{confirmDialog.referrer?.name}</strong>?
                  This will:
                  <ul className="list-disc list-inside mt-2 text-sm">
                    <li>Restrict their login access</li>
                    <li>Disable their referral code</li>
                    <li>Prevent new referrals from being submitted</li>
                  </ul>
                </>
              ) : (
                <>
                  Are you sure you want to activate <strong>{confirmDialog.referrer?.name}</strong>?
                  This will restore their login access and referral code.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDialog({ ...confirmDialog, open: false })}>
              Cancel
            </Button>
            <Button
              onClick={handleToggleStatus}
              className={confirmDialog.action === 'deactivate' 
                ? 'bg-red-500 hover:bg-red-600' 
                : 'bg-emerald-500 hover:bg-emerald-600'
              }
            >
              {confirmDialog.action === 'deactivate' ? 'Deactivate' : 'Activate'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </HRAdminLayout>
  );
};

export default HRAdminOperations;

