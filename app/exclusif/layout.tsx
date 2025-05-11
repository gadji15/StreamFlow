'use client';

import { VipContentGuard } from '@/components/vip-content-guard';

export default function ExclusifLayout({ children }: { children: React.ReactNode }) {
  return (
    <VipContentGuard>
      {children}
    </VipContentGuard>
  );
}
