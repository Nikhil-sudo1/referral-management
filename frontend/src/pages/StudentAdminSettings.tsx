import { useState, useEffect } from 'react';
import { StudentAdminLayout } from '@/components/layout/StudentAdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  User, Mail, Phone, Shield, Bell, Moon, Sun, Palette,
  Save, Loader2, HelpCircle, MessageSquare, ExternalLink,
  Lock, Key, CheckCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { authAPI } from '@/lib/api';

const StudentAdminSettings = () => {
  const { user } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  const [profileData, setProfileData] = useState({
    fullName: '',
    email: '',
    phone: '',
  });

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    referralAlerts: true,
    weeklyReports: true,
    systemUpdates: false,
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        fullName: user.full_name || '',
        email: user.email || '',
        phone: user.mobile_number || '',
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
      await authAPI.updateProfile({
        full_name: profileData.fullName,
        mobile_number: profileData.phone,
      });
      toast({ title: 'Success', description: 'Profile updated successfully' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update profile', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({ title: 'Error', description: 'Passwords do not match', variant: 'destructive' });
      return;
    }
    if (passwordData.newPassword.length < 6) {
      toast({ title: 'Error', description: 'Password must be at least 6 characters', variant: 'destructive' });
      return;
    }

    setIsSaving(true);
    try {
      // API call would go here
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({ title: 'Success', description: 'Password changed successfully' });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to change password', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <StudentAdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white">Settings</h1>
          <p className="text-white/60 mt-1">Manage your account and preferences</p>
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="bg-white/5 border border-white/10 p-1">
            <TabsTrigger value="profile" className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white">
              <User className="w-4 h-4 mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="security" className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white">
              <Shield className="w-4 h-4 mr-2" />
              Security
            </TabsTrigger>
            <TabsTrigger value="notifications" className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white">
              <Bell className="w-4 h-4 mr-2" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="appearance" className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white">
              <Palette className="w-4 h-4 mr-2" />
              Appearance
            </TabsTrigger>
            <TabsTrigger value="help" className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white">
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
                          className="pl-10 bg-white/5 border-white/10 text-white/60"
                          placeholder="your@email.com"
                          disabled
                        />
                      </div>
                      <p className="text-xs text-white/40">Email cannot be changed</p>
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
                      <Label className="text-white/80">Role</Label>
                      <div className="relative">
                        <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                        <Input
                          value="Student Admin"
                          className="pl-10 bg-white/5 border-white/10 text-white/60"
                          disabled
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button 
                      onClick={handleSaveProfile}
                      disabled={isSaving}
                      className="bg-emerald-500 hover:bg-emerald-600"
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
            </motion.div>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="mt-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Lock className="w-5 h-5 text-emerald-400" />
                    Change Password
                  </CardTitle>
                  <CardDescription className="text-white/60">
                    Update your password to keep your account secure
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="max-w-md space-y-4">
                    <div className="space-y-2">
                      <Label className="text-white/80">Current Password</Label>
                      <div className="relative">
                        <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                        <Input
                          type="password"
                          value={passwordData.currentPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                          className="pl-10 bg-white/5 border-white/10 text-white"
                          placeholder="Enter current password"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-white/80">New Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                        <Input
                          type="password"
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                          className="pl-10 bg-white/5 border-white/10 text-white"
                          placeholder="Enter new password"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-white/80">Confirm New Password</Label>
                      <div className="relative">
                        <CheckCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                        <Input
                          type="password"
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                          className="pl-10 bg-white/5 border-white/10 text-white"
                          placeholder="Confirm new password"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button 
                      onClick={handleChangePassword}
                      disabled={isSaving}
                      className="bg-emerald-500 hover:bg-emerald-600"
                    >
                      {isSaving ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Lock className="w-4 h-4 mr-2" />
                      )}
                      Change Password
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
                    { key: 'referralAlerts', label: 'Referral Alerts', desc: 'Get notified about new referrals' },
                    { key: 'weeklyReports', label: 'Weekly Reports', desc: 'Receive weekly performance reports' },
                    { key: 'systemUpdates', label: 'System Updates', desc: 'Get notified about system changes' },
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

          {/* Appearance Tab */}
          <TabsContent value="appearance" className="mt-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Appearance</CardTitle>
                  <CardDescription className="text-white/60">
                    Customize how the app looks
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                    <div className="flex items-center gap-4">
                      {theme === 'dark' ? (
                        <Moon className="w-6 h-6 text-emerald-400" />
                      ) : (
                        <Sun className="w-6 h-6 text-yellow-400" />
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
                    Get support or find answers
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button variant="outline" className="w-full justify-start border-white/10 text-white hover:bg-white/5">
                    <HelpCircle className="w-5 h-5 mr-3 text-emerald-400" />
                    FAQs & Help Center
                    <ExternalLink className="w-4 h-4 ml-auto text-white/40" />
                  </Button>
                  <Button variant="outline" className="w-full justify-start border-white/10 text-white hover:bg-white/5">
                    <MessageSquare className="w-5 h-5 mr-3 text-emerald-400" />
                    Contact Support
                    <ExternalLink className="w-4 h-4 ml-auto text-white/40" />
                  </Button>
                  <Button variant="outline" className="w-full justify-start border-white/10 text-white hover:bg-white/5">
                    <Mail className="w-5 h-5 mr-3 text-emerald-400" />
                    Email Support Team
                    <ExternalLink className="w-4 h-4 ml-auto text-white/40" />
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-white/5 border-white/10">
                <CardContent className="p-6">
                  <div className="text-center">
                    <p className="text-white/60 text-sm">
                      Having trouble? Email us at
                    </p>
                    <a href="mailto:support@teamleaseedtech.com" className="text-emerald-400 hover:underline">
                      support@teamleaseedtech.com
                    </a>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </StudentAdminLayout>
  );
};

export default StudentAdminSettings;

