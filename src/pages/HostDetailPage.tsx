import { useParams, useNavigate } from 'react-router-dom';
import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { useMobile } from '@/hooks/useMobile';
import {
  ArrowLeft, MapPin, HardDrive, Database, FileCheck, Shield,
  Wifi, DollarSign, TrendingUp, TrendingDown, Globe, Server,
  Key, CheckCircle, Clock, Flag, Code, Layers, Upload, Download,
  Lock, ChevronDown, ChevronUp, Copy
} from 'lucide-react';

// Speed gauge - speedtest-style arc
const SpeedGauge = ({ value, max, label, unit, compact = false }: { value: number; max: number; label: string; unit: string; compact?: boolean }) => {
  const percentage = Math.min((value / max) * 100, 100);
  const cx = 100, cy = 100, r = 80;
  const startAngle = 135, endAngle = 405;
  const totalArc = endAngle - startAngle;
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const arcPath = (start: number, end: number) => {
    const s = toRad(start), e = toRad(end);
    const x1 = cx + r * Math.cos(s), y1 = cy + r * Math.sin(s);
    const x2 = cx + r * Math.cos(e), y2 = cy + r * Math.sin(e);
    const large = end - start > 180 ? 1 : 0;
    return `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`;
  };

  const valueAngle = startAngle + (percentage / 100) * totalArc;
  const needleAngle = toRad(valueAngle);
  const needleLen = r - 12;

  // Tick marks
  const ticks = [0, 1, 5, 10, 20, 30, 50, 75, 100];
  const tickPositions = ticks.map(t => {
    const pct = (t / max) * 100;
    const angle = startAngle + (pct / 100) * totalArc;
    const rad = toRad(angle);
    const isMajor = [0, 10, 20, 50, 100].includes(t) || t === max;
    return { value: t, angle, rad, isMajor };
  }).filter(t => t.value <= max);

  const size = compact ? 'w-[120px] h-[100px]' : 'w-[180px] h-[150px]';

  return (
    <div className="flex flex-col items-center">
      <span className="text-[9px] uppercase tracking-wider text-foreground-subtle mb-1">{label}</span>
      <div className={cn('relative', size)}>
        <svg viewBox="0 0 200 160" className="w-full h-full">
          {/* Background arc track */}
          <path d={arcPath(startAngle, endAngle)} fill="none" stroke="hsl(var(--border))" strokeWidth="12" strokeLinecap="round" />

          {/* Active arc - gradient effect via segments */}
          {percentage > 0 && (
            <path d={arcPath(startAngle, valueAngle)} fill="none" stroke="hsl(var(--secondary))" strokeWidth="12" strokeLinecap="round" />
          )}

          {/* Glow on active arc */}
          {percentage > 0 && (
            <path d={arcPath(startAngle, valueAngle)} fill="none" stroke="hsl(var(--secondary))" strokeWidth="16" strokeLinecap="round" opacity="0.15" />
          )}

          {/* Tick marks */}
          {tickPositions.map((tick, i) => {
            const innerR = tick.isMajor ? r - 20 : r - 14;
            const outerR = r - 6;
            return (
              <g key={i}>
                <line
                  x1={cx + innerR * Math.cos(tick.rad)} y1={cy + innerR * Math.sin(tick.rad)}
                  x2={cx + outerR * Math.cos(tick.rad)} y2={cy + outerR * Math.sin(tick.rad)}
                  stroke="hsl(var(--foreground-subtle))" strokeWidth={tick.isMajor ? 1.5 : 0.8}
                />
                {tick.isMajor && (
                  <text
                    x={cx + (r - 28) * Math.cos(tick.rad)} y={cy + (r - 28) * Math.sin(tick.rad)}
                    fill="hsl(var(--foreground-muted))" fontSize={compact ? "7" : "8"} textAnchor="middle" dominantBaseline="middle"
                    fontFamily="JetBrains Mono, monospace"
                  >
                    {tick.value}
                  </text>
                )}
              </g>
            );
          })}

          {/* Needle */}
          <line
            x1={cx} y1={cy}
            x2={cx + needleLen * Math.cos(needleAngle)} y2={cy + needleLen * Math.sin(needleAngle)}
            stroke="hsl(var(--foreground))" strokeWidth="2.5" strokeLinecap="round"
          />
          {/* Needle glow tip */}
          <circle
            cx={cx + needleLen * Math.cos(needleAngle)} cy={cy + needleLen * Math.sin(needleAngle)}
            r="3" fill="hsl(var(--primary))" opacity="0.8"
          />
          {/* Center dot */}
          <circle cx={cx} cy={cy} r="5" fill="hsl(var(--foreground))" />
          <circle cx={cx} cy={cy} r="2.5" fill="hsl(var(--background))" />

          {/* Value display */}
          <text x={cx} y={cy + 28} textAnchor="middle" fill="hsl(var(--secondary))" fontSize={compact ? "18" : "24"} fontWeight="600" fontFamily="JetBrains Mono, monospace">
            {value.toFixed(0).padStart(2, '0')}
          </text>
          <text x={cx} y={cy + 42} textAnchor="middle" fill="hsl(var(--foreground-muted))" fontSize={compact ? "7" : "9"} fontFamily="JetBrains Mono, monospace">
            {unit}
          </text>
        </svg>
      </div>
    </div>
  );
};

