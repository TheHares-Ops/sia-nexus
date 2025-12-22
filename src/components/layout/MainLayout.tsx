import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { MobileLayout } from '../mobile/MobileLayout';
import { useMobile } from '@/hooks/useMobile';

interface MainLayoutProps {
  children: ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  const { isMobile } = useMobile();

  if (isMobile) {
    return (
      <MobileLayout>
        {children}
      </MobileLayout>
    );
  }

  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <main className="flex-1 ml-56 relative z-10">
        {children}
      </main>
    </div>
  );
};
