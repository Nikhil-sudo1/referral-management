import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, BookOpen, Plus, DollarSign, Clock, FileText, CheckCircle, TrendingUp, Edit, Loader2 } from 'lucide-react';
import { universitiesAPI, referralsAPI } from '@/lib/api';

const UniversityPrograms = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [university, setUniversity] = useState<any>(null);
  const [universityPrograms, setUniversityPrograms] = useState<any[]>([]);
  const [referrals, setReferrals] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        // Fetch university, programs, and referrals in parallel
        const [uniData, programsData, referralsData] = await Promise.all([
          universitiesAPI.getUniversity(id),
          universitiesAPI.getUniversityPrograms(id),
          referralsAPI.getReferrals({ university_id: id, limit: 100 }).catch(() => ({ items: [] })),
        ]);
        setUniversity(uniData);
        setUniversityPrograms(programsData || []);
        setReferrals(referralsData.items || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">Loading...</span>
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Enhanced Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(`/universities/${id}`)}
              className="hover:bg-muted border-2"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center shadow-lg">
                <BookOpen className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-foreground bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent">
                  Programs - {university.name}
                </h1>
                <p className="text-muted-foreground mt-1 font-medium">Manage programs and courses</p>
              </div>
            </div>
          </div>
          <Button className="gradient-primary text-primary-foreground hover:shadow-lg transition-all font-semibold" onClick={() => navigate(`/universities/${id}/programs/add`)}>
            <Plus className="w-4 h-4 mr-2" />
            Add New Program
          </Button>
        </div>

        {/* Programs Grid */}
        {universityPrograms.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <BookOpen className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold text-card-foreground mb-2">No Programs Yet</h3>
              <p className="text-muted-foreground mb-6">
                Start by adding the first program for {university.name}
              </p>
              <Button className="gradient-primary" onClick={() => navigate(`/universities/${id}/programs/add`)}>
                <Plus className="w-4 h-4 mr-2" />
                Add First Program
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {universityPrograms.map((program: any) => {
              const programReferrals = referrals.filter((r: any) => r.program_id === program.id || r.programId === program.id);
              const programAdmissions = programReferrals.filter((r: any) => r.status === 'admitted').length;
              const programConversionRate = programReferrals.length > 0
                ? ((programAdmissions / programReferrals.length) * 100).toFixed(1)
                : 0;

              // Get correct property names (backend uses snake_case)
              const feeStructure = program.fee_structure || program.feeStructure || 0;
              const rewardAmount = program.reward_amount || program.rewardAmount || 0;
              const commissionRate = program.commission_rate || program.commissionRate || 0;
              const rewardTier = program.reward_tier || program.rewardTier || 'bronze';

              return (
                <Card key={program.id} className="hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/30 group">
                  <CardHeader className="pb-3 bg-gradient-to-r from-primary/5 via-primary/5 to-accent/5 border-b-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-xl font-bold group-hover:text-primary transition-colors">{program.name}</CardTitle>
                        <p className="text-sm font-mono text-primary font-semibold mt-1">{program.code}</p>
                      </div>
                      <Badge
                        variant="outline"
                        className={`border-2 font-semibold ${
                          program.status === 'active'
                            ? 'bg-success/10 text-success border-success/30'
                            : 'bg-muted text-muted-foreground border-muted-foreground/30'
                        }`}
                      >
                        {program.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Program Details */}
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-4 p-3 rounded-lg bg-muted/30">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            <p className="text-xs text-muted-foreground">Duration</p>
                          </div>
                          <p className="font-semibold text-card-foreground">{program.duration}</p>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <DollarSign className="w-4 h-4 text-muted-foreground" />
                            <p className="text-xs text-muted-foreground">Fee Structure</p>
                          </div>
                          <p className="font-semibold text-card-foreground">
                            ₹{Number(feeStructure).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      
                      {/* Commission/Reward Card */}
                      <div className={`p-3 rounded-lg border-2 ${
                        rewardTier === 'platinum' ? 'bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30' :
                        rewardTier === 'gold' ? 'bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/30' :
                        rewardTier === 'silver' ? 'bg-gradient-to-br from-slate-500/10 to-gray-500/10 border-slate-500/30' :
                        'bg-gradient-to-br from-amber-700/10 to-orange-700/10 border-amber-700/30'
                      }`}>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">{rewardTier} Tier</p>
                            <p className="text-2xl font-bold text-success mt-1">₹{Number(rewardAmount).toLocaleString()}</p>
                            <p className="text-xs text-muted-foreground">Per Successful Referral ({commissionRate}%)</p>
                          </div>
                          <div className={`text-3xl`}>
                            {rewardTier === 'platinum' ? '💎' :
                             rewardTier === 'gold' ? '🏆' :
                             rewardTier === 'silver' ? '🥈' : '🥉'}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Program Stats */}
                    <div className="grid grid-cols-3 gap-3 pt-3 border-t border-border">
                      <div className="text-center">
                        <FileText className="w-4 h-4 mx-auto text-primary mb-1" />
                        <p className="text-lg font-bold text-card-foreground">{programReferrals.length}</p>
                        <p className="text-xs text-muted-foreground">Referrals</p>
                      </div>
                      <div className="text-center">
                        <CheckCircle className="w-4 h-4 mx-auto text-success mb-1" />
                        <p className="text-lg font-bold text-success">{programAdmissions}</p>
                        <p className="text-xs text-muted-foreground">Admitted</p>
                      </div>
                      <div className="text-center">
                        <TrendingUp className="w-4 h-4 mx-auto text-warning mb-1" />
                        <p className="text-lg font-bold text-card-foreground">{programConversionRate}%</p>
                        <p className="text-xs text-muted-foreground">Conv.</p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => navigate(`/universities/${id}/programs/${program.id}/edit`)}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => navigate('/referrals')}
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        View Referrals
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-3">
          <Button onClick={() => navigate('/universities')} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Universities
          </Button>
          <Button onClick={() => navigate(`/universities/${id}`)} variant="outline">
            View University Details
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default UniversityPrograms;

