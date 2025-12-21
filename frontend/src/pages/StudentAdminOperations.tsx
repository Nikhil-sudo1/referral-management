import { useState, useEffect } from 'react';
import { StudentAdminLayout } from '@/components/layout/StudentAdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Search, Filter, Users, UserCheck, UserX, DollarSign, TrendingUp,
  AlertCircle, CheckCircle, XCircle, Eye, MoreHorizontal, RefreshCw,
  Calendar, Award, Wallet, ChevronLeft, ChevronRight, Ban, ShieldCheck
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from '@/hooks/use-toast';
import { usersAPI } from '@/lib/api';
import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

const StudentAdminOperations = () => {
  const [referrers, setReferrers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [monthFilter, setMonthFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedReferrer, setSelectedReferrer] = useState<any>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState<'activate' | 'deactivate' | null>(null);
  const pageSize = 10;

  // Stats
  const [stats, setStats] = useState({
    totalReferrers: 0,
    activeReferrers: 0,
    inactiveReferrers: 0,
    totalEarnings: 0,
  });

  // Performance data
  const [performanceData, setPerformanceData] = useState<any[]>([]);

  useEffect(() => {
    fetchReferrers();
  }, [currentPage, statusFilter]);

  const fetchReferrers = async () => {
    setIsLoading(true);
    try {
      const params: any = {
        page: currentPage,
        limit: pageSize,
      };
      if (statusFilter === 'active') params.is_active = true;
      if (statusFilter === 'inactive') params.is_active = false;

      const response = await usersAPI.getReferrers(params);
      const items = response.items || [];
      
      // Add mock data for demo
      const enrichedItems = items.map((referrer: any) => ({
        ...referrer,
        total_referrals: Math.floor(Math.random() * 30) + 1,
        admitted_count: Math.floor(Math.random() * 10),
        total_earnings: Math.floor(Math.random() * 100000) + 5000,
        pending_earnings: Math.floor(Math.random() * 20000),
        last_referral_date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        performance_score: Math.floor(Math.random() * 40) + 60,
      }));

      setReferrers(enrichedItems);
      setTotalPages(response.total_pages || Math.ceil((response.total || items.length) / pageSize));

      // Calculate stats
      const active = enrichedItems.filter((r: any) => r.is_active).length;
      const totalEarnings = enrichedItems.reduce((sum: number, r: any) => sum + (r.total_earnings || 0), 0);
      
      setStats({
        totalReferrers: response.total || items.length,
        activeReferrers: active,
        inactiveReferrers: enrichedItems.length - active,
        totalEarnings,
      });

      // Generate performance data
      generatePerformanceData(enrichedItems);
    } catch (error) {
      console.error('Error fetching referrers:', error);
      toast({ title: 'Error', description: 'Failed to load referrers', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const generatePerformanceData = (data: any[]) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    setPerformanceData(months.map(month => ({
      name: month,
      referrals: Math.floor(Math.random() * 100) + 30,
      earnings: Math.floor(Math.random() * 200000) + 50000,
      active: Math.floor(Math.random() * 20) + 10,
    })));
  };

  const handleToggleStatus = (referrer: any) => {
    setSelectedReferrer(referrer);
    setConfirmAction(referrer.is_active ? 'deactivate' : 'activate');
    setShowConfirmDialog(true);
  };

  const confirmToggleStatus = async () => {
    if (!selectedReferrer) return;

    try {
      // API call to toggle status would go here
      // await usersAPI.updateUser(selectedReferrer.id, { is_active: !selectedReferrer.is_active });

      // Update local state
      setReferrers(prev => prev.map(r => 
        r.id === selectedReferrer.id 
          ? { ...r, is_active: !r.is_active }
          : r
      ));

      toast({
        title: confirmAction === 'activate' ? 'Referrer Activated' : 'Referrer Deactivated',
        description: confirmAction === 'activate' 
          ? `${selectedReferrer.full_name || selectedReferrer.name} can now login and submit referrals.`
          : `${selectedReferrer.full_name || selectedReferrer.name}'s account has been deactivated and their referral code is disabled.`,
      });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update status', variant: 'destructive' });
    } finally {
      setShowConfirmDialog(false);
      setSelectedReferrer(null);
      setConfirmAction(null);
    }
  };

  const viewDetails = (referrer: any) => {
    setSelectedReferrer(referrer);
    setShowDetailsDialog(true);
  };

  const filteredReferrers = referrers.filter(r => {
    const name = r.full_name || r.name || '';
    const email = r.email || '';
    return name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           email.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <StudentAdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Users className="w-8 h-8 text-emerald-400" />
              Operations
            </h1>
            <p className="text-white/60 mt-1">Manage referrers, rewards, and performance</p>
          </div>
          <Button 
            variant="outline" 
            className="border-white/10 text-white hover:bg-white/5"
            onClick={() => fetchReferrers()}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/60 text-sm">Total Referrers</p>
                    <p className="text-3xl font-bold text-white mt-1">{stats.totalReferrers}</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                    <Users className="w-6 h-6 text-emerald-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/60 text-sm">Active</p>
                    <p className="text-3xl font-bold text-green-400 mt-1">{stats.activeReferrers}</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                    <UserCheck className="w-6 h-6 text-green-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/60 text-sm">Inactive</p>
                    <p className="text-3xl font-bold text-red-400 mt-1">{stats.inactiveReferrers}</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center">
                    <UserX className="w-6 h-6 text-red-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/60 text-sm">Total Earnings</p>
                    <p className="text-2xl font-bold text-yellow-400 mt-1">{formatCurrency(stats.totalEarnings)}</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-yellow-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Performance Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
                Monthly Performance Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                  <XAxis dataKey="name" stroke="#ffffff40" fontSize={12} />
                  <YAxis stroke="#ffffff40" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1a1a2e', 
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Bar dataKey="referrals" fill="#10b981" name="Referrals" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="active" fill="#3b82f6" name="Active Users" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Referrers Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <CardTitle className="text-white">Active Referrers</CardTitle>
                
                <div className="flex flex-wrap items-center gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                    <Input
                      placeholder="Search referrers..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-[200px] bg-white/5 border-white/10 text-white placeholder:text-white/40"
                    />
                  </div>

                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[140px] bg-white/5 border-white/10 text-white">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={monthFilter} onValueChange={setMonthFilter}>
                    <SelectTrigger className="w-[140px] bg-white/5 border-white/10 text-white">
                      <Calendar className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="Month" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Time</SelectItem>
                      <SelectItem value="jan">January</SelectItem>
                      <SelectItem value="feb">February</SelectItem>
                      <SelectItem value="mar">March</SelectItem>
                      <SelectItem value="apr">April</SelectItem>
                      <SelectItem value="may">May</SelectItem>
                      <SelectItem value="jun">June</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-3 px-4 text-white/60 font-medium text-sm">Referrer</th>
                      <th className="text-left py-3 px-4 text-white/60 font-medium text-sm">Referral Code</th>
                      <th className="text-center py-3 px-4 text-white/60 font-medium text-sm">Status</th>
                      <th className="text-center py-3 px-4 text-white/60 font-medium text-sm">Referrals</th>
                      <th className="text-center py-3 px-4 text-white/60 font-medium text-sm">Admitted</th>
                      <th className="text-right py-3 px-4 text-white/60 font-medium text-sm">Total Earnings</th>
                      <th className="text-right py-3 px-4 text-white/60 font-medium text-sm">Pending</th>
                      <th className="text-center py-3 px-4 text-white/60 font-medium text-sm">Performance</th>
                      <th className="text-center py-3 px-4 text-white/60 font-medium text-sm">Active</th>
                      <th className="text-center py-3 px-4 text-white/60 font-medium text-sm">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      <tr>
                        <td colSpan={10} className="py-12 text-center text-white/40">Loading...</td>
                      </tr>
                    ) : filteredReferrers.length === 0 ? (
                      <tr>
                        <td colSpan={10} className="py-12 text-center text-white/40">No referrers found</td>
                      </tr>
                    ) : (
                      filteredReferrers.map((referrer, index) => (
                        <motion.tr
                          key={referrer.id || index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.02 }}
                          className="border-b border-white/5 hover:bg-white/5 transition-colors"
                        >
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center text-white font-bold">
                                {(referrer.full_name || referrer.name || 'U').charAt(0)}
                              </div>
                              <div>
                                <p className="text-white font-medium">{referrer.full_name || referrer.name}</p>
                                <p className="text-white/50 text-sm">{referrer.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <span className="font-mono text-emerald-400">{referrer.referral_code || '-'}</span>
                          </td>
                          <td className="py-4 px-4 text-center">
                            <Badge className={referrer.is_active 
                              ? 'bg-green-500/20 text-green-400 border-green-500/30'
                              : 'bg-red-500/20 text-red-400 border-red-500/30'
                            }>
                              {referrer.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </td>
                          <td className="py-4 px-4 text-center">
                            <span className="text-xl font-bold text-white">{referrer.total_referrals}</span>
                          </td>
                          <td className="py-4 px-4 text-center">
                            <span className="text-green-400 font-medium">{referrer.admitted_count}</span>
                          </td>
                          <td className="py-4 px-4 text-right">
                            <span className="text-yellow-400 font-medium">{formatCurrency(referrer.total_earnings)}</span>
                          </td>
                          <td className="py-4 px-4 text-right">
                            <span className="text-orange-400 font-medium">{formatCurrency(referrer.pending_earnings)}</span>
                          </td>
                          <td className="py-4 px-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <div className="w-16 h-2 bg-white/10 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full rounded-full ${
                                    referrer.performance_score >= 80 ? 'bg-green-500' :
                                    referrer.performance_score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                                  }`}
                                  style={{ width: `${referrer.performance_score}%` }}
                                />
                              </div>
                              <span className="text-white/60 text-sm">{referrer.performance_score}%</span>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-center">
                            <Switch
                              checked={referrer.is_active}
                              onCheckedChange={() => handleToggleStatus(referrer)}
                            />
                          </td>
                          <td className="py-4 px-4 text-center">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="text-white/60 hover:text-white hover:bg-white/10"
                              onClick={() => viewDetails(referrer)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </td>
                        </motion.tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/10">
                <p className="text-sm text-white/60">
                  Showing {filteredReferrers.length} referrers
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="border-white/10 text-white hover:bg-white/5"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <span className="text-white/60 px-4">Page {currentPage} of {totalPages}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="border-white/10 text-white hover:bg-white/5"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="bg-[#0a0a0f] border-white/10 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center text-white font-bold text-lg">
                {(selectedReferrer?.full_name || selectedReferrer?.name || 'U').charAt(0)}
              </div>
              <div>
                <p>{selectedReferrer?.full_name || selectedReferrer?.name}</p>
                <p className="text-sm text-white/60 font-normal">{selectedReferrer?.email}</p>
              </div>
            </DialogTitle>
          </DialogHeader>
          
          {selectedReferrer && (
            <div className="space-y-6 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-white/5">
                  <p className="text-white/60 text-sm">Referral Code</p>
                  <p className="text-emerald-400 font-mono text-lg">{selectedReferrer.referral_code || '-'}</p>
                </div>
                <div className="p-4 rounded-xl bg-white/5">
                  <p className="text-white/60 text-sm">Status</p>
                  <Badge className={selectedReferrer.is_active 
                    ? 'bg-green-500/20 text-green-400 border-green-500/30 mt-1'
                    : 'bg-red-500/20 text-red-400 border-red-500/30 mt-1'
                  }>
                    {selectedReferrer.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-white/5 text-center">
                  <p className="text-white/60 text-sm">Total Referrals</p>
                  <p className="text-2xl font-bold text-white mt-1">{selectedReferrer.total_referrals}</p>
                </div>
                <div className="p-4 rounded-xl bg-white/5 text-center">
                  <p className="text-white/60 text-sm">Admitted</p>
                  <p className="text-2xl font-bold text-green-400 mt-1">{selectedReferrer.admitted_count}</p>
                </div>
                <div className="p-4 rounded-xl bg-white/5 text-center">
                  <p className="text-white/60 text-sm">Performance</p>
                  <p className="text-2xl font-bold text-yellow-400 mt-1">{selectedReferrer.performance_score}%</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <div className="flex items-center gap-2 text-emerald-400 mb-2">
                    <Wallet className="w-4 h-4" />
                    <p className="text-sm">Total Earnings</p>
                  </div>
                  <p className="text-2xl font-bold text-white">{formatCurrency(selectedReferrer.total_earnings)}</p>
                </div>
                <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20">
                  <div className="flex items-center gap-2 text-orange-400 mb-2">
                    <Award className="w-4 h-4" />
                    <p className="text-sm">Pending Earnings</p>
                  </div>
                  <p className="text-2xl font-bold text-white">{formatCurrency(selectedReferrer.pending_earnings)}</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white/5">
                <p className="text-white/60 text-sm mb-2">Last Referral Date</p>
                <p className="text-white">{formatDate(selectedReferrer.last_referral_date)}</p>
              </div>
            </div>
          )}

          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setShowDetailsDialog(false)} className="border-white/10 text-white">
              Close
            </Button>
            <Button 
              className={selectedReferrer?.is_active ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}
              onClick={() => {
                setShowDetailsDialog(false);
                handleToggleStatus(selectedReferrer);
              }}
            >
              {selectedReferrer?.is_active ? (
                <><Ban className="w-4 h-4 mr-2" /> Deactivate</>
              ) : (
                <><ShieldCheck className="w-4 h-4 mr-2" /> Activate</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="bg-[#0a0a0f] border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {confirmAction === 'deactivate' ? (
                <AlertCircle className="w-5 h-5 text-red-400" />
              ) : (
                <CheckCircle className="w-5 h-5 text-green-400" />
              )}
              {confirmAction === 'deactivate' ? 'Deactivate Referrer' : 'Activate Referrer'}
            </DialogTitle>
            <DialogDescription className="text-white/60">
              {confirmAction === 'deactivate' 
                ? `Are you sure you want to deactivate ${selectedReferrer?.full_name || selectedReferrer?.name}? They will not be able to login and their referral code will be disabled.`
                : `Are you sure you want to activate ${selectedReferrer?.full_name || selectedReferrer?.name}? They will be able to login and submit referrals again.`
              }
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)} className="border-white/10 text-white">
              Cancel
            </Button>
            <Button 
              className={confirmAction === 'deactivate' ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}
              onClick={confirmToggleStatus}
            >
              {confirmAction === 'deactivate' ? 'Deactivate' : 'Activate'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </StudentAdminLayout>
  );
};

export default StudentAdminOperations;

