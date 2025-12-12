import { ReferrerLayout } from '@/components/layout/ReferrerLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Medal, Award, Crown, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

const leaderboard = [
  { rank: 1, name: 'Rajesh Kumar', referrals: 45, admissions: 32, earnings: 450000, tier: 'Platinum', conversionRate: 71.1, growthRate: 12 },
  { rank: 2, name: 'Priya Sharma', referrals: 38, admissions: 28, earnings: 380000, tier: 'Platinum', conversionRate: 73.7, growthRate: 8 },
  { rank: 3, name: 'Amit Patel', referrals: 35, admissions: 25, earnings: 350000, tier: 'Platinum', conversionRate: 71.4, growthRate: 15 },
  { rank: 4, name: 'Sneha Reddy', referrals: 32, admissions: 22, earnings: 320000, tier: 'Gold', conversionRate: 68.8, growthRate: 5 },
  { rank: 5, name: 'Vikram Singh', referrals: 28, admissions: 20, earnings: 280000, tier: 'Gold', conversionRate: 71.4, growthRate: 10 },
  { rank: 6, name: 'Anjali Mehta', referrals: 25, admissions: 18, earnings: 250000, tier: 'Gold', conversionRate: 72.0, growthRate: 7 },
  { rank: 7, name: 'Rohit Verma', referrals: 22, admissions: 16, earnings: 220000, tier: 'Gold', conversionRate: 72.7, growthRate: 3 },
  { rank: 8, name: 'Kavita Nair', referrals: 20, admissions: 15, earnings: 200000, tier: 'Gold', conversionRate: 75.0, growthRate: 6 },
  { rank: 9, name: 'Suresh Iyer', referrals: 18, admissions: 13, earnings: 180000, tier: 'Silver', conversionRate: 72.2, growthRate: 2 },
  { rank: 10, name: 'Meera Joshi', referrals: 16, admissions: 12, earnings: 160000, tier: 'Silver', conversionRate: 75.0, growthRate: 4 },
  { rank: 11, name: 'Arjun Desai', referrals: 15, admissions: 11, earnings: 150000, tier: 'Silver', conversionRate: 73.3, growthRate: 1 },
  { rank: 12, name: 'John Smith', referrals: 15, admissions: 8, earnings: 85000, tier: 'Gold', conversionRate: 53.3, growthRate: -2 },
];

const currentUser = leaderboard.find(u => u.name === 'John Smith')!;

