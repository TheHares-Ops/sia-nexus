import { ArrowUpRight, ArrowDownLeft, FileText, Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { useState } from 'react';

type TxType = 'send' | 'receive' | 'contract' | 'storage';

interface MobileTransactionRowProps {
  hash: string;
  type: TxType;
  amount: number;
  timestamp: Date;
  status: 'confirmed' | 'pending';
  highlight?: boolean;
  onTap?: () => void;
}

export const MobileTransactionRow = ({
  hash,
  type,
  amount,
  timestamp,
  status,
  highlight = false,
  onTap
}: MobileTransactionRowProps) => {
  const [copied, setCopied] = useState(false);

  const typeConfig = {
    send: { icon: ArrowUpRight, color: 'text-primary', bg: 'bg-primary/10' },
    receive: { icon: ArrowDownLeft, color: 'text-success', bg: 'bg-success/10' },
    contract: { icon: FileText, color: 'text-secondary', bg: 'bg-secondary/10' },
    storage: { icon: FileText, color: 'text-info', bg: 'bg-info/10' },
  };

  const config = typeConfig[type];
  const Icon = config.icon;

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <button
      onClick={onTap}
      className={cn(
        'w-full flex items-center justify-between p-3',
        'border-b border-border bg-background',
        'hover:bg-muted/30 transition-colors touch-manipulation',
        highlight && 'bg-secondary/5 border-l-2 border-l-secondary'
      )}
    >
      <div className="flex items-center gap-3">
        {/* Type icon */}
        <div className={cn('w-8 h-8 flex items-center justify-center', config.bg)}>
          <Icon size={14} className={config.color} />
        </div>
        
        <div className="text-left">
          {/* Hash with copy */}
          <div className="flex items-center gap-1">
            <span className="text-xs font-mono">
              {hash.slice(0, 10)}...{hash.slice(-6)}
            </span>
            <button
              onClick={handleCopy}
              className="p-0.5 text-foreground-subtle hover:text-foreground"
            >
              {copied ? <Check size={10} /> : <Copy size={10} />}
            </button>
          </div>
          
          {/* Type and time */}
          <div className="flex items-center gap-2 mt-0.5">
            <span className={cn(
              'text-[8px] uppercase tracking-wider px-1 py-0.5',
              config.bg, config.color
            )}>
              {type}
            </span>
            <span className="text-[10px] text-foreground-muted">
              {formatDistanceToNow(timestamp, { addSuffix: true })}
            </span>
          </div>
        </div>
      </div>

      <div className="text-right">
        <div className={cn(
          'text-sm font-mono font-medium',
          type === 'send' ? 'text-primary' : 'text-success'
        )}>
          {type === 'send' ? '-' : '+'}{amount.toFixed(4)} SC
        </div>
        <div className={cn(
          'text-[8px] uppercase tracking-wider',
          status === 'confirmed' ? 'text-success' : 'text-warning'
        )}>
          {status}
        </div>
      </div>
    </button>
  );
};
