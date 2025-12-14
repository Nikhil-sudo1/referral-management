import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, TrendingUp, Medal, Crown, Star, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { leaderboardAPI, type LeaderboardEntry } from '@/lib/api';

const Leaderboard = () => {
  const [referrerLeaderboard, setReferrerLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [counselorLeaderboard, setCounselorLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboards();
  }, []);

  const fetchLeaderboards = async () => {
    setIsLoading(true);
    try {
      const [referrerData, counselorData] = await Promise.all([
        leaderboardAPI.getReferrerLeaderboard({ limit: 50 }),
        leaderboardAPI.getCounselorLeaderboard({ limit: 50 }),
      ]);

      setReferrerLeaderboard(referrerData.entries || []);
      setCounselorLeaderboard(counselorData.entries || []);
    } catch (error) {
      console.error('Error fetching leaderboards:', error);
      toast({
        title: 'Error',
        description: 'Failed to load leaderboard data',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-6 h-6 text-warning" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-muted-foreground" />;
    if (rank === 3) return <Medal className="w-6 h-6 text-warning" />;
    return <span className="text-lg font-bold text-muted-foreground">#{rank}</span>;
  };

  const getRankBg = (rank: number) => {
    if (rank === 1) return 'bg-gradient-to-br from-warning/10 to-amber-100/50 border-warning/30';
    if (rank === 2) return 'bg-gradient-to-br from-muted/50 to-slate-100/50 border-border';
    if (rank === 3) return 'bg-gradient-to-br from-warning/10 to-orange-100/50 border-warning/20';
    return 'bg-card border-border';
  };

  const LeaderboardList = ({ entries }: { entries: LeaderboardEntry[] }) => {
    // Handle empty state
    if (entries.length === 0) {
      return (
        <div className="text-center py-12">
          <Trophy className="w-16 h-16 mx-auto text-muted-foreground mb-4 opacity-50" />
          <h3 className="text-xl font-bold text-card-foreground mb-2">No Leaderboard Data</h3>
          <p className="text-muted-foreground">No rankings available at this time.</p>
        </div>
      );
    }

    // Get top 3 for podium (with safe array access)
    const topThree = entries.length >= 3 
      ? [entries[1], entries[0], entries[2]] // Podium order: 2nd, 1st, 3rd
      : entries.slice(0, 3); // If less than 3, just show what we have

    return (
      <div className="space-y-4">
        {/* Top 3 Podium */}
        {entries.length >= 3 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {topThree.map((entry, idx) => {
              const position = idx === 1 ? 1 : idx === 0 ? 2 : 3;
              return (
                <Card
                  key={entry?.user_id || idx}
                  className={cn(
                    'border-2 transition-all hover:shadow-lg',
                    getRankBg(position),
                    position === 1 && 'md:order-2 md:scale-105'
                  )}
                >
                  <CardContent className="p-6 text-center">
                    <div className="mb-4 flex justify-center">{getRankIcon(position)}</div>
                    <h3 className="text-xl font-bold text-card-foreground mb-1">
                      {entry?.user_name || 'Unknown'}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {entry?.user_email || ''}
                    </p>
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <p className="text-2xl font-bold text-primary">
                          {entry?.total_referrals || 0}
                        </p>
                        <p className="text-xs text-muted-foreground">Referrals</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-success">
                          {entry?.successful_referrals || 0}
                        </p>
                        <p className="text-xs text-muted-foreground">Success</p>
                      </div>
                    </div>
                    {entry?.conversion_rate !== undefined && (
                      <div className="mt-4 pt-4 border-t border-border">
                        <div className="flex items-center justify-center gap-2">
                          <TrendingUp className="w-4 h-4 text-success" />
                          <span className="text-sm font-semibold text-card-foreground">
                            {entry.conversion_rate.toFixed(1)}% conversion
                          </span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Rest of the list */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-primary" />
              Full Rankings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {entries.map((entry) => (
                <div
                  key={entry.user_id}
                  className={cn(
                    'flex items-center justify-between p-4 rounded-lg border-2 transition-all hover:shadow-md',
                    getRankBg(entry.rank)
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 flex justify-center">
                      {getRankIcon(entry.rank)}
                    </div>
                    <div>
                      <h4 className="font-semibold text-card-foreground">
                        {entry.user_name}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {entry.user_email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Referrals</p>
                      <p className="text-lg font-bold text-card-foreground">
                        {entry.total_referrals}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Success</p>
                      <p className="text-lg font-bold text-success">
                        {entry.successful_referrals}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Rate</p>
                      <Badge variant="outline" className="bg-primary/10 text-primary">
                        {entry.conversion_rate?.toFixed(1) || 0}%
                      </Badge>
                    </div>
                    {entry.total_rewards !== undefined && (
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Rewards</p>
                        <p className="text-lg font-bold text-warning">
                          ₹{entry.total_rewards.toLocaleString()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
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
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Leaderboard</h1>
          <p className="text-muted-foreground mt-1">Top performers based on successful referrals</p>
        </div>

        {/* Tabs for different leaderboards */}
        <Tabs defaultValue="referrers" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="referrers" className="flex items-center gap-2">
              <Star className="w-4 h-4" />
              Referrers
            </TabsTrigger>
            <TabsTrigger value="counselors" className="flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              Counselors
            </TabsTrigger>
          </TabsList>

          <TabsContent value="referrers" className="mt-6">
            <LeaderboardList entries={referrerLeaderboard} />
          </TabsContent>

          <TabsContent value="counselors" className="mt-6">
            <LeaderboardList entries={counselorLeaderboard} />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Leaderboard;
