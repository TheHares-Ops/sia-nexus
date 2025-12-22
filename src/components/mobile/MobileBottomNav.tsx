import { NavLink, useLocation } from 'react-router-dom';
import { Activity, Box, ArrowRightLeft, Server, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

const navItems = [
  { path: '/', icon: Activity, label: 'Network' },
  { path: '/blocks', icon: Box, label: 'Blocks' },
  { path: '/transactions', icon: ArrowRightLeft, label: 'Txns' },
  { path: '/hosts', icon: Server, label: 'Hosts' },
  { path: '/analytics', icon: BarChart3, label: 'Analytics' },
];

export const MobileBottomNav = () => {
  const location = useLocation();
  const [showLabel, setShowLabel] = useState<string | null>(null);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-t border-border safe-area-bottom">
      <div className="flex items-center justify-around h-14">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                'flex flex-col items-center justify-center flex-1 h-full relative',
                'transition-colors touch-manipulation',
                isActive ? 'text-primary' : 'text-foreground-muted'
              )}
              onTouchStart={() => setShowLabel(item.path)}
              onTouchEnd={() => setTimeout(() => setShowLabel(null), 1000)}
            >
              {/* Active indicator */}
              {isActive && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary" />
              )}
              
              <Icon 
                size={20} 
                strokeWidth={isActive ? 2.5 : 2}
                className="mb-0.5"
              />
              
              {/* Label on long press or active */}
              <span className={cn(
                'text-[9px] uppercase tracking-wider font-medium transition-opacity',
                (showLabel === item.path || isActive) ? 'opacity-100' : 'opacity-0'
              )}>
                {item.label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
