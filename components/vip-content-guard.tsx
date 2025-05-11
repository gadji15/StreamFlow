'use client';

import { ReactNode } from 'react';
import { useVipStatus } from '@/hooks/useVipStatus';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Lock, AlarmClock } from 'lucide-react';

/**
 * Composant de protection du contenu VIP.
 * Affiche un message et un bouton d’abonnement si l’utilisateur n’est pas VIP.
 */
export function VipContentGuard({ children }: { children: ReactNode }) {
  const { isVIP, loading } = useVipStatus();
  const router = useRouter();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[30vh]">
        <AlarmClock className="h-8 w-8 animate-spin text-indigo-500" />
        <span className="ml-3">Vérification du statut VIP…</span>
      </div>
    );
  }

  if (!isVIP) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] bg-gray-900 rounded-lg p-8">
        <Lock className="h-10 w-10 text-amber-500 mb-4" />
        <p className="text-amber-400 text-lg font-semibold mb-3">
          Ce contenu est réservé aux membres VIP.
        </p>
        <Button
          size="lg"
          className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700"
          onClick={() => router.push('/abonnement')}
        >
          Devenir VIP
        </Button>
      </div>
    );
  }

  return <>{children}</>;
}
