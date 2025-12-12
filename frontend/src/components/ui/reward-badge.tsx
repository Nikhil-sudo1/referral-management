import { Badge } from '@/components/ui/badge';

interface RewardBadgeProps {
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  amount: number;
  size?: 'sm' | 'md' | 'lg';
}

export const RewardBadge = ({ tier, amount, size = 'md' }: RewardBadgeProps) => {
  const tierStyles = {
    platinum: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0',
    gold: 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0',
    silver: 'bg-gradient-to-r from-slate-400 to-gray-500 text-white border-0',
    bronze: 'bg-gradient-to-r from-amber-700 to-orange-700 text-white border-0',
  };

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5',
  };

  const icons = {
    platinum: '💎',
    gold: '🏆',
    silver: '🥈',
    bronze: '🥉',
  };

  return (
    <Badge className={`${tierStyles[tier]} ${sizeClasses[size]} font-bold`}>
      {icons[tier]} ${amount.toLocaleString()}
    </Badge>
  );
};

