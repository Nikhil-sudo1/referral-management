import { LeaderboardEntry } from '@/types/referral';
import { Trophy, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LeaderboardCardProps {
  title: string;
  entries: LeaderboardEntry[];
  showRewards?: boolean;
}

export const LeaderboardCard = ({ title, entries, showRewards = true }: LeaderboardCardProps) => {
  const getRankBadge = (rank: number) => {
    const styles = {
      1: 'bg-gradient-to-br from-yellow-400 to-amber-500 text-yellow-950',
      2: 'bg-gradient-to-br from-slate-300 to-slate-400 text-slate-800',
      3: 'bg-gradient-to-br from-amber-600 to-amber-700 text-amber-100',
    };
    return styles[rank as keyof typeof styles] || 'bg-muted text-muted-foreground';
  };

  return (
    <div className="bg-card rounded-xl border border-border shadow-sm animate-slide-up">
      <div className="p-5 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-warning/10">
            <Trophy className="w-5 h-5 text-warning" />
          </div>
          <h3 className="font-semibold text-card-foreground">{title}</h3>
        </div>
      </div>
      <div className="p-4 space-y-3">
        {entries.slice(0, 5).map((entry) => (
          <div
            key={entry.userId}
            className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors"
          >
            <div
              className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm',
                getRankBadge(entry.rank)
              )}
            >
              {entry.rank}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-card-foreground truncate">{entry.userName}</p>
              <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                <span>{entry.totalReferrals} referrals</span>
                <span>•</span>
                <span>{entry.conversionRate}% conv.</span>
              </div>
            </div>
            <div className="text-right">
              {showRewards && (
                <p className="font-semibold text-card-foreground">{entry.totalRewards.toLocaleString()} pts</p>
              )}
              <div className="flex items-center gap-1 text-xs text-success mt-0.5">
                <TrendingUp className="w-3 h-3" />
                <span>+{entry.growthRate}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
