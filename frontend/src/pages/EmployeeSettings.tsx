import { useState, useEffect } from 'react';
import { EmployeeLayout } from '@/components/layout/EmployeeLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion } from 'framer-motion';
import { 
  User, CreditCard, Palette, HelpCircle, MessageSquare, Save, Loader2,
  Mail, Phone, Building2, Sun, Moon, Send, AlertCircle, Shield, Bell
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { authAPI } from '@/lib/api/auth';

const EmployeeSettings = () => {
  const { user, refreshUser } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [requestDialogOpen, setRequestDialogOpen] = useState(false);
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);

  // Profile form
  const [profileData, setProfileData] = useState({
    fullName: '',
    email: '',
    phone: '',
    organization: '',
  });

  // Bank details form
  const [bankData, setBankData] = useState({
    accountHolderName: '',
    bankName: '',
    accountNumber: '',
    ifscCode: '',
  });

  // Request form
  const [requestData, setRequestData] = useState({
    type: '',
    subject: '',
    message: '',
  });

  // Notification settings
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    referralUpdates: true,
    rewardAlerts: true,
    promotionalEmails: false,
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        fullName: user.full_name || '',
        email: user.email || '',
        phone: user.mobile_number || '',
        organization: user.org_id ? `Organization ${user.org_id}` : '',
      });
      setBankData({
        accountHolderName: user.account_holder_name || '',
        bankName: user.bank_name || '',
        accountNumber: user.bank_acc || '',
        ifscCode: user.bank_ifsc || '',
      });
    }
  }, [user]);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    const isDark = document.documentElement.classList.contains('dark');
    setTheme(savedTheme || (isDark ? 'dark' : 'light'));
  }, []);

  const handleThemeChange = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      await authAPI.updateProfile(user?.id || '', {
        full_name: profileData.fullName,
        mobile_number: profileData.phone,
      });
      await refreshUser();
      toast({ title: 'Success', description: 'Profile updated successfully' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update profile', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveBankDetails = async () => {
    if (!bankData.accountHolderName || !bankData.bankName || !bankData.accountNumber || !bankData.ifscCode) {
      toast({ title: 'Validation Error', description: 'All bank details are required', variant: 'destructive' });
      return;
    }

    setIsSaving(true);
    try {
      await authAPI.updateBankDetails(user?.id || '', {
        account_holder_name: bankData.accountHolderName,
        bank_name: bankData.bankName,
        bank_acc: bankData.accountNumber,
        bank_ifsc: bankData.ifscCode,
      });
      await refreshUser();
      toast({ title: 'Success', description: 'Bank details updated successfully' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update bank details', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmitRequest = async () => {
    if (!requestData.type || !requestData.subject || !requestData.message) {
      toast({ title: 'Validation Error', description: 'Please fill all fields', variant: 'destructive' });
      return;
    }

    setIsSubmittingRequest(true);
    try {
      // In a real app, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({ title: 'Success', description: 'Your request has been submitted to the admin' });
      setRequestDialogOpen(false);
      setRequestData({ type: '', subject: '', message: '' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to submit request', variant: 'destructive' });
    } finally {
      setIsSubmittingRequest(false);
    }
  };

  return (
    <EmployeeLayout>
      <div className="space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold text-white mb-2">Settings</h1>
          <p className="text-white/60">Manage your account preferences</p>
        </motion.div>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="bg-white/5 border border-white/10 p-1 flex-wrap h-auto">
            <TabsTrigger value="profile" className="data-[state=active]:bg-amber-500 data-[state=active]:text-white">
              <User className="w-4 h-4 mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="bank" className="data-[state=active]:bg-amber-500 data-[state=active]:text-white">
              <CreditCard className="w-4 h-4 mr-2" />
              Bank Details
            </TabsTrigger>
            <TabsTrigger value="appearance" className="data-[state=active]:bg-amber-500 data-[state=active]:text-white">
              <Palette className="w-4 h-4 mr-2" />
              Appearance
            </TabsTrigger>
            <TabsTrigger value="help" className="data-[state=active]:bg-amber-500 data-[state=active]:text-white">
              <HelpCircle className="w-4 h-4 mr-2" />
              Help
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="mt-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Profile Information</CardTitle>
                  <CardDescription className="text-white/60">Update your personal details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-white/80">Full Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                        <Input
                          value={profileData.fullName}
                          onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                          className="pl-10 bg-white/5 border-white/10 text-white"
                          placeholder="Your full name"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white/80">Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                        <Input
                          value={profileData.email}
                          className="pl-10 bg-white/5 border-white/10 text-white"
                          placeholder="your@email.com"
                          disabled
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white/80">Phone Number</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                        <Input
                          value={profileData.phone}
                          onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                          className="pl-10 bg-white/5 border-white/10 text-white"
                          placeholder="+91 9876543210"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white/80">Organization</Label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                        <Input
                          value={profileData.organization}
                          className="pl-10 bg-white/5 border-white/10 text-white"
                          placeholder="Your organization"
                          disabled
                        />
                      </div>
                    </div>
                  </div>

                  {/* Notification Preferences */}
                  <div className="pt-6 border-t border-white/10">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <Bell className="w-5 h-5 text-amber-500" />
                      Notification Preferences
                    </h3>
                    <div className="space-y-4">
                      {[
                        { key: 'emailNotifications', label: 'Email Notifications', desc: 'Receive updates via email' },
                        { key: 'referralUpdates', label: 'Referral Updates', desc: 'Get notified about referral status changes' },
                        { key: 'rewardAlerts', label: 'Reward Alerts', desc: 'Notifications when you earn rewards' },
                        { key: 'promotionalEmails', label: 'Promotional Emails', desc: 'Receive promotional offers' },
                      ].map((item) => (
                        <div key={item.key} className="flex items-center justify-between py-2">
                          <div>
                            <p className="text-white font-medium">{item.label}</p>
                            <p className="text-white/60 text-sm">{item.desc}</p>
                          </div>
                          <Switch
                            checked={notifications[item.key as keyof typeof notifications]}
                            onCheckedChange={(checked) =>
                              setNotifications({ ...notifications, [item.key]: checked })
                            }
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      onClick={handleSaveProfile}
                      disabled={isSaving}
                      className="bg-amber-500 hover:bg-amber-600"
                    >
                      {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                      Save Changes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Bank Details Tab */}
          <TabsContent value="bank" className="mt-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-amber-500" />
                    Bank Details
                  </CardTitle>
                  <CardDescription className="text-white/60">
                    Your bank details for reward payouts
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-400 mt-0.5" />
                    <div>
                      <p className="text-amber-400 font-medium">Important</p>
                      <p className="text-white/70 text-sm">
                        Please ensure your bank details are correct. Rewards will be transferred to this account.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-white/80">Account Holder Name</Label>
                      <Input
                        value={bankData.accountHolderName}
                        onChange={(e) => setBankData({ ...bankData, accountHolderName: e.target.value })}
                        className="bg-white/5 border-white/10 text-white"
                        placeholder="As per bank records"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white/80">Bank Name</Label>
                      <Input
                        value={bankData.bankName}
                        onChange={(e) => setBankData({ ...bankData, bankName: e.target.value })}
                        className="bg-white/5 border-white/10 text-white"
                        placeholder="e.g., HDFC Bank"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white/80">Account Number</Label>
                      <Input
                        value={bankData.accountNumber}
                        onChange={(e) => setBankData({ ...bankData, accountNumber: e.target.value })}
                        className="bg-white/5 border-white/10 text-white"
                        placeholder="Your account number"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white/80">IFSC Code</Label>
                      <Input
                        value={bankData.ifscCode}
                        onChange={(e) => setBankData({ ...bankData, ifscCode: e.target.value.toUpperCase() })}
                        className="bg-white/5 border-white/10 text-white uppercase"
                        placeholder="e.g., HDFC0001234"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      onClick={handleSaveBankDetails}
                      disabled={isSaving}
                      className="bg-amber-500 hover:bg-amber-600"
                    >
                      {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                      Save Bank Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Appearance Tab */}
          <TabsContent value="appearance" className="mt-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Appearance</CardTitle>
                  <CardDescription className="text-white/60">Customize how the app looks</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                    <div className="flex items-center gap-4">
                      {theme === 'dark' ? (
                        <Moon className="w-6 h-6 text-white/60" />
                      ) : (
                        <Sun className="w-6 h-6 text-amber-500" />
                      )}
                      <div>
                        <p className="text-white font-medium">Dark Mode</p>
                        <p className="text-white/60 text-sm">Use dark theme for the interface</p>
                      </div>
                    </div>
                    <Switch checked={theme === 'dark'} onCheckedChange={handleThemeChange} />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Help Tab */}
          <TabsContent value="help" className="mt-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Need Help?</CardTitle>
                  <CardDescription className="text-white/60">Get support or send a request to admin</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button
                    variant="outline"
                    className="w-full justify-start border-white/10 text-white hover:bg-white/5"
                    onClick={() => setRequestDialogOpen(true)}
                  >
                    <MessageSquare className="w-5 h-5 mr-3 text-amber-500" />
                    Send Request to Admin
                  </Button>
                  <Button variant="outline" className="w-full justify-start border-white/10 text-white hover:bg-white/5">
                    <HelpCircle className="w-5 h-5 mr-3 text-amber-500" />
                    FAQs & Help Center
                  </Button>
                  <Button variant="outline" className="w-full justify-start border-white/10 text-white hover:bg-white/5">
                    <Mail className="w-5 h-5 mr-3 text-amber-500" />
                    Contact Support
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-white/5 border-white/10">
                <CardContent className="p-6 text-center">
                  <p className="text-white/60 text-sm">Having trouble? Email us at</p>
                  <a href="mailto:support@teamleaseedtech.com" className="text-amber-500 hover:underline">
                    support@teamleaseedtech.com
                  </a>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>

        {/* Request to Admin Dialog */}
        <Dialog open={requestDialogOpen} onOpenChange={setRequestDialogOpen}>
          <DialogContent className="bg-[#1a1a2e] border-white/10 text-white">
            <DialogHeader>
              <DialogTitle>Send Request to Admin</DialogTitle>
              <DialogDescription className="text-white/60">
                Submit a request or report an issue
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Request Type</Label>
                <Select value={requestData.type} onValueChange={(v) => setRequestData({ ...requestData, type: v })}>
                  <SelectTrigger className="bg-white/5 border-white/10">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="payout">Payout Issue</SelectItem>
                    <SelectItem value="referral">Referral Issue</SelectItem>
                    <SelectItem value="account">Account Issue</SelectItem>
                    <SelectItem value="technical">Technical Issue</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Subject</Label>
                <Input
                  value={requestData.subject}
                  onChange={(e) => setRequestData({ ...requestData, subject: e.target.value })}
                  className="bg-white/5 border-white/10"
                  placeholder="Brief subject"
                />
              </div>
              <div className="space-y-2">
                <Label>Message</Label>
                <Textarea
                  value={requestData.message}
                  onChange={(e) => setRequestData({ ...requestData, message: e.target.value })}
                  className="bg-white/5 border-white/10 min-h-[100px]"
                  placeholder="Describe your request in detail..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setRequestDialogOpen(false)} className="border-white/10">
                Cancel
              </Button>
              <Button
                onClick={handleSubmitRequest}
                disabled={isSubmittingRequest}
                className="bg-amber-500 hover:bg-amber-600"
              >
                {isSubmittingRequest ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Send className="w-4 h-4 mr-2" />
                )}
                Submit Request
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </EmployeeLayout>
  );
};

export default EmployeeSettings;

