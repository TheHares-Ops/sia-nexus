import { ReactNode, useEffect, useState } from 'react';
import { X, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  height?: 'auto' | 'half' | 'full';
}

export const MobileBottomSheet = ({
  isOpen,
  onClose,
  title,
  children,
  height = 'auto'
}: MobileBottomSheetProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragY, setDragY] = useState(0);
  const [startY, setStartY] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      document.body.style.overflow = 'hidden';
    } else {
      const timeout = setTimeout(() => setIsVisible(false), 300);
      document.body.style.overflow = '';
      return () => clearTimeout(timeout);
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setStartY(e.touches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const currentY = e.touches[0].clientY;
    const diff = currentY - startY;
    if (diff > 0) {
      setDragY(diff);
    }
  };

  const handleTouchEnd = () => {
    if (dragY > 100) {
      onClose();
    }
    setDragY(0);
    setIsDragging(false);
  };

  if (!isVisible) return null;

  const heightClass = {
    auto: 'max-h-[80vh]',
    half: 'h-[50vh]',
    full: 'h-[90vh]'
  }[height];

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 z-50 bg-background/80 backdrop-blur-sm transition-opacity',
          isOpen ? 'opacity-100' : 'opacity-0'
        )}
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        className={cn(
          'fixed bottom-0 left-0 right-0 z-50',
          'bg-background border-t border-border',
          'transition-transform duration-300 ease-out',
          heightClass,
          isOpen ? 'translate-y-0' : 'translate-y-full'
        )}
        style={{ transform: `translateY(${isOpen ? dragY : '100%'}px)` }}
      >
        {/* Drag Handle */}
        <div
          className="flex flex-col items-center pt-2 pb-1 cursor-grab active:cursor-grabbing"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="w-8 h-1 bg-border rounded-full" />
        </div>

        {/* Header */}
        {title && (
          <div className="flex items-center justify-between px-4 py-2 border-b border-border-subtle">
            <h3 className="text-xs uppercase tracking-wider font-medium">{title}</h3>
            <button
              onClick={onClose}
              className="p-1 text-foreground-muted hover:text-foreground transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Content */}
        <div className="overflow-y-auto overscroll-contain" style={{ maxHeight: 'calc(100% - 60px)' }}>
          {children}
        </div>
      </div>
    </>
  );
};
