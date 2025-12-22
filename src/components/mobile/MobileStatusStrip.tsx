import { Activity, Box, Server, Wifi } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatusItem {
  icon: React.ElementType;
  label: string;
  value: string;
  status: 'healthy' | 'warning' | 'critical';
}

const statusItems: StatusItem[] = [
  { icon: Box, label: 'Height', value: '234,567', status: 'healthy' },
  { icon: Wifi, label: 'Network', value: 'Synced', status: 'healthy' },
  { icon: Server, label: 'Hosts', value: '312', status: 'healthy' },
  { icon: Activity, label: 'TPS', value: '12.4', status: 'healthy' },
];

export const MobileStatusStrip = () => {
  return (
    <div className="flex items-center justify-between px-3 py-1.5 bg-muted/30 border-b border-border">
      {statusItems.map((item, i) => {
        const Icon = item.icon;
        const statusColor = {
          healthy: 'text-success',
          warning: 'text-secondary',
          critical: 'text-primary'
        }[item.status];

        return (
          <div key={i} className="flex items-center gap-1">
            <div className={cn('w-1.5 h-1.5 rounded-full', {
              'bg-success': item.status === 'healthy',
              'bg-secondary': item.status === 'warning',
              'bg-primary': item.status === 'critical',
            })} />
            <Icon size={10} className="text-foreground-subtle" />
            <span className={cn('text-[10px] font-mono font-medium', statusColor)}>
              {item.value}
            </span>
          </div>
        );
      })}
    </div>
  );
};
