import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HRAdminLayout } from '@/components/layout/HRAdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Trophy, Medal, Crown, TrendingUp, Users, DollarSign, RefreshCw, Target
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api/client';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';

interface LeaderboardEntry {
  rank: number;
  user_id: string;
  name: string;
  email: string;
  phone: string;
  total_referrals: number;
  successful_hires: number;
  pending: number;
  conversion_rate: number;
  total_earnings: number;
  slab_name: string;
}

const slabColors: Record<string, string> = {
  'Bronze': 'from-orange-700 to-orange-500',
  'Silver': 'from-gray-400 to-gray-300',
  'Gold': 'from-yellow-500 to-amber-400',
  'Platinum': 'from-cyan-400 to-blue-400',
  'Diamond': 'from-purple-500 to-pink-500',
};

const HRAdminLeaderboard = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('all');
  const [totalReferrers, setTotalReferrers] = useState(0);

  useEffect(() => {
    fetchLeaderboard();
  }, [period]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get(`/hr-admin/leaderboard?period=${period}&limit=50`);
      setLeaderboard(response.data.data);
      setTotalReferrers(response.data.total_referrers);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      toast({ title: 'Error', description: 'Failed to load leaderboard', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="w-6 h-6 text-yellow-400" />;
      case 2: return <Medal className="w-6 h-6 text-gray-300" />;
      case 3: return <Medal className="w-6 h-6 text-orange-400" />;
      default: return <span className="w-6 h-6 flex items-center justify-center text-white/60">#{rank}</span>;
    }
  };

  const getSlabBadge = (slab: string) => {
    const colors = slabColors[slab] || 'from-gray-500 to-gray-400';
    return (
      <Badge className={`bg-gradient-to-r ${colors} text-white border-none text-xs`}>
        {slab}
      </Badge>
    );
  };

  // Prepare chart data (top 10)
  const chartData = leaderboard.slice(0, 10).map((entry) => ({
    name: entry.name.split(' ')[0],
    referrals: entry.total_referrals,
    hires: entry.successful_hires
  }));

  const chartColors = ['#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef'];

  if (loading) {
    return (
      <HRAdminLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </HRAdminLayout>
    );
  }

  return (
    <HRAdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <motion.h1 
              className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              Referrer Leaderboard
            </motion.h1>
            <p className="text-white/60 mt-1">
              {totalReferrers} active referrers in your organization
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-40 bg-white/5 border-white/10 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="icon"
              onClick={fetchLeaderboard}
              className="border-white/10 hover:bg-white/10"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Top 3 Podium */}
        {leaderboard.length >= 3 && (
          <motion.div
            className="grid grid-cols-3 gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Second Place */}
            <div className="mt-8">
              <Card className="bg-gradient-to-b from-gray-500/20 to-gray-500/5 border-gray-500/30 text-center p-6">
                <div className="relative inline-block">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center text-white font-bold text-xl mx-auto mb-3">
                    {leaderboard[1].name.charAt(0)}
                  </div>
                  <Medal className="w-6 h-6 text-gray-300 absolute -top-1 -right-1" />
                </div>
                <h3 className="font-semibold text-white text-lg">{leaderboard[1].name}</h3>
                <p className="text-white/60 text-sm">{leaderboard[1].total_referrals} referrals</p>
                <p className="text-emerald-400 text-sm mt-1">{leaderboard[1].successful_hires} hires</p>
                {getSlabBadge(leaderboard[1].slab_name)}
              </Card>
            </div>

            {/* First Place */}
            <div>
              <Card className="bg-gradient-to-b from-yellow-500/20 to-amber-500/5 border-yellow-500/30 text-center p-6 relative overflow-hidden">
                <motion.div
                  className="absolute top-0 left-1/2 -translate-x-1/2"
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Crown className="w-8 h-8 text-yellow-400" />
                </motion.div>
                <div className="mt-6">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center text-white font-bold text-2xl mx-auto mb-3 ring-4 ring-yellow-400/30">
                    {leaderboard[0].name.charAt(0)}
                  </div>
                  <h3 className="font-bold text-white text-xl">{leaderboard[0].name}</h3>
                  <p className="text-white/60">{leaderboard[0].total_referrals} referrals</p>
                  <p className="text-emerald-400 font-medium mt-1">{leaderboard[0].successful_hires} hires</p>
                  <div className="mt-2">{getSlabBadge(leaderboard[0].slab_name)}</div>
                  <p className="text-yellow-400 font-semibold mt-2">
                    ₹{leaderboard[0].total_earnings.toLocaleString()} earned
                  </p>
                </div>
              </Card>
            </div>

            {/* Third Place */}
            <div className="mt-8">
              <Card className="bg-gradient-to-b from-orange-500/20 to-orange-500/5 border-orange-500/30 text-center p-6">
                <div className="relative inline-block">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold text-xl mx-auto mb-3">
                    {leaderboard[2].name.charAt(0)}
                  </div>
                  <Medal className="w-6 h-6 text-orange-400 absolute -top-1 -right-1" />
                </div>
                <h3 className="font-semibold text-white text-lg">{leaderboard[2].name}</h3>
                <p className="text-white/60 text-sm">{leaderboard[2].total_referrals} referrals</p>
                <p className="text-emerald-400 text-sm mt-1">{leaderboard[2].successful_hires} hires</p>
                {getSlabBadge(leaderboard[2].slab_name)}
              </Card>
            </div>
          </motion.div>
        )}

        {/* Analytics Chart */}
        {chartData.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-400" />
                  Top Performers Chart
                </CardTitle>
                <CardDescription className="text-white/60">
                  Referrals vs Successful Hires
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                      <XAxis dataKey="name" stroke="#ffffff60" />
                      <YAxis stroke="#ffffff60" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1a1a2e', 
                          border: '1px solid #ffffff20',
                          borderRadius: '8px'
                        }}
                      />
                      <Bar dataKey="referrals" name="Referrals" radius={[4, 4, 0, 0]}>
                        {chartData.map((_, index) => (
                          <Cell key={index} fill={chartColors[index % chartColors.length]} fillOpacity={0.8} />
                        ))}
                      </Bar>
                      <Bar dataKey="hires" name="Hires" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Full Rankings Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-400" />
                Full Rankings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-3 px-4 text-white/60 text-sm font-medium">Rank</th>
                      <th className="text-left py-3 px-4 text-white/60 text-sm font-medium">Referrer</th>
                      <th className="text-left py-3 px-4 text-white/60 text-sm font-medium">Slab</th>
                      <th className="text-center py-3 px-4 text-white/60 text-sm font-medium">Referrals</th>
                      <th className="text-center py-3 px-4 text-white/60 text-sm font-medium">Hires</th>
                      <th className="text-center py-3 px-4 text-white/60 text-sm font-medium">Conversion</th>
                      <th className="text-right py-3 px-4 text-white/60 text-sm font-medium">Earnings</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboard.map((entry) => (
                      <tr key={entry.user_id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center w-8 h-8">
                            {getRankIcon(entry.rank)}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div>
                            <p className="text-white font-medium">{entry.name}</p>
                            <p className="text-white/50 text-xs">{entry.email}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4">{getSlabBadge(entry.slab_name)}</td>
                        <td className="py-3 px-4 text-center">
                          <span className="text-blue-400 font-medium">{entry.total_referrals}</span>
                          {entry.pending > 0 && (
                            <span className="text-white/40 text-xs ml-1">({entry.pending} pending)</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center text-emerald-400 font-medium">
                          {entry.successful_hires}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Badge variant="outline" className={`
                            ${entry.conversion_rate >= 50 ? 'border-emerald-500/30 text-emerald-400' : 
                              entry.conversion_rate >= 25 ? 'border-amber-500/30 text-amber-400' : 
                              'border-white/20 text-white/60'}
                          `}>
                            {entry.conversion_rate}%
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-right text-white font-medium">
                          ₹{entry.total_earnings.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                    {leaderboard.length === 0 && (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-white/50">
                          No referrer data found for this period.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </HRAdminLayout>
  );
};

export default HRAdminLeaderboard;

