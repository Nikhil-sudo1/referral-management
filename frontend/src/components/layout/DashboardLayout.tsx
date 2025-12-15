import { ReactNode, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated (will redirect)
  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="p-6 lg:p-8 max-w-[1600px] mx-auto">
          {children}
        </div>
      </main>
      <CommandPalette />
    </div>
  );
};