const HostLocationMap = ({ lat, lng, country }: { lat: number; lng: number; country: string }) => (
  <div className="relative w-full h-full min-h-[140px] bg-background-surface border border-border overflow-hidden">
    <div className="absolute inset-0" style={{
      backgroundImage: `linear-gradient(hsl(var(--border-subtle)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--border-subtle)) 1px, transparent 1px)`,
      backgroundSize: '20px 20px'
    }} />
    <div className="absolute z-10 flex flex-col items-center" style={{ left: `${((lng + 180) / 360) * 100}%`, top: `${((90 - lat) / 180) * 100}%`, transform: 'translate(-50%, -50%)' }}>
      <div className="w-3 h-3 bg-primary rounded-full glow-primary animate-pulse-subtle" />
      <div className="mt-1 px-1.5 py-0.5 bg-background-elevated border border-border text-[8px] font-mono text-foreground-muted whitespace-nowrap">
        {country} ({lat.toFixed(1)}°, {lng.toFixed(1)}°)
      </div>
    </div>
    <div className="absolute top-2 left-2 flex items-center gap-1">
      <MapPin size={10} className="text-primary" />
      <span className="text-[9px] uppercase tracking-wider text-foreground-subtle">Location</span>
    </div>
    <svg viewBox="0 0 360 180" className="absolute inset-0 w-full h-full opacity-15" preserveAspectRatio="none">
      <ellipse cx="80" cy="55" rx="35" ry="25" fill="hsl(var(--foreground-muted))" />
      <ellipse cx="100" cy="115" rx="18" ry="30" fill="hsl(var(--foreground-muted))" />
      <ellipse cx="185" cy="45" rx="20" ry="15" fill="hsl(var(--foreground-muted))" />
      <ellipse cx="190" cy="95" rx="20" ry="30" fill="hsl(var(--foreground-muted))" />
      <ellipse cx="250" cy="55" rx="45" ry="25" fill="hsl(var(--foreground-muted))" />
      <ellipse cx="290" cy="125" rx="18" ry="12" fill="hsl(var(--foreground-muted))" />
    </svg>
  </div>
);

const InfoRow = ({ icon: Icon, label, value, mono = false, copyable = false }: { icon: any; label: string; value: string; mono?: boolean; copyable?: boolean }) => (
  <div className="flex items-center justify-between py-1.5 border-b border-border-subtle last:border-b-0 gap-2">
    <div className="flex items-center gap-1.5 flex-shrink-0">
      <Icon size={10} className="text-foreground-subtle" />
      <span className="text-[11px] text-foreground-muted">{label}</span>
    </div>
    <div className="flex items-center gap-1 min-w-0">
      <span className={cn('text-[11px] text-right truncate', mono ? 'font-mono text-foreground' : 'text-foreground')}>
        {value}
      </span>
      {copyable && (
        <button onClick={() => navigator.clipboard.writeText(value)} className="flex-shrink-0 p-0.5 hover:text-secondary transition-colors text-foreground-subtle">
          <Copy size={9} />
        </button>
      )}
    </div>
  </div>
);

