import { supabase } from '@/lib/supabaseClient';

export type Series = {
  id: string;
  title: string;
  description?: string;
  poster?: string;
  startYear?: number;
  endYear?: number;
  isVIP?: boolean;
  created_at?: string;
  genre?: string; // ex: 'thriller', 'sci-fi'
  popularity?: number;
};

export async function getSeries(): Promise<Series[]> {
  const { data, error } = await supabase
    .from('series')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) {
    console.error('Erreur getSeries:', error);
    return [];
  }
  return data || [];
}

export async function getSeriesById(id: string): Promise<Series | null> {
  const { data, error } = await supabase
    .from('series')
    .select('*')
    .eq('id', id)
    .single();
  if (error) {
    console.error('Erreur getSeriesById:', error);
    return null;
  }
  return data;
}

export async function addSeries(series: Omit<Series, 'id' | 'created_at'>): Promise<boolean> {
  const { error } = await supabase.from('series').insert([series]);
  if (error) {
    console.error('Erreur addSeries:', error);
    return false;
  }
  return true;
}

export async function updateSeries(id: string, data: Partial<Series>): Promise<boolean> {
  const { error } = await supabase.from('series').update(data).eq('id', id);
  if (error) {
    console.error('Erreur updateSeries:', error);
    return false;
  }
  return true;
}

export async function deleteSeries(id: string): Promise<boolean> {
  const { error } = await supabase.from('series').delete().eq('id', id);
  if (error) {
    console.error('Erreur deleteSeries:', error);
    return false;
  }
  return true;
}

/**
 * Récupère les séries populaires (champ 'popularity' requis)
 */
export async function getPopularSeries(limit = 6): Promise<Series[]> {
  const { data, error } = await supabase
    .from('series')
    .select('*')
    .order('popularity', { ascending: false })
    .limit(limit);
  if (error) {
    console.error('Erreur getPopularSeries:', error);
    return [];
  }
  // Ajoute le champ year à partir de start_year (champ réel en base)
  return (data || []).map((serie) => ({
    ...serie,
    year: typeof serie.start_year === "number" ? serie.start_year : undefined,
  }));
}

/**
 * Récupère les séries par catégorie d'accueil (champ 'homepage_categories')
 * @param category une des valeurs : 'featured', 'new', 'top', 'vip'
 */
export async function getSeriesByHomepageCategory(category: string, limit = 6): Promise<Series[]> {
  const { data, error } = await supabase
    .from('series')
    .select('*')
    .contains('homepage_categories', [category])
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) {
    console.error('Erreur getSeriesByHomepageCategory:', error);
    return [];
  }
  return (data || []).map((serie) => ({
    ...serie,
    year: serie.releaseDate ? parseInt(serie.releaseDate.substring(0, 4)) : undefined,
  }));
}

/**
 * Récupère les séries par genre, triées selon un critère (popularité, note, etc.)
 */
export async function getSeriesByGenre(genreId: string, limit = 6, sortBy: "created_at" | "popularity" | "vote_average" = "created_at"): Promise<Series[]> {
  const { data, error } = await supabase
    .from('series')
    .select('*')
    .ilike('genre', `%${genreId}%`)
    .order(sortBy, { ascending: false })
    .limit(limit);
  if (error) {
    console.error('Erreur getSeriesByGenre:', error);
    return [];
  }
  return (data || []).map((serie) => ({
    ...serie,
    year: serie.releaseDate ? parseInt(serie.releaseDate.substring(0, 4)) : undefined,
  }));
}
