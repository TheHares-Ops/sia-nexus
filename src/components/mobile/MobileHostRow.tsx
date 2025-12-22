import { Server, ChevronRight, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileHostRowProps {
  publicKey: string;
  uptime: number;
  reliability: number;
  priceCompetitive: boolean;
  contractSuccess: number;
  country: string;
  onTap?: () => void;
}

export const MobileHostRow = ({
  publicKey,
  uptime,
  reliability,
  priceCompetitive,
  contractSuccess,
  country,
  onTap
}: MobileHostRowProps) => {
  // Risk level based on metrics
  const getRiskLevel = () => {
    if (uptime >= 99 && reliability >= 95) return 'optimal';
    if (uptime >= 95 && reliability >= 85) return 'stable';
    return 'warning';
  };

  const riskLevel = getRiskLevel();
  
  const riskColors = {
    optimal: 'border-l-secondary',
    stable: 'border-l-success',
    warning: 'border-l-primary'
  };

  const uptimeColor = uptime >= 99 ? 'bg-secondary' : uptime >= 95 ? 'bg-success' : 'bg-primary';

  return (
    <button
      onClick={onTap}
      className={cn(
        'w-full flex items-center justify-between p-3',
        'border-l-2 border-b border-border bg-background',
        'hover:bg-muted/30 transition-colors touch-manipulation',
        riskColors[riskLevel]
      )}
    >
      <div className="flex items-center gap-3 min-w-0">
        {/* Host icon with status */}
        <div className="relative flex-shrink-0">
          <div className="w-8 h-8 bg-muted/50 flex items-center justify-center">
            <Server size={14} className="text-foreground-muted" />
          </div>
          <div className={cn(
            'absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full',
            uptimeColor
          )} />
        </div>
        
        <div className="min-w-0 text-left">
          {/* Host key */}
          <div className="text-xs font-mono truncate">
            {publicKey.slice(0, 16)}...
          </div>
          
          {/* Metrics row */}
          <div className="flex items-center gap-2 mt-0.5">
            {/* Uptime bar */}
            <div className="flex items-center gap-1">
              <div className="w-12 h-1 bg-muted overflow-hidden">
                <div 
                  className={cn('h-full', uptimeColor)}
                  style={{ width: `${uptime}%` }}
                />
              </div>
              <span className="text-[9px] font-mono text-foreground-muted">
                {uptime.toFixed(1)}%
              </span>
            </div>
            
            {/* Country */}
            <span className="text-[8px] uppercase tracking-wider text-foreground-subtle bg-muted px-1 py-0.5">
              {country}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        {/* Reliability indicator */}
        <div className="flex flex-col items-end">
          <div className="flex items-center gap-0.5">
            {reliability >= 90 ? (
              <TrendingUp size={10} className="text-success" />
            ) : (
              <TrendingDown size={10} className="text-primary" />
            )}
            <span className="text-[10px] font-mono">
              {reliability}%
            </span>
          </div>
          
          {/* Price indicator */}
          <span className={cn(
            'text-[8px] uppercase tracking-wider',
            priceCompetitive ? 'text-secondary' : 'text-foreground-subtle'
          )}>
            {priceCompetitive ? 'Competitive' : 'Premium'}
          </span>
        </div>
        
        <ChevronRight size={14} className="text-foreground-subtle" />
      </div>
    </button>
  );
};
