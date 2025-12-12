import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  FileText,
  Trophy,
  TrendingUp,
  Menu,
  X,
  Bell,
  Settings,
  LogOut,
  GraduationCap,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from './ThemeToggle';
import { NotificationBell } from './NotificationBell';

const menuItems = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/referrer' },
  { label: 'My Referrals', icon: FileText, path: '/referrer/referrals' },
  { label: 'Leaderboard', icon: Trophy, path: '/referrer/leaderboard' },
  { label: 'Analytics', icon: TrendingUp, path: '/referrer/analytics' },
];

const referrerData = {
  name: 'John Smith',
  tier: 'Gold',
};

export const ReferrerLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          'hidden lg:flex h-screen flex-col transition-all duration-500 ease-out sticky top-0 glass-sidebar border-r border-white/5',
          collapsed ? 'w-20' : 'w-72'
        )}
      >
        {/* Logo Section */}
        <div className="h-20 flex items-center justify-between px-5 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-lg glow-primary">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-success rounded-full border-2 border-sidebar-background"></div>
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <span className="font-display text-lg text-white tracking-tight">RefManager</span>
                <span className="text-xs text-sidebar-foreground/60 font-medium">Referrer Portal</span>
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
          <div className={cn("px-3 mb-4", collapsed && "hidden")}>
            <span className="text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/40">
              Main Menu
            </span>
          </div>
          {menuItems.map((item, index) => {
            const isActive = location.pathname === item.path || 
              (item.path !== '/referrer' && location.pathname.startsWith(item.path));
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'group relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300',
                  isActive
                    ? 'bg-gradient-to-r from-primary/20 to-primary/5 text-white'
                    : 'text-sidebar-foreground hover:bg-white/5 hover:text-white'
                )}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Active indicator */}
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-full shadow-lg shadow-primary/50" />
                )}
                
                <div className={cn(
                  'flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-300',
                  isActive 
                    ? 'bg-primary text-white shadow-lg shadow-primary/30' 
                    : 'bg-white/5 group-hover:bg-white/10'
                )}>
                  <item.icon className="w-[18px] h-[18px]" />
                </div>
                
                {!collapsed && (
                  <span className={cn(
                    'text-sm font-semibold transition-all',
                    isActive && 'text-white'
                  )}>
                    {item.label}
                  </span>
                )}
                
                {/* Hover glow effect */}
                {!isActive && (
                  <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-primary/10 to-transparent pointer-events-none" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        <div className="p-4 border-t border-white/5">
          <div className={cn(
            'flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all cursor-pointer group',
            collapsed && 'justify-center p-2'
          )}>
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-primary flex items-center justify-center text-white font-bold shadow-lg">
                {referrerData.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-success rounded-full border-2 border-sidebar-background"></div>
            </div>
            {!collapsed && (
              <>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{referrerData.name}</p>
                  <p className="text-xs text-sidebar-foreground/60 truncate">{referrerData.tier} Referrer</p>
                </div>
                <button 
                  onClick={() => navigate('/')}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors text-sidebar-foreground hover:text-destructive"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-4 top-24 w-8 h-8 rounded-full bg-card border-2 border-border text-foreground flex items-center justify-center shadow-lg hover:shadow-xl hover:bg-primary hover:text-white hover:border-primary transition-all duration-300 z-10"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </aside>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-background/95 backdrop-blur-xl">
          <div className="p-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-display">Menu</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(false)}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            <nav className="space-y-2">
              {menuItems.map((item) => {
                const isActive = location.pathname === item.path;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 rounded-xl transition-all',
                      isActive
                        ? 'bg-gradient-to-r from-primary/20 to-primary/5 text-primary'
                        : 'text-foreground hover:bg-muted'
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-semibold">{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Mobile Header */}
        <header className="lg:hidden sticky top-0 z-30 bg-background/90 backdrop-blur-xl border-b border-border">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                  {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </Button>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl gradient-primary flex items-center justify-center">
                    <GraduationCap className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h1 className="font-display text-lg">RefManager</h1>
                    <p className="text-xs text-muted-foreground">Referrer Portal</p>
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

        <div className="p-6 lg:p-8 max-w-[1600px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};
