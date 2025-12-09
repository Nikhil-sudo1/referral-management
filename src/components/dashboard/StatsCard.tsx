import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: LucideIcon;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'accent';
}

export const StatsCard = ({
  title,
  value,
  change,
  changeType = 'neutral',
  icon: Icon,
  variant = 'default',
}: StatsCardProps) => {
  const variants = {
    default: 'bg-card',
    primary: 'gradient-primary text-primary-foreground',
    success: 'gradient-success text-success-foreground',
    warning: 'gradient-warning text-warning-foreground',
    accent: 'bg-accent text-accent-foreground',
  };

  const iconBg = {
    default: 'bg-primary/10 text-primary',
    primary: 'bg-primary-foreground/20 text-primary-foreground',
    success: 'bg-success-foreground/20 text-success-foreground',
    warning: 'bg-warning-foreground/20 text-warning-foreground',
    accent: 'bg-accent-foreground/20 text-accent-foreground',
  };

  return (
    <div
      className={cn(
        'rounded-xl p-6 transition-all duration-200 hover:shadow-lg animate-fade-in',
        variants[variant],
        variant === 'default' && 'border border-border shadow-sm'
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className={cn('text-sm font-medium', variant === 'default' ? 'text-muted-foreground' : 'opacity-80')}>
            {title}
          </p>
          <p className="text-3xl font-bold mt-2">{value}</p>
          {change && (
            <p
              className={cn(
                'text-sm mt-2 flex items-center gap-1',
                changeType === 'positive' && (variant === 'default' ? 'text-success' : 'opacity-90'),
                changeType === 'negative' && (variant === 'default' ? 'text-destructive' : 'opacity-90'),
                changeType === 'neutral' && (variant === 'default' ? 'text-muted-foreground' : 'opacity-75')
              )}
            >
              {change}
            </p>
          )}
        </div>
        <div className={cn('p-3 rounded-xl', iconBg[variant])}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};
