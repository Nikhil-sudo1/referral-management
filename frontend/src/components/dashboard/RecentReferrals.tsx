import { referrals, universities, programs } from '@/data/mockData';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ReferralStatus } from '@/types/referral';
import { formatDistanceToNow } from 'date-fns';
import { FileText, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const statusConfig: Record<ReferralStatus, { bg: string; text: string; dot: string }> = {
  submitted: { bg: 'bg-info/10', text: 'text-info', dot: 'bg-info' },
  assigned: { bg: 'bg-warning/10', text: 'text-warning', dot: 'bg-warning' },
  contacted: { bg: 'bg-accent/10', text: 'text-accent', dot: 'bg-accent' },
  admitted: { bg: 'bg-success/10', text: 'text-success', dot: 'bg-success' },
  rejected: { bg: 'bg-destructive/10', text: 'text-destructive', dot: 'bg-destructive' },
};

export const RecentReferrals = () => {
  const navigate = useNavigate();
  const recentReferrals = referrals
    .sort((a, b) => b.submissionDate.getTime() - a.submissionDate.getTime())
    .slice(0, 5);

  return (
    <Card className="card-elevated overflow-hidden animate-slide-up">
      <CardHeader className="pb-4 bg-gradient-to-r from-primary/5 via-transparent to-transparent border-b border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-info/20 flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <h3 className="font-display text-lg text-foreground">Recent Referrals</h3>
          </div>
          <button 
            onClick={() => navigate('/referrals')}
            className="text-xs text-primary hover:text-primary/80 font-semibold hover:underline underline-offset-4 transition-colors flex items-center gap-1"
          >
            View All <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-border/50">
          {recentReferrals.map((referral, index) => {
            const university = universities.find((u) => u.id === referral.universityId);
            const program = programs.find((p) => p.id === referral.programId);
            const status = statusConfig[referral.status];

            return (
              <div 
                key={referral.id} 
                className="p-4 hover:bg-muted/30 transition-all duration-300 cursor-pointer group"
                onClick={() => navigate('/referrals')}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 min-w-0 flex-1">
                    {/* Avatar */}
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-sm shadow-lg flex-shrink-0">
                      {referral.refereeName.split(' ').map(n => n[0]).join('')}
                    </div>
                    
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                          {referral.refereeName}
                        </p>
                        <Badge
                          variant="outline"
                          className={cn(
                            'text-[10px] font-semibold uppercase tracking-wide border-0 px-2 py-0.5',
                            status.bg,
                            status.text
                          )}
                        >
                          <span className={cn('w-1.5 h-1.5 rounded-full mr-1.5', status.dot)} />
                          {referral.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground font-medium">
                        {university?.name} • {program?.name}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Referred by <span className="font-medium text-foreground">{referral.referrerName}</span>
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right flex-shrink-0">
                    <p className="font-mono text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-lg">
                      {referral.referralCode}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {formatDistanceToNow(referral.submissionDate, { addSuffix: true })}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
