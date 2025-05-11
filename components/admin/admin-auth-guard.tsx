'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import LoadingScreen from '@/components/loading-screen';

export default function AdminAuthGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userData, isAdmin, isLoading } = useSupabaseAuth();
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (isLoading || checked) return;

    // Ajout d'un log de debug détaillé
    console.log('DEBUG ADMIN GUARD', { userData, isAdmin, isLoading });

    // Si utilisateur non connecté → redirection vers la page de login globale
    if (!userData) {
      router.replace('/login');
      return;
    }

    // Si utilisateur connecté mais non admin → accès refusé
    if (!isAdmin) {
      router.replace('/admin/access-denied');
      return;
    }

    setChecked(true);
  }, [userData, isAdmin, isLoading, router, checked]);

  if (isLoading || !checked) {
    return <LoadingScreen />;
  }

  return <>{children}</>;
}