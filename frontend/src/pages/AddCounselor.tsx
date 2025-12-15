import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, UserPlus } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { universitiesAPI, usersAPI } from '@/lib/api';

const AddCounselor = () => {
  const navigate = useNavigate();
  const [universities, setUniversities] = useState<any[]>([]);
  const [isLoadingUniversities, setIsLoadingUniversities] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    universityId: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name || !formData.email || !formData.phone || !formData.universityId) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        title: 'Validation Error',
        description: 'Please enter a valid email address',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Create counselor user via API
      await usersAPI.createUser({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        role: 'counselor',
        university_id: formData.universityId,
        password: 'password123', // Default password - user should change it
      });
      
      toast({
        title: 'Counselor Added',
        description: `${formData.name} has been successfully added as a counselor`,
      });
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        universityId: '',
      });
      
      // Navigate back to referees page after a short delay
      setTimeout(() => {
        navigate('/referees');
      }, 1500);
    } catch (error) {
      console.error('Error adding counselor:', error);
      toast({
        title: 'Error',
        description: 'Failed to add counselor. Please try again.',
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
            onClick={() => navigate('/referees')}
            className="hover:bg-muted"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Add Counselor</h1>
            <p className="text-muted-foreground mt-1">Create a new counselor account</p>
          </div>
        </div>

        {/* Form Card */}
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>Counselor Information</CardTitle>
            <CardDescription>
              Enter the details for the new counselor. All fields are required.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">
                  Full Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">
                  Email Address <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john.doe@example.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required
                />
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone">
                  Phone Number <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1 234 567 8900"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  required
                />
              </div>

              {/* University */}
              <div className="space-y-2">
                <Label htmlFor="university">
                  Assigned University <span className="text-destructive">*</span>
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

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/referees')}
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
                      <UserPlus className="w-4 h-4 mr-2" />
                      Add Counselor
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

export default AddCounselor;

