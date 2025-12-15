import { LeaderboardEntry } from '@/types/referral';
import { Trophy, TrendingUp, Medal, Crown, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

interface LeaderboardCardProps {
  title: string;
  entries: LeaderboardEntry[];
  showRewards?: boolean;
}

export const LeaderboardCard = ({ title, entries, showRewards = true }: LeaderboardCardProps) => {
  const navigate = useNavigate();

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-4 h-4 text-yellow-500" />;
      case 2:
        return <Medal className="w-4 h-4 text-slate-400" />;
      case 3:
        return <Medal className="w-4 h-4 text-amber-600" />;
      default:
        return <Star className="w-3 h-3 text-muted-foreground" />;
    }
  };

  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-br from-yellow-400 to-amber-500 text-yellow-950 shadow-lg shadow-yellow-500/30';
      case 2:
        return 'bg-gradient-to-br from-slate-300 to-slate-400 text-slate-800 shadow-lg shadow-slate-400/30';
      case 3:
        return 'bg-gradient-to-br from-amber-500 to-amber-600 text-amber-100 shadow-lg shadow-amber-500/30';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <Card className="card-elevated overflow-hidden animate-slide-up">
      <CardHeader className="pb-4 bg-gradient-to-r from-warning/5 via-transparent to-transparent border-b border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-warning/20 to-orange-500/20 flex items-center justify-center">
              <Trophy className="w-5 h-5 text-warning" />
            </div>
            <h3 className="font-display text-lg text-foreground">{title}</h3>
          </div>
          <button 
            onClick={() => navigate('/leaderboard')}
            className="text-xs text-primary hover:text-primary/80 font-semibold hover:underline underline-offset-4 transition-colors"
          >
            View All →
          </button>
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-2">
        {entries.slice(0, 5).map((entry, index) => (
          <div
            key={entry.userId || entry.user_id || index}
            className="group flex items-center gap-4 p-3 rounded-xl hover:bg-muted/50 transition-all duration-300 cursor-pointer"
            onClick={() => navigate('/leaderboard')}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            {/* Rank Badge */}
            <div
              className={cn(
                'w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm transition-transform group-hover:scale-110',
                getRankStyle(entry.rank)
              )}
            >
              {entry.rank <= 3 ? getRankIcon(entry.rank) : entry.rank}
            </div>
            
            {/* User Info */}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                {entry.userName || entry.name || 'Unknown'}
              </p>
              <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                <span className="font-medium">{entry.totalReferrals || 0} referrals</span>
                <span className="w-1 h-1 rounded-full bg-border" />
                <span className="font-medium">{entry.conversionRate || 0}% conv.</span>
              </div>
            </div>
            
            {/* Stats */}
            <div className="text-right">
              {showRewards && (
                <p className="font-mono font-bold text-foreground text-sm">
                  {entry.totalRewards ? (typeof entry.totalRewards === 'number' ? entry.totalRewards.toLocaleString() : entry.totalRewards) : '0'} pts
                </p>
              )}
              <div className="flex items-center gap-1 text-xs text-success font-medium mt-1 justify-end">
                <TrendingUp className="w-3 h-3" />
                <span>+{entry.growthRate || 0}%</span>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