const generateHostDetail = (hostId: string) => {
  const seed = hostId.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const rand = (min: number, max: number) => {
    const x = Math.sin(seed * 9301 + 49297) % 1;
    return min + Math.abs(x) * (max - min);
  };
  const locations: Record<string, { lat: number; lng: number; country: string }> = {
    'US': { lat: 37.7, lng: -122.4, country: 'United States' },
    'EU': { lat: 48.8, lng: 2.3, country: 'Germany' },
    'Asia': { lat: 35.6, lng: 139.6, country: 'Japan' },
    'South': { lat: -23.5, lng: -46.6, country: 'Brazil' },
  };
  const locKey = ['US', 'EU', 'Asia', 'South'][seed % 4];
  const loc = locations[locKey];
  return {
    id: hostId,
    address: `${Math.floor(rand(1, 255))}.${Math.floor(rand(1, 255))}.${Math.floor(rand(1, 255))}.${Math.floor(rand(1, 255))}:9982`,
    publicKeyV2: `ed25519:${Array.from({ length: 64 }, (_, i) => '0123456789abcdef'[Math.floor(rand(0, 16) + i) % 16]).join('')}`,
    online: rand(0, 1) > 0.15,
    acceptingContracts: rand(0, 1) > 0.1,
    firstSeen: new Date(Date.now() - rand(30, 730) * 86400000),
    lastAnnounced: new Date(Date.now() - rand(0, 48) * 3600000),
    country: loc.country,
    lat: loc.lat + rand(-5, 5),
    lng: loc.lng + rand(-5, 5),
    softwareVersion: `hostd v${Math.floor(rand(1, 2))}.${Math.floor(rand(0, 9))}.${Math.floor(rand(0, 9))}`,
    protocolVersion: `${Math.floor(rand(1, 3))}.${Math.floor(rand(0, 5))}.0`,
    totalStorage: rand(2, 50),
    usedStorage: rand(0.5, 20),
    storagePrice: rand(0.001, 0.005),
    ingressPrice: rand(0.0001, 0.001),
    egressPrice: rand(0.0005, 0.003),
    contractPrice: rand(0.01, 0.1),
    sectorAccessPrice: rand(0.00001, 0.0001),
    collateral: rand(0.1, 5),
    maxCollateral: rand(5, 50),
    uploadSpeed: Math.floor(rand(50, 500)),
    downloadSpeed: Math.floor(rand(100, 1000)),
    uptime: rand(75, 99.9),
    reliability: rand(70, 99),
    contracts: Math.floor(rand(50, 600)),
    successRate: rand(80, 99.5),
    hostScore: rand(60, 98),
    uptimeHistory: Array.from({ length: 30 }, (_, i) => rand(70 + i * 0.3, 99.9)),
    priceHistory: Array.from({ length: 30 }, (_, i) => rand(0.001, 0.005) + Math.sin(i / 5) * 0.0005),
  };
};

