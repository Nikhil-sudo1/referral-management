import { useParams, useNavigate, Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { referrals, universities, programs } from '@/data/mockData';
import { ArrowLeft, Mail, Phone, Calendar, Building2, BookOpen, TrendingUp, CheckCircle, Clock, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { ReferralStatus } from '@/types/referral';

const RefereeProfile = () => {
  const { email } = useParams<{ email: string }>();
  const navigate = useNavigate();

  // Find all referrals for this referee
  const refereeReferrals = referrals.filter(
    (r) => r.refereeEmail.toLowerCase() === decodeURIComponent(email || '').toLowerCase()
  );

  if (refereeReferrals.length === 0) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Referee not found</p>
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
  const conversionRate = totalReferrals > 0 ? ((admittedCount / totalReferrals) * 100).toFixed(1) : 0;

  const statusStyles: Record<ReferralStatus, string> = {
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
            onClick={() => navigate('/counselors')}
            className="hover:bg-muted"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Referee Profile</h1>
            <p className="text-muted-foreground mt-1">Complete profile and referral history</p>
          </div>
        </div>

        {/* Profile Card */}
        <Card className="border-2">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full gradient-primary flex items-center justify-center text-primary-foreground text-2xl font-bold shadow-lg">
                  {referee.refereeName.split(' ').map((n) => n[0]).join('')}
                </div>
                <div>
                  <CardTitle className="text-2xl">{referee.refereeName}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">Student / Referee</p>
                </div>
              </div>
              <Badge variant="outline" className={statusStyles[referee.status]}>
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
                      <p className="text-sm font-medium text-card-foreground">{referee.refereeEmail}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                      <Phone className="w-5 h-5 text-success" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Phone</p>
                      <p className="text-sm font-medium text-card-foreground">{referee.refereePhone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">First Referral</p>
                      <p className="text-sm font-medium text-card-foreground">
                        {format(refereeReferrals[0].submissionDate, 'MMM d, yyyy')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Statistics */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg text-foreground">Statistics</h3>
                <div className="grid grid-cols-3 gap-3">
                  <Card className="bg-gradient-to-br from-primary/10 to-accent/10">
                    <CardContent className="p-4 text-center">
                      <FileText className="w-6 h-6 mx-auto text-primary mb-2" />
                      <p className="text-2xl font-bold text-foreground">{totalReferrals}</p>
                      <p className="text-xs text-muted-foreground">Total Referrals</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-gradient-to-br from-success/10 to-emerald-500/10">
                    <CardContent className="p-4 text-center">
                      <CheckCircle className="w-6 h-6 mx-auto text-success mb-2" />
                      <p className="text-2xl font-bold text-foreground">{admittedCount}</p>
                      <p className="text-xs text-muted-foreground">Admitted</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-gradient-to-br from-warning/10 to-orange-500/10">
                    <CardContent className="p-4 text-center">
                      <TrendingUp className="w-6 h-6 mx-auto text-warning mb-2" />
                      <p className="text-2xl font-bold text-foreground">{conversionRate}%</p>
                      <p className="text-xs text-muted-foreground">Success Rate</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Referral History */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Referral History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {refereeReferrals.map((referral) => {
                const university = universities.find((u) => u.id === referral.universityId);
                const program = programs.find((p) => p.id === referral.programId);

                return (
                  <div
                    key={referral.id}
                    className="p-4 rounded-lg border border-border hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Badge variant="outline" className={statusStyles[referral.status]}>
                            {referral.status}
                          </Badge>
                          <span className="text-sm font-mono text-primary">{referral.referralCode}</span>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm">
                            <Building2 className="w-4 h-4 text-muted-foreground" />
                            <span className="font-medium text-card-foreground">{university?.name}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <BookOpen className="w-4 h-4 text-muted-foreground" />
                            <span className="text-muted-foreground">{program?.name}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <span className="text-muted-foreground">
                              Submitted: {format(referral.submissionDate, 'MMM d, yyyy')}
                            </span>
                          </div>
                          {referral.admissionDate && (
                            <div className="flex items-center gap-2 text-sm">
                              <CheckCircle className="w-4 h-4 text-success" />
                              <span className="text-success font-medium">
                                Admitted: {format(referral.admissionDate, 'MMM d, yyyy')}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground mb-1">Referred by</p>
                        <p className="font-medium text-card-foreground">{referral.referrerName}</p>
                        <p className="text-xs text-muted-foreground">{referral.referrerPhone}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-3">
          <Button onClick={() => navigate('/counselors')} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Referees
          </Button>
          <Link to={`/counselors/referrals/${encodeURIComponent(email || '')}`}>
            <Button className="gradient-primary">
              <FileText className="w-4 h-4 mr-2" />
              View All Referrals
            </Button>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default RefereeProfile;

