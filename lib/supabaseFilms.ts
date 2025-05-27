import { supabase } from '@/lib/supabaseClient'

export type Movie = {
  id: string;
  title: string;
  description?: string;
  poster?: string;
  year?: number;
  isVIP?: boolean;
  created_at?: string;
  genre?: string;
  popularity?: number;
};

/**
 * Récupère tous les films (du plus récent au plus ancien)
 */
export async function getFilms(): Promise<Movie[]> {
  const { data, error } = await supabase
    .from('films')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) {
    console.error('Erreur getFilms:', error);
    return [];
  }
  return data || [];
}

/**
 * Récupère un film par son ID
 */
export async function getFilmById(id: string): Promise<Movie | null> {
  const { data, error } = await supabase
    .from('films')
    .select('*')
    .eq('id', id)
    .single();
  if (error) {
    console.error('Erreur getFilmById:', error);
    return null;
  }
  return data;
}

/**
 * Ajoute un nouveau film
 */
export async function addFilm(film: Omit<Movie, 'id' | 'created_at'>): Promise<boolean> {
  const { error } = await supabase.from('films').insert([film]);
  if (error) {
    console.error('Erreur addFilm:', error);
    return false;
  }
  return true;
}

/**
 * Met à jour un film
 */
export async function updateFilm(id: string, data: Partial<Movie>): Promise<boolean> {
  const { error } = await supabase.from('films').update(data).eq('id', id);
  if (error) {
    console.error('Erreur updateFilm:', error);
    return false;
  }
  return true;
}

/**
 * Supprime un film
 */
export async function deleteFilm(id: string): Promise<boolean> {
  const { error } = await supabase.from('films').delete().eq('id', id);
  if (error) {
    console.error('Erreur deleteFilm:', error);
    return false;
  }
  return true;
}

/**
 * Récupère les films populaires (champ 'popularity' requis)
 */
export async function getPopularMovies(limit = 6): Promise<Movie[]> {
  const { data, error } = await supabase
    .from('films')
    .select('*')
    .order('popularity', { ascending: false })
    .limit(limit);
  if (error) {
    console.error('Erreur getPopularMovies:', error);
    return [];
  }
  return data || [];
}

/**
 * Récupère les films par catégorie d'accueil (champ 'homepage_categories')
 * @param category une des valeurs : 'featured', 'new', 'top', 'vip'
 */
export async function getMoviesByHomepageCategory(category: string, limit = 6): Promise<Movie[]> {
  const { data, error } = await supabase
    .from('films')
    .select('*')
    .contains('homepage_categories', [category])
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) {
    console.error('Erreur getMoviesByHomepageCategory:', error);
    return [];
  }
  return data || [];
}

/**
 * Récupère les films par genre, triés selon un critère (popularité, note, etc.)
 */
export async function getMoviesByGenre(genreId: string, limit = 6, sortBy: "created_at" | "popularity" | "vote_average" = "created_at"): Promise<Movie[]> {
  const { data, error } = await supabase
    .from('films')
    .select('*')
    .ilike('genre', `%${genreId}%`)
    .order(sortBy, { ascending: false })
    .limit(limit);
  if (error) {
    console.error('Erreur getMoviesByGenre:', error);
    return [];
  }
  return data || [];
}