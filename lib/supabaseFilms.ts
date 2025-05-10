import { supabase } from '@/lib/supabaseClient'

export async function getFilms() {
  return await supabase.from('films').select('*').order('created_at', { ascending: false })
}

export async function getFilmById(id: string) {
  return await supabase.from('films').select('*').eq('id', id).single()
}

export async function addFilm(film: { title: string, description?: string, release_date?: string, created_by: string }) {
  return await supabase.from('films').insert([film])
}

export async function updateFilm(id: string, data: Partial<{ title: string, description: string, release_date: string }>) {
  return await supabase.from('films').update(data).eq('id', id)
}

export async function deleteFilm(id: string) {
  return await supabase.from('films').delete().eq('id', id)
}