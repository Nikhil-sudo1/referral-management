import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Mail, Phone, Calendar, Building2, BookOpen, TrendingUp, CheckCircle, Clock, FileText, User, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { referralsAPI, universitiesAPI, programsAPI } from '@/lib/api';
import { toast } from '@/hooks/use-toast';

const RefereeProfile = () => {
  const { email } = useParams<{ email: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [refereeReferrals, setRefereeReferrals] = useState<any[]>([]);
  const [universities, setUniversities] = useState<any[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, [email]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const decodedEmail = decodeURIComponent(email || '');
      
      // Fetch all data in parallel
      const [referralsData, universitiesData] = await Promise.all([
        referralsAPI.getReferrals({ page: 1, limit: 200 }),
        universitiesAPI.getUniversities({ page: 1, limit: 20 })
      ]);

      // Filter referrals for this referee
      const filtered = (referralsData.items || []).filter(
        (r: any) => r.referee_email?.toLowerCase() === decodedEmail.toLowerCase()
      );

      setRefereeReferrals(filtered);
      setUniversities(universitiesData.items || []);

      // Programs are not needed for profile view - removed N+1 query loop
      setPrograms([]);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load referee data',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
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

  if (refereeReferrals.length === 0) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Referee not found</p>
          <Button onClick={() => navigate('/referees')} className="mt-4">
            Back to Referees
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const referee = refereeReferrals[0];
  const totalReferrals = refereeReferrals.length;
  const admittedCount = refereeReferrals.filter((r) => r.status === 'admitted').length;
  const conversionRate = totalReferrals > 0 ? ((admittedCount / totalReferrals) * 100).toFixed(1) : 0;

  const statusStyles: Record<string, string> = {
    submitted: 'bg-info/10 text-info border-info/20',
    assigned: 'bg-warning/10 text-warning border-warning/20',
    contacted: 'bg-accent/10 text-accent border-accent/20',
    admitted: 'bg-success/10 text-success border-success/20',
    rejected: 'bg-destructive/10 text-destructive border-destructive/20',
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/referees')}
            className="hover:bg-muted border-2"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center shadow-lg">
              <User className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-foreground">
                Referee Profile
              </h1>
              <p className="text-muted-foreground mt-1 font-medium">Complete profile and referral history</p>
            </div>
          </div>
        </div>

        {/* Profile Card */}
        <Card className="border-2">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5 border-b-2">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-24 h-24 rounded-full gradient-primary flex items-center justify-center text-primary-foreground text-3xl font-extrabold shadow-2xl">
                  {referee.referee_name?.split(' ').map((n: string) => n[0]).join('') || '??'}
                </div>
                <div>
                  <CardTitle className="text-3xl font-extrabold">{referee.referee_name}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1 font-medium">Student / Referee</p>
                </div>
              </div>
              <Badge variant="outline" className={`border-2 font-semibold ${statusStyles[referee.status] || statusStyles.submitted}`}>
                {referee.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Contact Information */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg text-foreground">Contact Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Mail className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Email</p>
                      <p className="font-medium text-card-foreground">{referee.referee_email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Phone className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Phone</p>
                      <p className="font-medium text-card-foreground">{referee.referee_phone}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Statistics */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg text-foreground">Performance Statistics</h3>
                <div className="grid grid-cols-2 gap-4">
                  <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
                    <CardContent className="p-4 text-center">
                      <FileText className="w-8 h-8 text-primary mx-auto mb-2" />
                      <p className="text-2xl font-bold text-card-foreground">{totalReferrals}</p>
                      <p className="text-xs text-muted-foreground">Total Referrals</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-gradient-to-br from-success/10 to-success/5">
                    <CardContent className="p-4 text-center">
                      <CheckCircle className="w-8 h-8 text-success mx-auto mb-2" />
                      <p className="text-2xl font-bold text-card-foreground">{admittedCount}</p>
                      <p className="text-xs text-muted-foreground">Admitted</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-gradient-to-br from-warning/10 to-warning/5">
                    <CardContent className="p-4 text-center">
                      <TrendingUp className="w-8 h-8 text-warning mx-auto mb-2" />
                      <p className="text-2xl font-bold text-card-foreground">{conversionRate}%</p>
                      <p className="text-xs text-muted-foreground">Conversion</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-gradient-to-br from-info/10 to-info/5">
                    <CardContent className="p-4 text-center">
                      <Clock className="w-8 h-8 text-info mx-auto mb-2" />
                      <p className="text-2xl font-bold text-card-foreground">
                        {refereeReferrals.filter((r) => ['submitted', 'assigned', 'contacted'].includes(r.status)).length}
                      </p>
                      <p className="text-xs text-muted-foreground">Pending</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Referral History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Referral History</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/referees/referrals/${encodeURIComponent(email || '')}`)}
              >
                View All
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {refereeReferrals.slice(0, 5).map((referral) => {
                const university = universities?.find((u) => u.id === referral.university_id);
                const program = programs?.find((p) => p.id === referral.program_id);
                
                return (
                  <Card key={referral.id} className="border-2">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Building2 className="w-5 h-5 text-primary" />
                            <h4 className="font-semibold text-card-foreground">
                              {university?.name || 'Unknown University'}
                            </h4>
                          </div>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground mb-2">
                            <BookOpen className="w-4 h-4" />
                            <span>{program?.name || 'Unknown Program'}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Calendar className="w-3 h-3" />
                            <span>{format(new Date(referral.created_at), 'MMM dd, yyyy')}</span>
                          </div>
                        </div>
                        <Badge variant="outline" className={statusStyles[referral.status] || statusStyles.submitted}>
                          {referral.status}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default RefereeProfile;
