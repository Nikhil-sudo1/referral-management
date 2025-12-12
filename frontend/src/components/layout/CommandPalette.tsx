import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import {
  LayoutDashboard,
  FileText,
  Users,
  Building2,
  Trophy,
  Award,
  TrendingUp,
  Settings,
  Plus,
  Search,
  Moon,
  Sun,
} from 'lucide-react';

export const CommandPalette = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const runCommand = (command: () => void) => {
    setOpen(false);
    command();
  };

  const toggleTheme = () => {
    const isDark = document.documentElement.classList.contains('dark');
    document.documentElement.classList.toggle('dark', !isDark);
    localStorage.setItem('theme', isDark ? 'light' : 'dark');
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 h-12 px-4 rounded-full gradient-primary text-primary-foreground shadow-2xl hover:shadow-3xl transition-all hover:scale-105 flex items-center gap-2"
      >
        <Search className="w-4 h-4" />
        <span className="text-sm font-medium hidden sm:inline">Quick Search</span>
        <kbd className="pointer-events-none hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border border-primary-foreground/20 bg-primary-foreground/10 px-1.5 font-mono text-[10px] font-medium opacity-100">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          
          <CommandGroup heading="Navigation">
            <CommandItem onSelect={() => runCommand(() => navigate('/dashboard'))}>
              <LayoutDashboard className="mr-2 h-4 w-4" />
              <span>Dashboard</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => navigate('/referrals'))}>
              <FileText className="mr-2 h-4 w-4" />
              <span>Referrals</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => navigate('/counselors'))}>
              <Users className="mr-2 h-4 w-4" />
              <span>Referees</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => navigate('/universities'))}>
              <Building2 className="mr-2 h-4 w-4" />
              <span>Universities</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => navigate('/leaderboard'))}>
              <Trophy className="mr-2 h-4 w-4" />
              <span>Leaderboard</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => navigate('/rewards'))}>
              <Award className="mr-2 h-4 w-4" />
              <span>Rewards</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => navigate('/analytics'))}>
              <TrendingUp className="mr-2 h-4 w-4" />
              <span>Analytics</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => navigate('/settings'))}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />
          
          <CommandGroup heading="Quick Actions">
            <CommandItem onSelect={() => runCommand(() => navigate('/counselors/add'))}>
              <Plus className="mr-2 h-4 w-4" />
              <span>Add New Referee</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => navigate('/universities/add'))}>
              <Plus className="mr-2 h-4 w-4" />
              <span>Add New University</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => navigate('/'))}>
              <Search className="mr-2 h-4 w-4" />
              <span>Go to Public Portal</span>
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />
          
          <CommandGroup heading="Settings">
            <CommandItem onSelect={() => runCommand(toggleTheme)}>
              <Moon className="mr-2 h-4 w-4" />
              <span>Toggle Theme</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
};

