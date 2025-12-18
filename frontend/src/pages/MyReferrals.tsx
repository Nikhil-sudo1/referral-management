import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ReferrerLayout } from '@/components/layout/ReferrerLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Mail, Phone, MapPin, GraduationCap, BookOpen, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { referralsAPI } from '@/lib/api/referrals';
import { universitiesAPI } from '@/lib/api/universities';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import { AnimatedCounter } from '@/components/animations/AnimatedCounter';

interface Referral {
  id: string;
  referral_name: string;
  mobile: string;
  email: string;
  status: string;
  university_preference: string;
  course_preference: string;
  stage: string;
  region?: string;
  created_at: string;
}

const MyReferrals = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    referral_name: '',
    mobile: '',
    email: '',
    region: '',
    university_id: '',
    program_id: '',
  });
  const [universities, setUniversities] = useState<any[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);

  // Fetch referrals
  const { data: referralsData, refetch } = useQuery({
    queryKey: ['my-referrals'],
    queryFn: async () => {
      const response = await referralsAPI.getMyReferrals();
      return response.items || [];
    },
  });

  const referrals: Referral[] = referralsData || [];

  // Fetch universities when region is selected
  const { data: universitiesData } = useQuery({
    queryKey: ['universities', formData.region],
    queryFn: async () => {
      if (!formData.region) return [];
      const response = await universitiesAPI.getUniversities({ region: formData.region });
      return response.items || [];
    },
    enabled: !!formData.region,
  });

  // Update universities when data changes
  useEffect(() => {
    if (universitiesData) {
      setUniversities(universitiesData);
    }
  }, [universitiesData]);

  // Fetch programs when university is selected
  const { data: programsData } = useQuery({
    queryKey: ['programs', formData.university_id],
    queryFn: async () => {
      if (!formData.university_id) return [];
      // Fetch programs for the selected university
      const response = await universitiesAPI.getUniversityPrograms(formData.university_id);
      return response || [];
    },
    enabled: !!formData.university_id,
  });

  useEffect(() => {
    if (programsData) {
      setPrograms(programsData);
    }
  }, [programsData]);

  const filteredReferrals = referrals.filter((ref) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      ref.referral_name.toLowerCase().includes(searchLower) ||
      ref.mobile.includes(searchLower) ||
      ref.email.toLowerCase().includes(searchLower) ||
      ref.university_preference.toLowerCase().includes(searchLower) ||
      ref.course_preference.toLowerCase().includes(searchLower)
    );
  });

  const handleAddReferral = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.referral_name || !formData.mobile || !formData.email || !formData.region || !formData.university_id || !formData.program_id) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      await referralsAPI.submitReferral({
        student_name: formData.referral_name,
        student_phone: formData.mobile,
        student_email: formData.email,
        region: formData.region,
        university_id: formData.university_id,
        program_id: formData.program_id,
      });

      toast({
        title: 'Success',
        description: 'Referral added successfully',
      });

      setIsAddDialogOpen(false);
      setFormData({
        referral_name: '',
        mobile: '',
        email: '',
        region: '',
        university_id: '',
        program_id: '',
      });
      refetch();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Failed to add referral',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      'Hot': { label: 'Hot', variant: 'destructive' },
      'Warm': { label: 'Warm', variant: 'default' },
      'Cold': { label: 'Cold', variant: 'secondary' },
      'submitted': { label: 'Submitted', variant: 'outline' },
    };
    const config = statusConfig[status] || { label: status, variant: 'outline' };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getStageBadge = (stage: string) => {
    const stageConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      'New': { label: 'New', variant: 'outline' },
      'In-Progress': { label: 'In-Progress', variant: 'default' },
      'Closed Won': { label: 'Closed Won', variant: 'default' },
      'Closed Lost/Drop': { label: 'Closed Lost', variant: 'destructive' },
    };
    const config = stageConfig[stage] || { label: stage, variant: 'outline' };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const stats = {
    total: referrals.length,
    hot: referrals.filter((r) => r.status === 'Hot').length,
    warm: referrals.filter((r) => r.status === 'Warm').length,
    cold: referrals.filter((r) => r.status === 'Cold').length,
  };

  return (
    <ReferrerLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <ScrollReveal delay={0}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold">My Referrals</h1>
              <p className="text-muted-foreground mt-1">
                Manage and track all your referrals
              </p>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="btn-ripple hover-glow hover-lift group">
                  <Plus className="mr-2 h-4 w-4 group-hover:rotate-90 transition-transform duration-300" />
                  Add Referral
                </Button>
              </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Referral</DialogTitle>
                <DialogDescription>
                  Fill in the details of the student you want to refer
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddReferral} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="referral_name">Referral Name *</Label>
                  <Input
                    id="referral_name"
                    value={formData.referral_name}
                    onChange={(e) => setFormData({ ...formData, referral_name: e.target.value })}
                    placeholder="Enter student's full name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mobile">Mobile Number *</Label>
                  <Input
                    id="mobile"
                    type="tel"
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    placeholder="+91 9876543210"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email ID *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="student@example.com"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="region">Region *</Label>
                  <Select
                    value={formData.region}
                    onValueChange={(value) => {
                      setFormData({ ...formData, region: value, university_id: '', program_id: '' });
                    }}
                    required
                  >
                    <SelectTrigger id="region">
                      <SelectValue placeholder="Select region" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="North">North</SelectItem>
                      <SelectItem value="South">South</SelectItem>
                      <SelectItem value="East">East</SelectItem>
                      <SelectItem value="West">West</SelectItem>
                      <SelectItem value="Central">Central</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="university">University Preference *</Label>
                  <Select
                    value={formData.university_id}
                    onValueChange={(value) => {
                      setFormData({ ...formData, university_id: value, program_id: '' });
                    }}
                    required
                    disabled={!formData.region}
                  >
                    <SelectTrigger id="university">
                      <SelectValue placeholder={formData.region ? "Select university" : "Select region first"} />
                    </SelectTrigger>
                    <SelectContent>
                      {universities.map((uni) => (
                        <SelectItem key={uni.id} value={uni.id}>
                          {uni.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="program">Course Preference *</Label>
                  <Select
                    value={formData.program_id}
                    onValueChange={(value) => setFormData({ ...formData, program_id: value })}
                    required
                    disabled={!formData.university_id}
                  >
                    <SelectTrigger id="program">
                      <SelectValue placeholder={formData.university_id ? "Select course" : "Select university first"} />
                    </SelectTrigger>
                    <SelectContent>
                      {programs.map((prog) => (
                        <SelectItem key={prog.id} value={prog.id}>
                          {prog.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAddDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    className="btn-ripple hover-glow"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      'Add Referral'
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        </ScrollReveal>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <ScrollReveal delay={0}>
            <Card className="hover-lift hover-glow transition-all duration-300">
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-primary">
                  <AnimatedCounter value={stats.total} />
                </div>
                <p className="text-sm text-muted-foreground mt-1">Total Referrals</p>
              </CardContent>
            </Card>
          </ScrollReveal>
          <ScrollReveal delay={100}>
            <Card className="hover-lift hover-glow transition-all duration-300">
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-destructive">
                  <AnimatedCounter value={stats.hot} />
                </div>
                <p className="text-sm text-muted-foreground mt-1">Hot Leads</p>
              </CardContent>
            </Card>
          </ScrollReveal>
          <ScrollReveal delay={200}>
            <Card className="hover-lift hover-glow transition-all duration-300">
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-primary">
                  <AnimatedCounter value={stats.warm} />
                </div>
                <p className="text-sm text-muted-foreground mt-1">Warm Leads</p>
              </CardContent>
            </Card>
          </ScrollReveal>
          <ScrollReveal delay={300}>
            <Card className="hover-lift hover-glow transition-all duration-300">
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-muted-foreground">
                  <AnimatedCounter value={stats.cold} />
                </div>
                <p className="text-sm text-muted-foreground mt-1">Cold Leads</p>
              </CardContent>
            </Card>
          </ScrollReveal>
        </div>

        {/* Search */}
        <ScrollReveal delay={400}>
          <Card className="animate-slide-in-bottom">
            <CardContent className="pt-6">
              <div className="relative group">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  placeholder="Search by name, phone, email, university, or course..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>
        </ScrollReveal>

        {/* Referrals Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Referrals ({filteredReferrals.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredReferrals.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">No referrals found</p>
                <Button onClick={() => setIsAddDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Referral
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Referral Name</TableHead>
                      <TableHead>Mobile</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>University</TableHead>
                      <TableHead>Course</TableHead>
                      <TableHead>Stage</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredReferrals.map((referral, index) => (
                      <TableRow 
                        key={referral.id}
                        className="hover-lift transition-all duration-200"
                        style={{
                          animation: 'slideInFromBottom 0.5s ease-out',
                          animationDelay: `${index * 50}ms`,
                          animationFillMode: 'both'
                        }}
                      >
                        <TableCell className="font-medium">{referral.referral_name}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            {referral.mobile}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            {referral.email}
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(referral.status)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <GraduationCap className="h-4 w-4 text-muted-foreground" />
                            {referral.university_preference}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <BookOpen className="h-4 w-4 text-muted-foreground" />
                            {referral.course_preference}
                          </div>
                        </TableCell>
                        <TableCell>{getStageBadge(referral.stage)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </ReferrerLayout>
  );
};

export default MyReferrals;

