import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { Search, Filter, UserPlus, Eye, MoreHorizontal, Download, FileText, Users, CheckCircle, Clock, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { referralsAPI, universitiesAPI, usersAPI } from '@/lib/api';

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

  // Fetch data on mount
  useEffect(() => {
    fetchData();
  }, [statusFilter]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch referrals, universities, and counselors in parallel
      const [referralsData, universitiesData, counselorsData] = await Promise.all([
        referralsAPI.getReferrals({ 
          page: 1, 
          limit: 100,
          status: statusFilter === 'all' ? undefined : statusFilter 
        }),
        universitiesAPI.getUniversities({ page: 1, limit: 100 }),
        usersAPI.getCounselors({ page: 1, limit: 100 })
      ]);

      setReferrals(referralsData.items || []);
      setUniversities(universitiesData.items || []);
      setCounselors(counselorsData.items || []);
      setTotalReferrals(referralsData.total || 0);

      // Calculate stats
      const pending = referralsData.items.filter((r: any) => r.status === 'submitted').length;
      const admitted = referralsData.items.filter((r: any) => r.status === 'admitted').length;
      const conversion = referralsData.items.length > 0 
        ? Math.round((admitted / referralsData.items.length) * 100) 
        : 0;

      setStats({
        total: referralsData.items.length,
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
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center shadow-xl glow-primary">
              <FileText className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-display text-foreground">Referrals</h1>
              <p className="text-muted-foreground mt-1">Manage all referral submissions</p>
            </div>
          </div>
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
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {statsCards.map((stat, index) => (
            <Card key={stat.label} className="card-elevated animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg`}>
                    <stat.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-display text-foreground">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

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
                            <DropdownMenuItem onClick={() => toast({ title: 'View Details', description: `Viewing details for ${referral.referee_name}` })}>
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
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
      </div>
    </DashboardLayout>
  );
};

export default Referrals;
