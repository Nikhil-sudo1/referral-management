import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { referrals, counselors } from '@/data/mockData';
import { formatDistanceToNow } from 'date-fns';
import { CheckCircle, UserPlus, FileText, Activity } from 'lucide-react';

interface Activity {
  id: string;
  type: 'admission' | 'referral' | 'assignment' | 'reward';
  title: string;
  description: string;
  time: Date;
  icon: React.ElementType;
  color: string;
  bgColor: string;
}

export const ActivityTimeline = () => {
  // Generate activities from referrals
  const activities: Activity[] = [];

  // Recent admissions
  referrals
    .filter((r) => r.status === 'admitted' && r.admissionDate)
    .sort((a, b) => (b.admissionDate?.getTime() || 0) - (a.admissionDate?.getTime() || 0))
    .slice(0, 3)
    .forEach((r) => {
      activities.push({
        id: `admission-${r.id}`,
        type: 'admission',
        title: 'New Admission',
        description: `${r.refereeName} admitted to program`,
        time: r.admissionDate!,
        icon: CheckCircle,
        color: 'text-success',
        bgColor: 'bg-success/10',
      });
    });

  // Recent referrals
  referrals
    .sort((a, b) => b.submissionDate.getTime() - a.submissionDate.getTime())
    .slice(0, 3)
    .forEach((r) => {
      activities.push({
        id: `referral-${r.id}`,
        type: 'referral',
        title: 'New Referral',
        description: `${r.refereeName} referred by ${r.referrerName}`,
        time: r.submissionDate,
        icon: FileText,
        color: 'text-primary',
        bgColor: 'bg-primary/10',
      });
    });

  // Recent assignments
  referrals
    .filter((r) => r.status === 'assigned' && r.counselorId)
    .sort((a, b) => b.submissionDate.getTime() - a.submissionDate.getTime())
    .slice(0, 2)
    .forEach((r) => {
      const counselor = counselors.find((c) => c.id === r.counselorId);
      activities.push({
        id: `assignment-${r.id}`,
        type: 'assignment',
        title: 'Counselor Assigned',
        description: `${counselor?.name || 'Counselor'} assigned to ${r.refereeName}`,
        time: r.submissionDate,
        icon: UserPlus,
        color: 'text-warning',
        bgColor: 'bg-warning/10',
      });
    });

  // Sort all activities by time
  activities.sort((a, b) => b.time.getTime() - a.time.getTime());

  return (
    <Card className="card-elevated overflow-hidden animate-slide-up">
      <CardHeader className="pb-4 bg-gradient-to-r from-info/5 via-transparent to-transparent border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-info/20 to-cyan-500/20 flex items-center justify-center">
            <Activity className="w-5 h-5 text-info" />
          </div>
          <div>
            <h3 className="font-display text-lg text-foreground">Recent Activity</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Latest updates</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-[19px] top-0 bottom-0 w-px bg-gradient-to-b from-border via-border to-transparent" />
          
          {/* Activities */}
          <div className="space-y-4">
            {activities.slice(0, 6).map((activity, idx) => {
              const Icon = activity.icon;
              return (
                <div 
                  key={activity.id} 
                  className="relative flex gap-4 group"
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  {/* Timeline dot */}
                  <div className={`relative z-10 w-10 h-10 rounded-xl ${activity.bgColor} flex items-center justify-center transition-transform group-hover:scale-110`}>
                    <Icon className={`w-4 h-4 ${activity.color}`} />
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 pb-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="font-semibold text-foreground text-sm group-hover:text-primary transition-colors">
                          {activity.title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {activity.description}
                        </p>
                      </div>
                      <Badge 
                        variant="outline" 
                        className="text-[10px] whitespace-nowrap font-medium bg-muted/50 border-0"
                      >
                        {formatDistanceToNow(activity.time, { addSuffix: true })}
                      </Badge>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
