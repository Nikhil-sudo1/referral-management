import { referrals, universities, programs } from '@/data/mockData';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ReferralStatus } from '@/types/referral';
import { formatDistanceToNow } from 'date-fns';

const statusStyles: Record<ReferralStatus, string> = {
  submitted: 'bg-info/10 text-info border-info/20',
  assigned: 'bg-warning/10 text-warning border-warning/20',
  contacted: 'bg-accent/10 text-accent border-accent/20',
  admitted: 'bg-success/10 text-success border-success/20',
  rejected: 'bg-destructive/10 text-destructive border-destructive/20',
};

export const RecentReferrals = () => {
  const recentReferrals = referrals
    .sort((a, b) => b.submissionDate.getTime() - a.submissionDate.getTime())
    .slice(0, 5);

  return (
    <div className="bg-card rounded-xl border border-border shadow-sm animate-slide-up">
      <div className="p-5 border-b border-border">
        <h3 className="font-semibold text-card-foreground">Recent Referrals</h3>
      </div>
      <div className="divide-y divide-border">
        {recentReferrals.map((referral) => {
          const university = universities.find((u) => u.id === referral.universityId);
          const program = programs.find((p) => p.id === referral.programId);

          return (
            <div key={referral.id} className="p-4 hover:bg-muted/30 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-card-foreground truncate">{referral.refereeName}</p>
                    <Badge
                      variant="outline"
                      className={cn('capitalize text-xs', statusStyles[referral.status])}
                    >
                      {referral.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {university?.name} • {program?.name}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Referred by {referral.referrerName}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs font-mono text-primary">{referral.referralCode}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDistanceToNow(referral.submissionDate, { addSuffix: true })}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
