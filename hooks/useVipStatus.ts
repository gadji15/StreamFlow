import { useCurrentUser } from '@/hooks/useCurrentUser';

/**
 * Hook React pour obtenir le statut VIP actuel et la date d’expiration (si applicable)
 */
export function useVipStatus() {
  const { user, loading } = useCurrentUser();

  let isVIP = false;
  let expiry: Date | null = null;

  if (user) {
    isVIP = !!user.is_vip;
    if (user.vip_expiry) {
      expiry = new Date(user.vip_expiry);
      // Corrige le statut VIP si la date est passée
      if (expiry < new Date()) {
        isVIP = false;
      }
    }
  }

  return {
    isVIP,
    expiry,
    loading
  };
}