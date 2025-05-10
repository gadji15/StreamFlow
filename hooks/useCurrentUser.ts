import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

/**
 * Hook React pour obtenir l'utilisateur actuellement connecté (client-side)
 */
export function useCurrentUser() {
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    let isMounted = true
    supabase.auth.getUser().then(({ data }) => {
      if (isMounted) setUser(data.user)
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (isMounted) setUser(session?.user ?? null)
    })
    return () => {
      isMounted = false
      listener?.subscription.unsubscribe()
    }
  }, [])

  return user
}