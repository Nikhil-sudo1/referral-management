import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { universities, programs, referrals, counselors } from '@/data/mockData';
import { ArrowLeft, Building2, BookOpen, FileText, Users, TrendingUp, CheckCircle, Plus, Settings, Mail, MapPin, Edit } from 'lucide-react';
import { format } from 'date-fns';

const UniversityDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const university = universities.find((u) => u.id === id);

  if (!university) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">University not found</p>
          <Button onClick={() => navigate('/universities')} className="mt-4">
            Back to Universities
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  // Get programs for this university
  const universityPrograms = programs.filter((p) => p.universityId === university.id);

  // Get referrals for this university
  const universityReferrals = referrals.filter((r) => r.universityId === university.id);
  const admittedCount = universityReferrals.filter((r) => r.status === 'admitted').length;
  const conversionRate = universityReferrals.length > 0 
    ? ((admittedCount / universityReferrals.length) * 100).toFixed(1)
    : 0;

  // Get unique referees assigned to this university
  const assignedReferees = universityReferrals.map(r => ({
    name: r.refereeName,
    email: r.refereeEmail,
    phone: r.refereePhone,
    status: r.status,
    id: r.id
  }));

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/universities')}
              className="hover:bg-muted"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">{university.name}</h1>
              <p className="text-muted-foreground mt-1">University Details & Performance</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              className="border-2 hover:border-primary/40 hover:bg-primary/5 transition-all font-semibold"
              onClick={() => navigate(`/universities/${id}/edit`)}
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit University
            </Button>
            <Button className="gradient-primary text-primary-foreground hover:shadow-lg transition-all font-semibold" onClick={() => navigate(`/universities/${id}/programs/add`)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Program
            </Button>
          </div>
        </div>

        {/* University Info Card */}
        <Card className="border-2">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center shadow-lg">
                  <Building2 className="w-10 h-10 text-primary-foreground" />
                </div>
                <div>
                  <CardTitle className="text-2xl">{university.name}</CardTitle>
                  <p className="text-lg font-mono text-muted-foreground mt-1">{university.code}</p>
                </div>
              </div>
              <Badge
                variant="outline"
                className={
                  university.status === 'active'
                    ? 'bg-success/10 text-success border-success/20 text-lg px-4 py-1'
                    : 'bg-muted text-muted-foreground text-lg px-4 py-1'
                }
              >
                {university.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg text-foreground">Basic Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">University Code</p>
                      <p className="text-sm font-mono font-semibold text-card-foreground">{university.code}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-success" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Status</p>
                      <p className="text-sm font-medium text-card-foreground capitalize">{university.status}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Created At</p>
                      <p className="text-sm font-medium text-card-foreground">
                        {format(university.createdAt, 'MMM d, yyyy')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Statistics */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg text-foreground">Performance Statistics</h3>
                <div className="grid grid-cols-2 gap-3">
                  <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
                    <CardContent className="p-4 text-center">
                      <FileText className="w-6 h-6 mx-auto text-primary mb-2" />
                      <p className="text-2xl font-bold text-foreground">{universityReferrals.length}</p>
                      <p className="text-xs text-muted-foreground">Total Referrals</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-gradient-to-br from-success/10 to-emerald-500/10 border-success/20">
                    <CardContent className="p-4 text-center">
                      <CheckCircle className="w-6 h-6 mx-auto text-success mb-2" />
                      <p className="text-2xl font-bold text-foreground">{admittedCount}</p>
                      <p className="text-xs text-muted-foreground">Admissions</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-gradient-to-br from-warning/10 to-orange-500/10 border-warning/20">
                    <CardContent className="p-4 text-center">
                      <TrendingUp className="w-6 h-6 mx-auto text-warning mb-2" />
                      <p className="text-2xl font-bold text-foreground">{conversionRate}%</p>
                      <p className="text-xs text-muted-foreground">Conv. Rate</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-gradient-to-br from-accent/10 to-purple-500/10 border-accent/20">
                    <CardContent className="p-4 text-center">
                      <BookOpen className="w-6 h-6 mx-auto text-accent mb-2" />
                      <p className="text-2xl font-bold text-foreground">{universityPrograms.length}</p>
                      <p className="text-xs text-muted-foreground">Programs</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Programs */}
        <Card className="border-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Programs Offered
              </CardTitle>
              <Button size="sm" variant="outline" onClick={() => navigate(`/universities/${id}/programs/add`)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Program
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {universityPrograms.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No programs available</p>
                <Button className="mt-4" onClick={() => navigate(`/universities/${id}/programs/add`)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Program
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {universityPrograms.map((program) => {
                  const programReferrals = universityReferrals.filter((r) => r.programId === program.id);
                  const programAdmissions = programReferrals.filter((r) => r.status === 'admitted').length;

                  return (
                    <Card key={program.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-semibold text-card-foreground">{program.name}</h4>
                            <p className="text-sm font-mono text-primary">{program.code}</p>
                          </div>
                          <Badge
                            variant="outline"
                            className={
                              program.status === 'active'
                                ? 'bg-success/10 text-success border-success/20'
                                : 'bg-muted text-muted-foreground'
                            }
                          >
                            {program.status}
                          </Badge>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Duration:</span>
                            <span className="font-medium text-card-foreground">{program.duration}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Fee:</span>
                            <span className="font-medium text-card-foreground">
                              ₹{program.feeStructure.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex items-center justify-between pt-2 border-t border-border">
                            <span className="text-muted-foreground">Referrals:</span>
                            <span className="font-semibold text-primary">{programReferrals.length}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Admissions:</span>
                            <span className="font-semibold text-success">{programAdmissions}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Assigned Referees */}
        {assignedReferees.length > 0 && (
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Assigned Referees ({assignedReferees.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {assignedReferees.map((referee) => {
                  const statusStyles = {
                    submitted: 'bg-info/10 text-info border-info/20',
                    assigned: 'bg-warning/10 text-warning border-warning/20',
                    contacted: 'bg-accent/10 text-accent border-accent/20',
                    admitted: 'bg-success/10 text-success border-success/20',
                    rejected: 'bg-destructive/10 text-destructive border-destructive/20',
                  };
                  
                  return (
                    <Card key={referee.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-semibold">
                            {referee.name.split(' ').map((n) => n[0]).join('')}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-card-foreground truncate">{referee.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{referee.email}</p>
                            <Badge variant="outline" className={`${statusStyles[referee.status]} mt-2`}>
                              {referee.status}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Referrals */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Recent Referrals
            </CardTitle>
          </CardHeader>
          <CardContent>
            {universityReferrals.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No referrals yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {universityReferrals.slice(0, 5).map((referral) => {
                  const program = programs.find((p) => p.id === referral.programId);
                  
                  const statusStyles = {
                    submitted: 'bg-info/10 text-info border-info/20',
                    assigned: 'bg-warning/10 text-warning border-warning/20',
                    contacted: 'bg-accent/10 text-accent border-accent/20',
                    admitted: 'bg-success/10 text-success border-success/20',
                    rejected: 'bg-destructive/10 text-destructive border-destructive/20',
                  };

                  return (
                    <div
                      key={referral.id}
                      className="p-4 rounded-lg border border-border hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <p className="font-medium text-card-foreground">{referral.refereeName}</p>
                            <Badge variant="outline" className={statusStyles[referral.status]}>
                              {referral.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{program?.name}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {format(referral.submissionDate, 'MMM d, yyyy')}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-mono text-primary">{referral.referralCode}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {universityReferrals.length > 5 && (
                  <Button variant="outline" className="w-full" onClick={() => navigate('/referrals')}>
                    View All {universityReferrals.length} Referrals
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-3">
          <Button onClick={() => navigate('/universities')} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Universities
          </Button>
          <Button variant="outline" onClick={() => navigate(`/universities/${id}/programs`)}>
            <BookOpen className="w-4 h-4 mr-2" />
            Manage Programs
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default UniversityDetails;

