import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Search, TrendingUp, Award, FileText, Mail, Phone, Plus, CheckCircle, Download, Filter, User, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { referralsAPI, universitiesAPI } from '@/lib/api';

interface RefereeInfo {
  name: string;
  email: string;
  phone: string;
  totalReferrals: number;
  admitted: number;
  conversionRate: number;
  status: string;
  latestReferralDate: string;
  universityId?: string;
  programId?: string;
}

const Counselors = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [referees, setReferees] = useState<RefereeInfo[]>([]);
  const [universities, setUniversities] = useState<any[]>([]);
  
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      console.log('Fetching referees data...');
      const [referralsData, universitiesData] = await Promise.all([
        referralsAPI.getReferrals({ page: 1, limit: 20 }),
        universitiesAPI.getUniversities({ page: 1, limit: 20 })
      ]);

      console.log('Referrals data received:', referralsData);
      console.log('Total referrals:', referralsData.total);
      console.log('Referral items:', referralsData.items?.length);

      setUniversities(universitiesData.items || []);
      
      // Extract unique referees from referrals
      const refereeMap = new Map<string, RefereeInfo>();
      
      (referralsData.items || []).forEach((referral: any) => {
        // Check if referee email exists
        if (!referral.referee_email) {
          console.warn('Referral without referee email:', referral);
          return;
        }
        
        const key = referral.referee_email.toLowerCase();
        
        if (!refereeMap.has(key)) {
          refereeMap.set(key, {
            name: referral.referee_name || 'Unknown',
            email: referral.referee_email,
            phone: referral.referee_phone || 'N/A',
            totalReferrals: 0,
            admitted: 0,
            conversionRate: 0,
            status: referral.status,
            latestReferralDate: referral.created_at,
            universityId: referral.university_id,
            programId: referral.program_id,
          });
        }
        
        const referee = refereeMap.get(key)!;
        referee.totalReferrals += 1;
        if (referral.status === 'admitted') {
          referee.admitted += 1;
        }
        if (new Date(referral.created_at) > new Date(referee.latestReferralDate)) {
          referee.latestReferralDate = referral.created_at;
          referee.status = referral.status;
        }
      });
      
      // Calculate conversion rates
      refereeMap.forEach((referee) => {
        referee.conversionRate = referee.totalReferrals > 0 
          ? Number(((referee.admitted / referee.totalReferrals) * 100).toFixed(1))
          : 0;
      });
      
      const refereesArray = Array.from(refereeMap.values());
      console.log('Unique referees extracted:', refereesArray.length);
      console.log('Referees:', refereesArray);
      
      setReferees(refereesArray);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load referees data',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Filter referees based on search and status
  const filteredReferees = referees.filter((referee) => {
    const matchesSearch =
      searchQuery === '' ||
      referee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      referee.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus =
      statusFilter === 'all' ||
      referee.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const statusStyles: Record<string, string> = {
    submitted: 'bg-info/10 text-info border-info/20',
    assigned: 'bg-warning/10 text-warning border-warning/20',
    contacted: 'bg-accent/10 text-accent border-accent/20',
    admitted: 'bg-success/10 text-success border-success/20',
    rejected: 'bg-destructive/10 text-destructive border-destructive/20',
  };

  const handleExport = () => {
    const headers = ['Name', 'Email', 'Phone', 'Total Referrals', 'Admitted', 'Conversion Rate', 'Status'];
    const data = filteredReferees.map((r) => [
      r.name,
      r.email,
      r.phone,
      r.totalReferrals.toString(),
      r.admitted.toString(),
      `${r.conversionRate}%`,
      r.status,
    ]);
    
    // Simple CSV export
    const csvContent = [headers, ...data].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'referees.csv';
    a.click();
    
    toast({
      title: 'Export Successful',
      description: `Exported ${filteredReferees.length} referees`,
    });
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  const totalReferrals = referees.reduce((sum, r) => sum + r.totalReferrals, 0);
  const totalAdmitted = referees.reduce((sum, r) => sum + r.admitted, 0);
  const overallConversionRate = totalReferrals > 0 
    ? ((totalAdmitted / totalReferrals) * 100).toFixed(1)
    : '0';

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center shadow-lg">
              <Users className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Referees</h1>
              <p className="text-muted-foreground mt-1">Manage and track all referee activities</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-primary/10">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Referees</p>
                  <p className="text-2xl font-bold text-card-foreground">{referees.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-info/10">
                  <FileText className="w-6 h-6 text-info" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Referrals</p>
                  <p className="text-2xl font-bold text-card-foreground">{totalReferrals}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-success/10">
                  <CheckCircle className="w-6 h-6 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Admitted</p>
                  <p className="text-2xl font-bold text-card-foreground">{totalAdmitted}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-warning/10">
                  <TrendingUp className="w-6 h-6 text-warning" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Avg Conversion</p>
                  <p className="text-2xl font-bold text-card-foreground">{overallConversionRate}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filter Referees</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
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

        {/* Referees List */}
        <Card>
          <CardHeader>
            <CardTitle>All Referees ({filteredReferees.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredReferees.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-16 h-16 mx-auto text-muted-foreground mb-4 opacity-50" />
                <h3 className="text-xl font-bold text-card-foreground mb-2">No Referees Found</h3>
                <p className="text-muted-foreground">Try adjusting your search or filters</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredReferees.map((referee) => (
                  <Card
                    key={referee.email}
                    className="cursor-pointer hover:shadow-lg transition-all border-2 hover:border-primary/20"
                    onClick={() => navigate(`/referees/profile/${encodeURIComponent(referee.email)}`)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4 flex-1">
                          <div className="w-14 h-14 rounded-full gradient-primary flex items-center justify-center text-white font-bold text-lg">
                            {referee.name.split(' ').map((n) => n[0]).join('')}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg text-card-foreground">{referee.name}</h3>
                            <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Mail className="w-4 h-4" />
                                {referee.email}
                              </div>
                              <div className="flex items-center gap-1">
                                <Phone className="w-4 h-4" />
                                {referee.phone}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-center">
                            <p className="text-2xl font-bold text-primary">{referee.totalReferrals}</p>
                            <p className="text-xs text-muted-foreground">Referrals</p>
                          </div>
                          <div className="text-center">
                            <p className="text-2xl font-bold text-success">{referee.admitted}</p>
                            <p className="text-xs text-muted-foreground">Admitted</p>
                          </div>
                          <div className="text-center">
                            <p className="text-2xl font-bold text-warning">{referee.conversionRate}%</p>
                            <p className="text-xs text-muted-foreground">Conv. Rate</p>
                          </div>
                          <Badge variant="outline" className={statusStyles[referee.status] || statusStyles.submitted}>
                            {referee.status}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Counselors;
