import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Building2, BookOpen, FileText, Users, TrendingUp, CheckCircle, Plus, Settings, Mail, MapPin, Edit, Loader2, Globe, Phone } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from '@/hooks/use-toast';
import { universitiesAPI, referralsAPI } from '@/lib/api';

const UniversityDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [university, setUniversity] = useState<any>(null);
  const [programs, setPrograms] = useState<any[]>([]);
  const [referrals, setReferrals] = useState<any[]>([]);

  useEffect(() => {
    if (id) {
      fetchUniversityDetails();
    }
  }, [id]);

  const fetchUniversityDetails = async () => {
    setIsLoading(true);
    try {
      console.log('Fetching university details for ID:', id);
      
      // Fetch university details and programs
      const [universityData, programsData, referralsData] = await Promise.all([
        universitiesAPI.getUniversity(id!),
        universitiesAPI.getUniversityPrograms(id!),
        referralsAPI.getReferrals({ page: 1, limit: 20 })
      ]);

      console.log('University data:', universityData);
      console.log('Programs data:', programsData);
      console.log('Referrals data:', referralsData);

      setUniversity(universityData);
      setPrograms(programsData || []);
      
      // Filter referrals for this university
      const universityReferrals = (referralsData.items || []).filter(
        (r: any) => r.university_id === id
      );
      setReferrals(universityReferrals);

    } catch (error: any) {
      console.error('Error fetching university details:', error);
      toast({
        title: 'Error',
        description: 'Failed to load university details',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading university details...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

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

  // Calculate stats
  const admittedCount = referrals.filter((r) => r.status === 'admitted').length;
  const conversionRate = referrals.length > 0 
    ? ((admittedCount / referrals.length) * 100).toFixed(1)
    : '0';

  // Get unique referees assigned to this university
  const assignedReferees = referrals.map(r => ({
    name: r.referee_name,
    email: r.referee_email,
    phone: r.referee_phone,
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
            <Button 
              className="gradient-primary text-primary-foreground hover:shadow-lg transition-all font-semibold" 
              onClick={() => navigate(`/universities/${id}/programs/add`)}
            >
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
                  {university.logo_url ? (
                    <img src={university.logo_url} alt={university.name} className="w-16 h-16 object-contain rounded-xl" />
                  ) : (
                    <Building2 className="w-10 h-10 text-primary-foreground" />
                  )}
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
                    : 'bg-muted text-muted-foreground border-muted-foreground/20 text-lg px-4 py-1'
                }
              >
                {university.status === 'active' ? '● Active' : '○ Inactive'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {university.website && (
                <div className="flex items-start gap-3">
                  <Globe className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Website</p>
                    <a 
                      href={university.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-primary hover:underline"
                    >
                      {university.website}
                    </a>
                  </div>
                </div>
              )}
              {university.contact_email && (
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Contact Email</p>
                    <p className="text-sm font-medium">{university.contact_email}</p>
                  </div>
                </div>
              )}
              {university.contact_phone && (
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Contact Phone</p>
                    <p className="text-sm font-medium">{university.contact_phone}</p>
                  </div>
                </div>
              )}
              {university.address && (
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Address</p>
                    <p className="text-sm font-medium">{university.address}</p>
                  </div>
                </div>
              )}
            </div>
            {university.description && (
              <div className="mt-6 p-4 bg-muted/30 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Description</p>
                <p className="text-sm">{university.description}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Statistics */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="border-2 hover:border-primary/40 transition-all hover:shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Programs</CardTitle>
              <BookOpen className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{programs.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Active programs offered
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-primary/40 transition-all hover:shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Referrals</CardTitle>
              <FileText className="h-5 w-5 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{referrals.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Students referred
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-primary/40 transition-all hover:shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Admissions</CardTitle>
              <CheckCircle className="h-5 w-5 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{admittedCount}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Successfully admitted
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-primary/40 transition-all hover:shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
              <TrendingUp className="h-5 w-5 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{conversionRate}%</div>
              <p className="text-xs text-muted-foreground mt-1">
                Referrals to admissions
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Programs Section */}
        <Card className="border-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Programs ({programs.length})</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Available academic programs at this university
                </p>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate(`/universities/${id}/programs/add`)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Program
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {programs.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed rounded-lg">
                <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground mb-4">No programs added yet</p>
                <Button 
                  variant="outline"
                  onClick={() => navigate(`/universities/${id}/programs/add`)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Program
                </Button>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {programs.map((program) => (
                  <Card key={program.id} className="border hover:border-primary/40 transition-all hover:shadow-md">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{program.name}</CardTitle>
                          <p className="text-sm text-muted-foreground font-mono mt-1">{program.code}</p>
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
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        {program.duration && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Duration:</span>
                            <span className="font-medium">{program.duration}</span>
                          </div>
                        )}
                        {program.reward_amount && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Reward:</span>
                            <span className="font-medium text-success">₹{Number(program.reward_amount).toLocaleString()}</span>
                          </div>
                        )}
                        {program.commission_rate && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Commission:</span>
                            <span className="font-medium">{Number(program.commission_rate)}%</span>
                          </div>
                        )}
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full mt-4"
                        onClick={() => navigate(`/universities/${id}/programs/${program.id}/edit`)}
                      >
                        <Settings className="w-3 h-3 mr-2" />
                        Edit Program
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Referrals */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle>Recent Referrals ({referrals.length})</CardTitle>
            <p className="text-sm text-muted-foreground">
              Students referred to this university
            </p>
          </CardHeader>
          <CardContent>
            {referrals.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed rounded-lg">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No referrals yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {referrals.slice(0, 10).map((referral) => (
                  <div
                    key={referral.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:border-primary/40 transition-all hover:shadow-sm"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Users className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{referral.referee_name}</p>
                        <p className="text-sm text-muted-foreground">{referral.referee_email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge
                        variant="outline"
                        className={
                          referral.status === 'admitted'
                            ? 'bg-success/10 text-success border-success/20'
                            : referral.status === 'submitted'
                            ? 'bg-warning/10 text-warning border-warning/20'
                            : 'bg-muted text-muted-foreground'
                        }
                      >
                        {referral.status}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        {format(new Date(referral.created_at), 'MMM dd, yyyy')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default UniversityDetails;
