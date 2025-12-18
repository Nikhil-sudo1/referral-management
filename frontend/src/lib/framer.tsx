/**
 * Framer Motion Animation Utilities
 * Reusable animation components and variants for consistent UI/UX
 */
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { ReactNode } from 'react';

// ============================================
// ANIMATION VARIANTS
// ============================================

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: 0.5, ease: 'easeOut' }
  },
  exit: { opacity: 0, transition: { duration: 0.3 } }
};

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
  },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3 } }
};

export const fadeInDown: Variants = {
  hidden: { opacity: 0, y: -30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
  }
};

export const fadeInLeft: Variants = {
  hidden: { opacity: 0, x: -50 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
  }
};

export const fadeInRight: Variants = {
  hidden: { opacity: 0, x: 50 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
  }
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
  },
  exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } }
};

export const slideInFromBottom: Variants = {
  hidden: { opacity: 0, y: '100%' },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
  },
  exit: { opacity: 0, y: '100%', transition: { duration: 0.3 } }
};

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
  }
};

export const cardHover: Variants = {
  rest: { scale: 1, y: 0 },
  hover: { 
    scale: 1.02, 
    y: -5,
    transition: { duration: 0.3, ease: 'easeOut' }
  },
  tap: { scale: 0.98 }
};

export const buttonHover: Variants = {
  rest: { scale: 1 },
  hover: { 
    scale: 1.05,
    transition: { duration: 0.2, ease: 'easeOut' }
  },
  tap: { scale: 0.95 }
};

export const pulseGlow: Variants = {
  animate: {
    boxShadow: [
      '0 0 20px rgba(var(--primary), 0.3)',
      '0 0 40px rgba(var(--primary), 0.5)',
      '0 0 20px rgba(var(--primary), 0.3)'
    ],
    transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' }
  }
};

// ============================================
// REUSABLE COMPONENTS
// ============================================

interface MotionWrapperProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

// Fade In Component
export const FadeIn = ({ children, className = '', delay = 0 }: MotionWrapperProps) => (
  <motion.div
    className={className}
    initial="hidden"
    animate="visible"
    variants={fadeIn}
    transition={{ delay }}
  >
    {children}
  </motion.div>
);

// Fade In Up Component
export const FadeInUp = ({ children, className = '', delay = 0 }: MotionWrapperProps) => (
  <motion.div
    className={className}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, margin: '-50px' }}
    variants={fadeInUp}
    transition={{ delay }}
  >
    {children}
  </motion.div>
);

// Scale In Component
export const ScaleIn = ({ children, className = '', delay = 0 }: MotionWrapperProps) => (
  <motion.div
    className={className}
    initial="hidden"
    animate="visible"
    variants={scaleIn}
    transition={{ delay }}
  >
    {children}
  </motion.div>
);

// Stagger Container
export const StaggerContainer = ({ children, className = '' }: MotionWrapperProps) => (
  <motion.div
    className={className}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, margin: '-50px' }}
    variants={staggerContainer}
  >
    {children}
  </motion.div>
);

// Stagger Item
export const StaggerItem = ({ children, className = '' }: MotionWrapperProps) => (
  <motion.div className={className} variants={staggerItem}>
    {children}
  </motion.div>
);

// Animated Card
interface AnimatedCardProps extends MotionWrapperProps {
  onClick?: () => void;
}

export const AnimatedCard = ({ children, className = '', onClick }: AnimatedCardProps) => (
  <motion.div
    className={className}
    variants={cardHover}
    initial="rest"
    whileHover="hover"
    whileTap="tap"
    onClick={onClick}
  >
    {children}
  </motion.div>
);

// Animated Button
export const AnimatedButton = ({ children, className = '', onClick }: AnimatedCardProps) => (
  <motion.button
    className={className}
    variants={buttonHover}
    initial="rest"
    whileHover="hover"
    whileTap="tap"
    onClick={onClick}
  >
    {children}
  </motion.button>
);

// Page Transition Wrapper
export const PageTransition = ({ children, className = '' }: MotionWrapperProps) => (
  <motion.div
    className={className}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
  >
    {children}
  </motion.div>
);

// Animated List
interface AnimatedListProps {
  children: ReactNode[];
  className?: string;
}

export const AnimatedList = ({ children, className = '' }: AnimatedListProps) => (
  <motion.div
    className={className}
    initial="hidden"
    animate="visible"
    variants={{
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: { staggerChildren: 0.08 }
      }
    }}
  >
    {children.map((child, index) => (
      <motion.div
        key={index}
        variants={{
          hidden: { opacity: 0, x: -20 },
          visible: { 
            opacity: 1, 
            x: 0,
            transition: { duration: 0.4, ease: 'easeOut' }
          }
        }}
      >
        {child}
      </motion.div>
    ))}
  </motion.div>
);

// Counter Animation
interface AnimatedCounterProps {
  from?: number;
  to: number;
  duration?: number;
  className?: string;
  prefix?: string;
  suffix?: string;
}

export const AnimatedCounter = ({ 
  from = 0, 
  to, 
  duration = 2, 
  className = '',
  prefix = '',
  suffix = ''
}: AnimatedCounterProps) => (
  <motion.span
    className={className}
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
  >
    <motion.span
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
    >
      {prefix}
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {to.toLocaleString()}
      </motion.span>
      {suffix}
    </motion.span>
  </motion.span>
);

// Floating Animation
export const FloatingElement = ({ children, className = '' }: MotionWrapperProps) => (
  <motion.div
    className={className}
    animate={{
      y: [0, -10, 0],
    }}
    transition={{
      duration: 3,
      repeat: Infinity,
      ease: 'easeInOut'
    }}
  >
    {children}
  </motion.div>
);

// Rotating Element
export const RotatingElement = ({ children, className = '' }: MotionWrapperProps) => (
  <motion.div
    className={className}
    animate={{ rotate: 360 }}
    transition={{
      duration: 20,
      repeat: Infinity,
      ease: 'linear'
    }}
  >
    {children}
  </motion.div>
);

// Shimmer/Loading Effect
export const ShimmerEffect = ({ className = '' }: { className?: string }) => (
  <motion.div
    className={`absolute inset-0 ${className}`}
    style={{
      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)'
    }}
    animate={{
      x: ['-100%', '100%']
    }}
    transition={{
      duration: 1.5,
      repeat: Infinity,
      ease: 'easeInOut'
    }}
  />
);

// Export AnimatePresence for page transitions
export { motion, AnimatePresence };

