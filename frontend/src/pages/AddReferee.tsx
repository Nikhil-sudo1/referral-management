import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, UserPlus, Users, Building2, Loader2, AlertCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { universitiesAPI, referralsAPI } from '@/lib/api';
import { isValidEmail, isValidPhone, isValidName, hasErrors, FormErrors } from '@/lib/validations';

const AddReferee = () => {
  const navigate = useNavigate();
  const [universities, setUniversities] = useState<any[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);
  const [isLoadingUniversities, setIsLoadingUniversities] = useState(true);
  const [formData, setFormData] = useState({
    refereeName: '',
    refereeEmail: '',
    refereePhone: '',
    referrerName: '',
    referrerEmail: '',
    referrerPhone: '',
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
        setIsLoadingUniversities(false);
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

  const validateForm = (): FormErrors => {
    const newErrors: FormErrors = {};
    
    // Referee validations
    const refNameResult = isValidName(formData.refereeName, 'Student name');
    if (!refNameResult.isValid) newErrors.refereeName = refNameResult.error!;
    
    const refEmailResult = isValidEmail(formData.refereeEmail);
    if (!refEmailResult.isValid) newErrors.refereeEmail = refEmailResult.error!;
    
    const refPhoneResult = isValidPhone(formData.refereePhone);
    if (!refPhoneResult.isValid) newErrors.refereePhone = refPhoneResult.error!;
    
    // Referrer validations
    const referrerNameResult = isValidName(formData.referrerName, 'Referrer name');
    if (!referrerNameResult.isValid) newErrors.referrerName = referrerNameResult.error!;
    
    const referrerEmailResult = isValidEmail(formData.referrerEmail);
    if (!referrerEmailResult.isValid) newErrors.referrerEmail = referrerEmailResult.error!;
    
    const referrerPhoneResult = isValidPhone(formData.referrerPhone);
    if (!referrerPhoneResult.isValid) newErrors.referrerPhone = referrerPhoneResult.error!;
    
    // University & Program
    if (!formData.universityId) newErrors.universityId = 'Please select a university';
    if (!formData.programId) newErrors.programId = 'Please select a program';
    
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const newErrors = validateForm();
    setErrors(newErrors);
    
    if (hasErrors(newErrors)) {
      toast({
        title: 'Validation Error',
        description: 'Please correct the errors below',
        variant: 'destructive',
      });
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.refereeEmail) || !emailRegex.test(formData.referrerEmail)) {
      toast({
        title: 'Validation Error',
        description: 'Please enter valid email addresses',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Submit referral to backend
      await referralsAPI.createReferral({
        referee_name: formData.refereeName,
        referee_email: formData.refereeEmail,
        referee_phone: formData.refereePhone,
        referrer_name: formData.referrerName,
        referrer_email: formData.referrerEmail,
        referrer_phone: formData.referrerPhone,
        university_id: formData.universityId,
        program_id: formData.programId,
      });
      
      toast({
        title: 'Referee Added',
        description: `${formData.refereeName} has been successfully added as a referee`,
      });
      
      // Reset form
      setFormData({
        refereeName: '',
        refereeEmail: '',
        refereePhone: '',
        referrerName: '',
        referrerEmail: '',
        referrerPhone: '',
        universityId: '',
        programId: '',
      });
      
      // Navigate back to referees page after a short delay
      setTimeout(() => {
        navigate('/referees');
      }, 1500);
    } catch (error) {
      console.error('Error adding referee:', error);
      toast({
        title: 'Error',
        description: 'Failed to add referee. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Enhanced Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/referees')}
            className="hover:bg-muted border-2"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center shadow-lg">
              <UserPlus className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-foreground bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent">
                Add Referee
              </h1>
              <p className="text-muted-foreground mt-1 font-medium">Create a new referee (student) entry</p>
            </div>
          </div>
        </div>

        {/* Enhanced Form Card */}
        <Card className="max-w-3xl shadow-2xl border-2 border-border/50 hover:shadow-3xl transition-all duration-300">
          <CardHeader className="bg-gradient-to-r from-primary/5 via-primary/5 to-accent/5 border-b-2">
            <CardTitle className="text-2xl flex items-center gap-3 font-bold">
              <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center">
                <UserPlus className="w-5 h-5 text-primary-foreground" />
              </div>
              Referee Information
            </CardTitle>
            <CardDescription className="text-base mt-2">
              Enter the details for the student being referred and the person making the referral. All fields are required.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Referee Section */}
              <div className="space-y-5 pb-6 border-b-2 border-border">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center">
                    <UserPlus className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <h3 className="font-bold text-lg text-card-foreground">Student Details</h3>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="refereeName">
                    Student Full Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="refereeName"
                    placeholder="John Doe"
                    value={formData.refereeName}
                    onChange={(e) => handleInputChange('refereeName', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="refereeEmail">
                    Student Email Address <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="refereeEmail"
                    type="email"
                    placeholder="john.doe@example.com"
                    value={formData.refereeEmail}
                    onChange={(e) => handleInputChange('refereeEmail', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="refereePhone">
                    Student Phone Number <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="refereePhone"
                    type="tel"
                    placeholder="+1 234 567 8900"
                    value={formData.refereePhone}
                    onChange={(e) => handleInputChange('refereePhone', e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Referrer Section */}
              <div className="space-y-5 pb-6 border-b-2 border-border">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-lg gradient-success flex items-center justify-center">
                    <Users className="w-5 h-5 text-success-foreground" />
                  </div>
                  <h3 className="font-bold text-lg text-card-foreground">Referrer Details</h3>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="referrerName">
                    Referrer Full Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="referrerName"
                    placeholder="Jane Smith"
                    value={formData.referrerName}
                    onChange={(e) => handleInputChange('referrerName', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="referrerEmail">
                    Referrer Email Address <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="referrerEmail"
                    type="email"
                    placeholder="jane.smith@example.com"
                    value={formData.referrerEmail}
                    onChange={(e) => handleInputChange('referrerEmail', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="referrerPhone">
                    Referrer Phone Number <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="referrerPhone"
                    type="tel"
                    placeholder="+1 234 567 8900"
                    value={formData.referrerPhone}
                    onChange={(e) => handleInputChange('referrerPhone', e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* University & Program Section */}
              <div className="space-y-5">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-lg gradient-warning flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-warning-foreground" />
                  </div>
                  <h3 className="font-bold text-lg text-card-foreground">University & Program</h3>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="university">
                    University <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.universityId}
                    onValueChange={(value) => handleInputChange('universityId', value)}
                    required
                  >
                    <SelectTrigger id="university">
                      <SelectValue placeholder="Select a university" />
                    </SelectTrigger>
                    <SelectContent>
                      {universities
                        .filter((u) => u.status === 'active')
                        .map((university) => (
                          <SelectItem key={university.id} value={university.id}>
                            {university.name} ({university.code})
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="program">
                    Program <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.programId}
                    onValueChange={(value) => handleInputChange('programId', value)}
                    required
                    disabled={!formData.universityId || availablePrograms.length === 0}
                  >
                    <SelectTrigger id="program">
                      <SelectValue 
                        placeholder={
                          !formData.universityId
                            ? 'Select a university first'
                            : availablePrograms.length === 0
                            ? 'No programs available'
                            : 'Select a program'
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {availablePrograms.map((program: any) => (
                        <SelectItem key={program.id} value={program.id}>
                          <div className="flex items-center justify-between w-full">
                            <span>{program.name} ({program.code})</span>
                            <span className="ml-4 text-xs font-semibold text-success">
                              💰 ₹{(program.reward_amount || program.rewardAmount || 0).toLocaleString()} reward
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Enhanced Actions */}
              <div className="flex gap-4 pt-6 border-t-2 border-border">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/referees')}
                  className="flex-1 border-2 hover:border-primary/40 hover:bg-primary/5 transition-all font-semibold"
                  size="lg"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="gradient-primary flex-1 text-primary-foreground hover:shadow-lg transition-all font-semibold"
                  disabled={isSubmitting}
                  size="lg"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-primary-foreground" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Adding Referee...
                    </span>
                  ) : (
                    <>
                      <UserPlus className="w-5 h-5 mr-2" />
                      Add Referee
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AddReferee;

