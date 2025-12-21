import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  FileText,
  Trophy,
  TrendingUp,
  Menu,
  X,
  Settings,
  LogOut,
  GraduationCap,
  Gift,
  HelpCircle,
  UserPlus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from './ThemeToggle';
import { NotificationBell } from './NotificationBell';
import { useAuth } from '@/contexts/AuthContext';

const menuItems = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/referrer' },
  { label: 'My Referrals', icon: FileText, path: '/referrer/referrals' },
  { label: 'Add Referral', icon: UserPlus, path: '/referrer/add' },
  { label: 'Leaderboard', icon: Trophy, path: '/referrer/leaderboard' },
  { label: 'Rewards', icon: Gift, path: '/referrer/rewards' },
  { label: 'Settings', icon: Settings, path: '/referrer/settings' },
];

export const ReferrerLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Get user info
  const getUserInfo = () => {
    const name = user?.full_name || user?.name || 'User';
    return {
      name,
      tier: user?.tier || 'Bronze',
      initials: name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    };
  };

  const userInfo = getUserInfo();
  const isExpanded = isHovered;

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
      </div>

      {/* Desktop Sidebar - Hover Expand */}
      <motion.aside
        className={cn(
          'hidden lg:flex h-screen flex-col transition-all duration-300 ease-out sticky top-0 z-40',
          'bg-[#0a0a0f]/80 backdrop-blur-xl border-r border-white/5'
        )}
        initial={false}
        animate={{ width: isExpanded ? 280 : 80 }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Logo Section */}
        <div className="h-20 flex items-center px-5 border-b border-white/5">
          <div className="flex items-center gap-3">
            <motion.div 
              className="relative flex-shrink-0"
              whileHover={{ scale: 1.05 }}
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-cyan-400 flex items-center justify-center shadow-lg shadow-primary/30">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-[#0a0a0f]"></div>
            </motion.div>
            <AnimatePresence>
              {isExpanded && (
                <motion.div 
                  className="flex flex-col overflow-hidden"
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <span className="font-bold text-lg text-white tracking-tight whitespace-nowrap">TeamLease</span>
                  <span className="text-xs text-white/50 font-medium whitespace-nowrap">Referrer Portal</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <AnimatePresence>
            {isExpanded && (
              <motion.div 
                className="flex items-center gap-1 ml-auto"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <NotificationBell />
                <ThemeToggle />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 px-3 space-y-1.5 overflow-y-auto overflow-x-hidden">
          <AnimatePresence>
            {isExpanded && (
              <motion.div 
                className="px-3 mb-4"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                <span className="text-[10px] font-semibold uppercase tracking-widest text-white/30">
                  Main Menu
                </span>
              </motion.div>
            )}
          </AnimatePresence>
          {menuItems.map((item, index) => {
            const isActive = location.pathname === item.path || 
              (item.path !== '/referrer' && location.pathname.startsWith(item.path));
            
            return (
              <motion.div
                key={item.path}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.03 }}
              >
                <Link
                  to={item.path}
                  className={cn(
                    'group relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300',
                    isActive
                      ? 'bg-gradient-to-r from-primary/20 to-primary/5 text-white'
                      : 'text-white/60 hover:bg-white/5 hover:text-white'
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
                      'flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-300 flex-shrink-0',
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
                    {isExpanded && (
                      <motion.span 
                        className={cn(
                          'text-sm font-semibold whitespace-nowrap',
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
        <div className="p-4 border-t border-white/5">
          <motion.div 
            className={cn(
              'flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all cursor-pointer group',
              !isExpanded && 'justify-center p-2'
            )}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="relative flex-shrink-0">
              <motion.div 
                className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-primary flex items-center justify-center text-white font-bold shadow-lg"
                whileHover={{ rotate: 5 }}
              >
                {userInfo.initials}
              </motion.div>
              <motion.div 
                className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-[#0a0a0f]"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              />
            </div>
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  className="flex items-center flex-1 gap-3 overflow-hidden"
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{userInfo.name}</p>
                    <p className="text-xs text-white/50 truncate">{userInfo.tier} Referrer</p>
                  </div>
                  <motion.button 
                    onClick={handleLogout}
                    className="p-2 rounded-lg hover:bg-white/10 transition-colors text-white/50 hover:text-red-400"
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
        </div>
      </motion.aside>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            className="lg:hidden fixed inset-0 z-50 bg-[#0a0a0f]/98 backdrop-blur-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-cyan-400 flex items-center justify-center">
                    <GraduationCap className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-bold text-lg text-white">TeamLease</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-white hover:bg-white/10"
                >
                  <X className="w-6 h-6" />
                </Button>
              </div>
              <nav className="space-y-2">
                {menuItems.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <motion.div
                      key={item.path}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Link
                        to={item.path}
                        onClick={() => setMobileMenuOpen(false)}
                        className={cn(
                          'flex items-center gap-4 px-4 py-4 rounded-xl transition-all',
                          isActive
                            ? 'bg-gradient-to-r from-primary/20 to-primary/5 text-white'
                            : 'text-white/60 hover:bg-white/5 hover:text-white'
                        )}
                      >
                        <div className={cn(
                          'w-10 h-10 rounded-lg flex items-center justify-center',
                          isActive ? 'bg-primary text-white' : 'bg-white/5'
                        )}>
                          <item.icon className="w-5 h-5" />
                        </div>
                        <span className="font-semibold">{item.label}</span>
                      </Link>
                    </motion.div>
                  );
                })}
              </nav>
              
              {/* Mobile User Section */}
              <div className="mt-8 p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-primary flex items-center justify-center text-white font-bold">
                    {userInfo.initials}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-white">{userInfo.name}</p>
                    <p className="text-sm text-white/50">{userInfo.tier} Referrer</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleLogout}
                    className="text-white/50 hover:text-red-400 hover:bg-white/10"
                  >
                    <LogOut className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 overflow-auto relative z-10">
        {/* Mobile Header */}
        <header className="lg:hidden sticky top-0 z-30 bg-[#0a0a0f]/90 backdrop-blur-xl border-b border-white/5">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="text-white hover:bg-white/10"
                >
                  <Menu className="w-5 h-5" />
                </Button>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-cyan-400 flex items-center justify-center">
                    <GraduationCap className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h1 className="font-bold text-lg text-white">TeamLease</h1>
                    <p className="text-xs text-white/50">Referrer Portal</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <NotificationBell />
                <ThemeToggle />
              </div>
            </div>
          </div>
        </header>

        <div className="p-6 lg:p-8 max-w-[1600px] mx-auto text-white">
          {children}
        </div>
      </main>
    </div>
  );
};
