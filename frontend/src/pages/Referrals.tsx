import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { Search, Filter, UserPlus, Eye, MoreHorizontal, Download, FileText, Users, CheckCircle, Clock, Loader2, RefreshCw, ExternalLink, Activity, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { referralsAPI, universitiesAPI, usersAPI } from '@/lib/api';
import type { CRMActivityResponse } from '@/lib/api/referrals';

type ReferralStatus = 'submitted' | 'assigned' | 'contacted' | 'admitted' | 'rejected';

const statusConfig: Record<ReferralStatus, { bg: string; text: string; dot: string }> = {
  submitted: { bg: 'bg-info/10', text: 'text-info', dot: 'bg-info' },
  assigned: { bg: 'bg-warning/10', text: 'text-warning', dot: 'bg-warning' },
  contacted: { bg: 'bg-accent/10', text: 'text-accent', dot: 'bg-accent' },
  admitted: { bg: 'bg-success/10', text: 'text-success', dot: 'bg-success' },
  rejected: { bg: 'bg-destructive/10', text: 'text-destructive', dot: 'bg-destructive' },
};

const Referrals = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [referrals, setReferrals] = useState<any[]>([]);
  const [universities, setUniversities] = useState<any[]>([]);
  const [counselors, setCounselors] = useState<any[]>([]);
  const [totalReferrals, setTotalReferrals] = useState(0);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    admitted: 0,
    conversionRate: 0
  });
  
  // Referral Details Dialog state
  const [selectedReferral, setSelectedReferral] = useState<any>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [crmActivity, setCrmActivity] = useState<CRMActivityResponse | null>(null);
  const [loadingCRM, setLoadingCRM] = useState(false);
  const [syncingCRM, setSyncingCRM] = useState(false);

  // Fetch data on mount
  useEffect(() => {
    fetchData();
  }, [statusFilter]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // First fetch to get total count
      const firstPage = await referralsAPI.getReferrals({ 
        page: 1, 
        limit: 100,
        status: statusFilter === 'all' ? undefined : statusFilter 
      });
      
      let allReferrals = [...(firstPage.items || [])];
      
      // If there are more pages, fetch them all
      const totalPages = Math.ceil((firstPage.total || 0) / 100);
      if (totalPages > 1) {
        const additionalPages = [];
        for (let page = 2; page <= totalPages; page++) {
          additionalPages.push(referralsAPI.getReferrals({ 
            page, 
            limit: 100,
            status: statusFilter === 'all' ? undefined : statusFilter 
          }));
        }
        const results = await Promise.all(additionalPages);
        results.forEach(res => {
          allReferrals = [...allReferrals, ...(res.items || [])];
        });
      }

      // Fetch universities and counselors in parallel
      const [universitiesData, counselorsData] = await Promise.all([
        universitiesAPI.getUniversities({ page: 1, limit: 100 }),
        usersAPI.getCounselors({ page: 1, limit: 100 })
      ]);

      setReferrals(allReferrals);
      setUniversities(universitiesData.items || []);
      setCounselors(counselorsData.items || []);
      setTotalReferrals(firstPage.total || 0);

      // Calculate stats from ALL referrals
      const pending = allReferrals.filter((r: any) => r.status === 'submitted').length;
      const admitted = allReferrals.filter((r: any) => r.status === 'admitted').length;
      const conversion = allReferrals.length > 0 
        ? Math.round((admitted / allReferrals.length) * 100) 
        : 0;

      setStats({
        total: allReferrals.length,
        pending,
        admitted,
        conversionRate: conversion
      });
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load referrals data',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredReferrals = referrals.filter((r) => {
    const matchesSearch =
      r.referee_name?.toLowerCase().includes(search.toLowerCase()) ||
      r.referrer_name?.toLowerCase().includes(search.toLowerCase()) ||
      r.referral_code?.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  const handleAssign = async (referralId: string, counselorId: string) => {
    try {
      await referralsAPI.assignCounselor(referralId, counselorId);
      toast({
        title: 'Counselor Assigned',
        description: `Referral has been assigned successfully`,
      });
      fetchData(); // Refresh data
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to assign counselor',
        variant: 'destructive',
      });
    }
  };

  // Open referral details and fetch CRM activity
  const handleViewDetails = async (referral: any) => {
    setSelectedReferral(referral);
    setDetailsOpen(true);
    setCrmActivity(null);
    
    // Fetch CRM activity
    setLoadingCRM(true);
    try {
      const activity = await referralsAPI.getCRMActivity(referral.id);
      setCrmActivity(activity);
    } catch (error: any) {
      console.error('Error fetching CRM activity:', error);
      // Set a default state indicating CRM is not available
      setCrmActivity({
        synced: false,
        crm_lead_id: null,
        synced_at: null,
        activity: null,
        sync_error: error.response?.status === 404 
          ? 'CRM endpoint not available on this server' 
          : 'Failed to fetch CRM status'
      });
    } finally {
      setLoadingCRM(false);
    }
  };

  // Sync referral to CRM
  const handleSyncToCRM = async () => {
    if (!selectedReferral) return;
    
    setSyncingCRM(true);
    try {
      const result = await referralsAPI.syncToCRM(selectedReferral.id);
      toast({
        title: 'CRM Sync Successful',
        description: `Lead ID: ${result.crm_lead_id}`,
      });
      // Refresh CRM activity
      try {
        const activity = await referralsAPI.getCRMActivity(selectedReferral.id);
        setCrmActivity(activity);
      } catch (e) {
        console.error('Error refreshing CRM activity:', e);
      }
      fetchData(); // Refresh main data
    } catch (error: any) {
      console.error('CRM Sync Error:', error);
      const errorMsg = error.response?.data?.detail || error.response?.data?.message || 'Failed to sync to CRM';
      toast({
        title: 'CRM Sync Failed',
        description: typeof errorMsg === 'string' ? errorMsg : 'Failed to sync to CRM. The server may not support this feature yet.',
        variant: 'destructive',
      });
      // Update CRM activity state to show error
      setCrmActivity(prev => prev ? {
        ...prev,
        sync_error: typeof errorMsg === 'string' ? errorMsg : 'Sync failed'
      } : {
        synced: false,
        crm_lead_id: null,
        synced_at: null,
        activity: null,
        sync_error: 'CRM sync endpoint not available'
      });
    } finally {
      setSyncingCRM(false);
    }
  };

  const statsCards = [
    { label: 'Total Referrals', value: stats.total, icon: FileText, gradient: 'from-primary to-info' },
    { label: 'Pending', value: stats.pending, icon: Clock, gradient: 'from-warning to-orange-500' },
    { label: 'Admitted', value: stats.admitted, icon: CheckCircle, gradient: 'from-success to-emerald-500' },
    { label: 'Conversion', value: `${stats.conversionRate}%`, icon: Users, gradient: 'from-accent to-purple-500' },
  ];

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading referrals...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <motion.div 
        className="space-y-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <motion.div 
          className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="flex items-center gap-4">
            <motion.div 
              className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center shadow-xl glow-primary"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
            >
              <FileText className="w-7 h-7 text-white" />
            </motion.div>
            <div>
              <h1 className="text-4xl font-display text-foreground">Referrals</h1>
              <p className="text-muted-foreground mt-1">Manage all referral submissions</p>
            </div>
          </div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={() => {
                toast({
                  title: 'Export Started',
                  description: 'Your CSV file is being downloaded',
                });
              }}
              variant="outline"
              className="border-2 hover:border-primary/40 hover:bg-primary/5 transition-all"
            >
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </motion.div>
        </motion.div>

        {/* Stats */}
        <motion.div 
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.1, delayChildren: 0.2 }
            }
          }}
        >
          {statsCards.map((stat, index) => (
            <motion.div
              key={stat.label}
              variants={{
                hidden: { opacity: 0, y: 20, scale: 0.95 },
                visible: { 
                  opacity: 1, 
                  y: 0, 
                  scale: 1,
                  transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] }
                }
              }}
              whileHover={{ y: -5, scale: 1.02 }}
            >
              <Card className="card-elevated h-full">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <motion.div 
                      className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg`}
                      whileHover={{ scale: 1.1, rotate: 10 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                    >
                      <stat.icon className="w-5 h-5 text-white" />
                    </motion.div>
                    <div>
                      <p className="text-2xl font-display text-foreground">{stat.value}</p>
                      <p className="text-xs text-muted-foreground">{stat.label}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Filters */}
        <Card className="card-elevated">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or code..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 bg-muted/50 border-0 focus-visible:ring-2 focus-visible:ring-primary/20"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48 bg-muted/50 border-0">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="submitted">Submitted</SelectItem>
                  <SelectItem value="assigned">Assigned</SelectItem>
                  <SelectItem value="contacted">Contacted</SelectItem>
                  <SelectItem value="admitted">Admitted</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Results count */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-semibold text-foreground">{filteredReferrals.length}</span> of {totalReferrals} referrals
          </p>
        </div>

        {/* Table */}
        <Card className="card-elevated overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                <TableHead className="font-semibold">Code</TableHead>
                <TableHead className="font-semibold">Referee</TableHead>
                <TableHead className="font-semibold">Referrer</TableHead>
                <TableHead className="font-semibold">University</TableHead>
                <TableHead className="font-semibold">Counselor</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold">Date</TableHead>
                <TableHead className="text-right font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReferrals.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12">
                    <div className="flex flex-col items-center gap-2">
                      <FileText className="w-10 h-10 text-muted-foreground/50" />
                      <p className="text-muted-foreground">No referrals found</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredReferrals.map((referral) => {
                  const university = universities?.find((u) => u.id === referral.university_id);
                  const counselor = counselors?.find((c) => c.id === referral.counselor_id);
                  const status = statusConfig[referral.status as ReferralStatus] || statusConfig.submitted;

                  return (
                    <TableRow key={referral.id} className="hover:bg-muted/30 group">
                      <TableCell>
                        <span className="font-mono text-sm font-semibold text-primary bg-primary/10 px-2 py-1 rounded-lg">
                          {referral.referral_code}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-xs">
                            {referral.referee_name?.split(' ').map((n: string) => n[0]).join('') || '??'}
                          </div>
                          <div>
                            <p className="font-semibold text-foreground group-hover:text-primary transition-colors">
                              {referral.referee_name}
                            </p>
                            <p className="text-xs text-muted-foreground">{referral.referee_email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm font-medium text-foreground">{referral.referrer_name}</p>
                          <p className="text-xs text-muted-foreground">{referral.referrer_phone}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm font-medium text-foreground">{university?.code || 'N/A'}</p>
                          <p className="text-xs text-muted-foreground">{university?.name || 'N/A'}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {counselor ? (
                          <span className="text-sm font-medium text-foreground">{counselor.name}</span>
                        ) : (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button size="sm" variant="outline" className="h-8 text-xs border-dashed hover:border-primary hover:bg-primary/5">
                                <UserPlus className="w-3 h-3 mr-1" />
                                Assign
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle className="font-display">Assign Counselor</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4 py-4">
                                <div>
                                  <Label>Select Counselor</Label>
                                  <Select onValueChange={(v) => handleAssign(referral.id, v)}>
                                    <SelectTrigger className="mt-2">
                                      <SelectValue placeholder="Choose a counselor" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {counselors.map((c) => (
                                        <SelectItem key={c.id} value={c.id}>
                                          {c.name}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn(
                            'text-[10px] font-semibold uppercase tracking-wide border-0 px-2 py-1',
                            status.bg,
                            status.text
                          )}
                        >
                          <span className={cn('w-1.5 h-1.5 rounded-full mr-1.5', status.dot)} />
                          {referral.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {referral.submission_date ? format(new Date(referral.submission_date), 'MMM d, yyyy') : 'N/A'}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-muted">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem onClick={() => handleViewDetails(referral)}>
                              <Eye className="w-4 h-4 mr-2" />
                              View Details & CRM
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => toast({ title: 'Update Status', description: `Status update dialog for ${referral.referral_code}` })}>
                              Update Status
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => toast({ title: 'Notification Sent', description: `Notification sent to ${referral.referee_name}` })}>
                              Send Notification
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </Card>

        {/* Referral Details Dialog with CRM Activity */}
        <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle className="font-display text-xl flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Referral Details
                {selectedReferral && (
                  <Badge variant="outline" className="ml-2 font-mono">
                    {selectedReferral.referral_code}
                  </Badge>
                )}
              </DialogTitle>
              <DialogDescription>
                View referral information and CRM activity
              </DialogDescription>
            </DialogHeader>

            {selectedReferral && (
              <Tabs defaultValue="details" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="details">Referral Info</TabsTrigger>
                  <TabsTrigger value="crm" className="flex items-center gap-2">
                    <Activity className="w-4 h-4" />
                    CRM Activity
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="mt-4">
                  <ScrollArea className="h-[400px] pr-4">
                    <div className="space-y-6">
                      {/* Referee Info */}
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                            Referee (Student)
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold">
                              {selectedReferral.referee_name?.split(' ').map((n: string) => n[0]).join('') || '??'}
                            </div>
                            <div>
                              <p className="font-semibold text-lg">{selectedReferral.referee_name}</p>
                              <p className="text-sm text-muted-foreground">{selectedReferral.referee_email}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Referrer Info */}
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                            Referrer
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="font-medium">{selectedReferral.referrer_name}</p>
                          <p className="text-sm text-muted-foreground">{selectedReferral.referrer_phone}</p>
                        </CardContent>
                      </Card>

                      {/* Status & Dates */}
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                            Status & Timeline
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Status</span>
                            <Badge className={cn(
                              statusConfig[selectedReferral.status as ReferralStatus]?.bg,
                              statusConfig[selectedReferral.status as ReferralStatus]?.text
                            )}>
                              {selectedReferral.status}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Submitted</span>
                            <span>{selectedReferral.submission_date ? format(new Date(selectedReferral.submission_date), 'MMM d, yyyy HH:mm') : 'N/A'}</span>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="crm" className="mt-4">
                  <ScrollArea className="h-[400px] pr-4">
                    <div className="space-y-4">
                      {/* CRM Sync Status */}
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center justify-between">
                            <span>CRM Sync Status</span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={handleSyncToCRM}
                              disabled={syncingCRM || loadingCRM}
                              className="h-8"
                            >
                              {syncingCRM ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              ) : (
                                <RefreshCw className="w-4 h-4 mr-2" />
                              )}
                              {crmActivity?.synced ? 'Re-sync' : 'Sync to CRM'}
                            </Button>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          {loadingCRM ? (
                            <div className="flex items-center justify-center py-8">
                              <Loader2 className="w-8 h-8 animate-spin text-primary" />
                              <span className="ml-2 text-muted-foreground">Loading CRM status...</span>
                            </div>
                          ) : crmActivity ? (
                            <div className="space-y-4">
                              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                                {crmActivity.synced ? (
                                  <CheckCircle2 className="w-6 h-6 text-success" />
                                ) : crmActivity.sync_error ? (
                                  <XCircle className="w-6 h-6 text-destructive" />
                                ) : (
                                  <AlertCircle className="w-6 h-6 text-warning" />
                                )}
                                <div>
                                  <p className="font-medium">
                                    {crmActivity.synced 
                                      ? 'Synced to Digivarsity CRM' 
                                      : crmActivity.sync_error 
                                        ? 'Sync Failed' 
                                        : 'Not Synced'}
                                  </p>
                                  {crmActivity.synced && crmActivity.crm_lead_id && (
                                    <p className="text-sm text-muted-foreground">
                                      Lead ID: <span className="font-mono font-bold text-primary">{crmActivity.crm_lead_id}</span>
                                    </p>
                                  )}
                                  {crmActivity.synced_at && (
                                    <p className="text-xs text-muted-foreground">
                                      Synced: {(() => {
                                        try {
                                          const date = new Date(crmActivity.synced_at);
                                          return isNaN(date.getTime()) ? 'Unknown' : format(date, 'MMM d, yyyy HH:mm');
                                        } catch {
                                          return 'Unknown';
                                        }
                                      })()}
                                    </p>
                                  )}
                                  {crmActivity.sync_error && (
                                    <p className="text-sm text-destructive mt-1">{crmActivity.sync_error}</p>
                                  )}
                                </div>
                              </div>
                            </div>
                          ) : (
                            <p className="text-muted-foreground text-center py-4">
                              Unable to fetch CRM status
                            </p>
                          )}
                        </CardContent>
                      </Card>

                      {/* CRM Activity Error */}
                      {crmActivity?.activity_error && (
                        <Card className="border-amber-500/50 bg-amber-50/10">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-2 text-amber-600">
                              <AlertCircle className="w-5 h-5" />
                              <p className="text-sm font-medium">{crmActivity.activity_error}</p>
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {/* CRM Activity Timeline */}
                      {crmActivity?.activity && (
                        <Card>
                          <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                              <Activity className="w-4 h-4" />
                              Activity Timeline
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            {Array.isArray(crmActivity.activity) && crmActivity.activity.length > 0 ? (
                              <div className="space-y-3">
                                {crmActivity.activity.map((item: any, index: number) => (
                                  <div key={item.id || index} className="flex gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                                    <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
                                    <div className="flex-1">
                                      <p className="font-medium text-sm">
                                        {item.activity?.name || item.activity || item.action || item.type || 'Activity'}
                                      </p>
                                      {item.activity_details?.title && (
                                        <p className="text-sm text-muted-foreground">{item.activity_details.title}</p>
                                      )}
                                      {item.description && (
                                        <p className="text-sm text-muted-foreground">{item.description}</p>
                                      )}
                                      {item.remarks && (
                                        <p className="text-sm text-muted-foreground">{item.remarks}</p>
                                      )}
                                      <div className="flex items-center gap-2 mt-1">
                                        {(item.created_at || item.date || item.timestamp) && (
                                          <p className="text-xs text-muted-foreground">
                                            {(() => {
                                              try {
                                                const dateStr = item.created_at || item.date || item.timestamp;
                                                const date = new Date(dateStr);
                                                return isNaN(date.getTime()) ? dateStr : format(date, 'MMM d, yyyy HH:mm');
                                              } catch {
                                                return 'Unknown';
                                              }
                                            })()}
                                          </p>
                                        )}
                                        {item.created_by && (
                                          <p className="text-xs text-muted-foreground">
                                            • by {item.created_by.first_name} {item.created_by.last_name || ''}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : typeof crmActivity.activity === 'object' && crmActivity.activity ? (
                              <pre className="text-xs bg-muted/50 p-3 rounded-lg overflow-auto max-h-48">
                                {JSON.stringify(crmActivity.activity, null, 2)}
                              </pre>
                            ) : (
                              <p className="text-muted-foreground text-center py-4">
                                No activity data available
                              </p>
                            )}
                          </CardContent>
                        </Card>
                      )}

                      {/* CRM Link */}
                      {crmActivity?.synced && crmActivity.crm_lead_id && (
                        <Card>
                          <CardContent className="p-4">
                            <a 
                              href={`https://uatcrm.digivarsity.com/leads/${crmActivity.crm_lead_id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-center gap-2 text-primary hover:underline"
                            >
                              <ExternalLink className="w-4 h-4" />
                              Open in Digivarsity CRM
                            </a>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            )}
          </DialogContent>
        </Dialog>
      </motion.div>
    </DashboardLayout>
  );
};

export default Referrals;
