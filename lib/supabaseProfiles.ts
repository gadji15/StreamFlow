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

/**
 * Récupère la liste des rôles d'un utilisateur via user_roles/roles
 */
export async function getUserRoles(userId: string) {
  const { data, error } = await supabase
    .from('user_roles')
    .select('role_id, roles(name)')
    .eq('user_id', userId);

  if (error) return { roles: [], error };
  // Extraire les noms des rôles
  const roleNames = data?.map((r: any) => r.roles?.name).filter(Boolean) || [];
  return { roles: roleNames, error: null };
}