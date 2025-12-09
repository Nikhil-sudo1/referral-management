import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { universities, programs } from '@/data/mockData';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, UserPlus, Users, Building2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const AddReferee = () => {
  const navigate = useNavigate();
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

  // Filter programs based on selected university
  const availablePrograms = programs.filter(
    (p) => p.universityId === formData.universityId && p.status === 'active'
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
    
    // Validation
    if (
      !formData.refereeName ||
      !formData.refereeEmail ||
      !formData.refereePhone ||
      !formData.referrerName ||
      !formData.referrerEmail ||
      !formData.referrerPhone ||
      !formData.universityId ||
      !formData.programId
    ) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
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

    // Simulate API call
    setTimeout(() => {
      // In a real app, you would make an API call here
      // For now, we'll just show a success message
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
      
      setIsSubmitting(false);
      
      // Navigate back to counselors page after a short delay
      setTimeout(() => {
        navigate('/counselors');
      }, 1500);
    }, 1000);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/counselors')}
            className="hover:bg-muted"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Add Referee</h1>
            <p className="text-muted-foreground mt-1">Create a new referee (student) entry</p>
          </div>
        </div>

        {/* Form Card */}
        <Card className="max-w-3xl shadow-2xl border-2 hover:shadow-3xl transition-shadow">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5 border-b">
            <CardTitle className="text-2xl flex items-center gap-2">
              <UserPlus className="w-6 h-6 text-primary" />
              Referee Information
            </CardTitle>
            <CardDescription className="text-base">
              Enter the details for the new referee and referrer. All fields are required.
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
                  <h3 className="font-bold text-lg text-card-foreground">Referee Details (Student)</h3>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="refereeName">
                    Referee Full Name <span className="text-destructive">*</span>
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
                    Referee Email Address <span className="text-destructive">*</span>
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
                    Referee Phone Number <span className="text-destructive">*</span>
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
                      {availablePrograms.map((program) => (
                        <SelectItem key={program.id} value={program.id}>
                          <div className="flex items-center justify-between w-full">
                            <span>{program.name} ({program.code})</span>
                            <span className="ml-4 text-xs font-semibold text-success">
                              💰 ${program.rewardAmount.toLocaleString()} reward
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-4 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/counselors')}
                  className="flex-1"
                  size="lg"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="gradient-primary flex-1 text-primary-foreground hover:shadow-lg"
                  disabled={isSubmitting}
                  size="lg"
                >
                  {isSubmitting ? (
                    'Adding Referee...'
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

