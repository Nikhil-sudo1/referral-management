import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { referrals, universities, programs, counselors } from '@/data/mockData';
import { ArrowLeft, Building2, BookOpen, Calendar, User, CheckCircle, FileText, Phone, Mail } from 'lucide-react';
import { format } from 'date-fns';
import { ReferralStatus } from '@/types/referral';

const RefereeReferrals = () => {
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
                <h1 className="text-3xl md:text-4xl font-extrabold text-foreground bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent">
                  {referee.refereeName}
                </h1>
                <p className="text-muted-foreground mt-1 font-medium">
                  All referrals for this referee ({totalReferrals} total, {admittedCount} admitted)
                </p>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-accent/10 border-2 border-primary/20 hover:border-primary/40 hover:shadow-xl transition-all">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center">
                  <FileText className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Total</p>
                  <p className="text-2xl font-extrabold text-foreground">{totalReferrals}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-success/10 via-success/5 to-emerald-500/10 border-2 border-success/20 hover:border-success/40 hover:shadow-xl transition-all">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg gradient-success flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-success-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Admitted</p>
                  <p className="text-2xl font-extrabold text-success">{admittedCount}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Referrals Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {refereeReferrals.map((referral) => {
            const university = universities.find((u) => u.id === referral.universityId);
            const program = programs.find((p) => p.id === referral.programId);
            const counselor = counselors.find((c) => c.id === referral.counselorId);

            return (
              <Card key={referral.id} className="hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/30 group">
                <CardHeader className="pb-3 bg-gradient-to-r from-primary/5 to-transparent border-b-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">{university?.name}</CardTitle>
                      <Badge variant="outline" className={`border-2 font-semibold ${statusStyles[referral.status]}`}>
                        {referral.status}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground font-medium">Code</p>
                      <p className="text-sm font-mono text-primary font-bold bg-primary/10 px-2 py-1 rounded">{referral.referralCode}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Enhanced Program Info */}
                  <div className="p-4 rounded-lg bg-gradient-to-br from-primary/5 to-accent/5 border-2 border-primary/20">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                        <BookOpen className="w-4 h-4 text-primary-foreground" />
                      </div>
                      <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">Program</p>
                    </div>
                    <p className="font-bold text-card-foreground text-lg">{program?.name}</p>
                    <p className="text-xs text-muted-foreground mt-1 font-medium">{program?.duration}</p>
                  </div>

                  {/* Timeline */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Submitted:</span>
                      <span className="font-medium text-card-foreground">
                        {format(referral.submissionDate, 'MMM d, yyyy')}
                      </span>
                    </div>
                    {referral.admissionDate && (
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-success" />
                        <span className="text-muted-foreground">Admitted:</span>
                        <span className="font-medium text-success">
                          {format(referral.admissionDate, 'MMM d, yyyy')}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Counselor */}
                  {counselor && (
                    <div className="pt-3 border-t border-border">
                      <div className="flex items-center gap-2 mb-1">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <p className="text-xs text-muted-foreground">Assigned Counselor</p>
                      </div>
                      <p className="font-medium text-card-foreground">{counselor.name}</p>
                    </div>
                  )}

                  {/* Referrer Info */}
                  <div className="pt-3 border-t border-border">
                    <p className="text-xs text-muted-foreground mb-2">Referred by</p>
                    <div className="space-y-1">
                      <p className="font-medium text-card-foreground">{referral.referrerName}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="w-3 h-3" />
                        <span>{referral.referrerPhone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="w-3 h-3" />
                        <span>{referral.referrerEmail}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Back Button */}
        <div className="flex gap-3">
          <Button onClick={() => navigate('/counselors')} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Referees
          </Button>
          <Button
            onClick={() => navigate(`/counselors/profile/${encodeURIComponent(email || '')}`)}
            variant="outline"
          >
            View Profile
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default RefereeReferrals;

