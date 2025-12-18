import { useAnimatedCounter } from '@/hooks/useAnimatedCounter';

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

export const AnimatedCounter = ({
  value,
  duration = 2000,
  decimals = 0,
  prefix = '',
  suffix = '',
  className = '',
}: AnimatedCounterProps) => {
  const { displayValue } = useAnimatedCounter(value, {
    duration,
    decimals,
    prefix,
    suffix,
  });

  return <span className={className}>{displayValue}</span>;
};

