import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  FileText,
  Award,
  Settings,
  Building2,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  UserCircle,
  LogOut,
  Trophy,
  Sparkles,
} from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { NotificationBell } from './NotificationBell';
import { useAuth } from '@/contexts/AuthContext';

// Define menu items with role access
// Roles: super_admin (all access), manager (day-to-day operations), referrer (only own referrals)
const menuItems = [
  { 
    label: 'Dashboard', 
    icon: LayoutDashboard, 
    path: '/dashboard',
    roles: ['super_admin', 'manager'] // Super admin and manager can see dashboard
  },
  { 
    label: 'Referrals', 
    icon: FileText, 
    path: '/referrals',
    roles: ['super_admin', 'manager'] // Manager can track and manage referrals
  },
  { 
    label: 'Referees', 
    icon: Users, 
    path: '/referees',
    roles: ['super_admin', 'manager'] // Manager can manage referees
  },
  { 
    label: 'Universities', 
    icon: Building2, 
    path: '/universities',
    roles: ['super_admin'] // Only super admin can configure universities
  },
  { 
    label: 'Leaderboard', 
    icon: Trophy, 
    path: '/leaderboard',
    roles: ['super_admin', 'manager'] // Manager can view performance rankings
  },
  { 
    label: 'Rewards', 
    icon: Award, 
    path: '/rewards',
    roles: ['super_admin', 'manager'] // Manager can approve rewards
  },
  { 
    label: 'Analytics', 
    icon: TrendingUp, 
    path: '/analytics',
    roles: ['super_admin', 'manager'] // Manager can view analytics
  },
  { 
    label: 'My Referrals', 
    icon: FileText, 
    path: '/referrer/referrals',
    roles: ['referrer'] // Only referrer can see their own referrals
  },
  { 
    label: 'Add Referral', 
    icon: Users, 
    path: '/referrer/add',
    roles: ['referrer'] // Only referrer can add referrals
  },
  { 
    label: 'Settings', 
    icon: Settings, 
    path: '/settings',
    roles: ['super_admin', 'manager', 'referrer'] // All roles can access settings
  },
];

export const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Filter menu items based on user role
  const userRole = user?.role || 'referrer';
  const filteredMenuItems = menuItems.filter(item => 
    item.roles.includes(userRole)
  );

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Get user display name and role label
  const getUserInfo = () => {
    const name = user?.name || 'User';
    const roleLabels: Record<string, string> = {
      super_admin: 'Super Admin',
      manager: 'Manager',
      counselor: 'Counselor',
      referrer: 'Referrer'
    };
    return {
      name,
      role: roleLabels[userRole] || userRole,
      initials: name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    };
  };

  const userInfo = getUserInfo();

  return (
    <aside
      className={cn(
        'h-screen flex flex-col transition-all duration-500 ease-out sticky top-0 glass-sidebar border-r border-white/5',
        collapsed ? 'w-20' : 'w-72'
      )}
    >
      {/* Logo Section */}
      <div className="h-20 flex items-center justify-between px-5 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-lg glow-primary">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-success rounded-full border-2 border-sidebar-background"></div>
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-display text-lg text-white tracking-tight">RefManager</span>
              <span className="text-xs text-sidebar-foreground/60 font-medium">TeamLease EdTech</span>
            </div>
          )}
        </div>
        {!collapsed && (
          <div className="flex items-center gap-1">
            <NotificationBell />
            <ThemeToggle />
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 px-3 space-y-1.5 overflow-y-auto">
        <AnimatePresence>
          {!collapsed && (
            <motion.div 
              className="px-3 mb-4"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              <span className="text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/40">
                Main Menu
              </span>
            </motion.div>
          )}
        </AnimatePresence>
        {filteredMenuItems.map((item, index) => {
          const isActive = location.pathname === item.path || 
            (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
          
          return (
            <motion.div
              key={item.path}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Link
                to={item.path}
                className={cn(
                  'group relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300',
                  isActive
                    ? 'bg-gradient-to-r from-primary/20 to-primary/5 text-white'
                    : 'text-sidebar-foreground hover:bg-white/5 hover:text-white'
                )}
              >
                {/* Active indicator */}
                {isActive && (
                  <motion.div 
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-full shadow-lg shadow-primary/50"
                    layoutId="activeIndicator"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
                
                <motion.div 
                  className={cn(
                    'flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-300',
                    isActive 
                      ? 'bg-primary text-white shadow-lg shadow-primary/30' 
                      : 'bg-white/5 group-hover:bg-white/10'
                  )}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <item.icon className="w-[18px] h-[18px]" />
                </motion.div>
                
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span 
                      className={cn(
                        'text-sm font-semibold',
                        isActive && 'text-white'
                      )}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.2 }}
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
                
                {/* Hover glow effect */}
                {!isActive && (
                  <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-primary/10 to-transparent pointer-events-none" />
                )}
              </Link>
            </motion.div>
          );
        })}
      </nav>

      {/* User section */}
      <motion.div 
        className="p-4 border-t border-white/5"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <motion.div 
          className={cn(
            'flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all cursor-pointer group',
            collapsed && 'justify-center p-2'
          )}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="relative">
            <motion.div 
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-primary flex items-center justify-center text-white font-bold shadow-lg"
              whileHover={{ rotate: 5 }}
            >
              {userInfo.initials}
            </motion.div>
            <motion.div 
              className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-success rounded-full border-2 border-sidebar-background"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                className="flex items-center flex-1 gap-3"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{userInfo.name}</p>
                  <p className="text-xs text-sidebar-foreground/60 truncate">{userInfo.role}</p>
                </div>
                <motion.button 
                  onClick={handleLogout}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors text-sidebar-foreground hover:text-destructive"
                  title="Logout"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <LogOut className="w-4 h-4" />
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>

      {/* Collapse toggle */}
      <motion.button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-4 top-24 w-8 h-8 rounded-full bg-card border-2 border-border text-foreground flex items-center justify-center shadow-lg hover:shadow-xl hover:bg-primary hover:text-white hover:border-primary transition-all duration-300"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        animate={{ rotate: collapsed ? 180 : 0 }}
        transition={{ duration: 0.3 }}
      >
        <ChevronLeft className="w-4 h-4" />
      </motion.button>
    </aside>
  );
};
