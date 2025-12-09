import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Building2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const AddUniversity = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    logoUrl: '',
    status: 'active' as 'active' | 'inactive',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      // In a real app, you would make an API call here
      // For now, we'll just show a success message
      toast({
        title: 'University Added',
        description: `${formData.name} has been successfully added`,
      });
      
      // Reset form
      setFormData({
        name: '',
        code: '',
        logoUrl: '',
        status: 'active',
      });
      
      setIsSubmitting(false);
      
      // Navigate back to universities page after a short delay
      setTimeout(() => {
        navigate('/universities');
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
              Enter the details for the new university. Name and code are required.
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
                  placeholder="Massachusetts Institute of Technology"
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
                  placeholder="MIT"
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
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="gradient-primary flex-1"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    'Adding...'
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

