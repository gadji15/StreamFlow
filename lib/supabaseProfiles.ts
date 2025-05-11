import { supabase } from '@/lib/supabaseClient'

export async function getProfile(userId: string) {
  const { data, error } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', userId)
  .limit(1)

if (error) return { data: null, error }
return { data: data?.[0] || null, error: null }
}

export async function updateProfile(userId: string, data: Partial<{ full_name: string, role: string }>) {
  return await supabase.from('profiles').update(data).eq('id', userId)
}

/**
 * Créer un profil lors du sign up (si besoin)
 */
export async function createProfile(profile: { id: string; full_name?: string; role?: string }) {
  return await supabase.from('profiles').insert([profile])
}