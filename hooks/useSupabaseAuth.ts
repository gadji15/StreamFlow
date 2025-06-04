import { useState, useEffect } from 'react'
import { useCurrentUser } from './useCurrentUser'
import { getProfile, getUserRoles } from '../lib/supabaseProfiles'
import { signOut } from '../lib/supabaseAuth'
import { supabase } from '../lib/supabaseClient'

/**
 * Hook d’auth avancé avec Supabase : expose isLoggedIn, userData, isVIP, isAdmin, logout, etc.
 */
export function useSupabaseAuth() {
  const { user, loading } = useCurrentUser()
  const [userData, setUserData] = useState<any>(null)
  const [profileLoading, setProfileLoading] = useState(true)
  const [isVIP, setIsVIP] = useState<boolean | null>(null)
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)

  useEffect(() => {
    let ignore = false
    // On considère qu'on est "toujours en chargement" tant que userData est null mais user est présent
    if (user?.id) {
      setProfileLoading(true)
      Promise.all([
        getProfile(user.id),
        getUserRoles(user.id)
      ]).then(([{ data: profile }, { roles }]) => {
        if (ignore) return
        setUserData({
          ...profile,
          email: user.email,
          id: user.id,
          displayName: profile?.full_name || '',
          photoURL: profile?.avatar_url || '',
          roles,
        })
        setIsVIP(!!profile?.is_vip)
        setIsAdmin(roles.includes('admin') || roles.includes('super_admin'))
        setProfileLoading(false)
      }).catch(() => {
        if (ignore) return
        setProfileLoading(false)
      })
    } else {
      setUserData(null)
      setIsVIP(null)
      setIsAdmin(null)
      setProfileLoading(false)
    }
    return () => { ignore = true }
  }, [user])

  // LOG DEBUG pour diagnostic approfondi
  console.log('DEBUG useSupabaseAuth', {
    user,
    userData,
    isAdmin,
    isVIP,
    isLoading: loading || profileLoading,
  });

  // On est "en chargement" si :
  // - la session Supabase est en cours OU
  // - le profil est en cours OU
  // - on a un user authentifié MAIS userData (profil complet) n'est pas encore chargé
  const realIsLoading = loading || profileLoading || (user && userData === null);

  async function login(email: string, password: string) {
    // Remplacez par votre logique réelle si besoin
    const { error } = await supabase!.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }

  // Ajoutez cette fonction dans votre hook :
  async function updateProfile({ displayName, photoURL }: { displayName?: string; photoURL?: string }) {
    // Remplacez par la logique adaptée à votre backend
    // Exemple Supabase :
    // const user = ... // récupérez l'utilisateur courant
    // const { error } = await supabase
    //   .from('users')
    //   .update({ displayName, photoURL })
    //   .eq('id', user.id);
    // if (error) throw error;
    // await fetchUserData(); // recharge les infos utilisateur
  }

  return {
    user,
    isLoggedIn: !!user,
    isLoading: realIsLoading,
    userData,
    isVIP,
    isAdmin,
    login,
    logout: signOut,
    updateProfile, // <-- ajoutez cette ligne
  };
}