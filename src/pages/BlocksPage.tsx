import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { ArrowRight, Clock, Hash, Layers, ChevronDown } from 'lucide-react';
import { SearchInput } from '@/components/search/SearchInput';
import { MobileBlockCard } from '@/components/mobile/MobileBlockCard';
import { MobileBottomSheet } from '@/components/mobile/MobileBottomSheet';
import { useMobile } from '@/hooks/useMobile';

interface Block {
  height: number;
  hash: string;
  txCount: number;
  fees: number;
  timestamp: Date;
  size: number;
  miner: string;
}

const generateMockBlocks = (count: number, startHeight: number): Block[] => {
  return Array.from({ length: count }, (_, i) => ({
    height: startHeight - i,
    hash: `0000000000000000000${Math.random().toString(16).slice(2, 50)}`,
    txCount: Math.floor(Math.random() * 80) + 5,
    fees: Math.random() * 10,
    timestamp: new Date(Date.now() - i * 600000),
    size: Math.floor(Math.random() * 500000) + 100000,
    miner: `host_${Math.random().toString(36).slice(2, 8)}`,
  }));
};

const BlocksPage = () => {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [selectedBlock, setSelectedBlock] = useState<Block | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedHeight, setHighlightedHeight] = useState<number | null>(null);
  const blockRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const { isMobile } = useMobile();

  useEffect(() => {
    setBlocks(generateMockBlocks(50, 489271));
  }, []);

  // Handle search
  useEffect(() => {
    if (searchQuery) {
      const height = parseInt(searchQuery);
      if (!isNaN(height)) {
        const block = blocks.find(b => b.height === height);
        if (block) {
          setHighlightedHeight(height);
          const element = blockRefs.current.get(height);
          element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
          setHighlightedHeight(null);
        }
      } else {
        const block = blocks.find(b => b.hash.toLowerCase().includes(searchQuery.toLowerCase()));
        if (block) {
          setHighlightedHeight(block.height);
          const element = blockRefs.current.get(block.height);
          element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
          setHighlightedHeight(null);
        }
      }
    } else {
      setHighlightedHeight(null);
    }
  }, [searchQuery, blocks]);

  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  // Mobile View
  if (isMobile) {
    return (
      <div className="flex flex-col">
        {/* Mobile Block List */}
        <div className="divide-y divide-border">
          {blocks.map((block) => (
            <MobileBlockCard
              key={block.height}
              height={block.height}
              txCount={block.txCount}
              timestamp={block.timestamp}
              fees={block.fees}
              hash={block.hash}
              onTap={() => setSelectedBlock(block)}
            />
          ))}
        </div>

        {/* Block Detail Bottom Sheet */}
        <MobileBottomSheet
          isOpen={!!selectedBlock}
          onClose={() => setSelectedBlock(null)}
          title={`Block #${selectedBlock?.height.toLocaleString()}`}
          height="half"
        >
          {selectedBlock && (
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-muted/30 p-3">
                  <div className="text-[9px] uppercase tracking-wider text-foreground-subtle mb-1">
                    <Hash size={10} className="inline mr-1" />Height
                  </div>
                  <div className="text-sm font-mono font-medium text-secondary">
                    #{selectedBlock.height.toLocaleString()}
                  </div>
                </div>
                <div className="bg-muted/30 p-3">
                  <div className="text-[9px] uppercase tracking-wider text-foreground-subtle mb-1">
                    <Clock size={10} className="inline mr-1" />Time
                  </div>
                  <div className="text-sm font-mono">
                    {formatTimeAgo(selectedBlock.timestamp)}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm py-2 border-b border-border-subtle">
                  <span className="text-foreground-muted">Transactions</span>
                  <span className="font-mono text-secondary">{selectedBlock.txCount}</span>
                </div>
                <div className="flex justify-between text-sm py-2 border-b border-border-subtle">
                  <span className="text-foreground-muted">Total Fees</span>
                  <span className="font-mono">{selectedBlock.fees.toFixed(6)} SC</span>
                </div>
                <div className="flex justify-between text-sm py-2 border-b border-border-subtle">
                  <span className="text-foreground-muted">Size</span>
                  <span className="font-mono">{(selectedBlock.size / 1000).toFixed(1)} KB</span>
                </div>
                <div className="flex justify-between text-sm py-2 border-b border-border-subtle">
                  <span className="text-foreground-muted">Miner</span>
                  <span className="font-mono text-foreground-subtle">{selectedBlock.miner}</span>
                </div>
              </div>

              <div>
                <div className="text-[9px] uppercase tracking-wider text-foreground-subtle mb-1">
                  Block Hash
                </div>
                <div className="text-xs font-mono break-all text-foreground-muted bg-muted/30 p-2">
                  {selectedBlock.hash}
                </div>
              </div>
            </div>
          )}
        </MobileBottomSheet>
      </div>
    );
  }

  // Desktop View
  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="h-16 border-b border-border bg-background-elevated/50 backdrop-blur-sm px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Layers size={20} className="text-secondary" />
          <h1 className="text-lg font-semibold">Block Chain</h1>
        </div>
        <div className="flex items-center gap-4">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Block height (234567) or hash..."
            className="w-72"
          />
          <div className="flex items-center gap-2 text-foreground-subtle">
            <span className="text-xs font-mono">Latest:</span>
            <span className="text-sm font-mono text-secondary">{blocks[0]?.height.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Block Chain - Vertical */}
        <div className="flex-1 p-6">
          <div className="space-y-0">
            {blocks.map((block, index) => {
              const isHighlighted = highlightedHeight === block.height;
              
              return (
                <div 
                  key={block.height} 
                  className="relative"
                  ref={(el) => {
                    if (el) blockRefs.current.set(block.height, el);
                  }}
                >
                  {index > 0 && (
                    <div className="absolute left-4 -top-4 w-px h-4 bg-border" />
                  )}
                  
                  <div
                    className={cn(
                      'block-node group cursor-pointer',
                      selectedBlock?.height === block.height && 'border-primary glow-primary',
                      isHighlighted && !selectedBlock && 'border-secondary ring-2 ring-secondary/30 bg-secondary/10'
                    )}
                    onClick={() => setSelectedBlock(block)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          'w-8 h-8 flex items-center justify-center border',
                          selectedBlock?.height === block.height 
                            ? 'border-primary bg-primary/10' 
                            : isHighlighted
                            ? 'border-secondary bg-secondary/20'
                            : 'border-border bg-background'
                        )}>
                          <span className="text-xs font-mono text-secondary">
                            {(index + 1).toString().padStart(2, '0')}
                          </span>
                        </div>

                        <div className="flex flex-col">
                          <span className="font-mono text-sm text-foreground">
                            #{block.height.toLocaleString()}
                          </span>
                          <span className="font-mono text-[10px] text-foreground-subtle truncate max-w-[300px]">
                            {block.hash}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="flex flex-col items-end">
                          <span className="text-xs text-foreground-muted">Transactions</span>
                          <span className="font-mono text-sm text-secondary">{block.txCount}</span>
                        </div>
                        
                        <div className="flex flex-col items-end">
                          <span className="text-xs text-foreground-muted">Fees</span>
                          <span className="font-mono text-sm">{block.fees.toFixed(4)} SC</span>
                        </div>

                        <div className="flex flex-col items-end">
                          <span className="text-xs text-foreground-muted">Time</span>
                          <span className="font-mono text-xs text-foreground-subtle">
                            {formatTimeAgo(block.timestamp)}
                          </span>
                        </div>

                        <ArrowRight 
                          size={16} 
                          className={cn(
                            'text-foreground-subtle transition-all',
                            'group-hover:text-primary group-hover:translate-x-1'
                          )} 
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Detail Panel */}
        <div 
          className={cn(
            'w-[400px] border-l border-border bg-background-elevated/80 backdrop-blur-xl',
            'transition-all duration-300 overflow-hidden',
            selectedBlock ? 'translate-x-0' : 'translate-x-full w-0'
          )}
        >
          {selectedBlock && (
            <div className="p-6 animate-fade-in">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold">Block Intelligence</h2>
                <button 
                  onClick={() => setSelectedBlock(null)}
                  className="text-foreground-muted hover:text-foreground transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div className="metric-card">
                  <div className="flex items-center gap-2 mb-2">
                    <Hash size={14} className="text-secondary" />
                    <span className="text-[10px] uppercase tracking-wider text-foreground-subtle">
                      Block Height
                    </span>
                  </div>
                  <span className="font-mono text-xl text-secondary">
                    #{selectedBlock.height.toLocaleString()}
                  </span>
                </div>

                <div className="metric-card">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock size={14} className="text-foreground-muted" />
                    <span className="text-[10px] uppercase tracking-wider text-foreground-subtle">
                      Timestamp
                    </span>
                  </div>
                  <span className="font-mono text-sm">
                    {selectedBlock.timestamp.toLocaleString()}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground-muted">Hash</span>
                    <span className="font-mono text-xs text-foreground-subtle truncate max-w-[200px]">
                      {selectedBlock.hash}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground-muted">Transactions</span>
                    <span className="font-mono text-secondary">{selectedBlock.txCount}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground-muted">Total Fees</span>
                    <span className="font-mono">{selectedBlock.fees.toFixed(6)} SC</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground-muted">Size</span>
                    <span className="font-mono">{(selectedBlock.size / 1000).toFixed(1)} KB</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground-muted">Miner</span>
                    <span className="font-mono text-foreground-subtle">{selectedBlock.miner}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BlocksPage;
