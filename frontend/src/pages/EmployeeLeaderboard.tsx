import { useState, useEffect } from 'react';
import { EmployeeLayout } from '@/components/layout/EmployeeLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { 
  Trophy, Medal, Award, TrendingUp, TrendingDown, Minus,
  Crown, Star, Zap, Target, Loader2
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import apiClient from '@/lib/api/client';

interface LeaderboardEntry {
  rank: number;
  user_id: string;
  user_name: string;
  referral_count: number;
  successful_referrals: number;
  total_earnings: number;
  current_slab: string;
  current_level: number;
  trend?: 'up' | 'down' | 'same';
}

const EmployeeLeaderboard = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [totalParticipants, setTotalParticipants] = useState(0);
  
  // Filters
  const [period, setPeriod] = useState('all');
  const [jobFilter, setJobFilter] = useState('all');

  useEffect(() => {
    fetchLeaderboard();
  }, [period, jobFilter]);

  const fetchLeaderboard = async () => {
    setIsLoading(true);
    try {
      const params: any = { period, limit: 50 };
      if (jobFilter !== 'all') params.job_id = jobFilter;
      
      const response = await apiClient.get('/job-referrals/leaderboard', { params });
      if (response.data.success) {
        setLeaderboard(response.data.data);
        setUserRank(response.data.user_rank);
        setTotalParticipants(response.data.total_participants);
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      // Demo data
      setLeaderboard([
        { rank: 1, user_id: '1', user_name: 'Priya Sharma', referral_count: 45, successful_referrals: 28, total_earnings: 420000, current_slab: 'Platinum', current_level: 4, trend: 'up' },
        { rank: 2, user_id: '2', user_name: 'Rahul Verma', referral_count: 38, successful_referrals: 22, total_earnings: 330000, current_slab: 'Gold', current_level: 3, trend: 'same' },
        { rank: 3, user_id: '3', user_name: 'Anita Singh', referral_count: 35, successful_referrals: 20, total_earnings: 300000, current_slab: 'Gold', current_level: 3, trend: 'up' },
        { rank: 4, user_id: '4', user_name: 'Vikram Patel', referral_count: 30, successful_referrals: 18, total_earnings: 270000, current_slab: 'Gold', current_level: 3, trend: 'down' },
        { rank: 5, user_id: '5', user_name: 'Sneha Gupta', referral_count: 28, successful_referrals: 16, total_earnings: 240000, current_slab: 'Silver', current_level: 2, trend: 'up' },
        { rank: 6, user_id: '6', user_name: 'Arjun Kumar', referral_count: 25, successful_referrals: 14, total_earnings: 210000, current_slab: 'Silver', current_level: 2, trend: 'same' },
        { rank: 7, user_id: '7', user_name: 'Kavitha Nair', referral_count: 22, successful_referrals: 12, total_earnings: 180000, current_slab: 'Silver', current_level: 2, trend: 'down' },
        { rank: 8, user_id: '8', user_name: 'Ravi Mehta', referral_count: 20, successful_referrals: 10, total_earnings: 150000, current_slab: 'Silver', current_level: 2, trend: 'up' },
        { rank: 9, user_id: '9', user_name: 'Deepa Reddy', referral_count: 18, successful_referrals: 9, total_earnings: 135000, current_slab: 'Silver', current_level: 2, trend: 'same' },
        { rank: 10, user_id: '10', user_name: 'Amit Joshi', referral_count: 15, successful_referrals: 7, total_earnings: 105000, current_slab: 'Bronze', current_level: 1, trend: 'up' },
      ]);
      setUserRank(12);
      setTotalParticipants(150);
    } finally {
      setIsLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-400" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-300" />;
      case 3:
        return <Medal className="w-6 h-6 text-amber-600" />;
      default:
        return <span className="text-lg font-bold text-white/60">#{rank}</span>;
    }
  };

  const getSlabBadge = (slab: string) => {
    const config: Record<string, string> = {
      Bronze: 'bg-amber-700/30 text-amber-400 border-amber-600/30',
      Silver: 'bg-gray-500/30 text-gray-300 border-gray-500/30',
      Gold: 'bg-yellow-500/30 text-yellow-400 border-yellow-500/30',
      Platinum: 'bg-slate-400/30 text-slate-200 border-slate-400/30',
      Diamond: 'bg-cyan-400/30 text-cyan-300 border-cyan-400/30',
    };
    return <Badge variant="outline" className={config[slab] || config.Bronze}>{slab}</Badge>;
  };

  const getTrendIcon = (trend?: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-400" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-400" />;
      default:
        return <Minus className="w-4 h-4 text-white/40" />;
    }
  };

  const top3 = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3);

  return (
    <EmployeeLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl font-bold text-white mb-2">Leaderboard</h1>
            <p className="text-white/60">Top referrers across the organization</p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex gap-3"
          >
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-40 bg-white/5 border-white/10">
                <SelectValue placeholder="Time Period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
              </SelectContent>
            </Select>
          </motion.div>
        </div>

        {/* Your Rank Card */}
        {userRank && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 border-amber-500/30">
              <CardContent className="py-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-amber-500/30">
                      #{userRank}
                    </div>
                    <div>
                      <p className="text-white/60 text-sm">Your Current Rank</p>
                      <p className="text-2xl font-bold text-white">{user?.full_name}</p>
                      <p className="text-amber-400 text-sm">Out of {totalParticipants} participants</p>
                    </div>
                  </div>
                  <div className="hidden md:flex items-center gap-8">
                    <div className="text-center">
                      <p className="text-white/60 text-sm">Total Referrals</p>
                      <p className="text-2xl font-bold text-white">12</p>
                    </div>
                    <div className="text-center">
                      <p className="text-white/60 text-sm">Successful</p>
                      <p className="text-2xl font-bold text-green-400">5</p>
                    </div>
                    <div className="text-center">
                      <p className="text-white/60 text-sm">Earnings</p>
                      <p className="text-2xl font-bold text-amber-400">₹75K</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Top 3 Podium */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="bg-white/5 border-white/10 overflow-hidden">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-500" />
                Top Performers
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
                </div>
              ) : (
                <div className="flex flex-col md:flex-row items-end justify-center gap-4 md:gap-8 py-8">
                  {/* 2nd Place */}
                  {top3[1] && (
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.5 }}
                      className="flex flex-col items-center order-1 md:order-none"
                    >
                      <div className="relative">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center text-2xl font-bold text-white border-4 border-gray-300 shadow-lg">
                          {top3[1].user_name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-800 font-bold text-sm">
                          2
                        </div>
                      </div>
                      <div className="mt-4 text-center">
                        <p className="font-semibold text-white">{top3[1].user_name}</p>
                        <p className="text-white/60 text-sm">{top3[1].referral_count} referrals</p>
                        {getSlabBadge(top3[1].current_slab)}
                      </div>
                      <div className="w-24 h-20 md:h-24 bg-gradient-to-t from-gray-500/30 to-gray-400/10 rounded-t-xl mt-4 flex items-end justify-center pb-2">
                        <span className="text-gray-300 font-bold">₹{(top3[1].total_earnings / 1000).toFixed(0)}K</span>
                      </div>
                    </motion.div>
                  )}

                  {/* 1st Place */}
                  {top3[0] && (
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.4 }}
                      className="flex flex-col items-center order-0 md:order-none"
                    >
                      <div className="relative">
                        <motion.div 
                          className="absolute -top-8 left-1/2 -translate-x-1/2"
                          animate={{ y: [0, -5, 0] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <Crown className="w-10 h-10 text-yellow-400" />
                        </motion.div>
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center text-3xl font-bold text-white border-4 border-yellow-300 shadow-lg shadow-yellow-500/30">
                          {top3[0].user_name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center text-yellow-900 font-bold text-sm">
                          1
                        </div>
                      </div>
                      <div className="mt-4 text-center">
                        <p className="font-semibold text-white text-lg">{top3[0].user_name}</p>
                        <p className="text-white/60 text-sm">{top3[0].referral_count} referrals</p>
                        {getSlabBadge(top3[0].current_slab)}
                      </div>
                      <div className="w-28 h-28 md:h-32 bg-gradient-to-t from-yellow-500/30 to-yellow-400/10 rounded-t-xl mt-4 flex items-end justify-center pb-2">
                        <span className="text-yellow-400 font-bold text-lg">₹{(top3[0].total_earnings / 1000).toFixed(0)}K</span>
                      </div>
                    </motion.div>
                  )}

                  {/* 3rd Place */}
                  {top3[2] && (
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.6 }}
                      className="flex flex-col items-center order-2 md:order-none"
                    >
                      <div className="relative">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center text-2xl font-bold text-white border-4 border-amber-500 shadow-lg">
                          {top3[2].user_name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-amber-600 flex items-center justify-center text-white font-bold text-sm">
                          3
                        </div>
                      </div>
                      <div className="mt-4 text-center">
                        <p className="font-semibold text-white">{top3[2].user_name}</p>
                        <p className="text-white/60 text-sm">{top3[2].referral_count} referrals</p>
                        {getSlabBadge(top3[2].current_slab)}
                      </div>
                      <div className="w-24 h-16 md:h-20 bg-gradient-to-t from-amber-600/30 to-amber-500/10 rounded-t-xl mt-4 flex items-end justify-center pb-2">
                        <span className="text-amber-400 font-bold">₹{(top3[2].total_earnings / 1000).toFixed(0)}K</span>
                      </div>
                    </motion.div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Full Rankings Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Full Rankings</CardTitle>
              <CardDescription className="text-white/60">Complete leaderboard of all participants</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border border-white/10 overflow-x-auto">
                <Table>
                  <TableHeader className="bg-white/5">
                    <TableRow className="border-white/10">
                      <TableHead className="text-white/80 w-20">Rank</TableHead>
                      <TableHead className="text-white/80">Name</TableHead>
                      <TableHead className="text-white/80 text-center">Total Referrals</TableHead>
                      <TableHead className="text-white/80 text-center">Successful</TableHead>
                      <TableHead className="text-white/80 text-center">Conversion %</TableHead>
                      <TableHead className="text-white/80">Level</TableHead>
                      <TableHead className="text-white/80 text-right">Earnings</TableHead>
                      <TableHead className="text-white/80 text-center">Trend</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leaderboard.map((entry, index) => (
                      <TableRow 
                        key={entry.user_id} 
                        className={`border-white/5 hover:bg-white/5 ${entry.user_id === user?.id ? 'bg-amber-500/10' : ''}`}
                      >
                        <TableCell className="py-4">
                          <div className="flex items-center justify-center">
                            {getRankIcon(entry.rank)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500/30 to-orange-500/30 flex items-center justify-center text-white font-semibold">
                              {entry.user_name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <span className="font-medium text-white">{entry.user_name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center text-white">{entry.referral_count}</TableCell>
                        <TableCell className="text-center text-green-400">{entry.successful_referrals}</TableCell>
                        <TableCell className="text-center text-white/80">
                          {entry.referral_count > 0 
                            ? `${((entry.successful_referrals / entry.referral_count) * 100).toFixed(0)}%`
                            : '0%'
                          }
                        </TableCell>
                        <TableCell>{getSlabBadge(entry.current_slab)}</TableCell>
                        <TableCell className="text-right text-amber-400 font-medium">
                          ₹{entry.total_earnings.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-center">
                          {getTrendIcon(entry.trend)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </EmployeeLayout>
  );
};

export default EmployeeLeaderboard;

