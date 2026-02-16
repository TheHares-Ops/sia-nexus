import { useParams, useNavigate } from 'react-router-dom';
import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import {
  ArrowLeft, MapPin, Gauge, HardDrive, Database, FileCheck, Shield,
  Wifi, DollarSign, TrendingUp, TrendingDown, Globe, Server,
  Key, CheckCircle, Clock, Flag, Code, Layers, Upload, Download,
  Lock, ChevronDown, ChevronUp
} from 'lucide-react';

// Speed gauge component
const SpeedGauge = ({ value, max, label, unit }: { value: number; max: number; label: string; unit: string }) => {
  const percentage = (value / max) * 100;
  const angle = (percentage / 100) * 180 - 90; // -90 to 90 degrees

  return (
    <div className="flex flex-col items-center gap-2">
      <span className="text-[10px] uppercase tracking-wider text-foreground-subtle">{label}</span>
      <div className="relative w-32 h-16 overflow-hidden">
        {/* Background arc */}
        <svg viewBox="0 0 120 60" className="w-full h-full">
          <path
            d="M 10 55 A 50 50 0 0 1 110 55"
            fill="none"
            stroke="hsl(var(--border))"
            strokeWidth="8"
            strokeLinecap="round"
          />
          <path
            d="M 10 55 A 50 50 0 0 1 110 55"
            fill="none"
            stroke="hsl(var(--secondary))"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${percentage * 1.57} 157`}
          />
          {/* Needle */}
          <line
            x1="60"
            y1="55"
            x2={60 + 35 * Math.cos((angle * Math.PI) / 180)}
            y2={55 - 35 * Math.sin((angle * Math.PI) / 180)}
            stroke="hsl(var(--primary))"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <circle cx="60" cy="55" r="3" fill="hsl(var(--primary))" />
        </svg>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="font-mono text-lg text-secondary">{value}</span>
        <span className="text-[10px] text-foreground-muted">{unit}</span>
      </div>
    </div>
  );
};

// Mini map placeholder
const HostLocationMap = ({ lat, lng, country }: { lat: number; lng: number; country: string }) => (
  <div className="relative w-full h-48 bg-background-surface border border-border overflow-hidden">
    {/* Simplified world map grid */}
    <div className="absolute inset-0" style={{
      backgroundImage: `
        linear-gradient(hsl(var(--border-subtle)) 1px, transparent 1px),
        linear-gradient(90deg, hsl(var(--border-subtle)) 1px, transparent 1px)
      `,
      backgroundSize: '20px 20px'
    }} />
    {/* Location marker */}
    <div
      className="absolute z-10 flex flex-col items-center"
      style={{
        left: `${((lng + 180) / 360) * 100}%`,
        top: `${((90 - lat) / 180) * 100}%`,
        transform: 'translate(-50%, -50%)'
      }}
    >
      <div className="w-4 h-4 bg-primary rounded-full glow-primary animate-pulse-subtle" />
      <div className="mt-1 px-2 py-0.5 bg-background-elevated border border-border text-[9px] font-mono text-foreground-muted whitespace-nowrap">
        {country} ({lat.toFixed(1)}°, {lng.toFixed(1)}°)
      </div>
    </div>
    {/* Map label */}
    <div className="absolute top-2 left-3 flex items-center gap-1.5">
      <MapPin size={12} className="text-primary" />
      <span className="text-[10px] uppercase tracking-wider text-foreground-subtle">Host Location</span>
    </div>
    {/* Continent outlines approximation */}
    <svg viewBox="0 0 360 180" className="absolute inset-0 w-full h-full opacity-20" preserveAspectRatio="none">
      {/* North America */}
      <ellipse cx="80" cy="55" rx="35" ry="25" fill="hsl(var(--foreground-muted))" />
      {/* South America */}
      <ellipse cx="100" cy="115" rx="18" ry="30" fill="hsl(var(--foreground-muted))" />
      {/* Europe */}
      <ellipse cx="185" cy="45" rx="20" ry="15" fill="hsl(var(--foreground-muted))" />
      {/* Africa */}
      <ellipse cx="190" cy="95" rx="20" ry="30" fill="hsl(var(--foreground-muted))" />
      {/* Asia */}
      <ellipse cx="250" cy="55" rx="45" ry="25" fill="hsl(var(--foreground-muted))" />
      {/* Australia */}
      <ellipse cx="290" cy="125" rx="18" ry="12" fill="hsl(var(--foreground-muted))" />
    </svg>
  </div>
);

const InfoRow = ({ icon: Icon, label, value, mono = false }: { icon: any; label: string; value: string; mono?: boolean }) => (
  <div className="flex items-center justify-between py-2 border-b border-border-subtle last:border-b-0">
    <div className="flex items-center gap-2">
      <Icon size={12} className="text-foreground-subtle flex-shrink-0" />
      <span className="text-xs text-foreground-muted">{label}</span>
    </div>
    <span className={cn('text-xs text-right max-w-[60%] truncate', mono ? 'font-mono text-foreground' : 'text-foreground')}>
      {value}
    </span>
  </div>
);

// Generate mock host data based on ID
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

const ScoreIndicator = ({ score, label }: { score: number; label: string }) => (
  <div className="flex flex-col gap-1">
    <span className="text-[10px] uppercase tracking-wider text-foreground-subtle">{label}</span>
    <div className="flex items-center gap-2">
      <div className="h-1 w-16 bg-background overflow-hidden">
        <div
          className={cn(
            'h-full',
            score >= 90 ? 'bg-success' : score >= 70 ? 'bg-secondary' : 'bg-primary'
          )}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className={cn(
        'font-mono text-xs',
        score >= 90 ? 'text-success' : score >= 70 ? 'text-secondary' : 'text-primary'
      )}>
        {score.toFixed(0)}
      </span>
    </div>
  </div>
);

const HostDetailPage = () => {
  const { hostId } = useParams<{ hostId: string }>();
  const navigate = useNavigate();
  const [infoExpanded, setInfoExpanded] = useState(true);

  const host = useMemo(() => generateHostDetail(hostId || 'unknown'), [hostId]);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="h-14 border-b border-border bg-background-elevated/50 backdrop-blur-sm px-6 flex items-center gap-4">
        <button
          onClick={() => navigate('/hosts')}
          className="p-1.5 hover:bg-muted/30 transition-colors"
        >
          <ArrowLeft size={18} className="text-foreground-muted" />
        </button>
        <div className="flex items-center gap-3">
          <div className={cn(
            'w-2.5 h-2.5 rounded-full',
            host.online ? 'bg-success glow-success' : 'bg-primary'
          )} />
          <div>
            <h1 className="font-mono text-sm">{host.id}</h1>
            <span className="text-[10px] text-foreground-muted">{host.address}</span>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className={cn(
            'text-[10px] uppercase tracking-wider font-medium px-2 py-0.5 border',
            host.online
              ? 'text-success border-success/30 bg-success/5'
              : 'text-primary border-primary/30 bg-primary/5'
          )}>
            {host.online ? 'Online' : 'Offline'}
          </span>
          <span className={cn(
            'text-[10px] uppercase tracking-wider font-medium px-2 py-0.5 border',
            host.acceptingContracts
              ? 'text-secondary border-secondary/30 bg-secondary/5'
              : 'text-foreground-muted border-border'
          )}>
            {host.acceptingContracts ? 'Accepting' : 'Not Accepting'}
          </span>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Row 1: Map + Speed Gauges */}
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2">
            <HostLocationMap lat={host.lat} lng={host.lng} country={host.country} />
          </div>
          <div className="flex flex-col items-center justify-center gap-6 bg-background-surface border border-border p-4">
            <SpeedGauge value={host.uploadSpeed} max={1000} label="Upload Speed" unit="Mbps" />
            <SpeedGauge value={host.downloadSpeed} max={1000} label="Download Speed" unit="Mbps" />
          </div>
        </div>

        {/* Row 2: 4 Metric Cards */}
        <div className="grid grid-cols-4 gap-3">
          <div className="metric-card flex flex-col gap-1">
            <div className="flex items-center gap-1.5">
              <Database size={12} className="text-secondary" />
              <span className="text-[10px] uppercase tracking-wider text-foreground-subtle">Total Storage</span>
            </div>
            <span className="font-mono text-xl text-secondary">{host.totalStorage.toFixed(1)} TB</span>
          </div>
          <div className="metric-card flex flex-col gap-1">
            <div className="flex items-center gap-1.5">
              <HardDrive size={12} className="text-secondary" />
              <span className="text-[10px] uppercase tracking-wider text-foreground-subtle">Used Storage</span>
            </div>
            <span className="font-mono text-xl text-foreground">{host.usedStorage.toFixed(1)} TB</span>
            <div className="h-1 w-full bg-background overflow-hidden mt-1">
              <div className="h-full bg-secondary" style={{ width: `${(host.usedStorage / host.totalStorage) * 100}%` }} />
            </div>
          </div>
          <div className="metric-card flex flex-col gap-1">
            <div className="flex items-center gap-1.5">
              <FileCheck size={12} className="text-success" />
              <span className="text-[10px] uppercase tracking-wider text-foreground-subtle">Active Contracts</span>
            </div>
            <span className="font-mono text-xl text-success">{host.contracts}</span>
          </div>
          <div className="metric-card flex flex-col gap-1">
            <div className="flex items-center gap-1.5">
              <Shield size={12} className="text-primary" />
              <span className="text-[10px] uppercase tracking-wider text-foreground-subtle">Host Score</span>
            </div>
            <span className={cn(
              'font-mono text-xl',
              host.hostScore >= 90 ? 'text-success' : host.hostScore >= 70 ? 'text-secondary' : 'text-primary'
            )}>
              {host.hostScore.toFixed(1)}
            </span>
          </div>
        </div>

        {/* Row 3: Host Information */}
        <div className="bg-background-surface border border-border">
          <button
            onClick={() => setInfoExpanded(!infoExpanded)}
            className="w-full flex items-center justify-between p-4 hover:bg-muted/20 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Server size={14} className="text-secondary" />
              <h3 className="text-sm font-semibold">Host Information</h3>
            </div>
            {infoExpanded ? <ChevronUp size={16} className="text-foreground-muted" /> : <ChevronDown size={16} className="text-foreground-muted" />}
          </button>
          {infoExpanded && (
            <div className="px-4 pb-4 grid grid-cols-2 gap-x-8">
              <div>
                <InfoRow icon={Globe} label="Netaddress" value={host.address} mono />
                <InfoRow icon={Key} label="Public Key V2" value={host.publicKeyV2.slice(0, 30) + '...'} mono />
                <InfoRow icon={CheckCircle} label="Online" value={host.online ? 'Yes' : 'No'} />
                <InfoRow icon={FileCheck} label="Accepting Contracts" value={host.acceptingContracts ? 'Yes' : 'No'} />
                <InfoRow icon={Clock} label="First Seen" value={host.firstSeen.toLocaleDateString()} />
                <InfoRow icon={Clock} label="Last Announced" value={host.lastAnnounced.toLocaleString()} />
                <InfoRow icon={Flag} label="Country" value={host.country} />
                <InfoRow icon={Code} label="Software Version" value={host.softwareVersion} mono />
                <InfoRow icon={Layers} label="Protocol Version" value={host.protocolVersion} mono />
              </div>
              <div>
                <InfoRow icon={HardDrive} label="Used Storage" value={`${host.usedStorage.toFixed(2)} TB`} mono />
                <InfoRow icon={Database} label="Total Storage" value={`${host.totalStorage.toFixed(2)} TB`} mono />
                <InfoRow icon={DollarSign} label="Storage Price" value={`${host.storagePrice.toFixed(4)} SC/TB/mo`} mono />
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

        {/* Row 4: Uptime History + Price Trend */}
        <div className="grid grid-cols-2 gap-4">
          {/* Uptime History */}
          <div className="bg-background-surface border border-border p-4">
            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
              <Wifi size={14} className="text-success" />
              Uptime History (30 days)
            </h3>
            <div className="flex items-end gap-px h-20">
              {host.uptimeHistory.map((uptime, i) => (
                <div
                  key={i}
                  className={cn(
                    'flex-1 transition-all hover:opacity-80',
                    uptime >= 95 ? 'bg-success' : uptime >= 80 ? 'bg-secondary' : 'bg-primary'
                  )}
                  style={{ height: `${uptime}%` }}
                  title={`Day ${i + 1}: ${uptime.toFixed(1)}%`}
                />
              ))}
            </div>
            <div className="flex justify-between mt-2 text-[10px] text-foreground-subtle">
              <span>30 days ago</span>
              <span>Today</span>
            </div>
          </div>

          {/* Price Trend */}
          <div className="bg-background-surface border border-border p-4">
            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
              <DollarSign size={14} className="text-secondary" />
              Price Trend
            </h3>
            <div className="flex items-center gap-3 mb-4">
              <span className="font-mono text-xl text-secondary">
                ${host.storagePrice.toFixed(4)}
              </span>
              <span className="text-xs text-foreground-muted">/TB/mo</span>
              {host.priceHistory[29] > host.priceHistory[0] ? (
                <div className="flex items-center gap-1 text-primary">
                  <TrendingUp size={14} />
                  <span className="text-xs">+{((host.priceHistory[29] - host.priceHistory[0]) / host.priceHistory[0] * 100).toFixed(1)}%</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-success">
                  <TrendingDown size={14} />
                  <span className="text-xs">{((host.priceHistory[29] - host.priceHistory[0]) / host.priceHistory[0] * 100).toFixed(1)}%</span>
                </div>
              )}
            </div>
            <div className="flex items-end gap-px h-14">
              {host.priceHistory.map((price, i) => {
                const maxPrice = Math.max(...host.priceHistory);
                const minPrice = Math.min(...host.priceHistory);
                const range = maxPrice - minPrice || 1;
                const height = ((price - minPrice) / range) * 100;
                return (
                  <div
                    key={i}
                    className="flex-1 bg-secondary/60 hover:bg-secondary transition-colors"
                    style={{ height: `${Math.max(height, 5)}%` }}
                  />
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
