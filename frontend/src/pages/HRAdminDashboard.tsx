import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HRAdminLayout } from '@/components/layout/HRAdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription 
} from '@/components/ui/dialog';
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuCheckboxItem, 
  DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator 
} from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Briefcase, Plus, Search, Users, TrendingUp, CheckCircle, Clock,
  Filter, ChevronLeft, ChevronRight, Eye, MoreHorizontal, Building2,
  MapPin, Calendar, DollarSign, RefreshCw, Settings2, ArrowUpRight, Mail
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api/client';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

interface DashboardStats {
  company_name: string;
  total_jobs: number;
  active_jobs: number;
  total_referrals: number;
  pending_referrals: number;
  successful_hires: number;
  total_referrers: number;
  conversion_rate: number;
  monthly_stats: Array<{ month: string; referrals: number; hires: number }>;
}

interface Job {
  id: number;
  job_title: string;
  job_code: string;
  company_name: string;
  industry_name: string;
  location: string;
  vacancies: number;
  exp_from: number;
  exp_to: number;
  ctc_from: number | null;
  ctc_to: number | null;
  hide_salary: boolean;
  valid_till: string;
  is_active: boolean;
  created_at: string;
  total_referrals: number;
  pending_referrals: number;
  hired_count: number;
}

const defaultColumns = [
  { key: 'job_title', label: 'Job Title', visible: true },
  { key: 'job_code', label: 'Code', visible: true },
  { key: 'location', label: 'Location', visible: true },
  { key: 'vacancies', label: 'Vacancies', visible: true },
  { key: 'total_referrals', label: 'Referrals', visible: true },
  { key: 'hired_count', label: 'Hired', visible: true },
  { key: 'valid_till', label: 'Valid Till', visible: true },
  { key: 'is_active', label: 'Status', visible: true },
];

const HRAdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [jobsLoading, setJobsLoading] = useState(false);
  
  // Pagination & Filters
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [columns, setColumns] = useState(defaultColumns);
  
  // Add Job Dialog
  const [showAddJob, setShowAddJob] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [jobForm, setJobForm] = useState({
    job_title: '',
    job_code: '',
    description: '',
    exp_from: 0,
    exp_to: 0,
    ctc_from: '',
    ctc_to: '',
    hide_salary: false,
    vacancies: 1,
    location: '',
    pincode: '',
    valid_till: '',
    recruiter_name: '',
    recruiter_email: '',
    recruiter_mobile: ''
  });

  // Fetch dashboard stats
  useEffect(() => {
    fetchStats();
  }, []);

  // Fetch jobs when filters change
  useEffect(() => {
    fetchJobs();
  }, [page, statusFilter, searchQuery]);

  const fetchStats = async () => {
    try {
      const response = await apiClient.get('/hr-admin/dashboard-stats');
      setStats(response.data.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast({ title: 'Error', description: 'Failed to load dashboard stats', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const fetchJobs = async () => {
    setJobsLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        per_page: '10',
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(searchQuery && { search: searchQuery })
      });
      const response = await apiClient.get(`/hr-admin/jobs?${params}`);
      setJobs(response.data.data);
      setTotalPages(response.data.pagination.pages);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setJobsLoading(false);
    }
  };

  const handleAddJob = async () => {
    if (!jobForm.job_title || !jobForm.description || !jobForm.location || !jobForm.valid_till) {
      toast({ title: 'Error', description: 'Please fill all required fields', variant: 'destructive' });
      return;
    }

    setSubmitting(true);
    try {
      await apiClient.post('/hr-admin/jobs', {
        ...jobForm,
        ctc_from: jobForm.ctc_from ? parseFloat(jobForm.ctc_from) : null,
        ctc_to: jobForm.ctc_to ? parseFloat(jobForm.ctc_to) : null,
      });
      toast({ 
        title: 'Success', 
        description: 'Job posted successfully! Email notifications sent to employees.' 
      });
      setShowAddJob(false);
      setJobForm({
        job_title: '', job_code: '', description: '', exp_from: 0, exp_to: 0,
        ctc_from: '', ctc_to: '', hide_salary: false, vacancies: 1, location: '',
        pincode: '', valid_till: '', recruiter_name: '', recruiter_email: '', recruiter_mobile: ''
      });
      fetchJobs();
      fetchStats();
    } catch (error) {
      console.error('Error creating job:', error);
      toast({ title: 'Error', description: 'Failed to create job', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const toggleJobStatus = async (jobId: number) => {
    try {
      await apiClient.put(`/hr-admin/jobs/${jobId}/toggle-status`);
      toast({ title: 'Success', description: 'Job status updated' });
      fetchJobs();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update job status', variant: 'destructive' });
    }
  };

  const getStatusBadge = (job: Job) => {
    if (!job.is_active) {
      return <Badge variant="outline" className="border-gray-500 text-gray-400">Inactive</Badge>;
    }
    const validDate = new Date(job.valid_till);
    if (validDate < new Date()) {
      return <Badge variant="outline" className="border-red-500 text-red-400">Expired</Badge>;
    }
    return <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">Active</Badge>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', { 
      day: '2-digit', month: 'short', year: 'numeric' 
    });
  };

  if (loading) {
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
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <motion.h1 
              className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              HR Admin Dashboard
            </motion.h1>
            <p className="text-white/60 mt-1">
              {stats?.company_name} • Manage job postings and referrals
            </p>
          </div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Button 
              onClick={() => setShowAddJob(true)}
              className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              Post New Job
            </Button>
          </motion.div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Active Jobs', value: stats?.active_jobs || 0, icon: Briefcase, color: 'blue' },
            { label: 'Total Referrals', value: stats?.total_referrals || 0, icon: Users, color: 'indigo' },
            { label: 'Successful Hires', value: stats?.successful_hires || 0, icon: CheckCircle, color: 'emerald' },
            { label: 'Conversion Rate', value: `${stats?.conversion_rate || 0}%`, icon: TrendingUp, color: 'amber' },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-all">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-${stat.color}-500/20`}>
                      <stat.icon className={`w-5 h-5 text-${stat.color}-400`} />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">{stat.value}</p>
                      <p className="text-xs text-white/60">{stat.label}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Analytics Chart */}
        {stats?.monthly_stats && stats.monthly_stats.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Referral Trends</CardTitle>
                <CardDescription className="text-white/60">
                  Monthly referrals and successful hires
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={stats.monthly_stats}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                      <XAxis dataKey="month" stroke="#ffffff60" />
                      <YAxis stroke="#ffffff60" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1a1a2e', 
                          border: '1px solid #ffffff20',
                          borderRadius: '8px'
                        }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="referrals" 
                        stackId="1"
                        stroke="#3b82f6" 
                        fill="#3b82f6" 
                        fillOpacity={0.3}
                        name="Referrals"
                      />
                      <Area 
                        type="monotone" 
                        dataKey="hires" 
                        stackId="2"
                        stroke="#10b981" 
                        fill="#10b981" 
                        fillOpacity={0.3}
                        name="Hires"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Jobs Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-blue-400" />
                    Job Listings
                  </CardTitle>
                  <CardDescription className="text-white/60">
                    All job postings with referral statistics
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                    <Input
                      placeholder="Search jobs..."
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
                      <SelectItem value="expired">Expired</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="icon" className="border-white/10 hover:bg-white/10">
                        <Settings2 className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuLabel>Toggle Columns</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {columns.map((col) => (
                        <DropdownMenuCheckboxItem
                          key={col.key}
                          checked={col.visible}
                          onCheckedChange={(checked) => {
                            setColumns(columns.map(c => 
                              c.key === col.key ? { ...c, visible: checked } : c
                            ));
                          }}
                        >
                          {col.label}
                        </DropdownMenuCheckboxItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={fetchJobs}
                    className="border-white/10 hover:bg-white/10"
                  >
                    <RefreshCw className={`w-4 h-4 ${jobsLoading ? 'animate-spin' : ''}`} />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      {columns.filter(c => c.visible).map((col) => (
                        <th key={col.key} className="text-left py-3 px-4 text-white/60 text-sm font-medium">
                          {col.label}
                        </th>
                      ))}
                      <th className="text-right py-3 px-4 text-white/60 text-sm font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {jobs.map((job) => (
                      <tr key={job.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        {columns.filter(c => c.visible).map((col) => (
                          <td key={col.key} className="py-3 px-4 text-white">
                            {col.key === 'job_title' && (
                              <div>
                                <p className="font-medium">{job.job_title}</p>
                                <p className="text-xs text-white/50">{job.company_name}</p>
                              </div>
                            )}
                            {col.key === 'job_code' && (
                              <span className="text-white/70 font-mono text-sm">{job.job_code}</span>
                            )}
                            {col.key === 'location' && (
                              <div className="flex items-center gap-1 text-white/70">
                                <MapPin className="w-3 h-3" />
                                <span className="text-sm">{job.location}</span>
                              </div>
                            )}
                            {col.key === 'vacancies' && (
                              <span className="text-white/70">{job.vacancies}</span>
                            )}
                            {col.key === 'total_referrals' && (
                              <div className="flex items-center gap-2">
                                <span className="text-blue-400 font-medium">{job.total_referrals}</span>
                                {job.pending_referrals > 0 && (
                                  <Badge variant="outline" className="text-xs border-amber-500/30 text-amber-400">
                                    {job.pending_referrals} pending
                                  </Badge>
                                )}
                              </div>
                            )}
                            {col.key === 'hired_count' && (
                              <span className="text-emerald-400 font-medium">{job.hired_count}</span>
                            )}
                            {col.key === 'valid_till' && (
                              <span className="text-white/60 text-sm">{formatDate(job.valid_till)}</span>
                            )}
                            {col.key === 'is_active' && getStatusBadge(job)}
                          </td>
                        ))}
                        <td className="py-3 px-4 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="hover:bg-white/10">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuCheckboxItem onClick={() => {}}>
                                <Eye className="w-4 h-4 mr-2" /> View Referrals
                              </DropdownMenuCheckboxItem>
                              <DropdownMenuCheckboxItem onClick={() => toggleJobStatus(job.id)}>
                                {job.is_active ? 'Deactivate' : 'Activate'}
                              </DropdownMenuCheckboxItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                    {jobs.length === 0 && (
                      <tr>
                        <td colSpan={columns.filter(c => c.visible).length + 1} className="py-12 text-center text-white/50">
                          No jobs found. Click "Post New Job" to create one.
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
                    Page {page} of {totalPages}
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
      </div>

      {/* Add Job Dialog */}
      <Dialog open={showAddJob} onOpenChange={setShowAddJob}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-blue-500" />
              Post New Job
            </DialogTitle>
            <DialogDescription>
              Create a new job posting. Employees will be notified via email.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Job Title *</Label>
                <Input
                  placeholder="e.g. Senior Software Engineer"
                  value={jobForm.job_title}
                  onChange={(e) => setJobForm({ ...jobForm, job_title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Job Code (Optional)</Label>
                <Input
                  placeholder="Auto-generated if empty"
                  value={jobForm.job_code}
                  onChange={(e) => setJobForm({ ...jobForm, job_code: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description *</Label>
              <Textarea
                placeholder="Job description, requirements, responsibilities..."
                rows={4}
                value={jobForm.description}
                onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Location *</Label>
                <Input
                  placeholder="e.g. Bangalore, Karnataka"
                  value={jobForm.location}
                  onChange={(e) => setJobForm({ ...jobForm, location: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Vacancies</Label>
                <Input
                  type="number"
                  min={1}
                  value={jobForm.vacancies}
                  onChange={(e) => setJobForm({ ...jobForm, vacancies: parseInt(e.target.value) || 1 })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Experience From (years)</Label>
                <Input
                  type="number"
                  min={0}
                  step={0.5}
                  value={jobForm.exp_from}
                  onChange={(e) => setJobForm({ ...jobForm, exp_from: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label>Experience To (years)</Label>
                <Input
                  type="number"
                  min={0}
                  step={0.5}
                  value={jobForm.exp_to}
                  onChange={(e) => setJobForm({ ...jobForm, exp_to: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>CTC From (LPA)</Label>
                <Input
                  type="number"
                  min={0}
                  placeholder="e.g. 10"
                  value={jobForm.ctc_from}
                  onChange={(e) => setJobForm({ ...jobForm, ctc_from: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>CTC To (LPA)</Label>
                <Input
                  type="number"
                  min={0}
                  placeholder="e.g. 15"
                  value={jobForm.ctc_to}
                  onChange={(e) => setJobForm({ ...jobForm, ctc_to: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Valid Till *</Label>
              <Input
                type="date"
                value={jobForm.valid_till}
                onChange={(e) => setJobForm({ ...jobForm, valid_till: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <div className="flex items-start gap-2">
                <Mail className="w-5 h-5 text-blue-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-400">Email Notification</p>
                  <p className="text-xs text-white/60 mt-1">
                    All employees in your organization will receive an email notification about this job posting.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddJob(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAddJob} 
              disabled={submitting}
              className="bg-gradient-to-r from-blue-500 to-indigo-500"
            >
              {submitting ? 'Posting...' : 'Post Job'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </HRAdminLayout>
  );
};

export default HRAdminDashboard;

