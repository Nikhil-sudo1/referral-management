import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { universities } from '@/data/mockData';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, BookOpen, Clock, DollarSign } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

const AddProgram = () => {
  const navigate = useNavigate();
  const { universityId } = useParams<{ universityId?: string }>();
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    duration: '',
    feeStructure: '',
    commissionRate: '3.0',
    rewardTier: 'gold' as 'bronze' | 'silver' | 'gold' | 'platinum',
    status: 'active' as 'active' | 'inactive',
    universityId: universityId || '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const university = universities.find((u) => u.id === formData.universityId);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Calculate reward amount based on fee and commission
  const calculateReward = () => {
    const fee = parseFloat(formData.feeStructure) || 0;
    const rate = parseFloat(formData.commissionRate) || 0;
    return Math.round(fee * (rate / 100));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name || !formData.code || !formData.duration || !formData.feeStructure || !formData.universityId) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    // Code validation
    const codeRegex = /^[A-Z0-9]+$/;
    if (!codeRegex.test(formData.code.toUpperCase())) {
      toast({
        title: 'Validation Error',
        description: 'Program code must contain only uppercase letters and numbers',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      const rewardAmount = calculateReward();
      toast({
        title: 'Program Added',
        description: `${formData.name} has been added with $${rewardAmount.toLocaleString()} referral reward`,
      });
      
      setIsSubmitting(false);
      
      // Navigate back
      setTimeout(() => {
        if (universityId) {
          navigate(`/universities/${universityId}/programs`);
        } else {
          navigate('/universities');
        }
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
            onClick={() => navigate(universityId ? `/universities/${universityId}/programs` : '/universities')}
            className="hover:bg-muted"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Add Program</h1>
            <p className="text-muted-foreground mt-1">
              {university ? `Add a new program to ${university.name}` : 'Create a new program'}
            </p>
          </div>
        </div>

        {/* Form Card */}
        <Card className="max-w-3xl shadow-2xl border-2">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5 border-b">
            <CardTitle className="text-2xl flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-primary" />
              Program Information
            </CardTitle>
            <CardDescription className="text-base">
              Enter the details for the new program including reward structure
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* University Selection */}
              {!universityId && (
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
                        .map((uni) => (
                          <SelectItem key={uni.id} value={uni.id}>
                            {uni.name} ({uni.code})
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {university && (
                <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                  <p className="text-sm text-muted-foreground">Adding program to:</p>
                  <p className="font-semibold text-lg text-card-foreground">{university.name}</p>
                </div>
              )}

              {/* Program Name */}
              <div className="space-y-2">
                <Label htmlFor="name">
                  Program Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="Master of Business Administration"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                />
              </div>

              {/* Program Code */}
              <div className="space-y-2">
                <Label htmlFor="code">
                  Program Code <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="code"
                  placeholder="MBA"
                  value={formData.code}
                  onChange={(e) => handleInputChange('code', e.target.value.toUpperCase())}
                  required
                  maxLength={10}
                  className="font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Duration */}
                <div className="space-y-2">
                  <Label htmlFor="duration">
                    Duration <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="duration"
                    placeholder="2 years"
                    value={formData.duration}
                    onChange={(e) => handleInputChange('duration', e.target.value)}
                    required
                  />
                </div>

                {/* Fee Structure */}
                <div className="space-y-2">
                  <Label htmlFor="fee">
                    Fee Structure ($) <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="fee"
                    type="number"
                    placeholder="75000"
                    value={formData.feeStructure}
                    onChange={(e) => handleInputChange('feeStructure', e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Commission & Reward */}
              <div className="space-y-4 p-4 rounded-lg bg-gradient-to-br from-success/10 to-emerald-500/10 border-2 border-success/20">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  💰 Referral Reward Structure
                </h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="commission">
                      Commission Rate (%) <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="commission"
                      type="number"
                      step="0.1"
                      min="0"
                      max="10"
                      placeholder="3.0"
                      value={formData.commissionRate}
                      onChange={(e) => handleInputChange('commissionRate', e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tier">
                      Reward Tier <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={formData.rewardTier}
                      onValueChange={(value) => handleInputChange('rewardTier', value)}
                      required
                    >
                      <SelectTrigger id="tier">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="platinum">💎 Platinum (4-5%)</SelectItem>
                        <SelectItem value="gold">🏆 Gold (3-3.5%)</SelectItem>
                        <SelectItem value="silver">🥈 Silver (2-2.5%)</SelectItem>
                        <SelectItem value="bronze">🥉 Bronze (2%)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Calculated Reward */}
                {formData.feeStructure && formData.commissionRate && (
                  <div className="pt-3 border-t border-success/20">
                    <p className="text-sm text-muted-foreground mb-1">Calculated Referral Reward:</p>
                    <p className="text-3xl font-bold text-success">
                      ${calculateReward().toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Per successful admission
                    </p>
                  </div>
                )}
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
              </div>

              {/* Actions */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(universityId ? `/universities/${universityId}/programs` : '/universities')}
                  className="flex-1"
                  size="lg"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="gradient-primary flex-1 text-primary-foreground"
                  disabled={isSubmitting}
                  size="lg"
                >
                  {isSubmitting ? (
                    'Adding Program...'
                  ) : (
                    <>
                      <BookOpen className="w-5 h-5 mr-2" />
                      Add Program
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

export default AddProgram;

