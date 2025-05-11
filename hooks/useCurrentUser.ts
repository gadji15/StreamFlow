import { useAuthContext } from '@/components/auth/AuthProvider'

/**
 * Hook React pour obtenir l'utilisateur actuellement connecté (client-side) via le contexte global
 */
export function useCurrentUser() {
  return useAuthContext();
}