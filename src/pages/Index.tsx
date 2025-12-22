import { useState, useRef } from 'react';
import { StatusRail } from '@/components/network/StatusRail';
import { BlockchainTimeline } from '@/components/network/BlockchainTimeline';
import { TransactionFlow } from '@/components/network/TransactionFlow';
import { NetworkMetrics } from '@/components/network/NetworkMetrics';
import { BlockDetailPanel } from '@/components/network/BlockDetailPanel';
import { MobileBlockCard } from '@/components/mobile/MobileBlockCard';
import { MobileBottomSheet } from '@/components/mobile/MobileBottomSheet';
import { useMobile } from '@/hooks/useMobile';
import { Activity, Box, ArrowRightLeft } from 'lucide-react';

interface Block {
  height: number;
  txCount: number;
  timestamp: Date;
  hash: string;
  fees: number;
}

// Mock recent blocks for mobile
const recentBlocks: Block[] = Array.from({ length: 10 }, (_, i) => ({
  height: 234567 - i,
  txCount: Math.floor(Math.random() * 50) + 5,
  timestamp: new Date(Date.now() - i * 120000),
  hash: `0x${Math.random().toString(16).slice(2)}${Math.random().toString(16).slice(2)}`.slice(0, 66),
  fees: Math.random() * 0.5,
}));

const Index = () => {
  const [selectedBlock, setSelectedBlock] = useState<Block | null>(null);
  const { isMobile } = useMobile();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Mobile view
  if (isMobile) {
    return (
      <div className="flex flex-col">
        {/* Network Activity Section */}
        <section className="border-b border-border">
          <div className="px-3 py-2 flex items-center gap-2">
            <Activity size={12} className="text-primary" />
            <span className="text-[10px] uppercase tracking-wider text-foreground-subtle">
              Network Activity
            </span>
          </div>
          
          {/* Horizontal scrollable block timeline */}
          <div 
            ref={scrollRef}
            className="flex overflow-x-auto scrollbar-hide px-3 pb-3"
          >
            {recentBlocks.map((block) => (
              <MobileBlockCard
                key={block.height}
                {...block}
                compact
                onTap={() => setSelectedBlock(block)}
              />
            ))}
          </div>
        </section>

        {/* Recent Blocks List */}
        <section>
          <div className="px-3 py-2 flex items-center justify-between border-b border-border">
            <div className="flex items-center gap-2">
              <Box size={12} className="text-secondary" />
              <span className="text-[10px] uppercase tracking-wider text-foreground-subtle">
                Recent Blocks
              </span>
            </div>
            <span className="text-[9px] text-foreground-muted">
              Tap to view details
            </span>
          </div>
          
          <div className="divide-y divide-border">
            {recentBlocks.slice(0, 5).map((block) => (
              <MobileBlockCard
                key={block.height}
                {...block}
                onTap={() => setSelectedBlock(block)}
              />
            ))}
          </div>
        </section>

        {/* Quick Stats */}
        <section className="p-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-muted/30 border border-border p-3">
              <div className="text-[9px] uppercase tracking-wider text-foreground-subtle mb-1">
                Avg Block Time
              </div>
              <div className="text-lg font-mono font-medium text-secondary">
                10.2<span className="text-xs text-foreground-muted">min</span>
              </div>
            </div>
            <div className="bg-muted/30 border border-border p-3">
              <div className="text-[9px] uppercase tracking-wider text-foreground-subtle mb-1">
                Pending Txns
              </div>
              <div className="text-lg font-mono font-medium">
                24
              </div>
            </div>
          </div>
        </section>

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
                <div>
                  <div className="text-[9px] uppercase tracking-wider text-foreground-subtle mb-1">
                    Height
                  </div>
                  <div className="text-sm font-mono font-medium">
                    {selectedBlock.height.toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-[9px] uppercase tracking-wider text-foreground-subtle mb-1">
                    Transactions
                  </div>
                  <div className="text-sm font-mono font-medium text-secondary">
                    {selectedBlock.txCount}
                  </div>
                </div>
                <div>
                  <div className="text-[9px] uppercase tracking-wider text-foreground-subtle mb-1">
                    Fees
                  </div>
                  <div className="text-sm font-mono font-medium">
                    {selectedBlock.fees.toFixed(4)} SC
                  </div>
                </div>
                <div>
                  <div className="text-[9px] uppercase tracking-wider text-foreground-subtle mb-1">
                    Time
                  </div>
                  <div className="text-sm font-mono">
                    {selectedBlock.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </div>
              
              <div>
                <div className="text-[9px] uppercase tracking-wider text-foreground-subtle mb-1">
                  Block Hash
                </div>
                <div className="text-xs font-mono break-all text-foreground-muted">
                  {selectedBlock.hash}
                </div>
              </div>
            </div>
          )}
        </MobileBottomSheet>
      </div>
    );
  }

  // Desktop view (existing)
  return (
    <div className="min-h-screen flex flex-col">
      <StatusRail />
      <div className="flex-1 p-6">
        <div className="grid grid-cols-5 gap-6 mb-6">
          <div className="col-span-3 bg-background-elevated/30 border border-border p-4">
            <BlockchainTimeline 
              onBlockSelect={setSelectedBlock}
              selectedBlockHeight={selectedBlock?.height}
            />
            {selectedBlock && (
              <div className="mt-4 border-t border-border-subtle pt-4">
                <BlockDetailPanel 
                  block={selectedBlock}
                  onClose={() => setSelectedBlock(null)}
                />
              </div>
            )}
          </div>
          <div className="col-span-2 bg-background-elevated/30 border border-border p-4">
            <TransactionFlow />
          </div>
        </div>
        <NetworkMetrics />
      </div>
    </div>
  );
};

export default Index;
