import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { ArrowLeftRight, Filter, X } from 'lucide-react';
import { SearchInput } from '@/components/search/SearchInput';
import { MobileTransactionRow } from '@/components/mobile/MobileTransactionRow';
import { MobileBottomSheet } from '@/components/mobile/MobileBottomSheet';
import { useMobile } from '@/hooks/useMobile';

interface Transaction {
  id: string;
  type: 'contract_formation' | 'storage_proof' | 'transfer' | 'host_announcement' | 'contract_renewal';
  blockHeight: number;
  amount: number;
  fee: number;
  timestamp: Date;
  from: string;
  to: string;
}

const txTypeConfig = {
  contract_formation: { label: 'Contract Formation', color: 'bg-primary', textColor: 'text-primary' },
  storage_proof: { label: 'Storage Proof', color: 'bg-success', textColor: 'text-success' },
  transfer: { label: 'Transfer', color: 'bg-foreground-muted', textColor: 'text-foreground' },
  host_announcement: { label: 'Host Announcement', color: 'bg-secondary', textColor: 'text-secondary' },
  contract_renewal: { label: 'Contract Renewal', color: 'bg-primary/70', textColor: 'text-primary' },
};

const generateMockTxs = (count: number): Transaction[] => {
  const types: Transaction['type'][] = ['contract_formation', 'storage_proof', 'transfer', 'host_announcement', 'contract_renewal'];
  return Array.from({ length: count }, (_, i) => ({
    id: `${Math.random().toString(36).slice(2, 14)}${Math.random().toString(36).slice(2, 14)}`,
    type: types[Math.floor(Math.random() * types.length)],
    blockHeight: 489271 - Math.floor(i / 5),
    amount: Math.random() * 5000,
    fee: Math.random() * 0.1,
    timestamp: new Date(Date.now() - i * 30000),
    from: `addr_${Math.random().toString(36).slice(2, 10)}`,
    to: `addr_${Math.random().toString(36).slice(2, 10)}`,
  }));
};

