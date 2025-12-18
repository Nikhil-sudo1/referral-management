import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Building2, Loader2, AlertCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { universitiesAPI } from '@/lib/api';
import { validateUniversityForm, hasErrors, FormErrors, isRequired, minLength } from '@/lib/validations';

const AddUniversity = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    logo_url: '',
    website: '',
    description: '',
    contact_email: '',
    contact_phone: '',
    address: '',
    status: 'active' as 'active' | 'inactive',
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

  const handleInputChange = (field: string, value: string) => {
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Form submitted with data:', formData);
    
    // Validation using centralized validators
    const newErrors: FormErrors = {};
    
    // Required fields
    const nameRequired = isRequired(formData.name, 'University name');
    if (!nameRequired.isValid) newErrors.name = nameRequired.error!;
    else {
      const nameLength = minLength(formData.name, 3, 'University name');
      if (!nameLength.isValid) newErrors.name = nameLength.error!;
    }
    
    const codeRequired = isRequired(formData.code, 'University code');
    if (!codeRequired.isValid) newErrors.code = codeRequired.error!;
    else {
      // Code validation - should be uppercase and alphanumeric
      const codeRegex = /^[A-Z0-9]+$/;
      if (!codeRegex.test(formData.code.toUpperCase())) {
        newErrors.code = 'Code must contain only uppercase letters and numbers';
      }
    }
    
    // URL validations
    if (formData.logo_url && formData.logo_url.trim() !== '') {
      try {
        new URL(formData.logo_url);
      } catch {
        newErrors.logo_url = 'Please enter a valid URL for the logo';
      }
    }
    
    if (formData.website && formData.website.trim() !== '') {
      try {
        new URL(formData.website);
      } catch {
        newErrors.website = 'Please enter a valid website URL';
      }
    }
    
    // Email validation
    if (formData.contact_email && formData.contact_email.trim() !== '') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.contact_email)) {
        newErrors.contact_email = 'Please enter a valid email address';
      }
    }
    
    // Phone validation
    if (formData.contact_phone && formData.contact_phone.trim() !== '') {
      const cleanPhone = formData.contact_phone.replace(/[\s\-()]/g, '');
      const phoneRegex = /^(\+91)?[6-9]\d{9}$/;
      if (!phoneRegex.test(cleanPhone)) {
        newErrors.contact_phone = 'Please enter a valid 10-digit phone number';
      }
    }
    
    setErrors(newErrors);
    
    if (hasErrors(newErrors)) {
      toast({
        title: 'Validation Error',
        description: 'Please correct the errors below',
        variant: 'destructive',
          title: 'Validation Error',
          description: 'Please enter a valid URL for the website',
          variant: 'destructive',
        });
        return;
      }
    }

    // Email validation if provided
    if (formData.contact_email && formData.contact_email.trim() !== '') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.contact_email)) {
        toast({
          title: 'Validation Error',
          description: 'Please enter a valid email address',
          variant: 'destructive',
        });
        return;
      }
    }

    setIsSubmitting(true);

    try {
      console.log('Calling API to create university...');
      
      // Call backend API to create university
      const newUniversity = await universitiesAPI.createUniversity({
        name: formData.name,
        code: formData.code.toUpperCase(),
        logo_url: formData.logo_url || undefined,
        website: formData.website || undefined,
        description: formData.description || undefined,
        contact_email: formData.contact_email || undefined,
        contact_phone: formData.contact_phone || undefined,
        address: formData.address || undefined,
        status: formData.status,
      });

      console.log('University created:', newUniversity);
      
      toast({
        title: 'Success!',
        description: `${formData.name} has been successfully added to the system`,
      });
      
      // Navigate back to universities list
      setTimeout(() => {
        navigate('/universities');
      }, 500);
      
    } catch (error: any) {
      console.error('Error creating university:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to add university. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
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
            <h1 className="text-3xl font-bold text-foreground">Add University</h1>
            <p className="text-muted-foreground mt-1">Create a new university partner</p>
          </div>
        </div>

        {/* Form Card */}
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>University Information</CardTitle>
            <CardDescription>
              Enter the details for the new university. Fields marked with * are required.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">
                  University Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="e.g., Harvard University"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                />
              </div>

              {/* Code */}
              <div className="space-y-2">
                <Label htmlFor="code">
                  University Code <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="code"
                  placeholder="e.g., HARV"
                  value={formData.code}
                  onChange={(e) => handleInputChange('code', e.target.value.toUpperCase())}
                  required
                  maxLength={10}
                  className="font-mono"
                />
                <p className="text-xs text-muted-foreground">
                  Code will be automatically converted to uppercase (max 10 characters)
                </p>
              </div>

              {/* Website */}
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  type="url"
                  placeholder="https://university.edu"
                  value={formData.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                />
              </div>

              {/* Logo URL */}
              <div className="space-y-2">
                <Label htmlFor="logo_url">Logo URL</Label>
                <Input
                  id="logo_url"
                  type="url"
                  placeholder="https://example.com/logo.png"
                  value={formData.logo_url}
                  onChange={(e) => handleInputChange('logo_url', e.target.value)}
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Brief description of the university..."
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={3}
                />
              </div>

              {/* Contact Email */}
              <div className="space-y-2">
                <Label htmlFor="contact_email">Contact Email</Label>
                <Input
                  id="contact_email"
                  type="email"
                  placeholder="admissions@university.edu"
                  value={formData.contact_email}
                  onChange={(e) => handleInputChange('contact_email', e.target.value)}
                />
              </div>

              {/* Contact Phone */}
              <div className="space-y-2">
                <Label htmlFor="contact_phone">Contact Phone</Label>
                <Input
                  id="contact_phone"
                  type="tel"
                  placeholder="+1 234 567 8900"
                  value={formData.contact_phone}
                  onChange={(e) => handleInputChange('contact_phone', e.target.value)}
                />
              </div>

              {/* Address */}
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  placeholder="University address..."
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  rows={2}
                />
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
                  <SelectTrigger id="status">
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

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/universities')}
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="gradient-primary flex-1"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <Building2 className="w-4 h-4 mr-2" />
                      Add University
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

export default AddUniversity;
