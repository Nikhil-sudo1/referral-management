import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Building2, BookOpen, Calendar, CheckCircle, FileText, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { referralsAPI, universitiesAPI, programsAPI, usersAPI } from '@/lib/api';
import { toast } from '@/hooks/use-toast';

const RefereeReferrals = () => {
  const { email } = useParams<{ email: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [refereeReferrals, setRefereeReferrals] = useState<any[]>([]);
  const [universities, setUniversities] = useState<any[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);
  const [counselors, setCounselors] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, [email]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const decodedEmail = decodeURIComponent(email || '');
      
      // Fetch all data in parallel
      const [referralsData, universitiesData, counselorsData] = await Promise.all([
        referralsAPI.getReferrals({ page: 1, limit: 1000 }),
        universitiesAPI.getUniversities({ page: 1, limit: 100 }),
        usersAPI.getCounselors({ page: 1, limit: 100 })
      ]);

      // Filter referrals for this referee
      const filtered = (referralsData.items || []).filter(
        (r: any) => r.referee_email?.toLowerCase() === decodedEmail.toLowerCase()
      );

      setRefereeReferrals(filtered);
      setUniversities(universitiesData.items || []);
      setCounselors(counselorsData.items || []);

      // Fetch programs for universities
      const allPrograms: any[] = [];
      for (const uni of universitiesData.items || []) {
        try {
          const uniPrograms = await universitiesAPI.getUniversityPrograms(uni.id);
          allPrograms.push(...uniPrograms);
        } catch (error) {
          console.error(`Error fetching programs for ${uni.name}:`, error);
        }
      }
      setPrograms(allPrograms);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load referral data',
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
          <p className="text-muted-foreground">No referrals found for this referee</p>
          <Button onClick={() => navigate('/counselors')} className="mt-4">
            Back to Referees
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const referee = refereeReferrals[0];
  const totalReferrals = refereeReferrals.length;
  const admittedCount = refereeReferrals.filter((r) => r.status === 'admitted').length;

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
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(`/counselors/profile/${encodeURIComponent(email || '')}`)}
              className="hover:bg-muted border-2"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center shadow-lg">
                <FileText className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-foreground">
                  {referee.referee_name}
                </h1>
                <p className="text-muted-foreground mt-1 font-medium">
                  All referrals for this referee ({totalReferrals} total, {admittedCount} admitted)
                </p>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-2">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center">
                  <FileText className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Total</p>
                  <p className="text-2xl font-bold text-card-foreground">{totalReferrals}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-success/10 to-emerald-500/10 border-2">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-success/20 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-success" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Admitted</p>
                  <p className="text-2xl font-bold text-card-foreground">{admittedCount}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Referrals List */}
        <div className="grid gap-4">
          {refereeReferrals.map((referral) => {
            const university = universities?.find((u) => u.id === referral.university_id);
            const program = programs?.find((p) => p.id === referral.program_id);
            const counselor = counselors?.find((c) => c.id === referral.counselor_id);

            return (
              <Card key={referral.id} className="border-2 hover:shadow-lg transition-all">
                <CardHeader className="border-b bg-gradient-to-r from-primary/5 to-accent/5">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl font-bold">
                        {university?.name || 'Unknown University'}
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-2">
                        <BookOpen className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {program?.name || 'Unknown Program'}
                        </span>
                      </div>
                    </div>
                    <Badge variant="outline" className={`border-2 font-semibold ${statusStyles[referral.status] || statusStyles.submitted}`}>
                      {referral.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Submission Details */}
                    <div className="space-y-3">
                      <h4 className="font-semibold text-sm text-muted-foreground uppercase">Submission</h4>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="w-4 h-4 text-primary" />
                          <span className="text-card-foreground">
                            {format(new Date(referral.created_at), 'MMM dd, yyyy')}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <FileText className="w-4 h-4 text-primary" />
                          <span className="text-card-foreground font-mono">
                            {referral.referral_code || 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Counselor */}
                    <div className="space-y-3">
                      <h4 className="font-semibold text-sm text-muted-foreground uppercase">Assigned Counselor</h4>
                      <div>
                        {counselor ? (
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-white font-bold text-sm">
                              {counselor.name?.split(' ').map((n: string) => n[0]).join('') || '??'}
                            </div>
                            <div>
                              <p className="font-medium text-card-foreground">{counselor.name}</p>
                              <p className="text-xs text-muted-foreground">{counselor.email}</p>
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground italic">Not assigned yet</p>
                        )}
                      </div>
                    </div>

                    {/* Additional Info */}
                    <div className="space-y-3">
                      <h4 className="font-semibold text-sm text-muted-foreground uppercase">Additional Info</h4>
                      <div className="space-y-2 text-sm">
                        {referral.notes && (
                          <p className="text-card-foreground">{referral.notes}</p>
                        )}
                        {referral.admission_date && (
                          <div>
                            <span className="text-muted-foreground">Admission Date: </span>
                            <span className="text-card-foreground">
                              {format(new Date(referral.admission_date), 'MMM dd, yyyy')}
                            </span>
                          </div>
                        )}
                        {!referral.notes && !referral.admission_date && (
                          <p className="text-muted-foreground italic">No additional information</p>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default RefereeReferrals;