const HostDetailPage = () => {
  const { hostId } = useParams<{ hostId: string }>();
  const navigate = useNavigate();
  const [infoExpanded, setInfoExpanded] = useState(true);
  const { isMobile, isTablet } = useMobile();

  const host = useMemo(() => generateHostDetail(hostId || 'unknown'), [hostId]);

  const priceTrend = host.priceHistory[29] > host.priceHistory[0];
  const priceTrendPct = ((host.priceHistory[29] - host.priceHistory[0]) / host.priceHistory[0] * 100).toFixed(1);
  const maxPrice = Math.max(...host.priceHistory);
  const minPrice = Math.min(...host.priceHistory);
  const priceRange = maxPrice - minPrice || 1;

  // ─── MOBILE LAYOUT ───
  if (isMobile) {
    return (
      <div className="flex flex-col min-h-screen">
        {/* Compact mobile header */}
        <div className="h-12 border-b border-border bg-background-elevated/50 backdrop-blur-sm px-3 flex items-center gap-2 sticky top-0 z-20">
          <button onClick={() => navigate('/hosts')} className="p-1 hover:bg-muted/30 transition-colors">
            <ArrowLeft size={16} className="text-foreground-muted" />
          </button>
          <div className={cn('w-2 h-2 rounded-full flex-shrink-0', host.online ? 'bg-success glow-success' : 'bg-primary')} />
          <div className="min-w-0 flex-1">
            <h1 className="font-mono text-xs truncate">{host.id}</h1>
            <span className="text-[9px] text-foreground-muted">{host.address}</span>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <span className={cn('text-[8px] uppercase tracking-wider font-medium px-1.5 py-0.5 border', host.online ? 'text-success border-success/30' : 'text-primary border-primary/30')}>
              {host.online ? 'ON' : 'OFF'}
            </span>
          </div>
        </div>

        <div className="p-3 space-y-3 pb-20">
          {/* Map + Gauges row */}
          <div className="grid grid-cols-5 gap-2">
            <div className="col-span-3">
              <HostLocationMap lat={host.lat} lng={host.lng} country={host.country} />
            </div>
            <div className="col-span-2 flex flex-col items-center justify-center gap-3 bg-background-surface border border-border p-2">
              <SpeedGauge value={host.uploadSpeed} max={1000} label="Upload" unit="Mbps" compact />
              <SpeedGauge value={host.downloadSpeed} max={1000} label="Download" unit="Mbps" compact />
            </div>
          </div>

          {/* 4 metric cards - 2x2 grid */}
          <div className="grid grid-cols-2 gap-2">
            <div className="metric-card flex flex-col gap-0.5 p-2.5">
              <div className="flex items-center gap-1">
                <Database size={10} className="text-secondary" />
                <span className="text-[9px] uppercase tracking-wider text-foreground-subtle">Total Storage</span>
              </div>
              <span className="font-mono text-base text-secondary">{host.totalStorage.toFixed(1)} TB</span>
            </div>
            <div className="metric-card flex flex-col gap-0.5 p-2.5">
              <div className="flex items-center gap-1">
                <HardDrive size={10} className="text-secondary" />
                <span className="text-[9px] uppercase tracking-wider text-foreground-subtle">Used Storage</span>
              </div>
              <span className="font-mono text-base text-foreground">{host.usedStorage.toFixed(1)} TB</span>
              <div className="h-0.5 w-full bg-background overflow-hidden">
                <div className="h-full bg-secondary" style={{ width: `${(host.usedStorage / host.totalStorage) * 100}%` }} />
              </div>
            </div>
            <div className="metric-card flex flex-col gap-0.5 p-2.5">
              <div className="flex items-center gap-1">
                <FileCheck size={10} className="text-success" />
                <span className="text-[9px] uppercase tracking-wider text-foreground-subtle">Contracts</span>
              </div>
              <span className="font-mono text-base text-success">{host.contracts}</span>
            </div>
            <div className="metric-card flex flex-col gap-0.5 p-2.5">
              <div className="flex items-center gap-1">
                <Shield size={10} className="text-primary" />
                <span className="text-[9px] uppercase tracking-wider text-foreground-subtle">Score</span>
              </div>
              <span className={cn('font-mono text-base', host.hostScore >= 90 ? 'text-success' : host.hostScore >= 70 ? 'text-secondary' : 'text-primary')}>
                {host.hostScore.toFixed(1)}
              </span>
            </div>
          </div>

          {/* Host Information - collapsible */}
          <div className="bg-background-surface border border-border">
            <button onClick={() => setInfoExpanded(!infoExpanded)} className="w-full flex items-center justify-between p-3 hover:bg-muted/20 transition-colors">
              <div className="flex items-center gap-1.5">
                <Server size={12} className="text-secondary" />
                <h3 className="text-xs font-semibold">Host Information</h3>
              </div>
              {infoExpanded ? <ChevronUp size={14} className="text-foreground-muted" /> : <ChevronDown size={14} className="text-foreground-muted" />}
            </button>
            {infoExpanded && (
              <div className="px-3 pb-3">
                <InfoRow icon={Globe} label="Netaddress" value={host.address} mono copyable />
                <InfoRow icon={Key} label="Public Key V2" value={host.publicKeyV2.slice(0, 24) + '...'} mono copyable />
                <InfoRow icon={CheckCircle} label="Online" value={host.online ? 'Yes' : 'No'} />
                <InfoRow icon={FileCheck} label="Accepting" value={host.acceptingContracts ? 'Yes' : 'No'} />
                <InfoRow icon={Clock} label="First Seen" value={host.firstSeen.toLocaleDateString()} />
                <InfoRow icon={Clock} label="Last Announced" value={host.lastAnnounced.toLocaleString()} />
                <InfoRow icon={Flag} label="Country" value={host.country} />
                <InfoRow icon={Code} label="Software" value={host.softwareVersion} mono />
                <InfoRow icon={Layers} label="Protocol" value={host.protocolVersion} mono />
                <InfoRow icon={HardDrive} label="Used Storage" value={`${host.usedStorage.toFixed(2)} TB`} mono />
                <InfoRow icon={Database} label="Total Storage" value={`${host.totalStorage.toFixed(2)} TB`} mono />
                <InfoRow icon={DollarSign} label="Storage Price" value={`${host.storagePrice.toFixed(4)} SC/TB/mo`} mono />
                <InfoRow icon={Upload} label="Ingress Price" value={`${host.ingressPrice.toFixed(4)} SC/TB`} mono />
                <InfoRow icon={Download} label="Egress Price" value={`${host.egressPrice.toFixed(4)} SC/TB`} mono />
                <InfoRow icon={DollarSign} label="Contract Price" value={`${host.contractPrice.toFixed(4)} SC`} mono />
                <InfoRow icon={DollarSign} label="Sector Access" value={`${host.sectorAccessPrice.toFixed(6)} SC`} mono />
                <InfoRow icon={Lock} label="Collateral" value={`${host.collateral.toFixed(2)} SC`} mono />
                <InfoRow icon={Lock} label="Max Collateral" value={`${host.maxCollateral.toFixed(2)} SC`} mono />
              </div>
            )}
          </div>

          {/* Uptime History */}
          <div className="bg-background-surface border border-border p-3">
            <h3 className="text-xs font-semibold mb-2 flex items-center gap-1.5">
              <Wifi size={12} className="text-success" />
              Uptime History (30d)
            </h3>
            <div className="flex items-end gap-px h-12">
              {host.uptimeHistory.map((uptime, i) => (
                <div key={i} className={cn('flex-1', uptime >= 95 ? 'bg-success' : uptime >= 80 ? 'bg-secondary' : 'bg-primary')} style={{ height: `${uptime}%` }} />
              ))}
            </div>
            <div className="flex justify-between mt-1 text-[9px] text-foreground-subtle">
              <span>30d ago</span><span>Today</span>
            </div>
          </div>

          {/* Price Trend */}
          <div className="bg-background-surface border border-border p-3">
            <h3 className="text-xs font-semibold mb-2 flex items-center gap-1.5">
              <DollarSign size={12} className="text-secondary" />
              Price Trend
            </h3>
            <div className="flex items-center gap-2 mb-2">
              <span className="font-mono text-base text-secondary">${host.storagePrice.toFixed(4)}</span>
              <span className="text-[10px] text-foreground-muted">/TB/mo</span>
              <div className={cn('flex items-center gap-0.5 text-[10px]', priceTrend ? 'text-primary' : 'text-success')}>
                {priceTrend ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                <span>{priceTrend ? '+' : ''}{priceTrendPct}%</span>
              </div>
            </div>
            <div className="flex items-end gap-px h-10">
              {host.priceHistory.map((price, i) => (
                <div key={i} className="flex-1 bg-secondary/60" style={{ height: `${Math.max(((price - minPrice) / priceRange) * 100, 5)}%` }} />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── DESKTOP / TABLET LAYOUT ───
  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="h-12 border-b border-border bg-background-elevated/50 backdrop-blur-sm px-4 flex items-center gap-3 sticky top-0 z-20">
        <button onClick={() => navigate('/hosts')} className="p-1.5 hover:bg-muted/30 transition-colors">
          <ArrowLeft size={16} className="text-foreground-muted" />
        </button>
        <div className={cn('w-2.5 h-2.5 rounded-full', host.online ? 'bg-success glow-success' : 'bg-primary')} />
        <div>
          <h1 className="font-mono text-sm">{host.id}</h1>
          <span className="text-[10px] text-foreground-muted">{host.address}</span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className={cn('text-[10px] uppercase tracking-wider font-medium px-2 py-0.5 border', host.online ? 'text-success border-success/30 bg-success/5' : 'text-primary border-primary/30 bg-primary/5')}>
            {host.online ? 'Online' : 'Offline'}
          </span>
          <span className={cn('text-[10px] uppercase tracking-wider font-medium px-2 py-0.5 border', host.acceptingContracts ? 'text-secondary border-secondary/30 bg-secondary/5' : 'text-foreground-muted border-border')}>
            {host.acceptingContracts ? 'Accepting' : 'Not Accepting'}
          </span>
        </div>
      </div>

      <div className={cn('p-4 space-y-4', isTablet && 'p-3 space-y-3')}>
        {/* Row 1: Map + Gauges + 4 Metric Cards — all in one row */}
        <div className={cn('grid gap-3', isTablet ? 'grid-cols-1' : 'grid-cols-12')}>
          {/* Map */}
          <div className={cn(isTablet ? 'h-40' : 'col-span-5 h-[180px]')}>
            <HostLocationMap lat={host.lat} lng={host.lng} country={host.country} />
          </div>
          {/* Speed Gauges */}
          <div className={cn('flex items-center justify-center gap-8 bg-background-surface border border-border', isTablet ? 'py-3' : 'col-span-3 flex-col gap-4 py-2')}>
            <SpeedGauge value={host.uploadSpeed} max={1000} label="Upload Speed" unit="Mbps" />
            <SpeedGauge value={host.downloadSpeed} max={1000} label="Download Speed" unit="Mbps" />
          </div>
          {/* 4 Metric cards inline */}
          <div className={cn('grid grid-cols-2 gap-2', isTablet ? '' : 'col-span-4')}>
            <div className="metric-card flex flex-col gap-0.5 p-3">
              <div className="flex items-center gap-1">
                <Database size={10} className="text-secondary" />
                <span className="text-[9px] uppercase tracking-wider text-foreground-subtle">Total Storage</span>
              </div>
              <span className="font-mono text-lg text-secondary">{host.totalStorage.toFixed(1)} TB</span>
            </div>
            <div className="metric-card flex flex-col gap-0.5 p-3">
              <div className="flex items-center gap-1">
                <HardDrive size={10} className="text-secondary" />
                <span className="text-[9px] uppercase tracking-wider text-foreground-subtle">Used Storage</span>
              </div>
              <span className="font-mono text-lg text-foreground">{host.usedStorage.toFixed(1)} TB</span>
              <div className="h-1 w-full bg-background overflow-hidden mt-0.5">
                <div className="h-full bg-secondary" style={{ width: `${(host.usedStorage / host.totalStorage) * 100}%` }} />
              </div>
            </div>
            <div className="metric-card flex flex-col gap-0.5 p-3">
              <div className="flex items-center gap-1">
                <FileCheck size={10} className="text-success" />
                <span className="text-[9px] uppercase tracking-wider text-foreground-subtle">Active Contracts</span>
              </div>
              <span className="font-mono text-lg text-success">{host.contracts}</span>
            </div>
            <div className="metric-card flex flex-col gap-0.5 p-3">
              <div className="flex items-center gap-1">
                <Shield size={10} className="text-primary" />
                <span className="text-[9px] uppercase tracking-wider text-foreground-subtle">Host Score</span>
              </div>
              <span className={cn('font-mono text-lg', host.hostScore >= 90 ? 'text-success' : host.hostScore >= 70 ? 'text-secondary' : 'text-primary')}>
                {host.hostScore.toFixed(1)}
              </span>
            </div>
          </div>
        </div>

        {/* Row 2: Host Information */}
        <div className="bg-background-surface border border-border">
          <button onClick={() => setInfoExpanded(!infoExpanded)} className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-muted/20 transition-colors">
            <div className="flex items-center gap-2">
              <Server size={13} className="text-secondary" />
              <h3 className="text-xs font-semibold">Host Information</h3>
            </div>
            {infoExpanded ? <ChevronUp size={14} className="text-foreground-muted" /> : <ChevronDown size={14} className="text-foreground-muted" />}
          </button>
          {infoExpanded && (
            <div className={cn('px-4 pb-3', isTablet ? 'grid-cols-1' : 'grid grid-cols-3 gap-x-6')}>
              <div>
                <InfoRow icon={Globe} label="Netaddress" value={host.address} mono copyable />
                <InfoRow icon={Key} label="Public Key V2" value={host.publicKeyV2.slice(0, 30) + '...'} mono copyable />
                <InfoRow icon={CheckCircle} label="Online" value={host.online ? 'Yes' : 'No'} />
                <InfoRow icon={FileCheck} label="Accepting Contracts" value={host.acceptingContracts ? 'Yes' : 'No'} />
                <InfoRow icon={Clock} label="First Seen" value={host.firstSeen.toLocaleDateString()} />
                <InfoRow icon={Clock} label="Last Announced" value={host.lastAnnounced.toLocaleString()} />
              </div>
              <div>
                <InfoRow icon={Flag} label="Country" value={host.country} />
                <InfoRow icon={Code} label="Software Version" value={host.softwareVersion} mono />
                <InfoRow icon={Layers} label="Protocol Version" value={host.protocolVersion} mono />
                <InfoRow icon={HardDrive} label="Used Storage" value={`${host.usedStorage.toFixed(2)} TB`} mono />
                <InfoRow icon={Database} label="Total Storage" value={`${host.totalStorage.toFixed(2)} TB`} mono />
                <InfoRow icon={DollarSign} label="Storage Price" value={`${host.storagePrice.toFixed(4)} SC/TB/mo`} mono />
              </div>
              <div>
                <InfoRow icon={Upload} label="Ingress Price" value={`${host.ingressPrice.toFixed(4)} SC/TB`} mono />
                <InfoRow icon={Download} label="Egress Price" value={`${host.egressPrice.toFixed(4)} SC/TB`} mono />
                <InfoRow icon={DollarSign} label="Contract Price" value={`${host.contractPrice.toFixed(4)} SC`} mono />
                <InfoRow icon={DollarSign} label="Sector Access Price" value={`${host.sectorAccessPrice.toFixed(6)} SC`} mono />
                <InfoRow icon={Lock} label="Collateral" value={`${host.collateral.toFixed(2)} SC`} mono />
                <InfoRow icon={Lock} label="Max Collateral" value={`${host.maxCollateral.toFixed(2)} SC`} mono />
              </div>
            </div>
          )}
        </div>

        {/* Row 3: Uptime + Price side by side */}
        <div className={cn('grid gap-3', isTablet ? 'grid-cols-1' : 'grid-cols-2')}>
          <div className="bg-background-surface border border-border p-4">
            <h3 className="text-xs font-semibold mb-3 flex items-center gap-1.5">
              <Wifi size={12} className="text-success" />
              Uptime History (30 days)
            </h3>
            <div className="flex items-end gap-px h-16">
              {host.uptimeHistory.map((uptime, i) => (
                <div key={i} className={cn('flex-1 hover:opacity-80 transition-opacity', uptime >= 95 ? 'bg-success' : uptime >= 80 ? 'bg-secondary' : 'bg-primary')} style={{ height: `${uptime}%` }} title={`Day ${i + 1}: ${uptime.toFixed(1)}%`} />
              ))}
            </div>
            <div className="flex justify-between mt-1.5 text-[9px] text-foreground-subtle">
              <span>30 days ago</span><span>Today</span>
            </div>
          </div>

          <div className="bg-background-surface border border-border p-4">
            <h3 className="text-xs font-semibold mb-3 flex items-center gap-1.5">
              <DollarSign size={12} className="text-secondary" />
              Price Trend
            </h3>
            <div className="flex items-center gap-2 mb-3">
              <span className="font-mono text-lg text-secondary">${host.storagePrice.toFixed(4)}</span>
              <span className="text-[10px] text-foreground-muted">/TB/mo</span>
              <div className={cn('flex items-center gap-0.5 text-xs', priceTrend ? 'text-primary' : 'text-success')}>
                {priceTrend ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                <span>{priceTrend ? '+' : ''}{priceTrendPct}%</span>
              </div>
            </div>
            <div className="flex items-end gap-px h-12">
              {host.priceHistory.map((price, i) => {
                const height = ((price - minPrice) / priceRange) * 100;
                return (
                  <div key={i} className="flex-1 bg-secondary/60 hover:bg-secondary transition-colors" style={{ height: `${Math.max(height, 5)}%` }} />
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HostDetailPage;
