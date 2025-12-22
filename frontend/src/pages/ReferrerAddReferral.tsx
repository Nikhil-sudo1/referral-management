import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ReferrerLayout } from '@/components/layout/ReferrerLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SearchableSelect, SearchableSelectItem } from '@/components/ui/searchable-select';
import { ArrowLeft, UserPlus, Users, Building2, GraduationCap, Mail, Phone, Loader2, AlertCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { universitiesAPI, referralsAPI, crmAPI } from '@/lib/api';
import { validateReferralForm, hasErrors, FormErrors } from '@/lib/validations';

const ReferrerAddReferral = () => {
  const navigate = useNavigate();
  const [universities, setUniversities] = useState<any[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);
  const [crmUniversities, setCrmUniversities] = useState<any[]>([]);
  const [crmCourses, setCrmCourses] = useState<any[]>([]);
  const [selectedCrmUniversityId, setSelectedCrmUniversityId] = useState<number | null>(null);
  const [selectedCrmCourseId, setSelectedCrmCourseId] = useState<number | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isLoadingCourses, setIsLoadingCourses] = useState(false);
  const [formData, setFormData] = useState({
    refereeName: '',
    refereeEmail: '',
    refereePhone: '',
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

  // Fetch universities from CRM on mount
  useEffect(() => {
    const fetchUniversities = async () => {
      try {
        setIsLoadingData(true);
        let crmUnis: any[] = [];
        
        // Try to fetch from CRM API first
        try {
          crmUnis = await crmAPI.getUniversities();
          if (crmUnis && crmUnis.length > 0) {
            setCrmUniversities(crmUnis);
            console.log('Loaded CRM universities:', crmUnis.length);
          }
        } catch (crmError) {
          console.warn('CRM API unavailable:', crmError);
        }
        
        // Always fetch local universities for fallback and matching
        try {
          const response = await universitiesAPI.getUniversities({ status: 'active', limit: 100 });
          const localUnis = response.items || [];
          setUniversities(localUnis);
          console.log('Loaded local universities:', localUnis.length);
          
          // If no CRM universities, use local ones
          if (crmUnis.length === 0 && localUnis.length > 0) {
            const mappedCrmUnis = localUnis.map((uni: any) => ({
              id: uni.id,
              name: uni.name,
              short_name: uni.code,
            }));
            setCrmUniversities(mappedCrmUnis);
            console.log('Using local universities as fallback:', mappedCrmUnis.length);
          }
        } catch (localError) {
          console.error('Error fetching local universities:', localError);
          setUniversities([]);
        }
      } catch (error) {
        console.error('Unexpected error fetching universities:', error);
      } finally {
        setIsLoadingData(false);
      }
    };
    fetchUniversities();
  }, []);

  // Fetch courses from CRM when university is selected
  useEffect(() => {
    const fetchCourses = async () => {
      if (!selectedCrmUniversityId) {
        setCrmCourses([]);
        setPrograms([]);
        setSelectedCrmCourseId(null);
        return;
      }
      
      try {
        setIsLoadingCourses(true);
        setSelectedCrmCourseId(null);
        
        // Fetch courses from CRM API
        let courses: any[] = [];
        try {
          courses = await crmAPI.getCourses(selectedCrmUniversityId);
          if (courses && courses.length > 0) {
            setCrmCourses(courses);
            console.log('Loaded CRM courses:', courses.length);
          }
        } catch (crmError) {
          console.warn('CRM courses API unavailable:', crmError);
        }
        
        // Find local university and fetch its programs
        const localUniversity = universities.find((u: any) => {
          if (u.crm_university_id !== undefined && u.crm_university_id !== null) {
            return u.crm_university_id === selectedCrmUniversityId;
          }
          // Try name matching as fallback
          const crmUni = crmUniversities.find((cu: any) => cu.id === selectedCrmUniversityId);
          if (crmUni) {
            const normalizeName = (name: string) => name.toLowerCase().replace(/\s*\([^)]*\)\s*/g, '').trim();
            return normalizeName(u.name) === normalizeName(crmUni.name);
          }
          return false;
        });
        
        if (localUniversity) {
          try {
            const programsList = await universitiesAPI.getUniversityPrograms(localUniversity.id);
            setPrograms(programsList || []);
            console.log('Loaded local programs:', programsList?.length || 0);
            
            // If no CRM courses, use local programs
            if (courses.length === 0 && programsList && programsList.length > 0) {
              const mappedCourses = programsList.map((prog: any) => ({
                id: prog.id,
                name: prog.name,
                crm_course_id: prog.crm_course_id,
              }));
              setCrmCourses(mappedCourses);
              console.log('Using local programs as fallback:', mappedCourses.length);
            }
          } catch (progError) {
            console.error('Error fetching local programs:', progError);
            setPrograms([]);
          }
        } else {
          setPrograms([]);
        }
      } catch (error) {
        console.error('Error fetching courses:', error);
        setCrmCourses([]);
        setPrograms([]);
      } finally {
        setIsLoadingCourses(false);
      }
    };
    fetchCourses();
  }, [selectedCrmUniversityId, universities, crmUniversities]);

  // Handle CRM university selection
  const handleCrmUniversityChange = (crmUniversityId: string) => {
    const crmId = parseInt(crmUniversityId);
    setSelectedCrmUniversityId(crmId);
    setSelectedCrmCourseId(null);
  };

  // Handle CRM course selection
  const handleCrmCourseChange = (crmCourseId: string) => {
    if (!crmCourseId) {
      setSelectedCrmCourseId(null);
      return;
    }
    const crmId = parseInt(crmCourseId);
    setSelectedCrmCourseId(crmId);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Clear error for this field
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form data
    const validationData = {
      studentName: (formData.refereeName || '').trim(),
      studentEmail: (formData.refereeEmail || '').trim(),
      studentPhone: (formData.refereePhone || '').trim(),
      universityId: selectedCrmUniversityId ? 'crm-' + selectedCrmUniversityId : '',
      programId: selectedCrmCourseId ? 'crm-' + selectedCrmCourseId : '',
    };

    console.log('=== SUBMISSION DEBUG ===');
    console.log('Form data:', formData);
    console.log('Selected CRM University ID:', selectedCrmUniversityId);
    console.log('Selected CRM Course ID:', selectedCrmCourseId);
    console.log('Validation data:', validationData);
    console.log('========================');

    // Validate
    const newErrors = validateReferralForm(validationData);
    setErrors(newErrors);

    if (hasErrors(newErrors)) {
      const errorDetails = Object.entries(newErrors).map(([key, value]) => {
        const fieldName = key === 'studentName' ? 'Name' : 
                         key === 'studentEmail' ? 'Email' :
                         key === 'studentPhone' ? 'Phone' :
                         key === 'universityId' ? 'University' :
                         key === 'programId' ? 'Program' : key;
        return `${fieldName}: ${value}`;
      }).join(' | ');
      
      toast({ 
        title: 'Validation Error', 
        description: errorDetails, 
        variant: 'destructive',
        duration: 8000,
      });
      return;
    }

    if (!selectedCrmUniversityId || !selectedCrmCourseId) {
      toast({
        title: 'Error',
        description: 'Please select both university and program',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Submit directly with CRM IDs - no local matching required
      const submitData = {
        referee_name: validationData.studentName,
        referee_email: validationData.studentEmail,
        referee_phone: validationData.studentPhone,
        crm_university_id: selectedCrmUniversityId,
        crm_course_id: selectedCrmCourseId,
      };
      
      console.log('=== SUBMITTING REFERRAL ===');
      console.log('Submit data:', submitData);
      console.log('CRM University ID:', selectedCrmUniversityId);
      console.log('CRM Course ID:', selectedCrmCourseId);
      console.log('===========================');
      
      await referralsAPI.submitReferral(submitData);
      
      toast({ 
        title: 'Referral Submitted!', 
        description: 'Your referral has been submitted successfully. The student will be contacted soon.' 
      });
      
      // Reset form
      setFormData({
        refereeName: '',
        refereeEmail: '',
        refereePhone: '',
      });
      setSelectedCrmUniversityId(null);
      setSelectedCrmCourseId(null);
      
      // Navigate back
      setTimeout(() => {
        navigate('/referrer/referrals');
      }, 1500);
    } catch (error: any) {
      console.error('=== SUBMISSION ERROR ===');
      console.error('Error:', error);
      console.error('Error response:', error.response?.data);
      
      let errorMessage = 'Failed to submit referral';
      if (error.response?.data?.detail) {
        if (typeof error.response.data.detail === 'string') {
          errorMessage = error.response.data.detail;
        } else if (Array.isArray(error.response.data.detail)) {
          const errors = error.response.data.detail.map((err: any) => {
            const field = err.loc?.join('.') || 'field';
            return `${field}: ${err.msg}`;
          }).join(', ');
          errorMessage = `Validation error: ${errors}`;
        }
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({ 
        title: 'Submission Failed', 
        description: errorMessage, 
        variant: 'destructive',
        duration: 10000,
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
                        className={`pl-10 ${errors.studentName ? 'border-red-500' : ''}`}
                        value={formData.refereeName}
                        onChange={(e) => {
                          handleInputChange('refereeName', e.target.value);
                          if (errors.studentName) {
                            setErrors((prev) => ({ ...prev, studentName: '' }));
                          }
                        }}
                        required
                      />
                    </div>
                    <FieldError error={errors.studentName} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="refereeEmail" className="text-foreground">
                      Student Email <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="refereeEmail"
                        type="email"
                        placeholder="student@example.com"
                        className={`pl-10 ${errors.studentEmail ? 'border-red-500' : ''}`}
                        value={formData.refereeEmail}
                        onChange={(e) => {
                          handleInputChange('refereeEmail', e.target.value);
                          if (errors.studentEmail) {
                            setErrors((prev) => ({ ...prev, studentEmail: '' }));
                          }
                        }}
                        required
                      />
                    </div>
                    <FieldError error={errors.studentEmail} />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="refereePhone" className="text-foreground">
                      Student Phone <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="refereePhone"
                        type="tel"
                        placeholder="+91 1234567890"
                        className={`pl-10 ${errors.studentPhone ? 'border-red-500' : ''}`}
                        value={formData.refereePhone}
                        onChange={(e) => {
                          handleInputChange('refereePhone', e.target.value);
                          if (errors.studentPhone) {
                            setErrors((prev) => ({ ...prev, studentPhone: '' }));
                          }
                        }}
                        required
                      />
                    </div>
                    <FieldError error={errors.studentPhone} />
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
                    <SearchableSelect
                      value={selectedCrmUniversityId?.toString() || ''}
                      onValueChange={handleCrmUniversityChange}
                      placeholder={isLoadingData ? "Loading..." : crmUniversities.length === 0 ? "No universities available" : "Search and select a university"}
                      searchPlaceholder="Search universities..."
                      disabled={isLoadingData || crmUniversities.length === 0}
                      className="w-full"
                    >
                      {crmUniversities.length === 0 && !isLoadingData ? (
                        <div className="py-6 text-center text-sm text-muted-foreground">
                          <p>No universities available</p>
                          <p className="text-xs mt-2">Please refresh the page or contact support</p>
                        </div>
                      ) : (
                        crmUniversities.map((university) => (
                          <SearchableSelectItem key={university.id} value={university.id.toString()}>
                            {university.name} {university.short_name ? `(${university.short_name})` : ''}
                          </SearchableSelectItem>
                        ))
                      )}
                    </SearchableSelect>
                    <FieldError error={errors.universityId} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="programId" className="text-foreground">
                      Program <span className="text-destructive">*</span>
                    </Label>
                    <SearchableSelect
                      value={selectedCrmCourseId?.toString() || ''}
                      onValueChange={handleCrmCourseChange}
                      placeholder={
                        !selectedCrmUniversityId 
                          ? "Select university first" 
                          : isLoadingCourses
                          ? "Loading courses..." 
                          : crmCourses.length === 0
                          ? "No courses available"
                          : "Search and select a course"
                      }
                      searchPlaceholder="Search courses..."
                      disabled={!selectedCrmUniversityId || isLoadingCourses || crmCourses.length === 0}
                      className="w-full"
                    >
                      {crmCourses.length === 0 ? (
                        <div className="py-6 text-center text-sm text-muted-foreground">
                          {!selectedCrmUniversityId 
                            ? "Please select a university first"
                            : isLoadingCourses
                            ? "Loading courses..."
                            : "No courses available for this university"}
                        </div>
                      ) : (
                        crmCourses.map((course) => (
                          <SearchableSelectItem key={course.id} value={course.id.toString()}>
                            {course.name}
                          </SearchableSelectItem>
                        ))
                      )}
                    </SearchableSelect>
                    <FieldError error={errors.programId} />
                  </div>
                </div>
              </div>

              {/* Validation Errors Summary */}
              {hasErrors(errors) && (
                <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-destructive mb-2">Please fix the following errors:</p>
                      <ul className="text-sm text-destructive/80 space-y-1 list-disc list-inside">
                        {errors.studentName && <li>{errors.studentName}</li>}
                        {errors.studentEmail && <li>{errors.studentEmail}</li>}
                        {errors.studentPhone && <li>{errors.studentPhone}</li>}
                        {errors.universityId && <li>{errors.universityId}</li>}
                        {errors.programId && <li>{errors.programId}</li>}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Info Note */}
              <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
                <p className="text-sm text-muted-foreground">
                  <strong className="text-foreground">Note:</strong> After submission, the student will be contacted by our team. 
                  You'll receive updates on the referral status in your dashboard.
                </p>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/referrer/referrals')}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || !selectedCrmUniversityId || !selectedCrmCourseId}
                  className="min-w-[120px]"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
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
