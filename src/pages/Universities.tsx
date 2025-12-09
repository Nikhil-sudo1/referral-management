import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { universities, programs, referrals } from '@/data/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Building2, Plus, Settings, FileText, Users, TrendingUp, Eye, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { exportToCSV } from '@/utils/exportUtils';
import { toast } from '@/hooks/use-toast';

const Universities = () => {
  const navigate = useNavigate();
  
  const handleAddUniversity = () => {
    navigate('/universities/add');
  };

  const handleViewDetails = (universityId: string) => {
    navigate(`/universities/${universityId}`);
  };

  const handleManagePrograms = (universityId: string) => {
    navigate(`/universities/${universityId}/programs`);
  };
  const getUniversityStats = (universityId: string) => {
    const uniReferrals = referrals.filter((r) => r.universityId === universityId);
    const admissions = uniReferrals.filter((r) => r.status === 'admitted').length;
    return {
      totalReferrals: uniReferrals.length,
      admissions,
      conversionRate: uniReferrals.length > 0 ? ((admissions / uniReferrals.length) * 100).toFixed(1) : 0,
      programs: programs.filter((p) => p.universityId === universityId).length,
    };
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Universities</h1>
            <p className="text-muted-foreground mt-1">Manage partner universities and programs</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                exportToCSV('universities');
                toast({
                  title: 'Export Started',
                  description: 'Your CSV file is being downloaded',
                });
              }}
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button className="gradient-primary" onClick={handleAddUniversity}>
              <Plus className="w-4 h-4 mr-2" />
              Add University
            </Button>
          </div>
        </div>

        {/* University Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {universities.map((uni) => {
            const stats = getUniversityStats(uni.id);

            return (
              <Card key={uni.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-xl gradient-primary flex items-center justify-center">
                        <Building2 className="w-7 h-7 text-primary-foreground" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{uni.name}</CardTitle>
                        <p className="text-sm font-mono text-muted-foreground">{uni.code}</p>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={
                        uni.status === 'active'
                          ? 'bg-success/10 text-success border-success/20'
                          : 'bg-muted text-muted-foreground'
                      }
                    >
                      {uni.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Stats Grid */}
                  <div className="grid grid-cols-4 gap-4 py-4 border-y border-border">
                    <div className="text-center">
                      <FileText className="w-4 h-4 mx-auto text-muted-foreground mb-1" />
                      <p className="text-xl font-semibold text-card-foreground">{stats.totalReferrals}</p>
                      <p className="text-xs text-muted-foreground">Referrals</p>
                    </div>
                    <div className="text-center">
                      <Users className="w-4 h-4 mx-auto text-muted-foreground mb-1" />
                      <p className="text-xl font-semibold text-success">{stats.admissions}</p>
                      <p className="text-xs text-muted-foreground">Admissions</p>
                    </div>
                    <div className="text-center">
                      <TrendingUp className="w-4 h-4 mx-auto text-muted-foreground mb-1" />
                      <p className="text-xl font-semibold text-card-foreground">{stats.conversionRate}%</p>
                      <p className="text-xs text-muted-foreground">Conv. Rate</p>
                    </div>
                    <div className="text-center">
                      <Building2 className="w-4 h-4 mx-auto text-muted-foreground mb-1" />
                      <p className="text-xl font-semibold text-card-foreground">{stats.programs}</p>
                      <p className="text-xs text-muted-foreground">Programs</p>
                    </div>
                  </div>

                  {/* Programs List */}
                  <div>
                    <p className="text-sm font-medium text-card-foreground mb-2">Programs</p>
                    <div className="flex flex-wrap gap-2">
                      {programs
                        .filter((p) => p.universityId === uni.id)
                        .map((prog) => (
                          <Badge key={prog.id} variant="secondary">
                            {prog.code}
                          </Badge>
                        ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleViewDetails(uni.id)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleManagePrograms(uni.id)}
                    >
                      <Settings className="w-4 h-4" />
                    </Button>
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

export default Universities;
