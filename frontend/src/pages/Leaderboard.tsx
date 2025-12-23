import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, TrendingUp, Medal, Crown, Star, Loader2, Sparkles, Award, Flame } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { leaderboardAPI, type LeaderboardEntry } from '@/lib/api';

const Leaderboard = () => {
  const [referrerLeaderboard, setReferrerLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboards();
  }, []);

  const fetchLeaderboards = async () => {
    setIsLoading(true);
    try {
      const referrerData = await leaderboardAPI.getReferrerLeaderboard({ limit: 50 });
      setReferrerLeaderboard(referrerData.entries || []);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      toast({
        title: 'Error',
        description: 'Failed to load leaderboard data',
        variant: 'destructive',
      });
      setReferrerLeaderboard([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getRankIcon = (rank: number, size: 'sm' | 'lg' = 'sm') => {
    const sizeClass = size === 'lg' ? 'w-10 h-10' : 'w-6 h-6';
    if (rank === 1) return <Crown className={cn(sizeClass, 'text-yellow-500 drop-shadow-lg')} />;
    if (rank === 2) return <Medal className={cn(sizeClass, 'text-slate-400')} />;
    if (rank === 3) return <Medal className={cn(sizeClass, 'text-amber-600')} />;
    return <span className="text-lg font-bold text-muted-foreground">#{rank}</span>;
  };

  const PodiumCard = ({ entry, rank, position, index }: { entry: LeaderboardEntry; rank: number; position: 'left' | 'center' | 'right'; index: number }) => {
    const isFirst = rank === 1;
    const isSecond = rank === 2;
    const isThird = rank === 3;

    const bgGradient = isFirst 
      ? 'bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 dark:from-yellow-950/30 dark:via-amber-950/30 dark:to-orange-950/30'
      : isSecond 
      ? 'bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-100 dark:from-slate-950/30 dark:via-gray-950/30 dark:to-zinc-950/30'
      : 'bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:from-orange-950/30 dark:via-amber-950/30 dark:to-yellow-950/30';

    const borderColor = isFirst 
      ? 'border-yellow-400/50 shadow-yellow-200/50' 
      : isSecond 
      ? 'border-slate-300/50 shadow-slate-200/50' 
      : 'border-amber-400/50 shadow-amber-200/50';

    const heightClass = isFirst ? 'min-h-[320px]' : isSecond ? 'min-h-[280px]' : 'min-h-[260px]';
    const orderClass = position === 'left' ? 'order-1' : position === 'center' ? 'order-2 md:-mt-8' : 'order-3';

    return (
      <motion.div 
        className={cn('flex-1', orderClass)}
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ 
          duration: 0.6, 
          delay: isFirst ? 0.3 : isSecond ? 0.1 : 0.5,
          ease: [0.22, 1, 0.36, 1]
        }}
      >
        <motion.div
          whileHover={{ scale: 1.05, y: -10 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
        <Card className={cn(
          'border-2 transition-shadow duration-300 hover:shadow-2xl relative overflow-hidden',
          bgGradient,
          borderColor,
          heightClass,
          isFirst && 'ring-2 ring-yellow-400/30'
        )}>
          {/* Decorative elements */}
          {isFirst && (
            <>
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-400" />
              <Sparkles className="absolute top-4 right-4 w-5 h-5 text-yellow-400 animate-pulse" />
              <Sparkles className="absolute top-8 left-4 w-4 h-4 text-amber-400 animate-pulse delay-300" />
            </>
          )}
          
          <CardContent className="p-6 text-center flex flex-col items-center justify-center h-full">
            {/* Rank Badge */}
            <div className={cn(
              'w-16 h-16 rounded-full flex items-center justify-center mb-4 shadow-lg',
              isFirst ? 'bg-gradient-to-br from-yellow-400 to-amber-500' : 
              isSecond ? 'bg-gradient-to-br from-slate-300 to-gray-400' : 
              'bg-gradient-to-br from-amber-500 to-orange-600'
            )}>
              {getRankIcon(rank, 'lg')}
            </div>

            {/* Rank Number */}
            <div className={cn(
              'text-4xl font-black mb-2',
              isFirst ? 'text-yellow-600' : isSecond ? 'text-slate-500' : 'text-amber-600'
            )}>
              #{rank}
            </div>

            {/* Name */}
            <h3 className="text-xl font-bold text-card-foreground mb-1 line-clamp-1">
              {entry?.user_name || 'Unknown'}
            </h3>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-6 mt-4 w-full">
              <div className="text-center">
                <p className={cn(
                  'text-3xl font-bold',
                  isFirst ? 'text-yellow-600' : 'text-primary'
                )}>
                  {entry?.total_referrals || 0}
                </p>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Referrals</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-emerald-500">
                  {entry?.total_admissions || 0}
                </p>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Success</p>
              </div>
            </div>

            {/* Conversion Rate */}
            <div className={cn(
              'mt-4 px-4 py-2 rounded-full',
              isFirst ? 'bg-yellow-100 dark:bg-yellow-900/30' : 'bg-muted/50'
            )}>
              <div className="flex items-center gap-2">
                <Flame className={cn('w-4 h-4', isFirst ? 'text-orange-500' : 'text-emerald-500')} />
                <span className="text-sm font-bold text-card-foreground">
                  {(entry?.conversion_rate || 0).toFixed(1)}% conversion
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
        </motion.div>
      </motion.div>
    );
  };

  const LeaderboardList = ({ entries }: { entries: LeaderboardEntry[] }) => {
    if (entries.length === 0) {
      return (
        <div className="text-center py-12">
          <Trophy className="w-16 h-16 mx-auto text-muted-foreground mb-4 opacity-50" />
          <h3 className="text-xl font-bold text-card-foreground mb-2">No Leaderboard Data</h3>
          <p className="text-muted-foreground">No rankings available at this time.</p>
        </div>
      );
    }

    const top3 = entries.slice(0, 3);
    const rest = entries.slice(3);

    return (
      <div className="space-y-8">
        {/* Podium - Top 3 */}
        {entries.length >= 3 && (
          <motion.div 
            className="flex flex-col md:flex-row gap-4 items-end justify-center px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {/* 2nd Place */}
            <PodiumCard entry={top3[1]} rank={2} position="left" index={1} />
            {/* 1st Place */}
            <PodiumCard entry={top3[0]} rank={1} position="center" index={0} />
            {/* 3rd Place */}
            <PodiumCard entry={top3[2]} rank={3} position="right" index={2} />
          </motion.div>
        )}

        {/* Full Rankings Table */}
        <Card className="border-2 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-primary/5 via-transparent to-primary/5 border-b">
            <CardTitle className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Award className="w-5 h-5 text-primary" />
              </div>
              <div>
                <span className="text-xl font-bold">Full Rankings</span>
                <p className="text-sm font-normal text-muted-foreground mt-0.5">{entries.length} performers</p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {entries.map((entry, idx) => {
                const isTop3 = entry.rank <= 3;
                return (
                  <div
                    key={entry.user_id}
                    className={cn(
                      'flex items-center justify-between p-4 transition-all hover:bg-muted/50',
                      isTop3 && 'bg-gradient-to-r from-primary/5 via-transparent to-transparent'
                    )}
                  >
                    <div className="flex items-center gap-4">
                      {/* Rank */}
                      <div className={cn(
                        'w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg',
                        entry.rank === 1 ? 'bg-gradient-to-br from-yellow-400 to-amber-500 text-white shadow-lg' :
                        entry.rank === 2 ? 'bg-gradient-to-br from-slate-300 to-gray-400 text-white shadow-md' :
                        entry.rank === 3 ? 'bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-md' :
                        'bg-muted text-muted-foreground'
                      )}>
                        {isTop3 ? getRankIcon(entry.rank) : `#${entry.rank}`}
                      </div>
                      
                      {/* User Info */}
                      <div>
                        <h4 className="font-semibold text-card-foreground flex items-center gap-2">
                          {entry.user_name || entry.name}
                          {entry.rank === 1 && <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />}
                        </h4>
                        <div className="flex items-center gap-2">
                          {(entry.email || entry.user_email) && (
                            <p className="text-sm text-muted-foreground">{entry.email || entry.user_email}</p>
                          )}
                          {entry.referrer_code && (
                            <>
                              {(entry.email || entry.user_email) && <span className="text-muted-foreground">•</span>}
                              <p className="text-sm font-mono text-emerald-500">{entry.referrer_code}</p>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-8">
                      <div className="text-center min-w-[70px]">
                        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Referrals</p>
                        <p className="text-xl font-bold text-card-foreground">{entry.total_referrals}</p>
                      </div>
                      <div className="text-center min-w-[70px]">
                        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Success</p>
                        <p className="text-xl font-bold text-emerald-500">{entry.total_admissions}</p>
                      </div>
                      <div className="text-center min-w-[80px]">
                        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Rate</p>
                        <Badge 
                          variant="outline" 
                          className={cn(
                            'font-bold',
                            (entry.conversion_rate || 0) >= 50 ? 'bg-emerald-100 text-emerald-700 border-emerald-300' :
                            (entry.conversion_rate || 0) >= 30 ? 'bg-blue-100 text-blue-700 border-blue-300' :
                            'bg-orange-100 text-orange-700 border-orange-300'
                          )}
                        >
                          {(entry.conversion_rate || 0).toFixed(1)}%
                        </Badge>
                      </div>
                      <div className="text-center min-w-[100px]">
                        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Rewards</p>
                        <p className="text-xl font-bold text-amber-500">
                          ₹{(entry.total_rewards || 0).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading leaderboard...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-yellow-400 via-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/30">
            <Trophy className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Leaderboard</h1>
            <p className="text-muted-foreground mt-1">Top performers based on conversion rate</p>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-950/20 dark:to-amber-950/20 border-yellow-200/50">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-yellow-400/20 flex items-center justify-center">
                <Crown className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Top Performer</p>
                <p className="text-lg font-bold text-card-foreground">{referrerLeaderboard[0]?.user_name || '-'}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Highest Conversion</p>
                <p className="text-lg font-bold text-card-foreground">{(referrerLeaderboard[0]?.conversion_rate || 0).toFixed(1)}%</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <Award className="w-6 h-6 text-emerald-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Performers</p>
                <p className="text-lg font-bold text-card-foreground">{referrerLeaderboard.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <Flame className="w-6 h-6 text-amber-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Referrals</p>
                <p className="text-lg font-bold text-card-foreground">
                  {referrerLeaderboard.reduce((sum, e) => sum + (e.total_referrals || 0), 0)}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Leaderboard */}
        <LeaderboardList entries={referrerLeaderboard} />
      </div>
    </DashboardLayout>
  );
};

export default Leaderboard;
