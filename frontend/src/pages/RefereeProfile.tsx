import { useParams, useNavigate, Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { referrals, universities, programs } from '@/data/mockData';
import { ArrowLeft, Mail, Phone, Calendar, Building2, BookOpen, TrendingUp, CheckCircle, Clock, FileText, User } from 'lucide-react';
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
        {/* Enhanced Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/counselors')}
            className="hover:bg-muted border-2"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center shadow-lg">
              <User className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-foreground bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent">
                Referee Profile
              </h1>
              <p className="text-muted-foreground mt-1 font-medium">Complete profile and referral history</p>
            </div>
          </div>
        </div>

        {/* Enhanced Profile Card */}
        <Card className="border-2 hover:shadow-xl transition-all duration-300">
          <CardHeader className="bg-gradient-to-r from-primary/5 via-primary/5 to-accent/5 border-b-2">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-24 h-24 rounded-full gradient-primary flex items-center justify-center text-primary-foreground text-3xl font-extrabold shadow-2xl group hover:scale-110 transition-transform">
                  {referee.refereeName.split(' ').map((n) => n[0]).join('')}
                </div>
                <div>
                  <CardTitle className="text-3xl font-extrabold">{referee.refereeName}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1 font-medium">Student / Referee</p>
                </div>
              </div>
              <Badge variant="outline" className={`border-2 font-semibold ${statusStyles[referee.status]}`}>
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
                <div className="grid grid-cols-3 gap-4">
                  <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-2 border-primary/20 hover:border-primary/40 hover:shadow-lg transition-all">
                    <CardContent className="p-5 text-center">
                      <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                        <FileText className="w-6 h-6 text-primary-foreground" />
                      </div>
                      <p className="text-3xl font-extrabold text-foreground">{totalReferrals}</p>
                      <p className="text-xs text-muted-foreground font-medium mt-1">Total Referrals</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-gradient-to-br from-success/10 to-emerald-500/10 border-2 border-success/20 hover:border-success/40 hover:shadow-lg transition-all">
                    <CardContent className="p-5 text-center">
                      <div className="w-12 h-12 rounded-lg gradient-success flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                        <CheckCircle className="w-6 h-6 text-success-foreground" />
                      </div>
                      <p className="text-3xl font-extrabold text-success">{admittedCount}</p>
                      <p className="text-xs text-muted-foreground font-medium mt-1">Admitted</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-gradient-to-br from-warning/10 to-orange-500/10 border-2 border-warning/20 hover:border-warning/40 hover:shadow-lg transition-all">
                    <CardContent className="p-5 text-center">
                      <div className="w-12 h-12 rounded-lg gradient-warning flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                        <TrendingUp className="w-6 h-6 text-warning-foreground" />
                      </div>
                      <p className="text-3xl font-extrabold text-foreground">{conversionRate}%</p>
                      <p className="text-xs text-muted-foreground font-medium mt-1">Success Rate</p>
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

