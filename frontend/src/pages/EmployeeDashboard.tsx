import { useState, useEffect } from 'react';
import { EmployeeLayout } from '@/components/layout/EmployeeLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pagination, PaginationContent, PaginationItem, PaginationPrevious, PaginationLink, PaginationNext } from '@/components/ui/pagination';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { motion } from 'framer-motion';
import { 
  Plus, Search, FileText, Users, TrendingUp, Clock, 
  Linkedin, ExternalLink, Copy, CheckCircle, XCircle, 
  AlertCircle, Loader2, Briefcase, SlidersHorizontal
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import apiClient from '@/lib/api/client';

interface Job {
  id: number;
  job_title: string;
  job_code?: string;
  company_id: number;
  company_name?: string;
  industry_name?: string;
  exp_from?: number;
  exp_to?: number;
  ctc_from?: number;
  ctc_to?: number;
  hide_salary: boolean;
  description?: string;
  vacancies: number;
  location?: string;
  valid_till?: string;
}

interface JobReferral {
  id: string;
  referral_code: string;
  referee_name: string;
  referee_email: string;
  referee_phone: string;
  referee_linkedin?: string;
  referee_experience?: number;
  referee_current_company?: string;
  job_id: number;
  job_title?: string;
  company_name?: string;
  status: string;
  submission_date: string;
  expected_reward?: number;
  reward_status: string;
}

interface Stats {
  total_referrals: number;
  submitted: number;
  screening: number;
  interviewed: number;
  offered: number;
  joined: number;
  rejected: number;
  total_earnings: number;
  pending_earnings: number;
  current_month_referrals: number;
}

const EmployeeDashboard = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [linkedinDialogOpen, setLinkedinDialogOpen] = useState(false);
  
  // Data states
  const [jobs, setJobs] = useState<Job[]>([]);
  const [referrals, setReferrals] = useState<JobReferral[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [linkedinTemplate, setLinkedinTemplate] = useState<string>('');
  const [selectedJobForShare, setSelectedJobForShare] = useState<Job | null>(null);
  
  // Pagination and filters
  const [currentPage, setCurrentPage] = useState(1);
  const [totalReferrals, setTotalReferrals] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [jobFilter, setJobFilter] = useState('all');
  
  // Column visibility
  const [visibleColumns, setVisibleColumns] = useState({
    referral_code: true,
    referee_name: true,
    referee_email: true,
    job_title: true,
    company_name: true,
    status: true,
    submission_date: true,
    expected_reward: true,
  });
  
  // Referral form
  const [formData, setFormData] = useState({
    referee_name: '',
    referee_email: '',
    referee_phone: '',
    referee_linkedin: '',
    referee_experience: '',
    referee_current_company: '',
    referee_current_designation: '',
    job_id: '',
    notes: '',
  });

  // Fetch data on mount
  useEffect(() => {
    fetchData();
  }, [currentPage, statusFilter, jobFilter]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch jobs for the user's organization
      const jobsRes = await apiClient.get('/job-referrals/jobs', {
        params: { page: 1, per_page: 100 }
      });
      if (jobsRes.data.success) {
        setJobs(jobsRes.data.data);
      }
      
      // Fetch user's referrals
      const params: any = { page: currentPage, per_page: 10 };
      if (statusFilter !== 'all') params.status = statusFilter;
      if (jobFilter !== 'all') params.job_id = jobFilter;
      
      const referralsRes = await apiClient.get('/job-referrals/my-referrals', { params });
      if (referralsRes.data.success) {
        setReferrals(referralsRes.data.data);
        setTotalReferrals(referralsRes.data.total);
      }
      
      // Fetch stats
      const statsRes = await apiClient.get('/job-referrals/my-stats');
      if (statsRes.data.success) {
        setStats(statsRes.data.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      // Use dummy data for demo
      setJobs([
        { id: 1, job_title: 'Senior Software Engineer', company_name: 'TeamLease Digital', industry_name: 'IT', exp_from: 5, exp_to: 8, ctc_from: 15, ctc_to: 25, hide_salary: false, vacancies: 3, location: 'Bangalore', company_id: 1 },
        { id: 2, job_title: 'Product Manager', company_name: 'TeamLease Digital', industry_name: 'IT', exp_from: 4, exp_to: 7, ctc_from: 18, ctc_to: 30, hide_salary: false, vacancies: 2, location: 'Mumbai', company_id: 1 },
        { id: 3, job_title: 'Data Analyst', company_name: 'TeamLease Digital', industry_name: 'IT', exp_from: 2, exp_to: 4, ctc_from: 8, ctc_to: 14, hide_salary: false, vacancies: 5, location: 'Hyderabad', company_id: 1 },
      ]);
      setReferrals([
        { id: '1', referral_code: 'JR-ABC123', referee_name: 'Rahul Kumar', referee_email: 'rahul@example.com', referee_phone: '9876543210', job_id: 1, job_title: 'Senior Software Engineer', company_name: 'TeamLease Digital', status: 'screening', submission_date: '2024-12-20T10:00:00', expected_reward: 10000, reward_status: 'pending' },
        { id: '2', referral_code: 'JR-DEF456', referee_name: 'Priya Sharma', referee_email: 'priya@example.com', referee_phone: '9876543211', job_id: 2, job_title: 'Product Manager', company_name: 'TeamLease Digital', status: 'interviewed', submission_date: '2024-12-18T14:00:00', expected_reward: 15000, reward_status: 'pending' },
        { id: '3', referral_code: 'JR-GHI789', referee_name: 'Amit Patel', referee_email: 'amit@example.com', referee_phone: '9876543212', job_id: 3, job_title: 'Data Analyst', company_name: 'TeamLease Digital', status: 'joined', submission_date: '2024-12-10T09:00:00', expected_reward: 7500, reward_status: 'approved' },
      ]);
      setStats({
        total_referrals: 12,
        submitted: 3,
        screening: 4,
        interviewed: 2,
        offered: 1,
        joined: 1,
        rejected: 1,
        total_earnings: 25000,
        pending_earnings: 32500,
        current_month_referrals: 5
      });
      setTotalReferrals(3);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitReferral = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.referee_name || !formData.referee_email || !formData.referee_phone || !formData.job_id) {
      toast({ title: 'Validation Error', description: 'Please fill all required fields', variant: 'destructive' });
      return;
    }
    
    setIsSubmitting(true);
    try {
      const response = await apiClient.post('/job-referrals/submit', {
        referee_name: formData.referee_name,
        referee_email: formData.referee_email,
        referee_phone: formData.referee_phone,
        referee_linkedin: formData.referee_linkedin || null,
        referee_experience: formData.referee_experience ? parseFloat(formData.referee_experience) : null,
        referee_current_company: formData.referee_current_company || null,
        referee_current_designation: formData.referee_current_designation || null,
        job_id: parseInt(formData.job_id),
        notes: formData.notes || null,
      });
      
      if (response.data.success) {
        toast({ title: 'Success!', description: 'Referral submitted successfully' });
        setDialogOpen(false);
        setFormData({
          referee_name: '',
          referee_email: '',
          referee_phone: '',
          referee_linkedin: '',
          referee_experience: '',
          referee_current_company: '',
          referee_current_designation: '',
          job_id: '',
          notes: '',
        });
        fetchData();
      }
    } catch (error: any) {
      toast({ 
        title: 'Error', 
        description: error.response?.data?.detail || 'Failed to submit referral',
        variant: 'destructive' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLinkedInShare = async (job: Job) => {
    setSelectedJobForShare(job);
    try {
      const response = await apiClient.get(`/job-referrals/linkedin-share/${job.id}`);
      if (response.data.success) {
        setLinkedinTemplate(response.data.data.share_text);
      }
    } catch (error) {
      // Generate template locally
      const template = `🚀 We're Hiring! ${job.job_title} at ${job.company_name}

📍 Location: ${job.location || 'Multiple Locations'}
💼 Experience: ${job.exp_from || 0}-${job.exp_to || 0} years
${!job.hide_salary ? `💰 CTC: ₹${job.ctc_from}L - ₹${job.ctc_to}L` : ''}

Looking for talented professionals! If you know someone who'd be a great fit, let me know.

#hiring #jobs #${job.job_title?.replace(/\s+/g, '')} #careers`;
      setLinkedinTemplate(template);
    }
    setLinkedinDialogOpen(true);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: 'Copied!', description: 'Text copied to clipboard' });
  };

  const openLinkedIn = () => {
    const encodedText = encodeURIComponent(linkedinTemplate);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.origin)}&summary=${encodedText}`, '_blank');
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string; icon: React.ReactNode }> = {
      submitted: { color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', icon: <Clock className="w-3 h-3" /> },
      screening: { color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', icon: <AlertCircle className="w-3 h-3" /> },
      interview_scheduled: { color: 'bg-purple-500/20 text-purple-400 border-purple-500/30', icon: <Users className="w-3 h-3" /> },
      interviewed: { color: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30', icon: <Users className="w-3 h-3" /> },
      offered: { color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30', icon: <FileText className="w-3 h-3" /> },
      joined: { color: 'bg-green-500/20 text-green-400 border-green-500/30', icon: <CheckCircle className="w-3 h-3" /> },
      rejected: { color: 'bg-red-500/20 text-red-400 border-red-500/30', icon: <XCircle className="w-3 h-3" /> },
    };
    const config = statusConfig[status] || statusConfig.submitted;
    return (
      <Badge variant="outline" className={`${config.color} flex items-center gap-1`}>
        {config.icon}
        {status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
      </Badge>
    );
  };

  const statCards = [
    { title: 'Total Referrals', value: stats?.total_referrals || 0, icon: FileText, color: 'text-amber-500', bgColor: 'bg-amber-500/10' },
    { title: 'In Progress', value: (stats?.submitted || 0) + (stats?.screening || 0) + (stats?.interviewed || 0), icon: Clock, color: 'text-blue-500', bgColor: 'bg-blue-500/10' },
    { title: 'Successful Joins', value: stats?.joined || 0, icon: CheckCircle, color: 'text-green-500', bgColor: 'bg-green-500/10' },
    { title: 'Total Earnings', value: `₹${((stats?.total_earnings || 0) / 1000).toFixed(1)}K`, icon: TrendingUp, color: 'text-purple-500', bgColor: 'bg-purple-500/10' },
  ];

  const totalPages = Math.ceil(totalReferrals / 10);

  return (
    <EmployeeLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl font-bold text-white mb-2">Dashboard</h1>
            <p className="text-white/60">Refer candidates for jobs in your organization</p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-amber-500 hover:bg-amber-600 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Referral
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-[#1a1a2e] border-white/10 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add New Referral</DialogTitle>
                  <DialogDescription className="text-white/60">
                    Refer a candidate for a job position
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmitReferral} className="space-y-4 mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Candidate Name *</Label>
                      <Input
                        value={formData.referee_name}
                        onChange={(e) => setFormData({ ...formData, referee_name: e.target.value })}
                        className="bg-white/5 border-white/10"
                        placeholder="Full name"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Email *</Label>
                      <Input
                        type="email"
                        value={formData.referee_email}
                        onChange={(e) => setFormData({ ...formData, referee_email: e.target.value })}
                        className="bg-white/5 border-white/10"
                        placeholder="candidate@email.com"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Phone *</Label>
                      <Input
                        value={formData.referee_phone}
                        onChange={(e) => setFormData({ ...formData, referee_phone: e.target.value })}
                        className="bg-white/5 border-white/10"
                        placeholder="+91 9876543210"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>LinkedIn Profile</Label>
                      <Input
                        value={formData.referee_linkedin}
                        onChange={(e) => setFormData({ ...formData, referee_linkedin: e.target.value })}
                        className="bg-white/5 border-white/10"
                        placeholder="https://linkedin.com/in/..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Experience (Years)</Label>
                      <Input
                        type="number"
                        step="0.5"
                        value={formData.referee_experience}
                        onChange={(e) => setFormData({ ...formData, referee_experience: e.target.value })}
                        className="bg-white/5 border-white/10"
                        placeholder="5"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Current Company</Label>
                      <Input
                        value={formData.referee_current_company}
                        onChange={(e) => setFormData({ ...formData, referee_current_company: e.target.value })}
                        className="bg-white/5 border-white/10"
                        placeholder="Current employer"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Current Designation</Label>
                      <Input
                        value={formData.referee_current_designation}
                        onChange={(e) => setFormData({ ...formData, referee_current_designation: e.target.value })}
                        className="bg-white/5 border-white/10"
                        placeholder="Current role"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Job Position *</Label>
                      <Select value={formData.job_id} onValueChange={(v) => setFormData({ ...formData, job_id: v })}>
                        <SelectTrigger className="bg-white/5 border-white/10">
                          <SelectValue placeholder="Select a job" />
                        </SelectTrigger>
                        <SelectContent>
                          {jobs.map((job) => (
                            <SelectItem key={job.id} value={job.id.toString()}>
                              {job.job_title} ({job.location})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Notes</Label>
                    <Textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      className="bg-white/5 border-white/10 min-h-[80px]"
                      placeholder="Any additional information..."
                    />
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="border-white/10">
                      Cancel
                    </Button>
                    <Button type="submit" className="bg-amber-500 hover:bg-amber-600" disabled={isSubmitting}>
                      {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                      Submit Referral
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </motion.div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-all">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/60 text-sm">{stat.title}</p>
                      <p className="text-3xl font-bold text-white mt-1">{stat.value}</p>
                    </div>
                    <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                      <stat.icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Available Jobs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-amber-500" />
                Available Jobs in Your Organization
              </CardTitle>
              <CardDescription className="text-white/60">Share these jobs on LinkedIn to attract candidates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {jobs.slice(0, 6).map((job) => (
                  <Card key={job.id} className="bg-white/5 border-white/10 hover:bg-white/10 transition-all">
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-white mb-2">{job.job_title}</h3>
                      <p className="text-white/60 text-sm mb-1">{job.company_name}</p>
                      <p className="text-white/50 text-xs mb-2">📍 {job.location || 'Remote'}</p>
                      <div className="flex items-center gap-2 text-xs text-white/50 mb-3">
                        <span>💼 {job.exp_from}-{job.exp_to} yrs</span>
                        {!job.hide_salary && <span>| 💰 ₹{job.ctc_from}-{job.ctc_to}L</span>}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 border-white/10 text-white hover:bg-white/10"
                          onClick={() => handleLinkedInShare(job)}
                        >
                          <Linkedin className="w-3 h-3 mr-1" />
                          Share
                        </Button>
                        <Button
                          size="sm"
                          className="flex-1 bg-amber-500 hover:bg-amber-600"
                          onClick={() => {
                            setFormData({ ...formData, job_id: job.id.toString() });
                            setDialogOpen(true);
                          }}
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          Refer
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Referrals Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle className="text-white">My Referrals</CardTitle>
                  <CardDescription className="text-white/60">Track all your referrals and their status</CardDescription>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                    <Input
                      placeholder="Search..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9 bg-white/5 border-white/10 w-48"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-36 bg-white/5 border-white/10">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="submitted">Submitted</SelectItem>
                      <SelectItem value="screening">Screening</SelectItem>
                      <SelectItem value="interviewed">Interviewed</SelectItem>
                      <SelectItem value="offered">Offered</SelectItem>
                      <SelectItem value="joined">Joined</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="border-white/10">
                        <SlidersHorizontal className="w-4 h-4 mr-2" />
                        Columns
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {Object.entries(visibleColumns).map(([key, value]) => (
                        <DropdownMenuCheckboxItem
                          key={key}
                          checked={value}
                          onCheckedChange={(checked) => 
                            setVisibleColumns({ ...visibleColumns, [key]: checked })
                          }
                        >
                          {key.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </DropdownMenuCheckboxItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
                </div>
              ) : (
                <>
                  <div className="rounded-md border border-white/10 overflow-x-auto">
                    <Table>
                      <TableHeader className="bg-white/5">
                        <TableRow className="border-white/10">
                          {visibleColumns.referral_code && <TableHead className="text-white/80">Code</TableHead>}
                          {visibleColumns.referee_name && <TableHead className="text-white/80">Candidate</TableHead>}
                          {visibleColumns.referee_email && <TableHead className="text-white/80">Email</TableHead>}
                          {visibleColumns.job_title && <TableHead className="text-white/80">Job</TableHead>}
                          {visibleColumns.company_name && <TableHead className="text-white/80">Company</TableHead>}
                          {visibleColumns.status && <TableHead className="text-white/80">Status</TableHead>}
                          {visibleColumns.submission_date && <TableHead className="text-white/80">Date</TableHead>}
                          {visibleColumns.expected_reward && <TableHead className="text-white/80">Reward</TableHead>}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {referrals
                          .filter(r => 
                            r.referee_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            r.referee_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            r.referral_code.toLowerCase().includes(searchTerm.toLowerCase())
                          )
                          .map((referral) => (
                            <TableRow key={referral.id} className="border-white/5 hover:bg-white/5">
                              {visibleColumns.referral_code && (
                                <TableCell className="font-mono text-sm text-white">{referral.referral_code}</TableCell>
                              )}
                              {visibleColumns.referee_name && (
                                <TableCell className="text-white">{referral.referee_name}</TableCell>
                              )}
                              {visibleColumns.referee_email && (
                                <TableCell className="text-white/80">{referral.referee_email}</TableCell>
                              )}
                              {visibleColumns.job_title && (
                                <TableCell className="text-white/80">{referral.job_title}</TableCell>
                              )}
                              {visibleColumns.company_name && (
                                <TableCell className="text-white/80">{referral.company_name}</TableCell>
                              )}
                              {visibleColumns.status && (
                                <TableCell>{getStatusBadge(referral.status)}</TableCell>
                              )}
                              {visibleColumns.submission_date && (
                                <TableCell className="text-white/60">
                                  {new Date(referral.submission_date).toLocaleDateString()}
                                </TableCell>
                              )}
                              {visibleColumns.expected_reward && (
                                <TableCell className="text-green-400 font-medium">
                                  ₹{(referral.expected_reward || 0).toLocaleString()}
                                </TableCell>
                              )}
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </div>
                  
                  {totalPages > 1 && (
                    <Pagination className="mt-6">
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious 
                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                            className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                          />
                        </PaginationItem>
                        {[...Array(totalPages)].map((_, i) => (
                          <PaginationItem key={i}>
                            <PaginationLink
                              onClick={() => setCurrentPage(i + 1)}
                              isActive={currentPage === i + 1}
                              className="cursor-pointer"
                            >
                              {i + 1}
                            </PaginationLink>
                          </PaginationItem>
                        ))}
                        <PaginationItem>
                          <PaginationNext
                            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                            className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* LinkedIn Share Dialog */}
        <Dialog open={linkedinDialogOpen} onOpenChange={setLinkedinDialogOpen}>
          <DialogContent className="bg-[#1a1a2e] border-white/10 text-white max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Linkedin className="w-5 h-5 text-[#0077B5]" />
                Share on LinkedIn
              </DialogTitle>
              <DialogDescription className="text-white/60">
                Post about {selectedJobForShare?.job_title} to attract candidates
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <Textarea
                value={linkedinTemplate}
                onChange={(e) => setLinkedinTemplate(e.target.value)}
                className="bg-white/5 border-white/10 min-h-[200px] text-sm"
                placeholder="Loading template..."
              />
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 border-white/10"
                  onClick={() => copyToClipboard(linkedinTemplate)}
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Text
                </Button>
                <Button
                  className="flex-1 bg-[#0077B5] hover:bg-[#006699]"
                  onClick={openLinkedIn}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open LinkedIn
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </EmployeeLayout>
  );
};

export default EmployeeDashboard;

