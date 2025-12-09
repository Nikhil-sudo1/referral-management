import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { leaderboard, counselorLeaderboard } from '@/data/mockData';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, TrendingUp, Medal, Crown, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

const Leaderboard = () => {
  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-6 h-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-slate-400" />;
    if (rank === 3) return <Medal className="w-6 h-6 text-amber-600" />;
    return <span className="text-lg font-bold text-muted-foreground">#{rank}</span>;
  };

  const getRankBg = (rank: number) => {
    if (rank === 1) return 'bg-gradient-to-br from-yellow-50 to-amber-100 border-yellow-300';
    if (rank === 2) return 'bg-gradient-to-br from-slate-50 to-slate-100 border-slate-300';
    if (rank === 3) return 'bg-gradient-to-br from-amber-50 to-orange-100 border-amber-300';
    return 'bg-card border-border';
  };

  const LeaderboardList = ({ entries }: { entries: typeof leaderboard }) => (
    <div className="space-y-4">
      {/* Top 3 Podium */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[entries[1], entries[0], entries[2]].map((entry, idx) => {
          const position = idx === 1 ? 1 : idx === 0 ? 2 : 3;
          return (
            <div
              key={entry?.userId}
              className={cn(
                'rounded-xl p-6 text-center border-2 transition-all hover:shadow-lg',
                position === 1 ? 'transform -translate-y-4' : '',
                entry ? getRankBg(position) : 'bg-muted/30'
              )}
            >
              {entry && (
                <>
                  <div className="flex justify-center mb-3">{getRankIcon(position)}</div>
                  <div className="w-16 h-16 rounded-full gradient-primary mx-auto flex items-center justify-center text-primary-foreground text-xl font-bold mb-3">
                    {entry.userName.split(' ').map((n) => n[0]).join('')}
                  </div>
                  <h3 className="font-semibold text-card-foreground">{entry.userName}</h3>
                  <p className="text-2xl font-bold text-primary mt-2">{entry.totalRewards.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">points</p>
                  <div className="flex items-center justify-center gap-1 text-success text-sm mt-2">
                    <TrendingUp className="w-3 h-3" />
                    <span>+{entry.growthRate}%</span>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Full List */}
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border bg-muted/30">
          <div className="grid grid-cols-12 gap-4 text-sm font-medium text-muted-foreground">
            <div className="col-span-1">Rank</div>
            <div className="col-span-3">Name</div>
            <div className="col-span-2 text-center">Referrals</div>
            <div className="col-span-2 text-center">Admissions</div>
            <div className="col-span-2 text-center">Conv. Rate</div>
            <div className="col-span-2 text-right">Points</div>
          </div>
        </div>
        <div className="divide-y divide-border">
          {entries.map((entry) => (
            <div
              key={entry.userId}
              className={cn(
                'p-4 grid grid-cols-12 gap-4 items-center hover:bg-muted/30 transition-colors',
                entry.rank <= 3 && 'bg-primary/5'
              )}
            >
              <div className="col-span-1">
                <div className="flex items-center justify-center w-8 h-8">{getRankIcon(entry.rank)}</div>
              </div>
              <div className="col-span-3 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center font-medium text-muted-foreground">
                  {entry.userName.split(' ').map((n) => n[0]).join('')}
                </div>
                <div>
                  <p className="font-medium text-card-foreground">{entry.userName}</p>
                  <div className="flex items-center gap-1 text-xs text-success">
                    <TrendingUp className="w-3 h-3" />
                    <span>+{entry.growthRate}%</span>
                  </div>
                </div>
              </div>
              <div className="col-span-2 text-center font-medium text-card-foreground">{entry.totalReferrals}</div>
              <div className="col-span-2 text-center font-medium text-success">{entry.totalAdmissions}</div>
              <div className="col-span-2 text-center font-medium text-card-foreground">{entry.conversionRate}%</div>
              <div className="col-span-2 text-right">
                <span className="text-lg font-bold text-primary">{entry.totalRewards.toLocaleString()}</span>
                <span className="text-xs text-muted-foreground ml-1">pts</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl gradient-warning">
            <Trophy className="w-8 h-8 text-warning-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Leaderboard</h1>
            <p className="text-muted-foreground mt-1">Top performers this month</p>
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
