import { useState, useEffect } from 'react';
import { ReferrerLayout } from '@/components/layout/ReferrerLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { 
  User, Mail, Phone, Building2, CreditCard, Bell, Moon, Sun,
  Shield, HelpCircle, MessageSquare, Save, Loader2, CheckCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

const ReferrerSettings = () => {
  const { user } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  const [profileData, setProfileData] = useState({
    fullName: '',
    email: '',
    phone: '',
    organization: '',
  });

  const [bankData, setBankData] = useState({
    accountNumber: '',
    ifscCode: '',
    bankName: '',
    accountHolderName: '',
  });

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    smsNotifications: true,
    referralUpdates: true,
    payoutAlerts: true,
    promotionalEmails: false,
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        fullName: user.full_name || '',
        email: user.email || '',
        phone: user.mobile_number || '',
        organization: '',
      });
      setBankData({
        accountNumber: user.bank_acc || '',
        ifscCode: user.bank_ifsc || '',
        bankName: user.bank_name || '',
        accountHolderName: user.account_holder_name || '',
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
      const { authAPI } = await import('@/lib/api');
      await authAPI.updateProfile({
        full_name: profileData.fullName,
        mobile_number: profileData.phone,
      });
      
      toast({ title: 'Success', description: 'Profile updated successfully' });
      
      // Refresh user data
      const { useAuth } = await import('@/contexts/AuthContext');
      // User data will be refreshed on next page load
    } catch (error: any) {
      console.error('Error updating profile:', error);
      const errorMessage = error?.response?.data?.detail || 
                          error?.response?.data?.message || 
                          'Failed to update profile. Please try again.';
      toast({ 
        title: 'Error', 
        description: errorMessage, 
        variant: 'destructive' 
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveBank = async () => {
    // Validate required fields
    if (!bankData.accountHolderName || !bankData.bankName || !bankData.accountNumber || !bankData.ifscCode) {
      toast({ 
        title: 'Validation Error', 
        description: 'Please fill in all bank details', 
        variant: 'destructive' 
      });
      return;
    }

    setIsSaving(true);
    try {
      const { authAPI } = await import('@/lib/api');
      await authAPI.updateBankDetails({
        account_holder_name: bankData.accountHolderName,
        bank_name: bankData.bankName,
        account_number: bankData.accountNumber,
        ifsc_code: bankData.ifscCode,
      });
      
      toast({ 
        title: 'Success', 
        description: 'Bank details updated successfully' 
      });
      
      // Refresh user data
      const { useAuth } = await import('@/contexts/AuthContext');
      // User data will be refreshed on next page load
    } catch (error: any) {
      console.error('Error updating bank details:', error);
      const errorMessage = error?.response?.data?.detail || 
                          error?.response?.data?.message || 
                          'Failed to update bank details. Please try again.';
      toast({ 
        title: 'Error', 
        description: errorMessage, 
        variant: 'destructive' 
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ReferrerLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white">Settings</h1>
          <p className="text-white/60 mt-1">Manage your account preferences</p>
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="bg-white/5 border border-white/10 p-1">
            <TabsTrigger value="profile" className="data-[state=active]:bg-primary data-[state=active]:text-white">
              <User className="w-4 h-4 mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="bank" className="data-[state=active]:bg-primary data-[state=active]:text-white">
              <CreditCard className="w-4 h-4 mr-2" />
              Bank Details
            </TabsTrigger>
            <TabsTrigger value="notifications" className="data-[state=active]:bg-primary data-[state=active]:text-white">
              <Bell className="w-4 h-4 mr-2" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="help" className="data-[state=active]:bg-primary data-[state=active]:text-white">
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
                  <CardDescription className="text-white/60">
                    Update your personal details
                  </CardDescription>
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
                          onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
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
                      <Label className="text-white/80">Organization (Optional)</Label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                        <Input
                          value={profileData.organization}
                          onChange={(e) => setProfileData({ ...profileData, organization: e.target.value })}
                          className="pl-10 bg-white/5 border-white/10 text-white"
                          placeholder="Your organization"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button 
                      onClick={handleSaveProfile}
                      disabled={isSaving}
                      className="bg-primary hover:bg-primary/90"
                    >
                      {isSaving ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4 mr-2" />
                      )}
                      Save Changes
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Theme Settings */}
              <Card className="bg-white/5 border-white/10 mt-6">
                <CardHeader>
                  <CardTitle className="text-white">Appearance</CardTitle>
                  <CardDescription className="text-white/60">
                    Customize how the app looks
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {theme === 'dark' ? (
                        <Moon className="w-5 h-5 text-white/60" />
                      ) : (
                        <Sun className="w-5 h-5 text-white/60" />
                      )}
                      <div>
                        <p className="text-white font-medium">Dark Mode</p>
                        <p className="text-white/60 text-sm">Use dark theme for the interface</p>
                      </div>
                    </div>
                    <Switch
                      checked={theme === 'dark'}
                      onCheckedChange={handleThemeChange}
                    />
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
                    <CreditCard className="w-5 h-5 text-primary" />
                    Bank Account Details
                  </CardTitle>
                  <CardDescription className="text-white/60">
                    Add your bank details to receive reward payouts
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-white/80">Account Holder Name</Label>
                      <Input
                        value={bankData.accountHolderName}
                        onChange={(e) => setBankData({ ...bankData, accountHolderName: e.target.value })}
                        className="bg-white/5 border-white/10 text-white"
                        placeholder="Name as per bank records"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-white/80">Bank Name</Label>
                      <Input
                        value={bankData.bankName}
                        onChange={(e) => setBankData({ ...bankData, bankName: e.target.value })}
                        className="bg-white/5 border-white/10 text-white"
                        placeholder="e.g., State Bank of India"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-white/80">Account Number</Label>
                      <Input
                        value={bankData.accountNumber}
                        onChange={(e) => setBankData({ ...bankData, accountNumber: e.target.value })}
                        className="bg-white/5 border-white/10 text-white"
                        placeholder="Your account number"
                        type="password"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-white/80">IFSC Code</Label>
                      <Input
                        value={bankData.ifscCode}
                        onChange={(e) => setBankData({ ...bankData, ifscCode: e.target.value.toUpperCase() })}
                        className="bg-white/5 border-white/10 text-white"
                        placeholder="e.g., SBIN0001234"
                      />
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-primary/10 border border-primary/30">
                    <div className="flex items-start gap-3">
                      <Shield className="w-5 h-5 text-primary mt-0.5" />
                      <div>
                        <p className="text-white font-medium">Your data is secure</p>
                        <p className="text-white/60 text-sm">
                          Bank details are encrypted and only used for reward payouts.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button 
                      onClick={handleSaveBank}
                      disabled={isSaving}
                      className="bg-primary hover:bg-primary/90"
                    >
                      {isSaving ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4 mr-2" />
                      )}
                      Save Bank Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="mt-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Notification Preferences</CardTitle>
                  <CardDescription className="text-white/60">
                    Choose what notifications you want to receive
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {[
                    { key: 'emailNotifications', label: 'Email Notifications', desc: 'Receive updates via email' },
                    { key: 'smsNotifications', label: 'SMS Notifications', desc: 'Receive updates via SMS' },
                    { key: 'referralUpdates', label: 'Referral Updates', desc: 'Get notified about referral status changes' },
                    { key: 'payoutAlerts', label: 'Payout Alerts', desc: 'Get notified when rewards are processed' },
                    { key: 'promotionalEmails', label: 'Promotional Emails', desc: 'Receive promotional offers and tips' },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
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
                  <CardDescription className="text-white/60">
                    Get support or send a request to admin
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button variant="outline" className="w-full justify-start border-white/10 text-white hover:bg-white/5">
                    <HelpCircle className="w-5 h-5 mr-3 text-primary" />
                    FAQs & Help Center
                  </Button>
                  <Button variant="outline" className="w-full justify-start border-white/10 text-white hover:bg-white/5">
                    <MessageSquare className="w-5 h-5 mr-3 text-primary" />
                    Contact Support
                  </Button>
                  <Button variant="outline" className="w-full justify-start border-white/10 text-white hover:bg-white/5">
                    <Mail className="w-5 h-5 mr-3 text-primary" />
                    Request to Admin
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-white/5 border-white/10">
                <CardContent className="p-6">
                  <div className="text-center">
                    <p className="text-white/60 text-sm">
                      Having trouble? Email us at
                    </p>
                    <a href="mailto:support@teamleaseedtech.com" className="text-primary hover:underline">
                      support@teamleaseedtech.com
                    </a>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </ReferrerLayout>
  );
};

export default ReferrerSettings;

