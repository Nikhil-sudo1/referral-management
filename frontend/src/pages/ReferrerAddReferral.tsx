import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ReferrerLayout } from '@/components/layout/ReferrerLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, UserPlus, Users, Building2, GraduationCap, Mail, Phone, Loader2, AlertCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { universitiesAPI, referralsAPI } from '@/lib/api';
import { validateReferralForm, hasErrors, FormErrors } from '@/lib/validations';

const ReferrerAddReferral = () => {
  const navigate = useNavigate();
  const [universities, setUniversities] = useState<any[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [formData, setFormData] = useState({
    refereeName: '',
    refereeEmail: '',
    refereePhone: '',
    universityId: '',
    programId: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  // Helper to render field error
  const FieldError = ({ error }: { error?: string }) => {
    if (!error) return null;
    return (
      <div className="flex items-center gap-1 text-red-500 text-xs mt-1">
        <AlertCircle className="w-3 h-3" />
        <span>{error}</span>
      </div>
    );
  };

  // Fetch universities on mount
  useEffect(() => {
    const fetchUniversities = async () => {
      try {
        const response = await universitiesAPI.getUniversities({ status: 'active', limit: 100 });
        setUniversities(response.items || []);
      } catch (error) {
        console.error('Error fetching universities:', error);
        toast({ title: 'Error', description: 'Failed to load universities', variant: 'destructive' });
      } finally {
        setIsLoadingData(false);
      }
    };
    fetchUniversities();
  }, []);

  // Fetch programs when university changes
  useEffect(() => {
    const fetchPrograms = async () => {
      if (!formData.universityId) {
        setPrograms([]);
        return;
      }
      try {
        const programsList = await universitiesAPI.getUniversityPrograms(formData.universityId);
        setPrograms(programsList || []);
      } catch (error) {
        console.error('Error fetching programs:', error);
        setPrograms([]);
      }
    };
    fetchPrograms();
  }, [formData.universityId]);

  // Filter active programs
  const availablePrograms = programs.filter(
    (p: any) => p.status === 'active'
  );

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => {
      const updated = {
        ...prev,
        [field]: value,
      };
      // Reset programId when university changes
      if (field === 'universityId') {
        updated.programId = '';
      }
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate using centralized validation
    const newErrors = validateReferralForm({
      studentName: formData.refereeName,
      studentEmail: formData.refereeEmail,
      studentPhone: formData.refereePhone,
      universityId: formData.universityId,
      programId: formData.programId,
    });
    setErrors(newErrors);

    if (hasErrors(newErrors)) {
      toast({ title: 'Validation Error', description: 'Please correct the errors below', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);

    try {
      // Submit referral to backend
      await referralsAPI.createReferral({
        referee_name: formData.refereeName,
        referee_email: formData.refereeEmail,
        referee_phone: formData.refereePhone,
        university_id: formData.universityId,
        program_id: formData.programId,
      });
      
      toast({ 
        title: 'Referral Submitted!', 
        description: 'Your referral has been submitted successfully. The student will be contacted soon.' 
      });
      
      // Reset form
      setFormData({
        refereeName: '',
        refereeEmail: '',
        refereePhone: '',
        universityId: '',
        programId: '',
      });
      // Navigate back to referrals page
      setTimeout(() => {
        navigate('/referrer/referrals');
      }, 1500);
    } catch (error) {
      console.error('Error submitting referral:', error);
      toast({ 
        title: 'Error', 
        description: 'Failed to submit referral. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ReferrerLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/referrer/referrals')}
            className="hover:bg-muted"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="space-y-2">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center shadow-xl glow-primary">
                <UserPlus className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-display text-foreground">Add New Referral</h1>
                <p className="text-muted-foreground mt-1">Submit a new student referral</p>
              </div>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <Card className="card-elevated max-w-3xl">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-info/5 border-b border-border">
            <CardTitle className="text-2xl font-display flex items-center gap-2">
              <UserPlus className="w-6 h-6 text-primary" />
              Student Information
            </CardTitle>
            <CardDescription className="text-base">
              Enter the details for the student you're referring. All fields are required.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Student Details Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-border">
                  <Users className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-semibold text-foreground">Student Details</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="refereeName" className="text-foreground">
                      Student Name <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="refereeName"
                        placeholder="Enter student's full name"
                        className="pl-10"
                        value={formData.refereeName}
                        onChange={(e) => handleInputChange('refereeName', e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="refereeEmail" className="text-foreground">
                      Email Address <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="refereeEmail"
                        type="email"
                        placeholder="student@example.com"
                        className="pl-10"
                        value={formData.refereeEmail}
                        onChange={(e) => handleInputChange('refereeEmail', e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="refereePhone" className="text-foreground">
                    Phone Number <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="refereePhone"
                      type="tel"
                      placeholder="+91 1234567890"
                      className="pl-10"
                      value={formData.refereePhone}
                      onChange={(e) => handleInputChange('refereePhone', e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* University & Program Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-border">
                  <Building2 className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-semibold text-foreground">University & Program</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="universityId" className="text-foreground">
                      University <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={formData.universityId}
                      onValueChange={(value) => handleInputChange('universityId', value)}
                      required
                    >
                      <SelectTrigger id="universityId" className="w-full">
                        <SelectValue placeholder="Select a university" />
                      </SelectTrigger>
                      <SelectContent>
                        {universities.map((university) => (
                          <SelectItem key={university.id} value={university.id}>
                            {university.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="programId" className="text-foreground">
                      Program <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={formData.programId}
                      onValueChange={(value) => handleInputChange('programId', value)}
                      disabled={!formData.universityId || availablePrograms.length === 0}
                      required
                    >
                      <SelectTrigger id="programId" className="w-full">
                        <SelectValue 
                          placeholder={
                            !formData.universityId 
                              ? "Select university first" 
                              : availablePrograms.length === 0 
                              ? "No programs available" 
                              : "Select a program"
                          } 
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {availablePrograms.map((program) => (
                          <SelectItem key={program.id} value={program.id}>
                            {program.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Info Note */}
              <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
                <p className="text-sm text-muted-foreground">
                  <strong className="text-foreground">Note:</strong> After submission, the student will be contacted by our team. 
                  You'll receive updates on the referral status in your dashboard.
                </p>
              </div>

              {/* Submit Button */}
              <div className="flex items-center justify-end gap-4 pt-4 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/referrer/referrals')}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="gradient-primary text-white shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Submit Referral
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </ReferrerLayout>
  );
};

export default ReferrerAddReferral;

