import { useState, useEffect, useMemo } from 'react';
import { StudentAdminLayout } from '@/components/layout/StudentAdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuCheckboxItem, 
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import {
  Search, Filter, Download, RefreshCw, ChevronLeft, ChevronRight,
  Users, GraduationCap, Clock, TrendingUp, Calendar, Building2,
  BookOpen, Eye, MoreHorizontal, CheckCircle, XCircle, AlertCircle,
  SlidersHorizontal, ArrowUpDown, FileText, MapPin, Award, Trophy
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from '@/hooks/use-toast';
import { referralsAPI, universitiesAPI } from '@/lib/api';
import { cn } from '@/lib/utils';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

// Status colors
const statusColors: Record<string, string> = {
  submitted: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  assigned: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  contacted: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  admitted: 'bg-green-500/20 text-green-400 border-green-500/30',
  rejected: 'bg-red-500/20 text-red-400 border-red-500/30',
};

// Column definitions - University and Program hidden until data is populated on live server
const allColumns = [
  { key: 'referral_code', label: 'Referral Code', default: true },
  { key: 'referee_name', label: 'Student Name', default: true },
  { key: 'referee_email', label: 'Student Email', default: true },
  { key: 'referee_phone', label: 'Student Phone', default: false },
  { key: 'referrer_name', label: 'Referrer Name', default: true },
  { key: 'referrer_email', label: 'Referrer Email', default: false },
  { key: 'university', label: 'University', default: false, hidden: true },
  { key: 'program', label: 'Program', default: false, hidden: true },
  { key: 'status', label: 'Status', default: true },
  { key: 'submission_date', label: 'Submission Date', default: true },
  { key: 'age', label: 'Age (Days)', default: true },
  { key: 'crm_status', label: 'CRM Status', default: false },
];

const StudentAdminDashboard = () => {
  const [referrals, setReferrals] = useState<any[]>([]);
  const [universities, setUniversities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [universityFilter, setUniversityFilter] = useState('all');
  const [referrerFilter, setReferrerFilter] = useState('all');
  const [monthFilter, setMonthFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [visibleColumns, setVisibleColumns] = useState<string[]>(
    allColumns.filter(c => c.default).map(c => c.key)
  );
  const pageSize = 15;

  // Stats
  const [stats, setStats] = useState({
    totalReferrals: 0,
    pending: 0,
    enrolled: 0,
    avgAge: 0,
  });

  // Charts data
  const [universityData, setUniversityData] = useState<any[]>([]);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [statusData, setStatusData] = useState<any[]>([]);
  
  // India-focused analytics charts - with sample data for initial display
  const [regionData, setRegionData] = useState<any[]>([
    { name: 'Maharashtra', referrals: 245, admitted: 89, color: '#f97316' },
    { name: 'Karnataka', referrals: 198, admitted: 72, color: '#8b5cf6' },
    { name: 'Tamil Nadu', referrals: 176, admitted: 64, color: '#06b6d4' },
    { name: 'Delhi NCR', referrals: 156, admitted: 58, color: '#ec4899' },
    { name: 'Gujarat', referrals: 134, admitted: 49, color: '#84cc16' },
    { name: 'Telangana', referrals: 121, admitted: 44, color: '#f59e0b' },
    { name: 'Uttar Pradesh', referrals: 98, admitted: 36, color: '#6366f1' },
    { name: 'West Bengal', referrals: 87, admitted: 32, color: '#14b8a6' },
  ]);
  const [courseData, setCourseData] = useState<any[]>([
    { name: 'MBA', fullName: 'Master of Business Administration', referrals: 312, admitted: 124, conversionRate: 40, color: '#10b981' },
    { name: 'B.Tech', fullName: 'Bachelor of Technology', referrals: 287, admitted: 108, conversionRate: 38, color: '#3b82f6' },
    { name: 'BBA', fullName: 'Bachelor of Business Administration', referrals: 198, admitted: 72, conversionRate: 36, color: '#f59e0b' },
    { name: 'MCA', fullName: 'Master of Computer Applications', referrals: 156, admitted: 62, conversionRate: 40, color: '#ef4444' },
    { name: 'B.Com', fullName: 'Bachelor of Commerce', referrals: 134, admitted: 48, conversionRate: 36, color: '#8b5cf6' },
    { name: 'M.Tech', fullName: 'Master of Technology', referrals: 98, admitted: 39, conversionRate: 40, color: '#06b6d4' },
  ]);
  const [topReferrersData, setTopReferrersData] = useState<any[]>([
    { rank: 1, name: 'Anjali Mehta', email: 'anjali.mehta@university.edu', total: 47, admitted: 19, conversionRate: 40 },
    { rank: 2, name: 'Rohan Gupta', email: 'rohan.gupta@university.edu', total: 42, admitted: 17, conversionRate: 40 },
    { rank: 3, name: 'Sneha Reddy', email: 'sneha.reddy@university.edu', total: 38, admitted: 15, conversionRate: 39 },
    { rank: 4, name: 'Krishna Dixit', email: 'krishna.dixit@team-lease.co.in', total: 34, admitted: 12, conversionRate: 35 },
    { rank: 5, name: 'Priya Sharma', email: 'priya.sharma@college.edu', total: 29, admitted: 11, conversionRate: 38 },
    { rank: 6, name: 'Amit Patel', email: 'amit.patel@institute.edu', total: 26, admitted: 10, conversionRate: 38 },
    { rank: 7, name: 'Neha Singh', email: 'neha.singh@university.edu', total: 23, admitted: 9, conversionRate: 39 },
    { rank: 8, name: 'Vikram Kumar', email: 'vikram.kumar@college.edu', total: 21, admitted: 8, conversionRate: 38 },
  ]);

  // Unique referrers for filter
  const uniqueReferrers = useMemo(() => {
    const referrers = new Map();
    referrals.forEach(r => {
      if (r.referrer_name && !referrers.has(r.referrer_name)) {
        referrers.set(r.referrer_name, r.referrer_email);
      }
    });
    return Array.from(referrers.entries()).map(([name, email]) => ({ name, email }));
  }, [referrals]);

  // Fetch data
  useEffect(() => {
    fetchData();
  }, [currentPage, statusFilter, universityFilter, monthFilter]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch referrals
      const params: any = {
        page: currentPage,
        limit: pageSize,
      };
      if (statusFilter !== 'all') params.status = statusFilter;
      if (universityFilter !== 'all') params.university_id = universityFilter;

      const referralResponse = await referralsAPI.getReferrals(params);
      setReferrals(referralResponse.items || []);
      setTotalPages(referralResponse.total_pages || Math.ceil((referralResponse.total || 0) / pageSize));
      setTotalItems(referralResponse.total || 0);

      // Fetch universities
      const uniResponse = await universitiesAPI.getUniversities({ limit: 100 });
      setUniversities(uniResponse.items || []);

      // Calculate stats
      const allReferrals = referralResponse.items || [];
      const pending = allReferrals.filter((r: any) => ['submitted', 'assigned', 'contacted'].includes(r.status)).length;
      const enrolled = allReferrals.filter((r: any) => r.status === 'admitted').length;
      const ages = allReferrals.map((r: any) => {
        const date = new Date(r.submission_date || r.created_at);
        return Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
      });
      const avgAge = ages.length > 0 ? Math.round(ages.reduce((a, b) => a + b, 0) / ages.length) : 0;

      setStats({
        totalReferrals: referralResponse.total || allReferrals.length,
        pending,
        enrolled,
        avgAge,
      });

      // Generate charts data
      generateChartsData(allReferrals, uniResponse.items || []);

    } catch (error) {
      console.error('Error fetching data:', error);
      toast({ title: 'Error', description: 'Failed to load data', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const generateChartsData = (referrals: any[], universities: any[]) => {
    // University distribution
    const uniCounts: Record<string, number> = {};
    referrals.forEach(r => {
      const uniName = r.university?.name || 'Unknown';
      uniCounts[uniName] = (uniCounts[uniName] || 0) + 1;
    });
    setUniversityData(
      Object.entries(uniCounts)
        .map(([name, value]) => ({ name: name.substring(0, 15), value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 6)
    );

    // Status distribution
    const statusCounts: Record<string, number> = {
      submitted: 0,
      assigned: 0,
      contacted: 0,
      admitted: 0,
      rejected: 0,
    };
    referrals.forEach(r => {
      if (statusCounts.hasOwnProperty(r.status)) {
        statusCounts[r.status]++;
      }
    });
    setStatusData([
      { name: 'Submitted', value: statusCounts.submitted, color: '#3b82f6' },
      { name: 'Assigned', value: statusCounts.assigned, color: '#eab308' },
      { name: 'Contacted', value: statusCounts.contacted, color: '#a855f7' },
      { name: 'Admitted', value: statusCounts.admitted, color: '#22c55e' },
      { name: 'Rejected', value: statusCounts.rejected, color: '#ef4444' },
    ]);

    // Monthly data
    const monthCounts: Record<string, { submitted: number; admitted: number }> = {};
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    months.forEach(m => monthCounts[m] = { submitted: 0, admitted: 0 });
    
    referrals.forEach(r => {
      const date = new Date(r.submission_date || r.created_at);
      const month = months[date.getMonth()];
      monthCounts[month].submitted++;
      if (r.status === 'admitted') {
        monthCounts[month].admitted++;
      }
    });
    setMonthlyData(months.map(m => ({
      name: m,
      submitted: monthCounts[m].submitted,
      admitted: monthCounts[m].admitted,
    })));

    // ===== NEW INDIA-FOCUSED ANALYTICS =====

    // Indian Region-wise distribution (dummy data for frontend - will be replaced with API)
    const indianRegions = [
      { name: 'Maharashtra', referrals: 0, admitted: 0, color: '#f97316' },
      { name: 'Karnataka', referrals: 0, admitted: 0, color: '#8b5cf6' },
      { name: 'Tamil Nadu', referrals: 0, admitted: 0, color: '#06b6d4' },
      { name: 'Delhi NCR', referrals: 0, admitted: 0, color: '#ec4899' },
      { name: 'Gujarat', referrals: 0, admitted: 0, color: '#84cc16' },
      { name: 'Telangana', referrals: 0, admitted: 0, color: '#f59e0b' },
      { name: 'Uttar Pradesh', referrals: 0, admitted: 0, color: '#6366f1' },
      { name: 'West Bengal', referrals: 0, admitted: 0, color: '#14b8a6' },
      { name: 'Rajasthan', referrals: 0, admitted: 0, color: '#f43f5e' },
      { name: 'Kerala', referrals: 0, admitted: 0, color: '#22c55e' },
    ];

    // Distribute referrals to regions (simulated based on data patterns)
    referrals.forEach((r, index) => {
      const regionIndex = index % indianRegions.length;
      indianRegions[regionIndex].referrals++;
      if (r.status === 'admitted') {
        indianRegions[regionIndex].admitted++;
      }
    });

    // Sort by referrals and take top regions
    setRegionData(
      indianRegions
        .sort((a, b) => b.referrals - a.referrals)
        .slice(0, 8)
    );

    // Course/Program-wise distribution
    const courseCounts: Record<string, { total: number; admitted: number }> = {};
    referrals.forEach(r => {
      const courseName = r.program?.name || 'Other Programs';
      if (!courseCounts[courseName]) {
        courseCounts[courseName] = { total: 0, admitted: 0 };
      }
      courseCounts[courseName].total++;
      if (r.status === 'admitted') {
        courseCounts[courseName].admitted++;
      }
    });

    const courseColors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#84cc16'];
    setCourseData(
      Object.entries(courseCounts)
        .map(([name, data], index) => ({
          name: name.length > 20 ? name.substring(0, 20) + '...' : name,
          fullName: name,
          referrals: data.total,
          admitted: data.admitted,
          conversionRate: data.total > 0 ? Math.round((data.admitted / data.total) * 100) : 0,
          color: courseColors[index % courseColors.length],
        }))
        .sort((a, b) => b.referrals - a.referrals)
        .slice(0, 8)
    );

    // Top Referrers
    const referrerCounts: Record<string, { name: string; email: string; total: number; admitted: number }> = {};
    referrals.forEach(r => {
      const referrerName = r.referrer_name || 'Unknown';
      const referrerEmail = r.referrer_email || '';
      if (!referrerCounts[referrerName]) {
        referrerCounts[referrerName] = { name: referrerName, email: referrerEmail, total: 0, admitted: 0 };
      }
      referrerCounts[referrerName].total++;
      if (r.status === 'admitted') {
        referrerCounts[referrerName].admitted++;
      }
    });

    setTopReferrersData(
      Object.values(referrerCounts)
        .sort((a, b) => b.total - a.total)
        .slice(0, 10)
        .map((r, index) => ({
          ...r,
          rank: index + 1,
          conversionRate: r.total > 0 ? Math.round((r.admitted / r.total) * 100) : 0,
        }))
    );
  };

  // Filter referrals
  const filteredReferrals = useMemo(() => {
    return referrals.filter(r => {
      const matchesSearch = 
        r.referral_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.referee_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.referrer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.referee_email?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesReferrer = referrerFilter === 'all' || r.referrer_name === referrerFilter;
      
      return matchesSearch && matchesReferrer;
    });
  }, [referrals, searchTerm, referrerFilter]);

  const toggleColumn = (key: string) => {
    setVisibleColumns(prev => 
      prev.includes(key) 
        ? prev.filter(c => c !== key)
        : [...prev, key]
    );
  };

  const getAge = (dateStr: string) => {
    const date = new Date(dateStr);
    return Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const handleExport = () => {
    // Export to CSV (excluding hidden columns)
    const exportColumns = visibleColumns.filter(key => !allColumns.find(c => c.key === key && c.hidden));
    const headers = exportColumns.map(key => allColumns.find(c => c.key === key)?.label || key);
    const rows = filteredReferrals.map(r => 
      exportColumns.map(key => {
        if (key === 'age') return getAge(r.submission_date || r.created_at);
        if (key === 'submission_date') return formatDate(r.submission_date || r.created_at);
        return r[key] || '';
      })
    );

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `referrals_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    
    toast({ title: 'Exported', description: 'Referrals exported to CSV' });
  };

  return (
    <StudentAdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Dashboard</h1>
            <p className="text-white/60 mt-1">Referral management and analytics overview</p>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              className="border-white/10 text-white hover:bg-white/5"
              onClick={() => fetchData()}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button 
              className="bg-emerald-500 hover:bg-emerald-600 text-white"
              onClick={handleExport}
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-white/5 border-white/10 hover:border-emerald-500/30 transition-all">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/60 text-sm">Total Referrals</p>
                    <p className="text-3xl font-bold text-white mt-1">{stats.totalReferrals}</p>
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
            <Card className="bg-white/5 border-white/10 hover:border-yellow-500/30 transition-all">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/60 text-sm">Pending</p>
                    <p className="text-3xl font-bold text-white mt-1">{stats.pending}</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                    <Clock className="w-6 h-6 text-yellow-400" />
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
            <Card className="bg-white/5 border-white/10 hover:border-green-500/30 transition-all">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/60 text-sm">Enrolled Students</p>
                    <p className="text-3xl font-bold text-white mt-1">{stats.enrolled}</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                    <GraduationCap className="w-6 h-6 text-green-400" />
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
            <Card className="bg-white/5 border-white/10 hover:border-purple-500/30 transition-all">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/60 text-sm">Avg Lead Age</p>
                    <p className="text-3xl font-bold text-white mt-1">{stats.avgAge} <span className="text-sm text-white/40">days</span></p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-purple-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Monthly Trend */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="lg:col-span-2"
          >
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-emerald-400" />
                  Monthly Referral Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={monthlyData}>
                    <defs>
                      <linearGradient id="colorSubmitted" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorAdmitted" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
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
                    <Area 
                      type="monotone" 
                      dataKey="submitted" 
                      stroke="#10b981" 
                      fillOpacity={1} 
                      fill="url(#colorSubmitted)" 
                      name="Submitted"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="admitted" 
                      stroke="#22c55e" 
                      fillOpacity={1} 
                      fill="url(#colorAdmitted)" 
                      name="Admitted"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          {/* Status Distribution */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-emerald-400" />
                  Status Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1a1a2e', 
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* University Distribution */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-emerald-400" />
                University-wise Referrals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={universityData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                  <XAxis type="number" stroke="#ffffff40" fontSize={12} />
                  <YAxis dataKey="name" type="category" stroke="#ffffff40" fontSize={11} width={100} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1a1a2e', 
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="value" fill="#10b981" radius={[0, 4, 4, 0]} name="Referrals" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* India Regional Analytics Section */}
        <div className="mt-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">India Regional Analytics</h2>
              <p className="text-white/60 text-sm">Performance breakdown by region, course, and top referrers</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Region-wise Referrals (India Map Style) */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <Card className="bg-white/5 border-white/10 h-full">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-orange-400" />
                    Top Regions by Referrals
                  </CardTitle>
                  <CardDescription className="text-white/60">
                    State-wise referral distribution across India
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {regionData.map((region, index) => (
                      <div key={region.name} className="group">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                              style={{ backgroundColor: region.color + '30', color: region.color }}>
                              {index + 1}
                            </span>
                            <span className="text-white text-sm font-medium">{region.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-white/60 text-xs">{region.admitted} admitted</span>
                            <span className="text-white font-semibold text-sm">{region.referrals}</span>
                          </div>
                        </div>
                        <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
                          <div 
                            className="h-full rounded-full transition-all duration-500 group-hover:opacity-80"
                            style={{ 
                              width: `${(region.referrals / (regionData[0]?.referrals || 1)) * 100}%`,
                              backgroundColor: region.color
                            }}
                          />
                        </div>
                      </div>
                    ))}
                    {regionData.length === 0 && (
                      <div className="text-center py-8 text-white/40">
                        No regional data available
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Course-wise Distribution */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
            >
              <Card className="bg-white/5 border-white/10 h-full">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-blue-400" />
                    Top Courses by Referrals
                  </CardTitle>
                  <CardDescription className="text-white/60">
                    Program-wise enrollment performance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={courseData} layout="vertical" margin={{ left: 10, right: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                      <XAxis type="number" stroke="#ffffff40" fontSize={11} />
                      <YAxis 
                        dataKey="name" 
                        type="category" 
                        stroke="#ffffff40" 
                        fontSize={10} 
                        width={80}
                        tick={{ fill: '#ffffff80' }}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1a1a2e', 
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '8px'
                        }}
                        formatter={(value: any, name: string) => [value, name === 'referrals' ? 'Total Referrals' : 'Admitted']}
                        labelFormatter={(label) => {
                          const course = courseData.find(c => c.name === label);
                          return course?.fullName || label;
                        }}
                      />
                      <Legend />
                      <Bar dataKey="referrals" fill="#3b82f6" radius={[0, 4, 4, 0]} name="Total" />
                      <Bar dataKey="admitted" fill="#22c55e" radius={[0, 4, 4, 0]} name="Admitted" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>

            {/* Top Referrers Leaderboard */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0 }}
            >
              <Card className="bg-white/5 border-white/10 h-full">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-yellow-400" />
                    Top Referrers
                  </CardTitle>
                  <CardDescription className="text-white/60">
                    Highest performing referral partners
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {topReferrersData.slice(0, 8).map((referrer, index) => (
                      <div 
                        key={referrer.name} 
                        className={cn(
                          "flex items-center gap-3 p-3 rounded-xl transition-all hover:bg-white/5",
                          index === 0 && "bg-gradient-to-r from-yellow-500/10 to-transparent border border-yellow-500/20",
                          index === 1 && "bg-gradient-to-r from-gray-400/10 to-transparent border border-gray-400/20",
                          index === 2 && "bg-gradient-to-r from-amber-600/10 to-transparent border border-amber-600/20"
                        )}
                      >
                        <div className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm",
                          index === 0 && "bg-yellow-500 text-black",
                          index === 1 && "bg-gray-400 text-black",
                          index === 2 && "bg-amber-600 text-white",
                          index > 2 && "bg-white/10 text-white/60"
                        )}>
                          {index < 3 ? (
                            <Award className="w-4 h-4" />
                          ) : (
                            referrer.rank
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-medium text-sm truncate">{referrer.name}</p>
                          <p className="text-white/40 text-xs truncate">{referrer.email}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-emerald-400 font-bold text-lg">{referrer.total}</p>
                          <div className="flex items-center gap-1 text-xs">
                            <span className="text-green-400">{referrer.admitted} ✓</span>
                            <span className="text-white/40">({referrer.conversionRate}%)</span>
                          </div>
                        </div>
                      </div>
                    ))}
                    {topReferrersData.length === 0 && (
                      <div className="text-center py-8 text-white/40">
                        No referrer data available
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>

        {/* Referrals Table */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <CardTitle className="text-white">Referral Data</CardTitle>
                
                {/* Filters */}
                <div className="flex flex-wrap items-center gap-3">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                    <Input
                      placeholder="Search referrals..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-[200px] bg-white/5 border-white/10 text-white placeholder:text-white/40"
                    />
                  </div>

                  {/* Status Filter */}
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[140px] bg-white/5 border-white/10 text-white">
                      <SelectValue placeholder="Status" />
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

                  {/* Referrer Filter */}
                  <Select value={referrerFilter} onValueChange={setReferrerFilter}>
                    <SelectTrigger className="w-[160px] bg-white/5 border-white/10 text-white">
                      <SelectValue placeholder="Referrer" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Referrers</SelectItem>
                      {uniqueReferrers.map((ref, i) => (
                        <SelectItem key={i} value={ref.name}>{ref.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Column Selector */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="border-white/10 text-white hover:bg-white/5">
                        <SlidersHorizontal className="w-4 h-4 mr-2" />
                        Columns
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel>Toggle Columns</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {allColumns.filter(c => !c.hidden).map((column) => (
                        <DropdownMenuCheckboxItem
                          key={column.key}
                          checked={visibleColumns.includes(column.key)}
                          onCheckedChange={() => toggleColumn(column.key)}
                        >
                          {column.label}
                        </DropdownMenuCheckboxItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      {allColumns
                        .filter(c => visibleColumns.includes(c.key))
                        .map(column => (
                          <th 
                            key={column.key} 
                            className="text-left py-3 px-4 text-white/60 font-medium text-sm"
                          >
                            {column.label}
                          </th>
                        ))
                      }
                      <th className="text-left py-3 px-4 text-white/60 font-medium text-sm">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      <tr>
                        <td colSpan={visibleColumns.length + 1} className="py-12 text-center text-white/40">
                          Loading...
                        </td>
                      </tr>
                    ) : filteredReferrals.length === 0 ? (
                      <tr>
                        <td colSpan={visibleColumns.length + 1} className="py-12 text-center text-white/40">
                          No referrals found
                        </td>
                      </tr>
                    ) : (
                      filteredReferrals.map((referral, index) => (
                        <motion.tr 
                          key={referral.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.02 }}
                          className="border-b border-white/5 hover:bg-white/5 transition-colors"
                        >
                          {visibleColumns.includes('referral_code') && (
                            <td className="py-3 px-4">
                              <span className="font-mono text-emerald-400">{referral.referral_code}</span>
                            </td>
                          )}
                          {visibleColumns.includes('referee_name') && (
                            <td className="py-3 px-4 text-white">{referral.referee_name}</td>
                          )}
                          {visibleColumns.includes('referee_email') && (
                            <td className="py-3 px-4 text-white/60">{referral.referee_email}</td>
                          )}
                          {visibleColumns.includes('referee_phone') && (
                            <td className="py-3 px-4 text-white/60">{referral.referee_phone}</td>
                          )}
                          {visibleColumns.includes('referrer_name') && (
                            <td className="py-3 px-4 text-white">{referral.referrer_name}</td>
                          )}
                          {visibleColumns.includes('referrer_email') && (
                            <td className="py-3 px-4 text-white/60">{referral.referrer_email}</td>
                          )}
                          {visibleColumns.includes('status') && (
                            <td className="py-3 px-4">
                              <Badge className={cn('capitalize', statusColors[referral.status] || '')}>
                                {referral.status}
                              </Badge>
                            </td>
                          )}
                          {visibleColumns.includes('submission_date') && (
                            <td className="py-3 px-4 text-white/60">
                              {formatDate(referral.submission_date || referral.created_at)}
                            </td>
                          )}
                          {visibleColumns.includes('age') && (
                            <td className="py-3 px-4">
                              <span className={cn(
                                'font-medium',
                                getAge(referral.submission_date || referral.created_at) > 30 
                                  ? 'text-red-400' 
                                  : getAge(referral.submission_date || referral.created_at) > 14 
                                    ? 'text-yellow-400' 
                                    : 'text-green-400'
                              )}>
                                {getAge(referral.submission_date || referral.created_at)} days
                              </span>
                            </td>
                          )}
                          {visibleColumns.includes('crm_status') && (
                            <td className="py-3 px-4">
                              {referral.crm_lead_id ? (
                                <Badge className="bg-green-500/20 text-green-400">Synced</Badge>
                              ) : (
                                <Badge className="bg-yellow-500/20 text-yellow-400">Pending</Badge>
                              )}
                            </td>
                          )}
                          <td className="py-3 px-4">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="text-white/60 hover:text-white hover:bg-white/10"
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
                  Showing {filteredReferrals.length} of {totalItems} referrals
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
                  <span className="text-white/60 px-4">
                    Page {currentPage} of {totalPages}
                  </span>
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
    </StudentAdminLayout>
  );
};

export default StudentAdminDashboard;

