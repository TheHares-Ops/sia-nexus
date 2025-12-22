import { ReactNode } from 'react';
import { MobileBottomNav } from './MobileBottomNav';
import { MobileSearchHeader } from './MobileSearchHeader';
import { MobileStatusStrip } from './MobileStatusStrip';
import { cn } from '@/lib/utils';

interface MobileLayoutProps {
  children: ReactNode;
  showSearch?: boolean;
  showStatus?: boolean;
  className?: string;
}

export const MobileLayout = ({ 
  children, 
  showSearch = true,
  showStatus = true,
  className 
}: MobileLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Top Section */}
      {showSearch && <MobileSearchHeader />}
      {showStatus && <MobileStatusStrip />}
      
      {/* Main Content */}
      <main className={cn(
        'flex-1 overflow-y-auto overscroll-contain',
        'pb-16', // Space for bottom nav
        className
      )}>
        {children}
      </main>
      
      {/* Bottom Navigation */}
      <MobileBottomNav />
    </div>
  );
};
