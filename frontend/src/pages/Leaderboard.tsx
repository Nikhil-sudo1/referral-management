import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { leaderboard, counselorLeaderboard } from '@/data/mockData';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, TrendingUp, Medal, Crown, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

const Leaderboard = () => {
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

  const LeaderboardList = ({ entries }: { entries: typeof leaderboard }) => {
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
                  key={entry?.userId || idx}
                  className={cn(
                    'card-interactive relative overflow-hidden',
                    position === 1 && 'md:scale-105 md:-translate-y-2 border-warning/30'
                  )}
                >
                  {position === 1 && entry && (
                    <div className="absolute top-0 right-0 w-20 h-20 bg-warning/10 rounded-bl-full -mr-10 -mt-10" />
                  )}
                  <CardContent className="p-6 text-center relative">
                    {entry ? (
                      <>
                        <div className="flex justify-center mb-4">{getRankIcon(position)}</div>
                        <div className={cn(
                          'w-16 h-16 rounded-full mx-auto mb-3 shadow-lg flex items-center justify-center text-xl font-bold text-white',
                          position === 1 ? 'gradient-warning' : 'gradient-primary'
                        )}>
                          {entry.userName.split(' ').map((n) => n[0]).join('')}
                        </div>
                        <h3 className="font-display text-foreground mb-2">{entry.userName}</h3>
                        <div className="space-y-2 mt-4">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Referrals</span>
                            <span className="font-semibold text-foreground">{entry.totalReferrals}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Admissions</span>
                            <span className="font-semibold text-success">{entry.totalAdmissions}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Conversion</span>
                            <span className="font-semibold text-foreground">{entry.conversionRate}%</span>
                          </div>
                          <div className="flex justify-between text-sm pt-2 border-t border-border">
                            <span className="text-muted-foreground">Rewards</span>
                            <span className="font-bold text-primary">₹{entry.totalRewards.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center justify-center gap-1 text-success text-xs mt-2">
                            <TrendingUp className="w-3 h-3" />
                            <span className="font-medium">+{entry.growthRate}%</span>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="py-8 text-muted-foreground">No data</div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

      {/* Full List */}
      <Card className="card-elevated">
        <CardHeader className="border-b border-border pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-display flex items-center gap-2">
              <Trophy className="w-5 h-5 text-warning" />
              Full Leaderboard
            </CardTitle>
            <Badge variant="outline" className="text-xs">
              {entries.length} {entries === leaderboard ? 'Referrers' : 'Counselors'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Rank</th>
                  <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Name</th>
                  <th className="text-right p-4 text-sm font-semibold text-muted-foreground">Referrals</th>
                  <th className="text-right p-4 text-sm font-semibold text-muted-foreground">Admissions</th>
                  <th className="text-right p-4 text-sm font-semibold text-muted-foreground">Conversion</th>
                  <th className="text-right p-4 text-sm font-semibold text-muted-foreground">Rewards</th>
                  <th className="text-center p-4 text-sm font-semibold text-muted-foreground">Growth</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => (
                  <tr
                    key={entry.userId}
                    className={cn(
                      'border-b border-border hover:bg-muted/50 transition-colors',
                      entry.rank <= 3 && 'bg-primary/5'
                    )}
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {getRankIcon(entry.rank)}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          'w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-md',
                          entry.rank <= 3 ? 'gradient-warning' : 'gradient-primary'
                        )}>
                          {entry.userName.split(' ').map((n) => n[0]).join('')}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{entry.userName}</p>
                          {entry.rank <= 3 && (
                            <p className="text-xs text-muted-foreground">Top Performer</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <span className="font-semibold text-foreground">{entry.totalReferrals}</span>
                    </td>
                    <td className="p-4 text-right">
                      <span className="font-semibold text-success">{entry.totalAdmissions}</span>
                    </td>
                    <td className="p-4 text-right">
                      <span className="font-semibold text-foreground">{entry.conversionRate}%</span>
                    </td>
                    <td className="p-4 text-right">
                      <span className="font-bold text-primary">₹{entry.totalRewards.toLocaleString()}</span>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-1 text-xs text-success font-medium">
                        <TrendingUp className="w-3 h-3" />
                        <span>+{entry.growthRate}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center shadow-xl glow-primary">
              <Trophy className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-display text-foreground">Leaderboard</h1>
              <p className="text-muted-foreground mt-1">Top performers this month</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="referrers" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="referrers" className="flex items-center gap-2">
              <Star className="w-4 h-4" />
              Top Referrers
            </TabsTrigger>
            <TabsTrigger value="counselors" className="flex items-center gap-2">
              <Medal className="w-4 h-4" />
              Top Counselors
            </TabsTrigger>
          </TabsList>
          <TabsContent value="referrers" className="mt-6">
            <LeaderboardList entries={leaderboard} />
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
