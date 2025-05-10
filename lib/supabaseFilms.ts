import { supabase } from '@/lib/supabaseClient';

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

export async function addFilm(film: Omit<Movie, 'id' | 'created_at'>): Promise<boolean> {
  const { error } = await supabase.from('films').insert([film]);
  if (error) {
    console.error('Erreur addFilm:', error);
    return false;
  }
  return true;
}

export async function updateFilm(id: string, data: Partial<Movie>): Promise<boolean> {
  const { error } = await supabase.from('films').update(data).eq('id', id);
  if (error) {
    console.error('Erreur updateFilm:', error);
    return false;
  }
  return true;
}

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
 * Récupère les films par genre (champ 'genre' requis, format texte ou array)
 */
export async function getMoviesByGenre(genreId: string, limit = 6): Promise<Movie[]> {
  const { data, error } = await supabase
    .from('films')
    .select('*')
    .ilike('genre', `%${genreId}%`)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) {
    console.error('Erreur getMoviesByGenre:', error);
    return [];
  }
  return data || [];
}
  return data;
}

export async function addFilm(film: Omit<Movie, 'id' | 'created_at'>): Promise<boolean> {
  const { error } = await supabase.from('films').insert([film]);
  if (error) {
    console.error('Erreur addFilm:', error);
    return false;
  }
  return true;
}

export async function updateFilm(id: string, data: Partial<Movie>): Promise<boolean> {
  const { error } = await supabase.from('films').update(data).eq('id', id);
  if (error) {
    console.error('Erreur updateFilm:', error);
    return false;
  }
  return true;
}

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
 * Récupère les films par genre (champ 'genre' requis, format texte ou array)
 */
export async function getMoviesByGenre(genreId: string, limit = 6): Promise<Movie[]> {
  const { data, error } = await supabase
    .from('films')
    .select('*')
    .ilike('genre', `%${genreId}%`)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) {
    console.error('Erreur getMoviesByGenre:', error);
    return [];
  }
  return data || [];
} = await supabase
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
 * Récupère les films par genre (champ 'genre' requis, format texte ou array)
 */
export async function getMoviesByGenre(genreId: string, limit = 6): Promise<Movie[]> {
  const { data, error } = await supabase
    .from('films')
    .select('*')
    .ilike('genre', `%${genreId}%`)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) {
    console.error('Erreur getMoviesByGenre:', error);
    return [];
  }
  return data || [];
} = await supabase
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
 * Récupère les films par genre (champ 'genre' requis, format texte ou array)
 */
export async function getMoviesByGenre(genreId: string, limit = 6): Promise<Movie[]> {
  const { data, error } = await supabase
    .from('films')
    .select('*')
    .ilike('genre', `%${genreId}%`)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) {
    console.error('Erreur getMoviesByGenre:', error);
    return [];
  }
  return data || [];
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