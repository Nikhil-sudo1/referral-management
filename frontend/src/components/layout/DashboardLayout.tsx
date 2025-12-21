import { ReactNode, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sidebar } from './Sidebar';
import { CommandPalette } from './CommandPalette';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface DashboardLayoutProps {
  children: ReactNode;
}

// Admin routes that only super_admin and manager can access
const adminRoutes = ['/dashboard', '/referrals', '/referees', '/universities', '/leaderboard', '/rewards', '/analytics', '/settings'];
// Referrer routes
const referrerRoutes = ['/referrer', '/referrer/referrals', '/referrer/add', '/referrer/leaderboard', '/referrer/analytics'];

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const { user, isLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Wait for auth to load
    if (isLoading) return;

    // If not authenticated, redirect to login
    if (!isAuthenticated || !user) {
      navigate('/login');
      return;
    }

    const currentPath = location.pathname;
    const userRole = user.role;

    // Check if user is on the wrong type of route
    const isOnAdminRoute = adminRoutes.some(route => currentPath.startsWith(route));
    const isOnReferrerRoute = referrerRoutes.some(route => currentPath.startsWith(route));

    // Referrer trying to access admin routes
    if (userRole === 'referrer' && isOnAdminRoute) {
      console.log('Referrer on admin route, redirecting to referrer dashboard');
      navigate('/referrer');
      return;
    }

    // Admin/Manager trying to access referrer routes
    if ((userRole === 'super_admin' || userRole === 'manager') && isOnReferrerRoute) {
      console.log('Admin on referrer route, redirecting to admin dashboard');
      navigate('/dashboard');
      return;
    }
  }, [user, isLoading, isAuthenticated, location.pathname, navigate]);

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a0f]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-white/50">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated (will redirect)
  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-[#0a0a0f]">
      {/* Animated Background - Same as Landing */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div 
          className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[150px]"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.3, 0.2]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div 
          className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[150px]"
          animate={{ 
            scale: [1, 1.3, 1],
            opacity: [0.1, 0.2, 0.1]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        />
        <motion.div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-green-500/5 rounded-full blur-[180px]"
          animate={{ 
            rotate: [0, 360],
          }}
          transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
        />
      </div>

      <Sidebar />
      <main className="flex-1 overflow-auto relative z-10">
        <div className="p-6 lg:p-8 max-w-[1600px] mx-auto text-white">
          {children}
        </div>
      </main>
      <CommandPalette />
    </div>
  );
};
