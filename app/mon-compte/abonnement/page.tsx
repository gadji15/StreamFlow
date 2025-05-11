'use client';

import { useVipStatus } from '@/hooks/useVipStatus';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { BadgeCheck, AlarmClock } from 'lucide-react';

export default function MonAbonnementPage() {
  const { isVIP, expiry, loading } = useVipStatus();
  const router = useRouter();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[30vh]">
        <AlarmClock className="h-8 w-8 animate-spin text-indigo-500" />
        <span className="ml-3">Chargement du statut d’abonnement...</span>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-4">Mon abonnement VIP</h1>
      <div className="bg-gray-800 rounded-lg p-6 shadow-md text-white">
        {isVIP ? (
          <div>
            <div className="flex items-center text-green-400 mb-2">
              <BadgeCheck className="h-6 w-6 mr-2" />
              <span className="text-xl font-semibold">Vous êtes membre VIP</span>
            </div>
            {expiry && (
              <p className="text-gray-300 mb-3">
                Date d’expiration : <span className="font-medium">{expiry.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
              </p>
            )}
          </div>
        ) : (
          <div>
            <p className="mb-3 text-amber-400 text-lg font-semibold">Vous n’êtes pas abonné VIP actuellement.</p>
          </div>
        )}

        <div className="mt-6">
          <Button
            size="lg"
            className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700"
            onClick={() => router.push('/abonnement')}
          >
            {isVIP ? 'Renouveler mon abonnement' : 'Devenir membre VIP'}
          </Button>
        </div>
      </div>
    </div>
  );
}