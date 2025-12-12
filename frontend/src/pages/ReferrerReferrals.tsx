import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ReferrerLayout } from '@/components/layout/ReferrerLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  FileText, CheckCircle, XCircle, Phone, Users, Search,
  Download, Filter, Plus, Mail
} from 'lucide-react';
import { cn } from '@/lib/utils';

const myReferrals = [
  { id: '1', name: 'Alice Johnson', email: 'alice@email.com', phone: '+91 9999999991', university: 'MIT', program: 'MBA', status: 'admitted', date: '2024-10-01', reward: 15000, rewardStatus: 'paid', counselor: 'Sarah Williams' },
  { id: '2', name: 'Bob Williams', email: 'bob@email.com', phone: '+91 9999999992', university: 'MIT', program: 'MS CS', status: 'contacted', date: '2024-10-15', reward: 12000, rewardStatus: 'pending', counselor: 'Michael Brown' },
  { id: '3', name: 'Charlie Brown', email: 'charlie@email.com', phone: '+91 9999999993', university: 'Stanford', program: 'EMBA', status: 'assigned', date: '2024-11-01', reward: 18000, rewardStatus: 'pending', counselor: 'Emily Davis' },
  { id: '4', name: 'Diana Prince', email: 'diana@email.com', phone: '+91 9999999994', university: 'Harvard', program: 'MBA', status: 'submitted', date: '2024-11-20', reward: 20000, rewardStatus: 'pending', counselor: '-' },
  { id: '5', name: 'Eve Wilson', email: 'eve@email.com', phone: '+91 9999999995', university: 'MIT', program: 'MBA', status: 'admitted', date: '2024-09-15', reward: 15000, rewardStatus: 'paid', counselor: 'Sarah Williams' },
  { id: '6', name: 'Frank Moore', email: 'frank@email.com', phone: '+91 9999999996', university: 'Oxford', program: 'MS Finance', status: 'rejected', date: '2024-08-20', reward: 0, rewardStatus: 'na', counselor: 'Michael Brown' },
  { id: '7', name: 'Grace Lee', email: 'grace@email.com', phone: '+91 9999999997', university: 'MIT', program: 'MBA', status: 'contacted', date: '2024-11-25', reward: 15000, rewardStatus: 'pending', counselor: 'Sarah Williams' },
  { id: '8', name: 'Henry Taylor', email: 'henry@email.com', phone: '+91 9999999998', university: 'Harvard', program: 'MS CS', status: 'assigned', date: '2024-12-01', reward: 12000, rewardStatus: 'pending', counselor: 'Emily Davis' },
];

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
                <h1 className="text-4xl font-display text-foreground">My Referrals</h1>
                <p className="text-muted-foreground mt-1">Track all your referred students</p>
              </div>
            </div>
          </div>
          <Button 
            className="gradient-primary text-white shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all"
            onClick={() => navigate('/referrer/add')}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New Referral
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="card-interactive">
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground mb-2">Total Referrals</p>
              <p className="text-2xl font-display text-foreground">{stats.total}</p>
            </CardContent>
          </Card>
          <Card className="card-interactive bg-success/10 border-success/20">
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground mb-2">Admitted</p>
              <p className="text-2xl font-display text-success">{stats.admitted}</p>
            </CardContent>
          </Card>
          <Card className="card-interactive bg-warning/10 border-warning/20">
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground mb-2">Pending</p>
              <p className="text-2xl font-display text-warning">{stats.pending}</p>
            </CardContent>
          </Card>
          <Card className="card-interactive bg-destructive/10 border-destructive/20">
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground mb-2">Rejected</p>
              <p className="text-2xl font-display text-destructive">{stats.rejected}</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="card-elevated">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="Search by name, email, or university..." 
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select 
                className="bg-background border border-border rounded-xl px-4 py-2 text-sm text-foreground"
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
              <select 
                className="bg-background border border-border rounded-xl px-4 py-2 text-sm text-foreground"
                value={universityFilter}
                onChange={(e) => setUniversityFilter(e.target.value)}
              >
                <option value="all">All Universities</option>
                {universities.map(uni => (
                  <option key={uni} value={uni}>{uni}</option>
                ))}
              </select>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Referrals Table */}
        <Card className="card-elevated">
          <CardHeader className="border-b border-border pb-4">
            <CardTitle className="text-lg font-display">All Referrals ({filteredReferrals.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Student</th>
                    <th className="text-left p-4 text-sm font-semibold text-muted-foreground">University</th>
                    <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Counselor</th>
                    <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Status</th>
                    <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Date</th>
                    <th className="text-right p-4 text-sm font-semibold text-muted-foreground">Reward</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReferrals.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-muted-foreground">
                        No referrals found
                      </td>
                    </tr>
                  ) : (
                    filteredReferrals.map((referral) => {
                      const status = statusConfig[referral.status as keyof typeof statusConfig];
                      const StatusIcon = status.icon;
                      return (
                        <tr key={referral.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-xs font-bold text-white">
                                {referral.name.split(' ').map(n => n[0]).join('')}
                              </div>
                              <div>
                                <p className="font-medium text-foreground">{referral.name}</p>
                                <p className="text-xs text-muted-foreground">{referral.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <p className="font-medium text-foreground">{referral.university}</p>
                            <p className="text-xs text-muted-foreground">{referral.program}</p>
                          </td>
                          <td className="p-4">
                            <p className="text-sm text-foreground">{referral.counselor}</p>
                          </td>
                          <td className="p-4">
                            <Badge className={cn('border-0 font-medium', status.color)}>
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {status.label}
                            </Badge>
                          </td>
                          <td className="p-4 text-sm text-muted-foreground">
                            {new Date(referral.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </td>
                          <td className="p-4 text-right">
                            {referral.rewardStatus === 'paid' ? (
                              <div>
                                <p className="font-bold text-success">₹{referral.reward.toLocaleString()}</p>
                                <p className="text-xs text-success">Paid</p>
                              </div>
                            ) : referral.rewardStatus === 'pending' ? (
                              <div>
                                <p className="font-bold text-warning">₹{referral.reward.toLocaleString()}</p>
                                <p className="text-xs text-muted-foreground">Pending</p>
                              </div>
                            ) : (
                              <p className="text-muted-foreground">-</p>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </ReferrerLayout>
  );
};

export default ReferrerReferrals;

