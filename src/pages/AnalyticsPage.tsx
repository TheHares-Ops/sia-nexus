import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, TrendingDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMobile } from '@/hooks/useMobile';

interface AnalyticsData {
  label: string;
  value: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
}

const AnalyticsPage = () => {
  const [storageData, setStorageData] = useState<number[]>([]);
  const [hostData, setHostData] = useState<number[]>([]);
  const [txData, setTxData] = useState<number[]>([]);
  const [activeChart, setActiveChart] = useState(0);
  const { isMobile } = useMobile();
  
  useEffect(() => {
    setStorageData(Array.from({ length: 90 }, (_, i) => Math.random() * 500 + 4000 + i * 10));
    setHostData(Array.from({ length: 90 }, () => Math.floor(Math.random() * 50) + 280));
    setTxData(Array.from({ length: 90 }, () => Math.floor(Math.random() * 5000) + 2000));
  }, []);

  const metrics: AnalyticsData[] = [
    { label: 'Total Storage', value: 4.82, change: 12.3, trend: 'up' },
    { label: 'Active Hosts', value: 312, change: 2.1, trend: 'up' },
    { label: 'Daily Transactions', value: 2847, change: -5.2, trend: 'down' },
    { label: 'Avg Block Time', value: 10.2, change: 0, trend: 'stable' },
    { label: 'Network Utilization', value: 67.4, change: 8.9, trend: 'up' },
    { label: 'Contract Success', value: 98.2, change: 0.3, trend: 'up' },
  ];

  const charts = [
    { title: 'Storage Capacity', data: storageData, color: 'secondary', unit: 'TB' },
    { title: 'Active Hosts', data: hostData, color: 'success', unit: 'hosts' },
    { title: 'Transaction Volume', data: txData, color: 'primary', unit: 'txs' },
  ];

  const AreaChart = ({ data, color, height = 120 }: { data: number[]; color: string; height?: number }) => {
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;

    const points = data.map((value, i) => {
      const x = (i / (data.length - 1)) * 100;
      const y = 100 - ((value - min) / range) * 100;
      return `${x},${y}`;
    }).join(' ');

    const areaPoints = `0,100 ${points} 100,100`;

    return (
      <div style={{ height }} className="w-full">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
          <defs>
            <linearGradient id={`gradient-${color}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={`hsl(var(--${color}))`} stopOpacity="0.3" />
              <stop offset="100%" stopColor={`hsl(var(--${color}))`} stopOpacity="0" />
            </linearGradient>
          </defs>
          <polygon 
            points={areaPoints} 
            fill={`url(#gradient-${color})`}
          />
          <polyline 
            points={points} 
            fill="none" 
            stroke={`hsl(var(--${color}))`} 
            strokeWidth="0.5"
          />
        </svg>
      </div>
    );
  };

  // Mobile View
  if (isMobile) {
    return (
      <div className="flex flex-col">
        {/* Mobile Metrics Grid */}
        <div className="grid grid-cols-2 gap-2 p-3">
          {metrics.slice(0, 4).map((metric) => (
            <div key={metric.label} className="bg-muted/30 border border-border p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[9px] uppercase tracking-wider text-foreground-subtle">
                  {metric.label}
                </span>
                {metric.trend === 'up' && <TrendingUp size={10} className="text-success" />}
                {metric.trend === 'down' && <TrendingDown size={10} className="text-primary" />}
              </div>
              <div className="flex items-baseline gap-1">
                <span className="font-mono text-lg font-semibold">
                  {metric.value.toLocaleString()}
                </span>
                {metric.change !== 0 && (
                  <span className={cn(
                    'text-[10px] font-mono',
                    metric.change > 0 ? 'text-success' : 'text-primary'
                  )}>
                    {metric.change > 0 ? '+' : ''}{metric.change}%
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Swipeable Charts */}
        <div className="border-t border-border">
          {/* Chart Navigation */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-border-subtle">
            <button
              onClick={() => setActiveChart(Math.max(0, activeChart - 1))}
              className={cn(
                'p-1',
                activeChart === 0 ? 'text-foreground-subtle' : 'text-foreground'
              )}
              disabled={activeChart === 0}
            >
              <ChevronLeft size={16} />
            </button>
            
            <span className="text-xs font-medium uppercase tracking-wider">
              {charts[activeChart]?.title}
            </span>
            
            <button
              onClick={() => setActiveChart(Math.min(charts.length - 1, activeChart + 1))}
              className={cn(
                'p-1',
                activeChart === charts.length - 1 ? 'text-foreground-subtle' : 'text-foreground'
              )}
              disabled={activeChart === charts.length - 1}
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Active Chart */}
          <div className="p-3">
            {charts[activeChart] && (
              <>
                <AreaChart 
                  data={charts[activeChart].data} 
                  color={charts[activeChart].color} 
                  height={150} 
                />
                <div className="flex justify-between mt-2 text-[9px] text-foreground-subtle font-mono">
                  <span>{Math.min(...charts[activeChart].data).toFixed(0)} {charts[activeChart].unit}</span>
                  <span>{Math.max(...charts[activeChart].data).toFixed(0)} {charts[activeChart].unit}</span>
                </div>
              </>
            )}
          </div>

          {/* Chart Dots */}
          <div className="flex justify-center gap-2 pb-3">
            {charts.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveChart(i)}
                className={cn(
                  'w-1.5 h-1.5 rounded-full transition-colors',
                  i === activeChart ? 'bg-secondary' : 'bg-border'
                )}
              />
            ))}
          </div>
        </div>

        {/* Transaction Volume Bars */}
        <div className="p-3 border-t border-border">
          <h3 className="text-xs font-semibold uppercase tracking-wider mb-3">
            Daily Transaction Volume
          </h3>
          <div className="flex items-end gap-px h-20">
            {txData.slice(-30).map((value, i) => {
              const max = Math.max(...txData);
              const height = (value / max) * 100;
              return (
                <div
                  key={i}
                  className="flex-1 bg-primary/40"
                  style={{ height: `${height}%` }}
                />
              );
            })}
          </div>
          <div className="flex justify-between mt-2 text-[9px] text-foreground-subtle">
            <span>30 days ago</span>
            <span>Today</span>
          </div>
        </div>
      </div>
    );
  }

  // Desktop View
  return (
    <div className="min-h-screen">
      <div className="h-16 border-b border-border bg-background-elevated/50 backdrop-blur-sm px-6 flex items-center">
        <div className="flex items-center gap-3">
          <BarChart3 size={20} className="text-secondary" />
          <h1 className="text-lg font-semibold">Network Analytics</h1>
        </div>
      </div>

      <div className="p-6">
        {/* Key Metrics Grid */}
        <div className="grid grid-cols-6 gap-3 mb-8">
          {metrics.map((metric) => (
            <div key={metric.label} className="metric-card">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase tracking-wider text-foreground-subtle">
                  {metric.label}
                </span>
                {metric.trend === 'up' && <TrendingUp size={12} className="text-success" />}
                {metric.trend === 'down' && <TrendingDown size={12} className="text-primary" />}
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-mono text-xl font-semibold text-foreground">
                  {metric.value.toLocaleString()}
                </span>
                {metric.change !== 0 && (
                  <span className={cn(
                    'text-xs font-mono',
                    metric.change > 0 ? 'text-success' : 'text-primary'
                  )}>
                    {metric.change > 0 ? '+' : ''}{metric.change}%
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-2 gap-6">
          {/* Storage Evolution */}
          <div className="chart-container">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider">
                Storage Capacity Evolution
              </h3>
              <span className="text-xs text-foreground-muted font-mono">90 days</span>
            </div>
            <AreaChart data={storageData} color="secondary" height={200} />
            <div className="flex justify-between mt-2 text-[10px] text-foreground-subtle font-mono">
              <span>{Math.min(...storageData).toFixed(0)} TB</span>
              <span>{Math.max(...storageData).toFixed(0)} TB</span>
            </div>
          </div>

          {/* Host Count */}
          <div className="chart-container">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider">
                Active Host Count
              </h3>
              <span className="text-xs text-foreground-muted font-mono">90 days</span>
            </div>
            <AreaChart data={hostData} color="success" height={200} />
            <div className="flex justify-between mt-2 text-[10px] text-foreground-subtle font-mono">
              <span>{Math.min(...hostData)} hosts</span>
              <span>{Math.max(...hostData)} hosts</span>
            </div>
          </div>

          {/* Transaction Volume */}
          <div className="chart-container col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider">
                Daily Transaction Volume
              </h3>
              <span className="text-xs text-foreground-muted font-mono">90 days</span>
            </div>
            <div className="flex items-end gap-px h-32">
              {txData.map((value, i) => {
                const max = Math.max(...txData);
                const height = (value / max) * 100;
                return (
                  <div
                    key={i}
                    className="flex-1 bg-primary/40 hover:bg-primary/70 transition-colors"
                    style={{ height: `${height}%` }}
                    title={`Day ${i + 1}: ${value.toLocaleString()} txs`}
                  />
                );
              })}
            </div>
            <div className="flex justify-between mt-2 text-[10px] text-foreground-subtle">
              <span>90 days ago</span>
              <span>Today</span>
            </div>
          </div>
        </div>

        {/* Correlation Matrix */}
        <div className="mt-8">
          <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">
            Metric Correlations
          </h3>
          <div className="grid grid-cols-4 gap-2">
            {['Storage', 'Hosts', 'Price', 'TX Volume'].map((row) => (
              ['Storage', 'Hosts', 'Price', 'TX Volume'].map((col) => {
                const correlation = row === col ? 1 : Math.random() * 2 - 1;
                return (
                  <div 
                    key={`${row}-${col}`}
                    className={cn(
                      'h-12 flex items-center justify-center font-mono text-xs',
                      'transition-colors cursor-pointer hover:opacity-80'
                    )}
                    style={{
                      backgroundColor: correlation > 0 
                        ? `hsl(var(--success) / ${Math.abs(correlation) * 0.5})`
                        : correlation < 0
                        ? `hsl(var(--primary) / ${Math.abs(correlation) * 0.5})`
                        : 'hsl(var(--muted))'
                    }}
                    title={`${row} vs ${col}: ${correlation.toFixed(2)}`}
                  >
                    {row === col ? (
                      <span className="text-foreground">{row.slice(0, 3)}</span>
                    ) : (
                      <span className={cn(
                        correlation > 0 ? 'text-success' : 'text-primary'
                      )}>
                        {correlation.toFixed(2)}
                      </span>
                    )}
                  </div>
                );
              })
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
