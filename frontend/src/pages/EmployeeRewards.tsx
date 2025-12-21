import { useState, useEffect } from 'react';
import { EmployeeLayout } from '@/components/layout/EmployeeLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import { 
  Gift, Trophy, Target, Zap, Star, Crown, Award,
  TrendingUp, CheckCircle, Clock, ArrowRight, Loader2,
  Gem, Shield, Medal
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import apiClient from '@/lib/api/client';

interface RewardSlab {
  id: string;
  slab_name: string;
  min_referrals: number;
  max_referrals: number | null;
  reward_per_referral: number;
  bonus_amount: number;
  level: number;
  description: string;
  icon: string;
  color: string;
}

interface RewardProgress {
  total_referrals: number;
  successful_referrals: number;
  current_slab: RewardSlab;
  next_slab: RewardSlab | null;
  referrals_to_next_slab: number;
  progress_percentage: number;
  total_earned: number;
  pending_earnings: number;
  level: number;
  level_name: string;
  rewards_history: any[];
}

const EmployeeRewards = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState<RewardProgress | null>(null);
  const [slabs, setSlabs] = useState<RewardSlab[]>([]);

  useEffect(() => {
    fetchRewardData();
  }, []);

  const fetchRewardData = async () => {
    setIsLoading(true);
    try {
      // Fetch reward progress
      const progressRes = await apiClient.get('/job-referrals/my-rewards');
      if (progressRes.data.success) {
        setProgress(progressRes.data.data);
      }
      
      // Fetch slabs
      const slabsRes = await apiClient.get('/job-referrals/reward-slabs');
      if (slabsRes.data.success) {
        setSlabs(slabsRes.data.data);
      }
    } catch (error) {
      console.error('Error fetching reward data:', error);
      // Demo data
      setSlabs([
        { id: '1', slab_name: 'Bronze', min_referrals: 0, max_referrals: 5, reward_per_referral: 5000, bonus_amount: 0, level: 1, description: 'Starting level for new referrers', icon: 'bronze', color: '#CD7F32' },
        { id: '2', slab_name: 'Silver', min_referrals: 6, max_referrals: 15, reward_per_referral: 7500, bonus_amount: 5000, level: 2, description: 'Silver tier with increased rewards', icon: 'silver', color: '#C0C0C0' },
        { id: '3', slab_name: 'Gold', min_referrals: 16, max_referrals: 30, reward_per_referral: 10000, bonus_amount: 15000, level: 3, description: 'Gold tier for consistent performers', icon: 'gold', color: '#FFD700' },
        { id: '4', slab_name: 'Platinum', min_referrals: 31, max_referrals: 50, reward_per_referral: 15000, bonus_amount: 30000, level: 4, description: 'Platinum tier for top performers', icon: 'platinum', color: '#E5E4E2' },
        { id: '5', slab_name: 'Diamond', min_referrals: 51, max_referrals: null, reward_per_referral: 20000, bonus_amount: 50000, level: 5, description: 'Diamond tier - maximum rewards!', icon: 'diamond', color: '#B9F2FF' },
      ]);
      setProgress({
        total_referrals: 12,
        successful_referrals: 8,
        current_slab: { id: '2', slab_name: 'Silver', min_referrals: 6, max_referrals: 15, reward_per_referral: 7500, bonus_amount: 5000, level: 2, description: 'Silver tier', icon: 'silver', color: '#C0C0C0' },
        next_slab: { id: '3', slab_name: 'Gold', min_referrals: 16, max_referrals: 30, reward_per_referral: 10000, bonus_amount: 15000, level: 3, description: 'Gold tier', icon: 'gold', color: '#FFD700' },
        referrals_to_next_slab: 8,
        progress_percentage: 20,
        total_earned: 60000,
        pending_earnings: 22500,
        level: 2,
        level_name: 'Silver',
        rewards_history: [
          { id: '1', amount: 7500, status: 'disbursed', type: 'referral', date: '2024-12-15' },
          { id: '2', amount: 7500, status: 'disbursed', type: 'referral', date: '2024-12-10' },
          { id: '3', amount: 5000, status: 'approved', type: 'bonus', date: '2024-12-05' },
        ]
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getSlabIcon = (slab_name: string) => {
    const icons: Record<string, React.ReactNode> = {
      Bronze: <Medal className="w-8 h-8" />,
      Silver: <Shield className="w-8 h-8" />,
      Gold: <Award className="w-8 h-8" />,
      Platinum: <Crown className="w-8 h-8" />,
      Diamond: <Gem className="w-8 h-8" />,
    };
    return icons[slab_name] || <Star className="w-8 h-8" />;
  };

  const getSlabColor = (slab_name: string) => {
    const colors: Record<string, string> = {
      Bronze: 'from-amber-700 to-amber-900',
      Silver: 'from-gray-400 to-gray-600',
      Gold: 'from-yellow-400 to-amber-600',
      Platinum: 'from-slate-300 to-slate-500',
      Diamond: 'from-cyan-300 to-blue-500',
    };
    return colors[slab_name] || 'from-gray-500 to-gray-700';
  };

  const motivationalMessages = [
    "🎯 You're doing great! Keep referring to unlock more rewards.",
    "💪 Just 8 more successful referrals to reach Gold tier!",
    "🌟 Your referrals are making a difference. Keep it up!",
    "🚀 You're on track to become a top performer this month!",
  ];

  if (isLoading) {
    return (
      <EmployeeLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
        </div>
      </EmployeeLayout>
    );
  }

  return (
    <EmployeeLayout>
      <div className="space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold text-white mb-2">Rewards</h1>
          <p className="text-white/60">Track your earnings and level up with more referrals</p>
        </motion.div>

        {/* Current Level Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className={`bg-gradient-to-br ${getSlabColor(progress?.current_slab.slab_name || 'Bronze')} border-0 overflow-hidden relative`}>
            <div className="absolute inset-0 bg-black/30" />
            <CardContent className="py-8 relative z-10">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white shadow-lg">
                    {getSlabIcon(progress?.current_slab.slab_name || 'Bronze')}
                  </div>
                  <div>
                    <p className="text-white/70 text-sm mb-1">Current Level</p>
                    <h2 className="text-3xl font-bold text-white">{progress?.current_slab.slab_name} Tier</h2>
                    <p className="text-white/80 mt-1">Level {progress?.level}</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-6 md:gap-8">
                  <div className="text-center">
                    <p className="text-white/70 text-sm">Total Referrals</p>
                    <p className="text-3xl font-bold text-white">{progress?.total_referrals}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-white/70 text-sm">Successful</p>
                    <p className="text-3xl font-bold text-green-300">{progress?.successful_referrals}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-white/70 text-sm">Total Earned</p>
                    <p className="text-3xl font-bold text-white">₹{((progress?.total_earned || 0) / 1000).toFixed(0)}K</p>
                  </div>
                </div>
              </div>
              
              {progress?.next_slab && (
                <div className="mt-8">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white/70 text-sm">Progress to {progress.next_slab.slab_name}</span>
                    <span className="text-white font-medium">{progress.referrals_to_next_slab} more to go</span>
                  </div>
                  <Progress value={progress.progress_percentage} className="h-3 bg-white/20" />
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Motivation Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 border-amber-500/30">
            <CardContent className="py-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-500/30 flex items-center justify-center">
                  <Zap className="w-6 h-6 text-amber-400" />
                </div>
                <div>
                  <p className="text-white font-medium text-lg">
                    {motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)]}
                  </p>
                  <p className="text-white/60 text-sm mt-1">
                    Earn ₹{progress?.current_slab.reward_per_referral.toLocaleString()} per successful referral at your current level
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Stats and Slabs */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Earnings Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card className="bg-white/5 border-white/10 h-full">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                  Earnings Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                  <p className="text-green-400/80 text-sm">Total Earned</p>
                  <p className="text-3xl font-bold text-green-400">₹{(progress?.total_earned || 0).toLocaleString()}</p>
                </div>
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                  <p className="text-amber-400/80 text-sm">Pending Rewards</p>
                  <p className="text-3xl font-bold text-amber-400">₹{(progress?.pending_earnings || 0).toLocaleString()}</p>
                </div>
                <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
                  <p className="text-purple-400/80 text-sm">Per Referral Reward</p>
                  <p className="text-3xl font-bold text-purple-400">₹{(progress?.current_slab.reward_per_referral || 0).toLocaleString()}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Reward Slabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="lg:col-span-2"
          >
            <Card className="bg-white/5 border-white/10 h-full">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-500" />
                  Reward Levels
                </CardTitle>
                <CardDescription className="text-white/60">Unlock higher rewards as you refer more</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {slabs.map((slab, index) => {
                    const isCurrentSlab = progress?.current_slab.slab_name === slab.slab_name;
                    const isUnlocked = (progress?.successful_referrals || 0) >= slab.min_referrals;
                    
                    return (
                      <motion.div
                        key={slab.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className={`relative p-4 rounded-xl border ${
                          isCurrentSlab 
                            ? 'bg-amber-500/20 border-amber-500/50' 
                            : isUnlocked 
                              ? 'bg-white/5 border-white/20' 
                              : 'bg-white/5 border-white/10 opacity-60'
                        }`}
                      >
                        {isCurrentSlab && (
                          <Badge className="absolute -top-2 right-4 bg-amber-500 text-white">Current</Badge>
                        )}
                        <div className="flex items-center gap-4">
                          <div 
                            className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getSlabColor(slab.slab_name)} flex items-center justify-center text-white shadow-lg`}
                          >
                            {getSlabIcon(slab.slab_name)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-white">{slab.slab_name}</h3>
                              <span className="text-white/50 text-sm">Level {slab.level}</span>
                            </div>
                            <p className="text-white/60 text-sm">
                              {slab.min_referrals} - {slab.max_referrals || '∞'} successful referrals
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-white font-medium">₹{slab.reward_per_referral.toLocaleString()}/referral</p>
                            {slab.bonus_amount > 0 && (
                              <p className="text-amber-400 text-sm">+₹{slab.bonus_amount.toLocaleString()} bonus</p>
                            )}
                          </div>
                          {isUnlocked ? (
                            <CheckCircle className="w-6 h-6 text-green-400" />
                          ) : (
                            <Clock className="w-6 h-6 text-white/30" />
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Recent Rewards History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Gift className="w-5 h-5 text-purple-500" />
                Recent Rewards
              </CardTitle>
            </CardHeader>
            <CardContent>
              {progress?.rewards_history && progress.rewards_history.length > 0 ? (
                <div className="space-y-3">
                  {progress.rewards_history.map((reward, index) => (
                    <motion.div
                      key={reward.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          reward.status === 'disbursed' ? 'bg-green-500/20' : 'bg-amber-500/20'
                        }`}>
                          {reward.status === 'disbursed' ? (
                            <CheckCircle className="w-5 h-5 text-green-400" />
                          ) : (
                            <Clock className="w-5 h-5 text-amber-400" />
                          )}
                        </div>
                        <div>
                          <p className="text-white font-medium capitalize">{reward.type} Reward</p>
                          <p className="text-white/50 text-sm">{new Date(reward.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-green-400 font-bold">+₹{reward.amount.toLocaleString()}</p>
                        <Badge variant="outline" className={
                          reward.status === 'disbursed' 
                            ? 'bg-green-500/20 text-green-400 border-green-500/30'
                            : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                        }>
                          {reward.status}
                        </Badge>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-white/50">
                  <Gift className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No rewards yet. Start referring to earn rewards!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </EmployeeLayout>
  );
};

export default EmployeeRewards;

