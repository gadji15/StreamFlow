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

// --------- AJOUT POUR LES DONNÉES RÉELLES ---------

/**
 * Récupère les films populaires (suppose un champ 'popularity' ou 'views')
 * @param {number} limit Nombre de films à retourner
 */
export async function getPopularMovies(limit = 6) {
  const { data, error } = await supabase
    .from('films')
    .select('*')
    .order('popularity', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
}

/**
 * Récupère les films par genre (suppose un champ 'genre' ou une relation)
 * @param {string} genreId ID ou nom du genre (ex: 'thriller', 'sci-fi')
 * @param {number} limit Nombre de films à retourner
 */
export async function getMoviesByGenre(genreId: string, limit = 6) {
  const { data, error } = await supabase
    .from('films')
    .select('*')
    .ilike('genre', `%${genreId}%`)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
}