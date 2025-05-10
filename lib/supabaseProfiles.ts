import { supabase } from './supabaseClient'

export async function getProfile(userId: string) {
  return await supabase.from('profiles').select('*').eq('id', userId).single()
}

export async function updateProfile(userId: string, data: Partial<{ full_name: string, role: string }>) {
  return await supabase.from('profiles').update(data).eq('id', userId)
}