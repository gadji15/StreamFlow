import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

/**
 * Hook React pour obtenir l'utilisateur actuellement connecté (client-side)
 */
export function useCurrentUser() {
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    let ignore = false
    supabase.auth.getUser().then(({ data }) => {
      if (!ignore) setUser(data.user)
    })
    const sub = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => {
      ignore = true
      sub.data.subscription.unsubscribe()
    }
  }, [])

  return user
}