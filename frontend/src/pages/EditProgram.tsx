import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, BookOpen, Loader2, Trash2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { programsAPI, universitiesAPI } from '@/lib/api';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const EditProgram = () => {
  const navigate = useNavigate();
  const { universityId, programId } = useParams<{ universityId?: string; programId?: string }>();
  const [university, setUniversity] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    duration: '',
    fee_structure: '',
    commission_rate: '',
    reward_amount: '',
    reward_tier: 'gold' as 'bronze' | 'silver' | 'gold' | 'platinum',
    eligibility_criteria: '',
    status: 'active' as 'active' | 'inactive',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (programId && universityId) {
      fetchData();
    }
  }, [programId, universityId]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [programData, universityData] = await Promise.all([
        programsAPI.getProgram(programId!),
        universitiesAPI.getUniversity(universityId!)
      ]);

      console.log('Program data loaded:', programData);
      
      setUniversity(universityData);
      setFormData({
        name: programData.name || '',
        code: programData.code || '',
        description: programData.description || '',
        duration: programData.duration || '',
        fee_structure: programData.fee_structure?.toString() || '',
        commission_rate: programData.commission_rate?.toString() || '',
        reward_amount: programData.reward_amount?.toString() || '',
        reward_tier: programData.reward_tier || 'gold',
        eligibility_criteria: programData.eligibility_criteria || '',
        status: programData.status || 'active',
      });
    } catch (error: any) {
      console.error('Error fetching program:', error);
      toast({
        title: 'Error',
        description: 'Failed to load program details',
        variant: 'destructive',
      });
      navigate(`/universities/${universityId}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => {
      const updated = {
        ...prev,
        [field]: value,
      };
      
      // Auto-calculate reward amount when fee or commission changes
      if (field === 'fee_structure' || field === 'commission_rate') {
        const fee = parseFloat(field === 'fee_structure' ? value : updated.fee_structure) || 0;
        const rate = parseFloat(field === 'commission_rate' ? value : updated.commission_rate) || 0;
        updated.reward_amount = Math.round(fee * (rate / 100)).toString();
      }
      
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Form submitted with data:', formData);
    
    // Validation
    if (!formData.name || !formData.code || !formData.fee_structure) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    const fee = parseFloat(formData.fee_structure);
    if (isNaN(fee) || fee <= 0) {
      toast({
        title: 'Validation Error',
        description: 'Please enter a valid fee amount',
        variant: 'destructive',
      });
      return;
    }

    const commissionRate = parseFloat(formData.commission_rate);
    if (isNaN(commissionRate) || commissionRate < 0 || commissionRate > 100) {
      toast({
        title: 'Validation Error',
        description: 'Commission rate must be between 0 and 100',
        variant: 'destructive',
      });
      return;
    }

    const rewardAmount = parseFloat(formData.reward_amount);
    if (isNaN(rewardAmount) || rewardAmount < 0) {
      toast({
        title: 'Validation Error',
        description: 'Please enter a valid reward amount',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('Calling API to update program...');
      
      // Call backend API to update program
      const updatedProgram = await programsAPI.updateProgram(programId!, {
        name: formData.name,
        description: formData.description || undefined,
        duration: formData.duration || undefined,
        fee_structure: fee,
        commission_rate: commissionRate,
        reward_amount: rewardAmount,
        reward_tier: formData.reward_tier,
        eligibility_criteria: formData.eligibility_criteria || undefined,
        status: formData.status,
      });

      console.log('Program updated:', updatedProgram);
      
      toast({
        title: 'Success!',
        description: `${formData.name} has been updated successfully`,
      });
      
      // Navigate back to university details
      setTimeout(() => {
        navigate(`/universities/${universityId}`);
      }, 500);
      
    } catch (error: any) {
      console.error('Error updating program:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update program. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await programsAPI.deleteProgram(programId!);
      toast({
        title: 'Success!',
        description: 'Program has been deleted',
      });
      navigate(`/universities/${universityId}`);
    } catch (error: any) {
      console.error('Error deleting program:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to delete program. It may have associated referrals.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading program details...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(`/universities/${universityId}`)}
              className="hover:bg-muted"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Edit Program</h1>
              <p className="text-muted-foreground mt-1">
                {university ? `Update program for ${university.name}` : 'Update program details'}
              </p>
            </div>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" disabled={isDeleting}>
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Program
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete the program "{formData.name}". This action cannot be undone.
                  {' '}Programs with existing referrals cannot be deleted.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        {/* Form Card */}
        <Card className="max-w-3xl">
          <CardHeader>
            <CardTitle>Program Information</CardTitle>
            <CardDescription>
              Update the program details. Fields marked with * are required.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Program Name */}
              <div className="space-y-2">
                <Label htmlFor="name">
                  Program Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="e.g., Master of Business Administration"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                />
              </div>

              {/* Program Code (Read-only) */}
              <div className="space-y-2">
                <Label htmlFor="code">
                  Program Code <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="code"
                  value={formData.code}
                  disabled
                  className="font-mono bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  Program code cannot be changed after creation
                </p>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Brief description of the program..."
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Duration */}
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration</Label>
                  <Input
                    id="duration"
                    placeholder="e.g., 2 years, 24 months"
                    value={formData.duration}
                    onChange={(e) => handleInputChange('duration', e.target.value)}
                  />
                </div>

                {/* Fee Structure */}
                <div className="space-y-2">
                  <Label htmlFor="fee_structure">
                    Fee Structure (₹) <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="fee_structure"
                    type="number"
                    placeholder="e.g., 500000"
                    value={formData.fee_structure}
                    onChange={(e) => handleInputChange('fee_structure', e.target.value)}
                    required
                    min="0"
                    step="1000"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Commission Rate */}
                <div className="space-y-2">
                  <Label htmlFor="commission_rate">
                    Commission Rate (%) <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="commission_rate"
                    type="number"
                    placeholder="e.g., 3.0"
                    value={formData.commission_rate}
                    onChange={(e) => handleInputChange('commission_rate', e.target.value)}
                    required
                    min="0"
                    max="100"
                    step="0.1"
                  />
                </div>

                {/* Reward Amount (Auto-calculated) */}
                <div className="space-y-2">
                  <Label htmlFor="reward_amount">
                    Reward Amount (₹) <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="reward_amount"
                    type="number"
                    placeholder="Auto-calculated"
                    value={formData.reward_amount}
                    onChange={(e) => handleInputChange('reward_amount', e.target.value)}
                    required
                    min="0"
                    step="100"
                  />
                  <p className="text-xs text-muted-foreground">
                    Auto-calculated from fee × commission
                  </p>
                </div>

                {/* Reward Tier */}
                <div className="space-y-2">
                  <Label htmlFor="reward_tier">Reward Tier</Label>
                  <Select
                    value={formData.reward_tier}
                    onValueChange={(value) => handleInputChange('reward_tier', value)}
                  >
                    <SelectTrigger id="reward_tier">
                      <SelectValue placeholder="Select tier" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bronze">
                        <Badge variant="outline" className="bg-orange-500/10 text-orange-600 border-orange-300">Bronze</Badge>
                      </SelectItem>
                      <SelectItem value="silver">
                        <Badge variant="outline" className="bg-gray-500/10 text-gray-600 border-gray-300">Silver</Badge>
                      </SelectItem>
                      <SelectItem value="gold">
                        <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-300">Gold</Badge>
                      </SelectItem>
                      <SelectItem value="platinum">
                        <Badge variant="outline" className="bg-purple-500/10 text-purple-600 border-purple-300">Platinum</Badge>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Eligibility Criteria */}
              <div className="space-y-2">
                <Label htmlFor="eligibility_criteria">Eligibility Criteria</Label>
                <Textarea
                  id="eligibility_criteria"
                  placeholder="e.g., Bachelor's degree with 60% marks, Valid GMAT/CAT score..."
                  value={formData.eligibility_criteria}
                  onChange={(e) => handleInputChange('eligibility_criteria', e.target.value)}
                  rows={3}
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
                  Active programs will be available for referrals
                </p>
              </div>

              {/* Preview */}
              {formData.fee_structure && formData.commission_rate && (
                <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                  <h3 className="font-semibold mb-2">Preview</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Total Fee:</p>
                      <p className="font-semibold">₹{parseFloat(formData.fee_structure).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Commission:</p>
                      <p className="font-semibold">{formData.commission_rate}%</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Referral Reward:</p>
                      <p className="font-semibold text-success">₹{(formData.reward_amount || 0).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Reward Tier:</p>
                      <Badge variant="outline" className={
                        formData.reward_tier === 'platinum' ? 'bg-purple-500/10 text-purple-600' :
                        formData.reward_tier === 'gold' ? 'bg-yellow-500/10 text-yellow-600' :
                        formData.reward_tier === 'silver' ? 'bg-gray-500/10 text-gray-600' :
                        'bg-orange-500/10 text-orange-600'
                      }>
                        {formData.reward_tier}
                      </Badge>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(`/universities/${universityId}`)}
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
                      Updating...
                    </>
                  ) : (
                    <>
                      <BookOpen className="w-4 h-4 mr-2" />
                      Update Program
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

export default EditProgram;

