import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { CommandPalette } from './CommandPalette';

interface DashboardLayoutProps {
  children: ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
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
