import { useEffect, useState, useRef } from 'react';

interface UseAnimatedCounterOptions {
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
}

/**
 * Hook for animated number counters
 * Smoothly animates from 0 to target value
 */
export const useAnimatedCounter = (
  target: number,
  options: UseAnimatedCounterOptions = {}
) => {
  const {
    duration = 2000,
    decimals = 0,
    prefix = '',
    suffix = '',
  } = options;

  const [count, setCount] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const startTimeRef = useRef<number | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (target === 0) {
      setCount(0);
      return;
    }

    setIsAnimating(true);
    const startValue = count;
    const difference = target - startValue;
    const startTime = performance.now();
    startTimeRef.current = startTime;

    const animate = (currentTime: number) => {
      if (startTimeRef.current === null) return;

      const elapsed = currentTime - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentValue = startValue + difference * easeOut;

      setCount(currentValue);

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        setCount(target);
        setIsAnimating(false);
        startTimeRef.current = null;
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [target, duration]);

  const formattedValue = count.toFixed(decimals);
  const displayValue = `${prefix}${formattedValue}${suffix}`;

  return { count, displayValue, isAnimating };
};