const ReferrerLeaderboard = () => {
  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-6 h-6 text-warning" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-muted-foreground" />;
    if (rank === 3) return <Medal className="w-6 h-6 text-warning" />;
    return <span className="text-lg font-bold text-muted-foreground">#{rank}</span>;
  };

  const getTierColor = (tier: string) => {
    if (tier === 'Platinum') return 'bg-info/20 text-info border-info/30';
    if (tier === 'Gold') return 'bg-warning/20 text-warning border-warning/30';
    return 'bg-muted text-muted-foreground border-border';
  };

  const getGrowthIcon = (growthRate: number) => {
    if (growthRate > 0) return <TrendingUp className="w-3 h-3" />;
    if (growthRate < 0) return <TrendingDown className="w-3 h-3" />;
    return <Minus className="w-3 h-3" />;
  };

  const getGrowthColor = (growthRate: number) => {
    if (growthRate > 0) return 'text-success';
    if (growthRate < 0) return 'text-destructive';
    return 'text-muted-foreground';
  };

  // Top 3 for podium
  const topThree = [leaderboard[1], leaderboard[0], leaderboard[2]]; // 2nd, 1st, 3rd

  return (
    <ReferrerLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center shadow-xl glow-primary">
              <Trophy className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-display text-foreground">Leaderboard</h1>
              <p className="text-muted-foreground mt-1">See how you rank among top referrers</p>
            </div>
          </div>
        </div>

        {/* Current User Card */}
        <Card className="card-elevated bg-gradient-to-r from-primary/20 to-info/20 border-primary/30">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center text-xl font-bold text-white shadow-lg">
                  {currentUser.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-xl font-display text-foreground">{currentUser.name}</p>
                    <Badge className={cn('border', getTierColor(currentUser.tier))}>{currentUser.tier}</Badge>
                  </div>
                  <p className="text-muted-foreground">Your Rank: <span className="font-semibold text-foreground">#{currentUser.rank}</span></p>
                </div>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                <div className="text-center lg:text-left">
                  <p className="text-2xl font-display text-foreground">{currentUser.referrals}</p>
                  <p className="text-xs text-muted-foreground">Referrals</p>
                </div>
                <div className="text-center lg:text-left">
                  <p className="text-2xl font-display text-foreground">{currentUser.admissions}</p>
                  <p className="text-xs text-muted-foreground">Admissions</p>
                </div>
                <div className="text-center lg:text-left">
                  <p className="text-2xl font-display text-foreground">{currentUser.conversionRate}%</p>
                  <p className="text-xs text-muted-foreground">Conversion</p>
                </div>
                <div className="text-center lg:text-left">
                  <p className="text-2xl font-display text-success">₹{(currentUser.earnings / 1000).toFixed(0)}k</p>
                  <p className="text-xs text-muted-foreground">Earnings</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top 3 Podium */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {topThree.map((user, idx) => {
            const position = idx === 1 ? 1 : idx === 0 ? 2 : 3;
            if (!user) return null;
            return (
              <Card 
                key={position}
                className={cn(
                  'card-interactive relative overflow-hidden',
                  position === 1 && 'md:scale-105 md:-translate-y-2 border-warning/30'
                )}
              >
                {position === 1 && (
                  <div className="absolute top-0 right-0 w-20 h-20 bg-warning/10 rounded-bl-full -mr-10 -mt-10" />
                )}
                <CardContent className="p-6 text-center relative">
                  <div className="flex justify-center mb-4">
                    {getRankIcon(position)}
                  </div>
                  <div className={cn(
                    'w-16 h-16 rounded-full mx-auto mb-3 shadow-lg flex items-center justify-center text-xl font-bold text-white',
                    position === 1 ? 'gradient-warning' : 'gradient-primary'
                  )}>
                    {user.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <p className="font-display text-foreground mb-1">{user.name}</p>
                  <Badge className={cn('border mb-3', getTierColor(user.tier))}>{user.tier}</Badge>
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Referrals</span>
                      <span className="font-semibold text-foreground">{user.referrals}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Admissions</span>
                      <span className="font-semibold text-foreground">{user.admissions}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Conversion</span>
                      <span className="font-semibold text-success">{user.conversionRate}%</span>
                    </div>
                    <div className="flex justify-between text-sm pt-2 border-t border-border">
                      <span className="text-muted-foreground">Earnings</span>
                      <span className="font-bold text-success">₹{(user.earnings / 1000).toFixed(0)}k</span>
                    </div>
                    <div className="flex items-center justify-center gap-1 text-xs mt-2">
                      <span className={getGrowthColor(user.growthRate)}>
                        {getGrowthIcon(user.growthRate)}
                      </span>
                      <span className={cn('font-medium', getGrowthColor(user.growthRate))}>
                        {user.growthRate > 0 ? '+' : ''}{user.growthRate}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Full Leaderboard */}
        <Card className="card-elevated">
          <CardHeader className="border-b border-border pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-display flex items-center gap-2">
                <Trophy className="w-5 h-5 text-warning" />
                Full Leaderboard
              </CardTitle>
              <Badge variant="outline" className="text-xs">
                {leaderboard.length} Referrers
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Rank</th>
                    <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Referrer</th>
                    <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Tier</th>
                    <th className="text-right p-4 text-sm font-semibold text-muted-foreground">Referrals</th>
                    <th className="text-right p-4 text-sm font-semibold text-muted-foreground">Admissions</th>
                    <th className="text-right p-4 text-sm font-semibold text-muted-foreground">Conversion</th>
                    <th className="text-right p-4 text-sm font-semibold text-muted-foreground">Earnings</th>
                    <th className="text-center p-4 text-sm font-semibold text-muted-foreground">Growth</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((user) => {
                    const isCurrentUser = user.name === currentUser.name;
                    return (
                      <tr 
                        key={user.rank} 
                        className={cn(
                          'border-b border-border hover:bg-muted/50 transition-colors',
                          isCurrentUser && 'bg-primary/10 border-primary/20',
                          user.rank <= 3 && !isCurrentUser && 'bg-primary/5'
                        )}
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            {getRankIcon(user.rank)}
                            {isCurrentUser && (
                              <Badge className="bg-primary/20 text-primary border-0 text-xs">You</Badge>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              'w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-md',
                              user.rank <= 3 ? 'gradient-warning' : 'gradient-primary'
                            )}>
                              {user.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div>
                              <p className="font-medium text-foreground">{user.name}</p>
                              {user.rank <= 3 && (
                                <p className="text-xs text-muted-foreground">Top Performer</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge className={cn('border', getTierColor(user.tier))}>{user.tier}</Badge>
                        </td>
                        <td className="p-4 text-right">
                          <span className="font-semibold text-foreground">{user.referrals}</span>
                        </td>
                        <td className="p-4 text-right">
                          <span className="font-semibold text-success">{user.admissions}</span>
                        </td>
                        <td className="p-4 text-right">
                          <span className="font-semibold text-foreground">{user.conversionRate}%</span>
                        </td>
                        <td className="p-4 text-right">
                          <p className="font-bold text-success">₹{(user.earnings / 1000).toFixed(0)}k</p>
                        </td>
                        <td className="p-4 text-center">
                          <div className={cn('flex items-center justify-center gap-1 text-xs font-medium', getGrowthColor(user.growthRate))}>
                            {getGrowthIcon(user.growthRate)}
                            <span>{user.growthRate > 0 ? '+' : ''}{user.growthRate}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Tier Benefits */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="card-elevated bg-gradient-to-br from-info/10 to-cyan-500/10 border-info/20">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <Crown className="w-5 h-5 text-info" />
                <CardTitle className="text-lg font-display">Platinum Tier</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-info mt-0.5">•</span>
                  <span>50+ successful referrals</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-info mt-0.5">•</span>
                  <span>Priority support</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-info mt-0.5">•</span>
                  <span>Exclusive rewards</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-info mt-0.5">•</span>
                  <span>Higher commission rates</span>
                </li>
              </ul>
            </CardContent>
          </Card>
          <Card className="card-elevated bg-gradient-to-br from-warning/10 to-amber-500/10 border-warning/20">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <Award className="w-5 h-5 text-warning" />
                <CardTitle className="text-lg font-display">Gold Tier</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-warning mt-0.5">•</span>
                  <span>20-49 successful referrals</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-warning mt-0.5">•</span>
                  <span>Standard support</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-warning mt-0.5">•</span>
                  <span>Regular rewards</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-warning mt-0.5">•</span>
                  <span>Standard commission rates</span>
                </li>
              </ul>
            </CardContent>
          </Card>
          <Card className="card-elevated bg-gradient-to-br from-muted/50 to-slate-500/10 border-border">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <Medal className="w-5 h-5 text-muted-foreground" />
                <CardTitle className="text-lg font-display">Silver Tier</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-muted-foreground mt-0.5">•</span>
                  <span>10-19 successful referrals</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-muted-foreground mt-0.5">•</span>
                  <span>Basic support</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-muted-foreground mt-0.5">•</span>
                  <span>Standard rewards</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-muted-foreground mt-0.5">•</span>
                  <span>Standard commission rates</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </ReferrerLayout>
  );
};

export default ReferrerLeaderboard;
