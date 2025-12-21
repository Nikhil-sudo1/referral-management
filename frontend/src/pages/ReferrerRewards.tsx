import { useState, useEffect } from 'react';
import { ReferrerLayout } from '@/components/layout/ReferrerLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Gift, Trophy, Star, Wallet, Target, CheckCircle, 
  Clock, TrendingUp, Award, Zap, ChevronRight, Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { analyticsAPI } from '@/lib/api';

const ReferrerRewards = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [rewardsData, setRewardsData] = useState({
    totalEarnings: 0,
    pendingEarnings: 0,
    withdrawnEarnings: 0,
    totalReferrals: 0,
    successfulAdmissions: 0,
    currentTier: 'Bronze',
    nextTier: 'Silver',
    progressToNextTier: 0,
    referralsToNextTier: 5,
  });

  useEffect(() => {
    const fetchRewardsData = async () => {
      setIsLoading(true);
      try {
        const analytics = await analyticsAPI.getMyAnalytics();
        if (analytics) {
          const totalReferrals = analytics.total_referrals || 0;
          let currentTier = 'Bronze';
          let nextTier = 'Silver';
          let progressToNextTier = 0;
          let referralsToNextTier = 5;

          if (totalReferrals >= 20) {
            currentTier = 'Platinum';
            nextTier = 'Diamond';
            progressToNextTier = Math.min(((totalReferrals - 20) / 30) * 100, 100);
            referralsToNextTier = Math.max(50 - totalReferrals, 0);
          } else if (totalReferrals >= 10) {
            currentTier = 'Gold';
            nextTier = 'Platinum';
            progressToNextTier = ((totalReferrals - 10) / 10) * 100;
            referralsToNextTier = 20 - totalReferrals;
          } else if (totalReferrals >= 5) {
            currentTier = 'Silver';
            nextTier = 'Gold';
            progressToNextTier = ((totalReferrals - 5) / 5) * 100;
            referralsToNextTier = 10 - totalReferrals;
          } else {
            progressToNextTier = (totalReferrals / 5) * 100;
            referralsToNextTier = 5 - totalReferrals;
          }

          setRewardsData({
            totalEarnings: Number(analytics.total_earnings) || 0,
            pendingEarnings: Number(analytics.pending_earnings) || 0,
            withdrawnEarnings: Number(analytics.withdrawn_earnings) || 0,
            totalReferrals,
            successfulAdmissions: analytics.successful_admissions || 0,
            currentTier,
            nextTier,
            progressToNextTier,
            referralsToNextTier,
          });
        }
      } catch (error) {
        console.error('Error fetching rewards data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRewardsData();
  }, []);

  const tierConfig = {
    Bronze: { color: 'from-amber-600 to-amber-800', icon: Award, reward: '₹5,000' },
    Silver: { color: 'from-gray-400 to-gray-600', icon: Star, reward: '₹7,500' },
    Gold: { color: 'from-yellow-400 to-yellow-600', icon: Trophy, reward: '₹10,000' },
    Platinum: { color: 'from-cyan-400 to-cyan-600', icon: Zap, reward: '₹15,000' },
    Diamond: { color: 'from-purple-400 to-purple-600', icon: Gift, reward: '₹25,000' },
  };

  const currentTierConfig = tierConfig[rewardsData.currentTier as keyof typeof tierConfig] || tierConfig.Bronze;

  const milestones = [
    { referrals: 5, tier: 'Silver', reward: '₹2,500 Bonus', achieved: rewardsData.totalReferrals >= 5 },
    { referrals: 10, tier: 'Gold', reward: '₹5,000 Bonus', achieved: rewardsData.totalReferrals >= 10 },
    { referrals: 20, tier: 'Platinum', reward: '₹10,000 Bonus', achieved: rewardsData.totalReferrals >= 20 },
    { referrals: 50, tier: 'Diamond', reward: '₹25,000 Bonus', achieved: rewardsData.totalReferrals >= 50 },
  ];

  if (isLoading) {
    return (
      <ReferrerLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </ReferrerLayout>
    );
  }

  return (
    <ReferrerLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white">Rewards & Earnings</h1>
          <p className="text-white/60 mt-1">Track your earnings and unlock new tiers</p>
        </div>

        {/* Earnings Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-white/5 border-white/10 overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                    <Wallet className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-white/60 text-sm">Total Earnings</p>
                    <p className="text-2xl font-bold text-white">₹{rewardsData.totalEarnings.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-white/5 border-white/10 overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-white/60 text-sm">Pending Payout</p>
                    <p className="text-2xl font-bold text-white">₹{rewardsData.pendingEarnings.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-white/5 border-white/10 overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-cyan-600 flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-white/60 text-sm">Withdrawn</p>
                    <p className="text-2xl font-bold text-white">₹{rewardsData.withdrawnEarnings.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Current Tier Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-white/5 border-white/10 overflow-hidden">
            <CardContent className="p-8">
              <div className="flex flex-col lg:flex-row items-center gap-8">
                <div className={`w-24 h-24 rounded-2xl bg-gradient-to-br ${currentTierConfig.color} flex items-center justify-center shadow-lg`}>
                  <currentTierConfig.icon className="w-12 h-12 text-white" />
                </div>
                <div className="flex-1 text-center lg:text-left">
                  <Badge className={`bg-gradient-to-r ${currentTierConfig.color} text-white border-0 mb-2`}>
                    {rewardsData.currentTier} Tier
                  </Badge>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    Keep going! You're doing great!
                  </h2>
                  <p className="text-white/60">
                    {rewardsData.referralsToNextTier > 0 
                      ? `${rewardsData.referralsToNextTier} more referrals to unlock ${rewardsData.nextTier} tier`
                      : `You've reached the highest tier!`
                    }
                  </p>
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-sm text-white/60 mb-2">
                      <span>{rewardsData.currentTier}</span>
                      <span>{rewardsData.nextTier}</span>
                    </div>
                    <Progress value={rewardsData.progressToNextTier} className="h-3" />
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-white/60 text-sm mb-1">Per Admission Reward</p>
                  <p className="text-3xl font-bold text-primary">{currentTierConfig.reward}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Milestones */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                Milestones & Bonuses
              </CardTitle>
              <CardDescription className="text-white/60">
                Unlock bonuses as you reach referral milestones
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {milestones.map((milestone, index) => (
                  <motion.div
                    key={milestone.referrals}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    className={`p-4 rounded-xl border ${
                      milestone.achieved 
                        ? 'bg-primary/10 border-primary/30' 
                        : 'bg-white/5 border-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      {milestone.achieved ? (
                        <CheckCircle className="w-6 h-6 text-primary" />
                      ) : (
                        <div className="w-6 h-6 rounded-full border-2 border-white/30" />
                      )}
                      <span className="font-bold text-white">{milestone.referrals} Referrals</span>
                    </div>
                    <p className="text-sm text-white/60 mb-1">{milestone.tier} Tier</p>
                    <p className="text-lg font-bold text-primary">{milestone.reward}</p>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/60 text-sm">Total Referrals</p>
                    <p className="text-3xl font-bold text-white">{rewardsData.totalReferrals}</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/60 text-sm">Successful Admissions</p>
                    <p className="text-3xl font-bold text-white">{rewardsData.successfulAdmissions}</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </ReferrerLayout>
  );
};

export default ReferrerRewards;

