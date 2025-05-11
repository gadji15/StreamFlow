'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import LoadingScreen from '@/components/loading-screen';

export default function AdminAuthGuard({
  children,
  requiredRole = 'admin'
}: {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'super_admin';
}) {
  // Une seule source d'état utilisateur/chargement
  const { userData, isAdmin, isLoading } = useSupabaseAuth();
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (isLoading || checked) return;

    // Si utilisateur non connecté
    if (!userData) {
      router.replace('/admin/auth/login');
      return;
    }

    // Si admin requis et non admin
    if (!isAdmin || (requiredRole === 'super_admin' && userData?.role !== 'super_admin')) {
      router.replace('/admin/auth/unauthorized');
      return;
    }

    setChecked(true);
  }, [userData, isAdmin, isLoading, requiredRole, router, checked]);

  if (isLoading || !checked) {
    return <LoadingScreen />;
  }

  return <>{children}</>;
}