const TransactionsPage = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [activeFilters, setActiveFilters] = useState<Set<Transaction['type']>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const { isMobile } = useMobile();

  useEffect(() => {
    setTransactions(generateMockTxs(100));
  }, []);

  const toggleFilter = (type: Transaction['type']) => {
    const newFilters = new Set(activeFilters);
    if (newFilters.has(type)) {
      newFilters.delete(type);
    } else {
      newFilters.add(type);
    }
    setActiveFilters(newFilters);
  };

  const filteredTxs = transactions.filter(tx => {
    const matchesFilter = activeFilters.size === 0 || activeFilters.has(tx.type);
    const matchesSearch = !searchQuery || 
      tx.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.from.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.to.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const groupedByBlock = filteredTxs.reduce((acc, tx) => {
    if (!acc[tx.blockHeight]) acc[tx.blockHeight] = [];
    acc[tx.blockHeight].push(tx);
    return acc;
  }, {} as Record<number, Transaction[]>);

  // Mobile View
  if (isMobile) {
    return (
      <div className="flex flex-col">
        {/* Mobile Filter Toggle */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-border">
          <span className="text-xs font-mono text-foreground-muted">
            {filteredTxs.length} transactions
          </span>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              'flex items-center gap-1 text-xs px-2 py-1',
              activeFilters.size > 0 ? 'text-primary' : 'text-foreground-muted'
            )}
          >
            <Filter size={12} />
            Filter
            {activeFilters.size > 0 && (
              <span className="bg-primary text-background px-1 text-[9px]">
                {activeFilters.size}
              </span>
            )}
          </button>
        </div>

        {/* Transaction List */}
        <div className="divide-y divide-border">
          {filteredTxs.slice(0, 50).map((tx) => {
            const isHighlighted = searchQuery && tx.id.toLowerCase().includes(searchQuery.toLowerCase());
            return (
              <MobileTransactionRow
                key={tx.id}
                hash={tx.id}
                type={tx.type === 'contract_formation' ? 'contract' : 
                      tx.type === 'storage_proof' ? 'storage' :
                      tx.type === 'transfer' ? 'send' : 'receive'}
                amount={tx.amount}
                timestamp={tx.timestamp}
                status="confirmed"
                highlight={isHighlighted}
                onTap={() => setSelectedTx(tx)}
              />
            );
          })}
        </div>

        {/* Filter Bottom Sheet */}
        <MobileBottomSheet
          isOpen={showFilters}
          onClose={() => setShowFilters(false)}
          title="Filter Transactions"
        >
          <div className="p-4 space-y-3">
            {Object.entries(txTypeConfig).map(([type, config]) => (
              <button
                key={type}
                onClick={() => toggleFilter(type as Transaction['type'])}
                className={cn(
                  'w-full flex items-center justify-between p-3 border transition-colors',
                  activeFilters.has(type as Transaction['type'])
                    ? 'border-primary bg-primary/10'
                    : 'border-border'
                )}
              >
                <div className="flex items-center gap-2">
                  <div className={cn('w-2 h-2', config.color)} />
                  <span className="text-sm">{config.label}</span>
                </div>
                {activeFilters.has(type as Transaction['type']) && (
                  <span className="text-primary text-xs">Active</span>
                )}
              </button>
            ))}
            {activeFilters.size > 0 && (
              <button
                onClick={() => setActiveFilters(new Set())}
                className="w-full py-2 text-sm text-foreground-muted"
              >
                Clear All
              </button>
            )}
          </div>
        </MobileBottomSheet>

        {/* Transaction Detail Bottom Sheet */}
        <MobileBottomSheet
          isOpen={!!selectedTx}
          onClose={() => setSelectedTx(null)}
          title="Transaction Details"
        >
          {selectedTx && (
            <div className="p-4 space-y-4">
              <div className="bg-muted/30 p-3">
                <div className="text-[9px] uppercase tracking-wider text-foreground-subtle mb-1">
                  Transaction ID
                </div>
                <div className="text-xs font-mono break-all">
                  {selectedTx.id}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-[9px] uppercase tracking-wider text-foreground-subtle mb-1">
                    Type
                  </div>
                  <div className={cn(
                    'text-sm font-medium px-2 py-1 inline-block',
                    txTypeConfig[selectedTx.type].color,
                    'text-background'
                  )}>
                    {txTypeConfig[selectedTx.type].label}
                  </div>
                </div>
                <div>
                  <div className="text-[9px] uppercase tracking-wider text-foreground-subtle mb-1">
                    Amount
                  </div>
                  <div className="text-lg font-mono text-secondary">
                    {selectedTx.amount.toFixed(2)} SC
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm py-2 border-b border-border-subtle">
                  <span className="text-foreground-muted">Fee</span>
                  <span className="font-mono">{selectedTx.fee.toFixed(4)} SC</span>
                </div>
                <div className="flex justify-between text-sm py-2 border-b border-border-subtle">
                  <span className="text-foreground-muted">Block</span>
                  <span className="font-mono text-secondary">#{selectedTx.blockHeight.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm py-2 border-b border-border-subtle">
                  <span className="text-foreground-muted">From</span>
                  <span className="font-mono text-xs">{selectedTx.from}</span>
                </div>
                <div className="flex justify-between text-sm py-2 border-b border-border-subtle">
                  <span className="text-foreground-muted">To</span>
                  <span className="font-mono text-xs">{selectedTx.to}</span>
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
      <div className="h-16 border-b border-border bg-background-elevated/50 backdrop-blur-sm px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ArrowLeftRight size={20} className="text-secondary" />
          <h1 className="text-lg font-semibold">Transaction Stream</h1>
        </div>
        <div className="flex items-center gap-4">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Transaction ID or address..."
            className="w-72"
          />
          <span className="text-xs font-mono text-foreground-subtle">{filteredTxs.length} transactions</span>
        </div>
      </div>

      <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-xl border-b border-border-subtle px-6 py-3">
        <div className="flex items-center gap-4">
          <Filter size={14} className="text-foreground-muted" />
          <div className="flex items-center gap-2">
            {Object.entries(txTypeConfig).map(([type, config]) => (
              <button
                key={type}
                onClick={() => toggleFilter(type as Transaction['type'])}
                className={cn(
                  'px-3 py-1.5 text-xs font-medium border transition-all',
                  activeFilters.has(type as Transaction['type'])
                    ? `${config.color} border-transparent text-background`
                    : 'border-border text-foreground-muted hover:border-foreground-muted'
                )}
              >
                {config.label}
              </button>
            ))}
          </div>
          {activeFilters.size > 0 && (
            <button
              onClick={() => setActiveFilters(new Set())}
              className="text-xs text-foreground-muted hover:text-foreground transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="p-6">
        {Object.entries(groupedByBlock).map(([blockHeight, txs]) => (
          <div key={blockHeight} className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-1 h-4 bg-secondary" />
              <span className="text-xs font-mono text-foreground-muted">
                Block #{Number(blockHeight).toLocaleString()}
              </span>
              <span className="text-xs text-foreground-subtle">
                {txs.length} transaction{txs.length > 1 ? 's' : ''}
              </span>
            </div>

            <div className="space-y-1 ml-4">
              {txs.map((tx) => {
                const config = txTypeConfig[tx.type];
                const isHighlighted = searchQuery && tx.id.toLowerCase().includes(searchQuery.toLowerCase());
                
                return (
                  <div
                    key={tx.id}
                    className={cn(
                      "group relative flex items-center gap-4 p-3 bg-background-surface/50 border border-transparent hover:border-border transition-all cursor-pointer",
                      isHighlighted && 'border-secondary bg-secondary/10'
                    )}
                  >
                    <div className={cn('w-1 h-full absolute left-0 top-0', config.color)} />
                    
                    <div className={cn(
                      'px-2 py-0.5 text-[10px] uppercase tracking-wider',
                      config.color,
                      'text-background font-medium min-w-[120px] text-center'
                    )}>
                      {config.label.split(' ')[0]}
                    </div>

                    <span className="font-mono text-xs text-foreground-muted flex-1 truncate">
                      {tx.id}
                    </span>

                    <div className="flex flex-col items-end min-w-[100px]">
                      <span className="font-mono text-sm text-secondary">
                        {tx.amount.toFixed(2)} SC
                      </span>
                      <span className="font-mono text-[10px] text-foreground-subtle">
                        Fee: {tx.fee.toFixed(4)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 min-w-[180px]">
                      <span className="font-mono text-[10px] text-foreground-subtle truncate max-w-[70px]">
                        {tx.from}
                      </span>
                      <div className="flex-1 h-px bg-border relative">
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0 h-0 border-l-4 border-l-border border-y-2 border-y-transparent" />
                      </div>
                      <span className="font-mono text-[10px] text-foreground-subtle truncate max-w-[70px]">
                        {tx.to}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {filteredTxs.length === 0 && (
          <div className="text-center py-12 text-foreground-muted">
            No transactions match your search
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionsPage;
