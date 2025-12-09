import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { referrals, counselors } from '@/data/mockData';
import { formatDistanceToNow } from 'date-fns';
import { CheckCircle, UserPlus, FileText, Award, TrendingUp, AlertCircle } from 'lucide-react';

interface Activity {
  id: string;
  type: 'admission' | 'referral' | 'assignment' | 'reward';
  title: string;
  description: string;
  time: Date;
  icon: React.ElementType;
  color: string;
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
      });
    });

  // Sort all activities by time
  activities.sort((a, b) => b.time.getTime() - a.time.getTime());

  return (
    <Card className="border-2 hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-border" />
          
          {/* Activities */}
          <div className="space-y-6">
            {activities.slice(0, 8).map((activity, idx) => {
              const Icon = activity.icon;
              return (
                <div key={activity.id} className="relative flex gap-4 group">
                  {/* Timeline dot */}
                  <div className={`relative z-10 w-6 h-6 rounded-full bg-background border-2 border-border flex items-center justify-center group-hover:scale-125 transition-transform`}>
                    <Icon className={`w-3 h-3 ${activity.color}`} />
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 pb-2">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <p className="font-medium text-card-foreground text-sm">{activity.title}</p>
                        <p className="text-sm text-muted-foreground mt-0.5">{activity.description}</p>
                      </div>
                      <Badge variant="outline" className="text-xs whitespace-nowrap">
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

