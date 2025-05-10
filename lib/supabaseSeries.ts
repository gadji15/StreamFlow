import { supabase } from '@/lib/supabaseClient'

export async function getSeries() {
  return await supabase.from('series').select('*').order('created_at', { ascending: false })
}

export async function getSeriesById(id: string) {
  return await supabase.from('series').select('*').eq('id', id).single()
}

export async function addSeries(serie: { title: string, description?: string, release_date?: string, created_by: string }) {
  return await supabase.from('series').insert([serie])
}

export async function updateSeries(id: string, data: Partial<{ title: string, description: string, release_date: string }>) {
  return await supabase.from('series').update(data).eq('id', id)
}

export async function deleteSeries(id: string) {
  return await supabase.from('series').delete().eq('id', id)
}