import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { referrals, universities, programs } from '@/data/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Users, Search, TrendingUp, Award, FileText, Mail, Phone, Plus, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { ReferralStatus } from '@/types/referral';

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
  
  // Filter referees based on search
  const filteredReferees = referees.filter((referee) =>
    referee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    referee.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    referee.phone.includes(searchQuery)
  );

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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Referees</h1>
            <p className="text-muted-foreground mt-1">Manage referee (student) information and referrals</p>
          </div>
          <Button className="gradient-primary" onClick={handleAddReferee}>
            <Plus className="w-4 h-4 mr-2" />
            Add Referee
          </Button>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search referees..." 
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Referee Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredReferees.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground">No referees found</p>
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
                <Card key={referee.email} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-semibold text-lg">
                          {referee.name.split(' ').map((n) => n[0]).join('')}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{referee.name}</CardTitle>
                          <p className="text-sm text-muted-foreground">Referee</p>
                        </div>
                      </div>
                      <Badge variant="outline" className={statusStyles[referee.status]}>
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

                    {/* Stats */}
                    {stats && (
                      <div className="grid grid-cols-3 gap-3 pt-3 border-t border-border">
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                            <FileText className="w-3 h-3" />
                          </div>
                          <p className="text-lg font-semibold text-card-foreground">{stats.totalReferrals}</p>
                          <p className="text-xs text-muted-foreground">Referrals</p>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                            <CheckCircle className="w-3 h-3" />
                          </div>
                          <p className="text-lg font-semibold text-success">{stats.admitted}</p>
                          <p className="text-xs text-muted-foreground">Admitted</p>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                            <TrendingUp className="w-3 h-3" />
                          </div>
                          <p className="text-lg font-semibold text-success">{stats.conversionRate}%</p>
                          <p className="text-xs text-muted-foreground">Conversion</p>
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleViewProfile(referee.email, referee.name)}
                      >
                        View Profile
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleViewReferrals(referee.email, referee.name)}
                      >
                        View Referrals
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
