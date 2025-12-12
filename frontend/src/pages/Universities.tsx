import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building2, Plus, Settings, FileText, Users, TrendingUp, Eye, Download, BookOpen, Search, Filter, Edit, Trash2, MoreVertical, ArrowUpDown, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { universitiesAPI, referralsAPI } from '@/lib/api';

const Universities = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [universityToDelete, setUniversityToDelete] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [universities, setUniversities] = useState<any[]>([]);
  const [referrals, setReferrals] = useState<any[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);
  
  // Fetch data on mount
  useEffect(() => {
    fetchData();
  }, [statusFilter]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [universitiesData, referralsData] = await Promise.all([
        universitiesAPI.getUniversities({ 
          page: 1, 
          page_size: 100,
          status: statusFilter === 'all' ? undefined : statusFilter 
        }),
        referralsAPI.getReferrals({ page: 1, page_size: 1000 })
      ]);

      setUniversities(universitiesData.items);
      setReferrals(referralsData.items);

      // Fetch programs for all universities
      const allPrograms: any[] = [];
      for (const uni of universitiesData.items) {
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
        description: 'Failed to load universities data',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

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
    const uniReferrals = referrals.filter((r) => r.university_id === universityId);
    const admissions = uniReferrals.filter((r) => r.status === 'admitted').length;
    return {
      totalReferrals: uniReferrals.length,
      admissions,
      conversionRate: uniReferrals.length > 0 ? ((admissions / uniReferrals.length) * 100).toFixed(1) : '0',
      programs: programs.filter((p) => p.university_id === universityId).length,
    };
  };

  // Calculate overall statistics
  const totalUniversities = universities.length;
  const activeUniversities = universities.filter((u) => u.status === 'active').length;
  const totalReferrals = referrals.length;
  const totalAdmissions = referrals.filter((r) => r.status === 'admitted').length;
  const overallConversionRate = totalReferrals > 0 
    ? ((totalAdmissions / totalReferrals) * 100).toFixed(1)
    : '0';

  // Filter and sort universities
  const filteredAndSortedUniversities = universities
    .filter((uni) => {
      const matchesSearch =
        uni.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        uni.code.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || uni.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'code':
          return a.code.localeCompare(b.code);
        case 'referrals':
          return getUniversityStats(b.id).totalReferrals - getUniversityStats(a.id).totalReferrals;
        case 'admissions':
          return getUniversityStats(b.id).admissions - getUniversityStats(a.id).admissions;
        case 'date':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        default:
          return 0;
      }
    });

  const handleEdit = (universityId: string) => {
    navigate(`/universities/${universityId}/edit`);
  };

  const handleDelete = (universityId: string) => {
    setUniversityToDelete(universityId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (universityToDelete) {
      const hasReferrals = referrals.some((r) => r.university_id === universityToDelete);
      const hasPrograms = programs.some((p) => p.university_id === universityToDelete);

      if (hasReferrals || hasPrograms) {
        toast({
          title: 'Cannot Delete',
          description: 'This university has associated referrals or programs. Please deactivate it instead.',
          variant: 'destructive',
        });
      } else {
        try {
          await universitiesAPI.deleteUniversity(universityToDelete);
          toast({
            title: 'University Deleted',
            description: 'University has been successfully deleted',
          });
          fetchData(); // Refresh data
        } catch (error) {
          toast({
            title: 'Error',
            description: 'Failed to delete university',
            variant: 'destructive',
          });
        }
      }
      setDeleteDialogOpen(false);
      setUniversityToDelete(null);
    }
  };

  const handleStatusToggle = async (universityId: string, currentStatus: 'active' | 'inactive') => {
    try {
      await universitiesAPI.toggleStatus(universityId);
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      toast({
        title: 'Status Updated',
        description: `University status changed to ${newStatus}`,
      });
      fetchData(); // Refresh data
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update status',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading universities...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 md:space-y-8">
        {/* Enhanced Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center shadow-lg">
              <Building2 className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-foreground bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent">
                Universities
              </h1>
              <p className="text-muted-foreground mt-1 font-medium">Manage partner universities and programs</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => {
                toast({
                  title: 'Export Started',
                  description: 'Your CSV file is being downloaded',
                });
              }}
              className="border-2 hover:shadow-lg transition-all"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button className="gradient-primary text-primary-foreground hover:shadow-lg transition-all font-semibold" onClick={handleAddUniversity}>
              <Plus className="w-4 h-4 mr-2" />
              Add University
            </Button>
          </div>
        </div>

        {/* Statistics Dashboard */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-2 border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Universities</p>
                  <p className="text-2xl font-extrabold text-foreground mt-1">{totalUniversities}</p>
                </div>
                <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-primary-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-success/10 to-emerald-500/10 border-2 border-success/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Universities</p>
                  <p className="text-2xl font-extrabold text-success mt-1">{activeUniversities}</p>
                </div>
                <div className="w-10 h-10 rounded-lg gradient-success flex items-center justify-center">
                  <Users className="w-5 h-5 text-success-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-info/10 to-blue-500/10 border-2 border-info/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Referrals</p>
                  <p className="text-2xl font-extrabold text-foreground mt-1">{totalReferrals}</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-info/20 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-info" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-warning/10 to-orange-500/10 border-2 border-warning/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Overall Conversion</p>
                  <p className="text-2xl font-extrabold text-foreground mt-1">{overallConversionRate}%</p>
                </div>
                <div className="w-10 h-10 rounded-lg gradient-warning flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-warning-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search, Filter, and Sort */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search by name or code..." 
              className="pl-9 border-2"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px] border-2">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px] border-2">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name (A-Z)</SelectItem>
                <SelectItem value="code">Code (A-Z)</SelectItem>
                <SelectItem value="referrals">Referrals (High-Low)</SelectItem>
                <SelectItem value="admissions">Admissions (High-Low)</SelectItem>
                <SelectItem value="date">Date (Newest)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results Count */}
        {filteredAndSortedUniversities.length > 0 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground font-medium">
              Showing <span className="font-bold text-foreground">{filteredAndSortedUniversities.length}</span> of <span className="font-bold text-foreground">{totalUniversities}</span> universities
              {statusFilter !== 'all' && ` (filtered by ${statusFilter})`}
            </p>
          </div>
        )}

        {/* Enhanced University Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredAndSortedUniversities.length === 0 ? (
            <div className="col-span-full">
              <Card className="border-2 border-dashed">
                <CardContent className="p-12 text-center">
                  <Building2 className="w-16 h-16 mx-auto text-muted-foreground mb-4 opacity-50" />
                  <h3 className="text-xl font-bold text-card-foreground mb-2">No Universities Found</h3>
                  <p className="text-muted-foreground mb-6">
                    {searchQuery || statusFilter !== 'all' 
                      ? 'Try adjusting your search or filter criteria'
                      : 'Get started by adding your first university'}
                  </p>
                  {(!searchQuery && statusFilter === 'all') && (
                    <Button className="gradient-primary text-primary-foreground" onClick={handleAddUniversity}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add First University
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : (
            filteredAndSortedUniversities.map((uni) => {
            const stats = getUniversityStats(uni.id);

            return (
              <Card key={uni.id} className="hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/30 group">
                <CardHeader className="bg-gradient-to-r from-primary/5 via-primary/5 to-accent/5 border-b-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-xl gradient-primary flex items-center justify-center shadow-lg transition-transform">
                        <Building2 className="w-8 h-8 text-primary-foreground" />
                      </div>
                      <div>
                        <CardTitle className="text-xl font-bold text-card-foreground group-hover:text-primary transition-colors">{uni.name}</CardTitle>
                        <p className="text-sm font-mono text-primary font-semibold mt-1">{uni.code}</p>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={`border-2 font-semibold ${
                        uni.status === 'active'
                          ? 'bg-success/10 text-success border-success/30'
                          : 'bg-muted text-muted-foreground border-muted-foreground/30'
                      }`}
                    >
                      {uni.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-5 p-6">
                  {/* Enhanced Stats Grid */}
                  <div className="grid grid-cols-4 gap-3 py-4 border-y-2 border-border">
                    <div className="text-center p-3 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors group/stat">
                      <FileText className="w-5 h-5 mx-auto text-primary mb-2 group-hover/stat:scale-110 transition-transform" />
                      <p className="text-2xl font-extrabold text-card-foreground">{stats.totalReferrals}</p>
                      <p className="text-xs text-muted-foreground font-medium">Referrals</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-success/5 hover:bg-success/10 transition-colors group/stat">
                      <Users className="w-5 h-5 mx-auto text-success mb-2 group-hover/stat:scale-110 transition-transform" />
                      <p className="text-2xl font-extrabold text-success">{stats.admissions}</p>
                      <p className="text-xs text-muted-foreground font-medium">Admissions</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-warning/5 hover:bg-warning/10 transition-colors group/stat">
                      <TrendingUp className="w-5 h-5 mx-auto text-warning mb-2 group-hover/stat:scale-110 transition-transform" />
                      <p className="text-2xl font-extrabold text-card-foreground">{stats.conversionRate}%</p>
                      <p className="text-xs text-muted-foreground font-medium">Conv. Rate</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-accent/5 hover:bg-accent/10 transition-colors group/stat">
                      <Building2 className="w-5 h-5 mx-auto text-accent mb-2 group-hover/stat:scale-110 transition-transform" />
                      <p className="text-2xl font-extrabold text-card-foreground">{stats.programs}</p>
                      <p className="text-xs text-muted-foreground font-medium">Programs</p>
                    </div>
                  </div>

                  {/* Enhanced Programs List */}
                  <div>
                    <p className="text-sm font-bold text-card-foreground mb-3 flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-primary" />
                      Programs
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {programs
                        .filter((p) => p.university_id === uni.id)
                        .slice(0, 5)
                        .map((prog) => (
                          <Badge key={prog.id} variant="secondary" className="border-2 font-medium hover:scale-105 transition-transform cursor-pointer">
                            {prog.code}
                          </Badge>
                        ))}
                      {programs.filter((p) => p.university_id === uni.id).length === 0 && (
                        <p className="text-sm text-muted-foreground italic">No programs yet</p>
                      )}
                    </div>
                  </div>

                  {/* Enhanced Actions */}
                  <div className="flex gap-2 pt-3 border-t-2 border-border">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 border-2 hover:border-primary/40 hover:bg-primary/5 transition-all font-semibold"
                      onClick={() => handleViewDetails(uni.id)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="border-2 hover:border-primary/40 hover:bg-primary/5 transition-all"
                      onClick={() => handleManagePrograms(uni.id)}
                      title="Manage Programs"
                    >
                      <Settings className="w-4 h-4" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="border-2 hover:border-primary/40 hover:bg-primary/5 transition-all"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleEdit(uni.id)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit University
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusToggle(uni.id, uni.status)}>
                          <Settings className="w-4 h-4 mr-2" />
                          {uni.status === 'active' ? 'Deactivate' : 'Activate'}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => handleDelete(uni.id)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            );
          })
          )}
        </div>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the university from the system.
                {universityToDelete && (
                  <>
                    <br /><br />
                    <strong>Note:</strong> Universities with associated referrals or programs cannot be deleted. 
                    Please deactivate them instead.
                  </>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
};

export default Universities;
