import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { referrals, universities, programs } from '@/data/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Search, TrendingUp, Award, FileText, Mail, Phone, Plus, CheckCircle, Download, Filter, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { ReferralStatus } from '@/types/referral';
import { exportToCSV } from '@/utils/exportUtils';

interface RefereeInfo {
  name: string;
  email: string;
  phone: string;
  totalReferrals: number;
  admitted: number;
  conversionRate: number;
  status: ReferralStatus;
  latestReferralDate: Date;
  universityId?: string;
  programId?: string;
}

const Counselors = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Extract unique referees from referrals
  const getUniqueReferees = (): RefereeInfo[] => {
    const refereeMap = new Map<string, RefereeInfo>();
    
    referrals.forEach((referral) => {
      const key = referral.refereeEmail.toLowerCase();
      
      if (!refereeMap.has(key)) {
        refereeMap.set(key, {
          name: referral.refereeName,
          email: referral.refereeEmail,
          phone: referral.refereePhone,
          totalReferrals: 0,
          admitted: 0,
          conversionRate: 0,
          status: referral.status,
          latestReferralDate: referral.submissionDate,
          universityId: referral.universityId,
          programId: referral.programId,
        });
      }
      
      const referee = refereeMap.get(key)!;
      referee.totalReferrals += 1;
      if (referral.status === 'admitted') {
        referee.admitted += 1;
      }
      if (referral.submissionDate > referee.latestReferralDate) {
        referee.latestReferralDate = referral.submissionDate;
        referee.status = referral.status;
      }
    });
    
    // Calculate conversion rates
    refereeMap.forEach((referee) => {
      referee.conversionRate = referee.totalReferrals > 0 
        ? Number(((referee.admitted / referee.totalReferrals) * 100).toFixed(1))
        : 0;
    });
    
    return Array.from(refereeMap.values());
  };

  const referees = getUniqueReferees();
  
  // Filter referees based on search and status
  const filteredReferees = referees.filter((referee) => {
    const matchesSearch =
      referee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      referee.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      referee.phone.includes(searchQuery);
    const matchesStatus = statusFilter === 'all' || referee.status === statusFilter;
    return matchesSearch && matchesStatus;
  });
  
  // Calculate total stats
  const totalReferees = referees.length;
  const totalReferrals = referees.reduce((sum, r) => sum + r.totalReferrals, 0);
  const totalAdmitted = referees.reduce((sum, r) => sum + r.admitted, 0);
  const avgConversionRate = totalReferrals > 0 
    ? Number(((totalAdmitted / totalReferrals) * 100).toFixed(1))
    : 0;

  const getRefereeStats = (refereeEmail: string) => {
    const referee = referees.find((r) => r.email.toLowerCase() === refereeEmail.toLowerCase());
    return referee;
  };

  const handleAddReferee = () => {
    navigate('/counselors/add');
  };

  const handleViewProfile = (refereeEmail: string, refereeName: string) => {
    navigate(`/counselors/profile/${encodeURIComponent(refereeEmail)}`);
  };

  const handleViewReferrals = (refereeEmail: string, refereeName: string) => {
    navigate(`/counselors/referrals/${encodeURIComponent(refereeEmail)}`);
  };
  
  const handleExport = () => {
    try {
      exportToCSV('referees', filteredReferees.map(r => ({
        Name: r.name,
        Email: r.email,
        Phone: r.phone,
        'Total Referrals': r.totalReferrals,
        'Admitted': r.admitted,
        'Conversion Rate': `${r.conversionRate}%`,
        Status: r.status,
        'Latest Referral': r.latestReferralDate.toLocaleDateString(),
      })));
      toast({
        title: 'Export Successful',
        description: `${filteredReferees.length} referees exported to CSV`,
      });
    } catch (error) {
      toast({
        title: 'Export Failed',
        description: 'There was an error exporting the data',
        variant: 'destructive',
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Enhanced Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center shadow-lg">
              <Users className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-foreground bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent">
                Referees
              </h1>
              <p className="text-muted-foreground mt-1 font-medium">Manage referee (student) information and referrals</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleExport}
              className="border-2 hover:shadow-lg transition-all"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button className="gradient-primary text-primary-foreground hover:shadow-lg transition-all font-semibold" onClick={handleAddReferee}>
              <Plus className="w-4 h-4 mr-2" />
              Add Referee
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-2 border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Referees</p>
                  <p className="text-2xl font-extrabold text-foreground mt-1">{totalReferees}</p>
                </div>
                <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center">
                  <Users className="w-5 h-5 text-primary-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-info/10 to-blue-500/10 border-2 border-info/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Referrals</p>
                  <p className="text-2xl font-extrabold text-foreground mt-1">{totalReferrals}</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-info/20 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-info" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-success/10 to-emerald-500/10 border-2 border-success/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Admitted</p>
                  <p className="text-2xl font-extrabold text-success mt-1">{totalAdmitted}</p>
                </div>
                <div className="w-10 h-10 rounded-lg gradient-success flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-success-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-warning/10 to-orange-500/10 border-2 border-warning/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Avg. Conversion</p>
                  <p className="text-2xl font-extrabold text-foreground mt-1">{avgConversionRate}%</p>
                </div>
                <div className="w-10 h-10 rounded-lg gradient-warning flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-warning-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search by name, email, or phone..." 
              className="pl-9 border-2"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px] border-2">
                <SelectValue placeholder="Filter by status" />
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
        </div>

        {/* Results Count */}
        {filteredReferees.length > 0 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground font-medium">
              Showing <span className="font-bold text-foreground">{filteredReferees.length}</span> of <span className="font-bold text-foreground">{totalReferees}</span> referees
              {statusFilter !== 'all' && ` (filtered by ${statusFilter})`}
            </p>
          </div>
        )}

        {/* Referee Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredReferees.length === 0 ? (
            <div className="col-span-full">
              <Card className="border-2 border-dashed">
                <CardContent className="p-12 text-center">
                  <Users className="w-16 h-16 mx-auto text-muted-foreground mb-4 opacity-50" />
                  <h3 className="text-xl font-bold text-card-foreground mb-2">No Referees Found</h3>
                  <p className="text-muted-foreground mb-6">
                    {searchQuery || statusFilter !== 'all' 
                      ? 'Try adjusting your search or filter criteria'
                      : 'Get started by adding your first referee'}
                  </p>
                  {(!searchQuery && statusFilter === 'all') && (
                    <Button className="gradient-primary text-primary-foreground" onClick={handleAddReferee}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add First Referee
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : (
            filteredReferees.map((referee) => {
              const stats = getRefereeStats(referee.email);
              const university = referee.universityId ? universities.find((u) => u.id === referee.universityId) : null;
              const program = referee.programId ? programs.find((p) => p.id === referee.programId) : null;

              // Status badge styling
              const statusStyles: Record<ReferralStatus, string> = {
                submitted: 'bg-info/10 text-info border-info/20',
                assigned: 'bg-warning/10 text-warning border-warning/20',
                contacted: 'bg-accent/10 text-accent border-accent/20',
                admitted: 'bg-success/10 text-success border-success/20',
                rejected: 'bg-destructive/10 text-destructive border-destructive/20',
              };

              return (
                <Card key={referee.email} className="hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/30 group">
                  <CardHeader className="pb-3 bg-gradient-to-r from-primary/5 to-transparent border-b-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-14 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-extrabold text-lg shadow-lg group-hover:scale-110 transition-transform">
                          {referee.name.split(' ').map((n) => n[0]).join('')}
                        </div>
                        <div>
                          <CardTitle className="text-lg font-bold group-hover:text-primary transition-colors">{referee.name}</CardTitle>
                          <p className="text-sm text-muted-foreground font-medium">Referee / Student</p>
                        </div>
                      </div>
                      <Badge variant="outline" className={`border-2 font-semibold ${statusStyles[referee.status]}`}>
                        {referee.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Contact Info */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="w-4 h-4" />
                        <span className="truncate">{referee.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="w-4 h-4" />
                        <span>{referee.phone}</span>
                      </div>
                      {university && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <FileText className="w-4 h-4" />
                          <span className="truncate">{university.name} {program && `• ${program.name}`}</span>
                        </div>
                      )}
                    </div>

                    {/* Enhanced Stats */}
                    {stats && (
                      <div className="grid grid-cols-3 gap-3 pt-3 border-t-2 border-border">
                        <div className="text-center p-3 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors">
                          <div className="flex items-center justify-center gap-1 text-primary mb-2">
                            <FileText className="w-4 h-4" />
                          </div>
                          <p className="text-xl font-extrabold text-card-foreground">{stats.totalReferrals}</p>
                          <p className="text-xs text-muted-foreground font-medium">Referrals</p>
                        </div>
                        <div className="text-center p-3 rounded-lg bg-success/5 hover:bg-success/10 transition-colors">
                          <div className="flex items-center justify-center gap-1 text-success mb-2">
                            <CheckCircle className="w-4 h-4" />
                          </div>
                          <p className="text-xl font-extrabold text-success">{stats.admitted}</p>
                          <p className="text-xs text-muted-foreground font-medium">Admitted</p>
                        </div>
                        <div className="text-center p-3 rounded-lg bg-warning/5 hover:bg-warning/10 transition-colors">
                          <div className="flex items-center justify-center gap-1 text-warning mb-2">
                            <TrendingUp className="w-4 h-4" />
                          </div>
                          <p className="text-xl font-extrabold text-card-foreground">{stats.conversionRate}%</p>
                          <p className="text-xs text-muted-foreground font-medium">Conversion</p>
                        </div>
                      </div>
                    )}

                    {/* Enhanced Actions */}
                    <div className="flex gap-2 pt-3 border-t border-border">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1 border-2 hover:border-primary/40 hover:bg-primary/5 transition-all font-semibold"
                        onClick={() => handleViewProfile(referee.email, referee.name)}
                      >
                        <User className="w-4 h-4 mr-2" />
                        Profile
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1 border-2 hover:border-primary/40 hover:bg-primary/5 transition-all font-semibold"
                        onClick={() => handleViewReferrals(referee.email, referee.name)}
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        Referrals
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Counselors;
