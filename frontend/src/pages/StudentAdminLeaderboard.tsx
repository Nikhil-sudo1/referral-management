import { useState, useEffect } from 'react';
import { StudentAdminLayout } from '@/components/layout/StudentAdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Trophy, Medal, Crown, Star, TrendingUp, Users, Target,
  Calendar, Filter, Award, Flame, ArrowUp, ArrowDown
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from '@/hooks/use-toast';
import { leaderboardAPI, universitiesAPI } from '@/lib/api';
import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

// Tier colors
const tierColors: Record<string, { bg: string; text: string; border: string }> = {
  Platinum: { bg: 'bg-gradient-to-r from-purple-500/20 to-pink-500/20', text: 'text-purple-400', border: 'border-purple-500/30' },
  Gold: { bg: 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20', text: 'text-yellow-400', border: 'border-yellow-500/30' },
  Silver: { bg: 'bg-gradient-to-r from-gray-400/20 to-gray-500/20', text: 'text-gray-300', border: 'border-gray-400/30' },
  Bronze: { bg: 'bg-gradient-to-r from-orange-600/20 to-amber-600/20', text: 'text-orange-400', border: 'border-orange-500/30' },
};

const rankIcons = [Crown, Medal, Award];
const rankColors = ['text-yellow-400', 'text-gray-300', 'text-orange-400'];

const StudentAdminLeaderboard = () => {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [universities, setUniversities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState('all');
  const [universityFilter, setUniversityFilter] = useState('all');
  const [weeklyData, setWeeklyData] = useState<any[]>([]);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, [timeFilter, universityFilter]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch leaderboard
      const params: any = { limit: 50 };
      if (timeFilter !== 'all') params.period = timeFilter;
      if (universityFilter !== 'all') params.university_id = universityFilter;
      
      const response = await leaderboardAPI.getLeaderboard(params);
      setLeaderboard(response.items || response || []);

      // Fetch universities
      const uniResponse = await universitiesAPI.getUniversities({ limit: 100 });
      setUniversities(uniResponse.items || []);

      // Generate mock weekly/monthly performance data
      generatePerformanceData(response.items || response || []);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      toast({ title: 'Error', description: 'Failed to load leaderboard', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to get user name from various possible field names
  const getUserName = (referrer: any) => {
    return referrer.user_name || referrer.name || referrer.full_name || 'Unknown';
  };

  const generatePerformanceData = (data: any[]) => {
    // Weekly data
    const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
    setWeeklyData(weeks.map((week, i) => ({
      name: week,
      referrals: Math.floor(Math.random() * 50) + 20,
      admissions: Math.floor(Math.random() * 20) + 5,
    })));

    // Monthly comparison of top 5
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const top5 = data.slice(0, 5);
    setMonthlyData(months.map(month => {
      const item: any = { name: month };
      top5.forEach((referrer, i) => {
        item[getUserName(referrer)] = Math.floor(Math.random() * 15) + 5;
      });
      return item;
    }));
  };

  const getTier = (referrals: number) => {
    if (referrals >= 21) return 'Platinum';
    if (referrals >= 11) return 'Gold';
    if (referrals >= 6) return 'Silver';
    return 'Bronze';
  };

  return (
    <StudentAdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Trophy className="w-8 h-8 text-yellow-400" />
              Leaderboard
            </h1>
            <p className="text-white/60 mt-1">Referrer rankings and performance analytics</p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={timeFilter} onValueChange={setTimeFilter}>
              <SelectTrigger className="w-[140px] bg-white/5 border-white/10 text-white">
                <Calendar className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="quarter">This Quarter</SelectItem>
              </SelectContent>
            </Select>

            <Select value={universityFilter} onValueChange={setUniversityFilter}>
              <SelectTrigger className="w-[180px] bg-white/5 border-white/10 text-white">
                <SelectValue placeholder="University" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Universities</SelectItem>
                {universities.map((uni: any) => (
                  <SelectItem key={uni.id} value={uni.id}>{uni.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Top 3 Podium */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {leaderboard.slice(0, 3).map((referrer, index) => {
            const RankIcon = rankIcons[index];
            const position = index === 0 ? 1 : index === 1 ? 0 : 2;
            const heights = ['h-48', 'h-56', 'h-44'];
            const total = referrer.total_referrals || referrer.referrals_count || 0;
            const tier = referrer.tier || getTier(total);
            
            return (
              <motion.div
                key={referrer.user_id || referrer.id || index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: position * 0.15 }}
                className={`order-${position + 1} md:order-${index + 1}`}
              >
                <Card className={`bg-white/5 border-white/10 ${heights[index]} flex flex-col justify-end relative overflow-hidden`}>
                  {index === 0 && (
                    <div className="absolute inset-0 bg-gradient-to-b from-yellow-500/10 to-transparent" />
                  )}
                  <CardContent className="relative z-10 p-6 text-center">
                    <motion.div
                      className="mb-4"
                      animate={{ rotate: [0, 5, -5, 0] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    >
                      <RankIcon className={`w-12 h-12 mx-auto ${rankColors[index]}`} />
                    </motion.div>
                    <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center text-white text-xl font-bold">
                      {getUserName(referrer).charAt(0).toUpperCase()}
                    </div>
                    <h3 className="text-lg font-bold text-white mb-1">{getUserName(referrer)}</h3>
                    <Badge className={`${tierColors[tier]?.bg || tierColors.Bronze.bg} ${tierColors[tier]?.text || tierColors.Bronze.text} ${tierColors[tier]?.border || tierColors.Bronze.border} mb-2`}>
                      {tier}
                    </Badge>
                    <div className="text-2xl font-bold text-emerald-400">
                      {total}
                    </div>
                    <p className="text-white/60 text-sm">referrals</p>
                    <div className="mt-2 flex items-center justify-center gap-1 text-green-400 text-sm">
                      <ArrowUp className="w-3 h-3" />
                      {referrer.total_admissions || referrer.admitted_count || 0} admitted
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Analytics Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Weekly Performance */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-400" />
                  Weekly Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                    <XAxis dataKey="name" stroke="#ffffff40" fontSize={12} />
                    <YAxis stroke="#ffffff40" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1a1a2e', 
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                    <Bar dataKey="referrals" fill="#10b981" name="Referrals" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="admissions" fill="#22c55e" name="Admissions" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          {/* Top Performers Trend */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Flame className="w-5 h-5 text-orange-400" />
                  Top 5 Monthly Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                    <XAxis dataKey="name" stroke="#ffffff40" fontSize={12} />
                    <YAxis stroke="#ffffff40" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1a1a2e', 
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                    {leaderboard.slice(0, 5).map((referrer, i) => (
                      <Line 
                        key={i}
                        type="monotone" 
                        dataKey={getUserName(referrer)}
                        stroke={['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'][i]}
                        strokeWidth={2}
                        dot={{ r: 4 }}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Full Leaderboard Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-400" />
                Full Rankings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-3 px-4 text-white/60 font-medium text-sm">Rank</th>
                      <th className="text-left py-3 px-4 text-white/60 font-medium text-sm">Referrer</th>
                      <th className="text-left py-3 px-4 text-white/60 font-medium text-sm">Email</th>
                      <th className="text-left py-3 px-4 text-white/60 font-medium text-sm">Tier</th>
                      <th className="text-center py-3 px-4 text-white/60 font-medium text-sm">Total Referrals</th>
                      <th className="text-center py-3 px-4 text-white/60 font-medium text-sm">Admitted</th>
                      <th className="text-center py-3 px-4 text-white/60 font-medium text-sm">Conversion</th>
                      <th className="text-center py-3 px-4 text-white/60 font-medium text-sm">Trend</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      <tr>
                        <td colSpan={8} className="py-12 text-center text-white/40">Loading...</td>
                      </tr>
                    ) : leaderboard.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-12 text-center text-white/40">No data available</td>
                      </tr>
                    ) : (
                      leaderboard.map((referrer, index) => {
                        const total = referrer.total_referrals || referrer.referrals_count || 0;
                        const tier = referrer.tier || getTier(total);
                        const admitted = referrer.total_admissions || referrer.admitted_count || 0;
                        const conversion = referrer.conversion_rate || (total > 0 ? Math.round((admitted / total) * 100) : 0);
                        const growth = referrer.growth_rate || 0;
                        const userName = getUserName(referrer);
                        
                        return (
                          <motion.tr
                            key={referrer.user_id || referrer.id || index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.02 }}
                            className="border-b border-white/5 hover:bg-white/5 transition-colors"
                          >
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-2">
                                {index < 3 ? (
                                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                    index === 0 ? 'bg-yellow-500/20' : index === 1 ? 'bg-gray-500/20' : 'bg-orange-500/20'
                                  }`}>
                                    {index === 0 ? <Crown className="w-4 h-4 text-yellow-400" /> :
                                     index === 1 ? <Medal className="w-4 h-4 text-gray-300" /> :
                                     <Award className="w-4 h-4 text-orange-400" />}
                                  </div>
                                ) : (
                                  <span className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/60 font-medium">
                                    {referrer.rank || index + 1}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center text-white font-bold">
                                  {userName.charAt(0).toUpperCase()}
                                </div>
                                <span className="text-white font-medium">{userName}</span>
                              </div>
                            </td>
                            <td className="py-4 px-4 text-white/60">{referrer.email || '-'}</td>
                            <td className="py-4 px-4">
                              <Badge className={`${tierColors[tier]?.bg || tierColors.Bronze.bg} ${tierColors[tier]?.text || tierColors.Bronze.text} ${tierColors[tier]?.border || tierColors.Bronze.border}`}>
                                {tier}
                              </Badge>
                            </td>
                            <td className="py-4 px-4 text-center">
                              <span className="text-xl font-bold text-emerald-400">{total}</span>
                            </td>
                            <td className="py-4 px-4 text-center">
                              <span className="text-green-400 font-medium">{admitted}</span>
                            </td>
                            <td className="py-4 px-4 text-center">
                              <div className="flex items-center justify-center gap-1">
                                <span className={`font-medium ${conversion >= 30 ? 'text-green-400' : conversion >= 15 ? 'text-yellow-400' : 'text-red-400'}`}>
                                  {typeof conversion === 'number' ? `${conversion.toFixed(0)}%` : conversion}
                                </span>
                              </div>
                            </td>
                            <td className="py-4 px-4 text-center">
                              {growth >= 0 ? (
                                <div className="flex items-center justify-center gap-1 text-green-400">
                                  <ArrowUp className="w-4 h-4" />
                                  <span className="text-sm">+{growth.toFixed(0)}</span>
                                </div>
                              ) : (
                                <div className="flex items-center justify-center gap-1 text-red-400">
                                  <ArrowDown className="w-4 h-4" />
                                  <span className="text-sm">{growth.toFixed(0)}</span>
                                </div>
                              )}
                            </td>
                          </motion.tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </StudentAdminLayout>
  );
};

export default StudentAdminLeaderboard;

