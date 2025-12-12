import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { universities } from '@/data/mockData';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Building2, Save } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const EditUniversity = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    logoUrl: '',
    status: 'active' as 'active' | 'inactive',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load university data
    const university = universities.find((u) => u.id === id);
    if (university) {
      setFormData({
        name: university.name,
        code: university.code,
        logoUrl: university.logoUrl || '',
        status: university.status,
      });
      setIsLoading(false);
    } else {
      toast({
        title: 'University Not Found',
        description: 'The university you are trying to edit does not exist',
        variant: 'destructive',
      });
      navigate('/universities');
    }
  }, [id, navigate]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name || !formData.code) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    // Code validation - should be uppercase and alphanumeric
    const codeRegex = /^[A-Z0-9]+$/;
    if (!codeRegex.test(formData.code.toUpperCase())) {
      toast({
        title: 'Validation Error',
        description: 'University code must contain only uppercase letters and numbers',
        variant: 'destructive',
      });
      return;
    }

    // Check for duplicate code (excluding current university)
    const duplicateCode = universities.find(
      (u) => u.code.toUpperCase() === formData.code.toUpperCase() && u.id !== id
    );
    if (duplicateCode) {
      toast({
        title: 'Validation Error',
        description: 'A university with this code already exists',
        variant: 'destructive',
      });
      return;
    }

    // URL validation if provided
    if (formData.logoUrl && formData.logoUrl.trim() !== '') {
      try {
        new URL(formData.logoUrl);
      } catch {
        toast({
          title: 'Validation Error',
          description: 'Please enter a valid URL for the logo',
          variant: 'destructive',
        });
        return;
      }
    }

    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      toast({
        title: 'University Updated',
        description: `${formData.name} has been successfully updated`,
      });
      
      setIsSubmitting(false);
      
      // Navigate back to universities page after a short delay
      setTimeout(() => {
        navigate('/universities');
      }, 1500);
    }, 1000);
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading university data...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Enhanced Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/universities')}
            className="hover:bg-muted border-2"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center shadow-lg">
              <Building2 className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-foreground bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent">
                Edit University
              </h1>
              <p className="text-muted-foreground mt-1 font-medium">Update university information</p>
            </div>
          </div>
        </div>

        {/* Enhanced Form Card */}
        <Card className="max-w-2xl shadow-2xl border-2 border-border/50 hover:shadow-3xl transition-all duration-300">
          <CardHeader className="bg-gradient-to-r from-primary/5 via-primary/5 to-accent/5 border-b-2">
            <CardTitle className="text-2xl flex items-center gap-3 font-bold">
              <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center">
                <Building2 className="w-5 h-5 text-primary-foreground" />
              </div>
              University Information
            </CardTitle>
            <CardDescription className="text-base mt-2">
              Update the details for this university. Name and code are required.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">
                  University Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="Massachusetts Institute of Technology"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                  className="border-2"
                />
              </div>

              {/* Code */}
              <div className="space-y-2">
                <Label htmlFor="code">
                  University Code <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="code"
                  placeholder="MIT"
                  value={formData.code}
                  onChange={(e) => handleInputChange('code', e.target.value.toUpperCase())}
                  required
                  maxLength={10}
                  className="font-mono border-2"
                />
                <p className="text-xs text-muted-foreground">
                  Code will be automatically converted to uppercase (max 10 characters)
                </p>
              </div>

              {/* Logo URL */}
              <div className="space-y-2">
                <Label htmlFor="logoUrl">
                  Logo URL <span className="text-muted-foreground text-xs">(Optional)</span>
                </Label>
                <Input
                  id="logoUrl"
                  type="url"
                  placeholder="https://example.com/logo.png"
                  value={formData.logoUrl}
                  onChange={(e) => handleInputChange('logoUrl', e.target.value)}
                  className="border-2"
                />
                <p className="text-xs text-muted-foreground">
                  URL to the university logo image
                </p>
              </div>

              {/* Status */}
              <div className="space-y-2">
                <Label htmlFor="status">
                  Status <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleInputChange('status', value)}
                  required
                >
                  <SelectTrigger id="status" className="border-2">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Active universities will be available for referrals
                </p>
              </div>

              {/* Enhanced Actions */}
              <div className="flex gap-3 pt-6 border-t-2 border-border">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/universities')}
                  className="flex-1 border-2 hover:border-primary/40 hover:bg-primary/5 transition-all font-semibold"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="gradient-primary flex-1 text-primary-foreground hover:shadow-lg transition-all font-semibold"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-primary-foreground" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Updating...
                    </span>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Update University
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

export default EditUniversity;

