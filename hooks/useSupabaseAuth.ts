import { useState, useEffect } from 'react'
import { useCurrentUser } from './useCurrentUser'
import { getProfile } from '../lib/supabaseProfiles'
import { signOut } from '../lib/supabaseAuth'

/**
 * Hook d’auth avancé avec Supabase : expose isLoggedIn, userData, isVIP, isAdmin, logout, etc.
 */
export function useSupabaseAuth() {
  const user = useCurrentUser()
  const [userData, setUserData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isVIP, setIsVIP] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    let ignore = false
    if (user?.id) {
      setIsLoading(true)
      getProfile(user.id).then(({ data }) => {
        if (ignore) return
        setUserData({
          ...data,
          email: user.email,
          id: user.id,
          displayName: data?.full_name || '',
          photoURL: data?.avatar_url || '',
        })
        setIsVIP(!!data?.is_vip)
        setIsAdmin(data?.role === 'admin')
        setIsLoading(false)
      })
    } else {
      setUserData(null)
      setIsVIP(false)
      setIsAdmin(false)
      setIsLoading(false)
    }
    return () => { ignore = true }
  }, [user])

  return {
    isLoggedIn: !!user,
    isLoading,
    userData,
    isVIP,
    isAdmin,
    logout: signOut,
  }
}
