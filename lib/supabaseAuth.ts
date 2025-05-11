import { supabase } from '@/lib/supabaseClient'

/**
 * Inscription d'un nouvel utilisateur (email/password)
 */
export async function signUpWithEmail(email: string, password: string) {
  return await supabase.auth.signUp({ email, password })
}

/**
 * Connexion d'un utilisateur (email/password)
 */
export async function signInWithEmail(email: string, password: string) {
  return await supabase.auth.signInWithPassword({ email, password })
}

/**
 * Déconnexion de l'utilisateur courant
 */
export async function signOut() {
  return await supabase.auth.signOut()
}

/**
 * Récupérer l'utilisateur connecté (côté client)
 */
export async function getCurrentUser() {
  return (await supabase.auth.getUser()).data.user
}

/**
 * Surveille l'état d'auth en temps réel (callback à chaque changement)
 */
export function onAuthStateChange(callback: (user: any | null) => void) {
  return supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user ?? null)
  })
}