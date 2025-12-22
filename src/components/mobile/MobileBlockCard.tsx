import { Box, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface MobileBlockCardProps {
  height: number;
  txCount: number;
  timestamp: Date;
  fees: number;
  hash: string;
  onTap?: () => void;
  compact?: boolean;
}

export const MobileBlockCard = ({
  height,
  txCount,
  timestamp,
  fees,
  hash,
  onTap,
  compact = false
}: MobileBlockCardProps) => {
  if (compact) {
    return (
      <button
        onClick={onTap}
        className={cn(
          'flex-shrink-0 w-20 p-2 mr-2',
          'bg-muted/30 border border-border hover:border-primary/50',
          'transition-colors touch-manipulation'
        )}
      >
        <div className="text-[10px] text-foreground-subtle mb-0.5">Block</div>
        <div className="text-sm font-mono font-medium text-secondary">
          #{height.toLocaleString()}
        </div>
        <div className="text-[9px] text-foreground-muted mt-1">
          {txCount} txns
        </div>
      </button>
    );
  }

  return (
    <button
      onClick={onTap}
      className={cn(
        'w-full flex items-center justify-between p-3',
        'bg-muted/20 border border-border hover:border-primary/30',
        'transition-colors touch-manipulation'
      )}
    >
      <div className="flex items-center gap-3">
        {/* Block indicator */}
        <div className="w-8 h-8 bg-secondary/20 flex items-center justify-center">
          <Box size={14} className="text-secondary" />
        </div>
        
        <div className="text-left">
          <div className="flex items-center gap-2">
            <span className="text-sm font-mono font-medium">
              #{height.toLocaleString()}
            </span>
            <span className="text-[8px] uppercase tracking-wider text-foreground-subtle bg-muted px-1 py-0.5">
              {txCount} tx
            </span>
          </div>
          <div className="text-[10px] text-foreground-muted font-mono">
            {hash.slice(0, 12)}...{hash.slice(-8)}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="text-right">
          <div className="text-[10px] text-foreground-subtle">
            {formatDistanceToNow(timestamp, { addSuffix: true })}
          </div>
          <div className="text-[10px] font-mono text-secondary">
            {fees.toFixed(4)} SC
          </div>
        </div>
        <ArrowRight size={14} className="text-foreground-subtle" />
      </div>
    </button>
  );
};
