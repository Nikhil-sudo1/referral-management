import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HRAdminLayout } from '@/components/layout/HRAdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  User, Lock, Bell, Palette, HelpCircle, Mail, Phone, Building2, Save, Shield
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { authAPI } from '@/lib/api';

const HRAdminSettings = () => {
  const { user, refreshUser } = useAuth();
  const [saving, setSaving] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  
  // Profile form
  const [profileForm, setProfileForm] = useState({
    full_name: '',
    mobile_number: '',
  });

  // Notification settings
  const [notifications, setNotifications] = useState({
    email_new_referral: true,
    email_hire_success: true,
    email_weekly_report: true,
    push_notifications: false,
  });

  useEffect(() => {
    if (user) {
      setProfileForm({
        full_name: user.full_name || '',
        mobile_number: user.mobile_number || '',
      });
    }
    // Get theme
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    setTheme(savedTheme || 'dark');
  }, [user]);

  const handleSaveProfile = async () => {
    if (!profileForm.full_name) {
      toast({ title: 'Error', description: 'Name is required', variant: 'destructive' });
      return;
    }

    setSaving(true);
    try {
      await authAPI.updateProfile(profileForm);
      await refreshUser();
      toast({ title: 'Success', description: 'Profile updated successfully' });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({ title: 'Error', description: 'Failed to update profile', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleThemeChange = (newTheme: 'light' | 'dark') => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
    toast({ title: 'Theme Updated', description: `Switched to ${newTheme} mode` });
  };

  return (
    <HRAdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <motion.h1 
            className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Settings
          </motion.h1>
          <p className="text-white/60 mt-1">
            Manage your profile and preferences
          </p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="bg-white/5 border border-white/10">
            <TabsTrigger value="profile" className="data-[state=active]:bg-blue-500/20">
              <User className="w-4 h-4 mr-2" /> Profile
            </TabsTrigger>
            <TabsTrigger value="appearance" className="data-[state=active]:bg-blue-500/20">
              <Palette className="w-4 h-4 mr-2" /> Appearance
            </TabsTrigger>
            <TabsTrigger value="notifications" className="data-[state=active]:bg-blue-500/20">
              <Bell className="w-4 h-4 mr-2" /> Notifications
            </TabsTrigger>
            <TabsTrigger value="help" className="data-[state=active]:bg-blue-500/20">
              <HelpCircle className="w-4 h-4 mr-2" /> Help
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <User className="w-5 h-5 text-blue-400" />
                    Profile Information
                  </CardTitle>
                  <CardDescription className="text-white/60">
                    Update your personal information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-white/70">Full Name</Label>
                      <Input
                        value={profileForm.full_name}
                        onChange={(e) => setProfileForm({ ...profileForm, full_name: e.target.value })}
                        className="bg-white/5 border-white/10 text-white"
                        placeholder="Your full name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white/70">Email</Label>
                      <Input
                        value={user?.email || ''}
                        disabled
                        className="bg-white/5 border-white/10 text-white/50"
                      />
                      <p className="text-xs text-white/40">Email cannot be changed</p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white/70">Phone Number</Label>
                      <Input
                        value={profileForm.mobile_number}
                        onChange={(e) => setProfileForm({ ...profileForm, mobile_number: e.target.value })}
                        className="bg-white/5 border-white/10 text-white"
                        placeholder="+91 9876543210"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white/70">Role</Label>
                      <Input
                        value={user?.role_name || 'HR Admin'}
                        disabled
                        className="bg-white/5 border-white/10 text-white/50"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <Button 
                      onClick={handleSaveProfile} 
                      disabled={saving}
                      className="bg-gradient-to-r from-blue-500 to-indigo-500"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Security Card */}
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Lock className="w-5 h-5 text-blue-400" />
                    Security
                  </CardTitle>
                  <CardDescription className="text-white/60">
                    Manage your account security
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                    <div>
                      <p className="text-white font-medium">Password</p>
                      <p className="text-white/50 text-sm">Last changed: Never</p>
                    </div>
                    <Button variant="outline" className="border-white/20 hover:bg-white/10">
                      Change Password
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Appearance Tab */}
          <TabsContent value="appearance">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Palette className="w-5 h-5 text-blue-400" />
                    Theme
                  </CardTitle>
                  <CardDescription className="text-white/60">
                    Choose your preferred theme
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div
                      onClick={() => handleThemeChange('light')}
                      className={`p-6 rounded-xl border-2 cursor-pointer transition-all ${
                        theme === 'light' 
                          ? 'border-blue-500 bg-white/10' 
                          : 'border-white/10 hover:border-white/30'
                      }`}
                    >
                      <div className="w-full h-24 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 mb-4 flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-blue-500"></div>
                      </div>
                      <p className="text-white font-medium text-center">Light Mode</p>
                    </div>
                    <div
                      onClick={() => handleThemeChange('dark')}
                      className={`p-6 rounded-xl border-2 cursor-pointer transition-all ${
                        theme === 'dark' 
                          ? 'border-blue-500 bg-white/10' 
                          : 'border-white/10 hover:border-white/30'
                      }`}
                    >
                      <div className="w-full h-24 rounded-lg bg-gradient-to-br from-gray-800 to-gray-900 mb-4 flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-blue-500"></div>
                      </div>
                      <p className="text-white font-medium text-center">Dark Mode</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Bell className="w-5 h-5 text-blue-400" />
                    Notification Preferences
                  </CardTitle>
                  <CardDescription className="text-white/60">
                    Choose what notifications you receive
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { key: 'email_new_referral', label: 'New Referral', description: 'Get notified when a new referral is submitted' },
                    { key: 'email_hire_success', label: 'Successful Hire', description: 'Get notified when a referral results in a hire' },
                    { key: 'email_weekly_report', label: 'Weekly Report', description: 'Receive a weekly summary of referral activity' },
                    { key: 'push_notifications', label: 'Push Notifications', description: 'Enable browser push notifications' },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                      <div>
                        <p className="text-white font-medium">{item.label}</p>
                        <p className="text-white/50 text-sm">{item.description}</p>
                      </div>
                      <Switch
                        checked={notifications[item.key as keyof typeof notifications]}
                        onCheckedChange={(checked) => {
                          setNotifications({ ...notifications, [item.key]: checked });
                          toast({ 
                            title: checked ? 'Enabled' : 'Disabled', 
                            description: `${item.label} notifications ${checked ? 'enabled' : 'disabled'}` 
                          });
                        }}
                        className="data-[state=checked]:bg-blue-500"
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Help Tab */}
          <TabsContent value="help">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <HelpCircle className="w-5 h-5 text-blue-400" />
                    Help & Support
                  </CardTitle>
                  <CardDescription className="text-white/60">
                    Get help with the HR Admin portal
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-500/20 rounded-lg">
                          <Mail className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                          <p className="text-white font-medium">Email Support</p>
                          <p className="text-white/50 text-sm">hr-support@teamlease.com</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-500/20 rounded-lg">
                          <Phone className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                          <p className="text-white font-medium">Phone Support</p>
                          <p className="text-white/50 text-sm">+91 1800-xxx-xxxx</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <h3 className="text-white font-medium mb-4">Frequently Asked Questions</h3>
                    <div className="space-y-3">
                      {[
                        { q: 'How do I post a new job?', a: 'Click the "Post New Job" button on the dashboard to create a new job listing.' },
                        { q: 'How do employees get notified?', a: 'When you post a job, all active employees in your organization receive an email notification.' },
                        { q: 'How do I deactivate a referrer?', a: 'Go to Operations page and toggle the status switch for the referrer you want to deactivate.' },
                        { q: 'How are rewards calculated?', a: 'Rewards are based on the reward slab system. Higher referral counts unlock better reward tiers.' },
                      ].map((faq, index) => (
                        <div key={index} className="p-4 bg-white/5 rounded-lg">
                          <p className="text-white font-medium">{faq.q}</p>
                          <p className="text-white/60 text-sm mt-1">{faq.a}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </HRAdminLayout>
  );
};

export default HRAdminSettings;

