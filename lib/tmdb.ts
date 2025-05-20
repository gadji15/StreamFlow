/**
 * Utilitaires pour interagir avec l'API TMDB.
 * Gère le fetch du casting et d'autres données liées aux films.
 * Utilise une clé API stockée dans les variables d'environnement.
 */

const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY || '';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

export interface TMDBCastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
}

export interface TMDBMovie {
  id: number;
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string;
  release_date: string;
  vote_average: number;
}

/**
 * Récupère le casting d'un film OU d'une série via TMDB.
 * @param tmdbId L'identifiant TMDB de l'œuvre
 * @param type 'movie' ou 'tv'
 * @returns Liste des membres du casting
 */
export async function fetchTMDBCredits(
  tmdbId: string,
  type: 'movie' | 'tv' = 'movie'
): Promise<TMDBCastMember[]> {
  if (!TMDB_API_KEY) {
    throw new Error("TMDB API key manquante.");
  }
  const endpoint =
    type === 'tv'
      ? `${TMDB_BASE_URL}/tv/${tmdbId}/credits?api_key=${TMDB_API_KEY}&language=fr-FR`
      : `${TMDB_BASE_URL}/movie/${tmdbId}/credits?api_key=${TMDB_API_KEY}&language=fr-FR`;
  const res = await fetch(endpoint);
  if (!res.ok) throw new Error('Erreur TMDB');
  const data = await res.json();
  return (data.cast || []).map((member: any) => ({
    id: member.id,
    name: member.name,
    character: member.character,
    profile_path: member.profile_path,
  }));
}

/**
 * Récupère les films similaires via TMDB.
 * @param tmdbId L'identifiant TMDB du film
 * @returns Liste de films similaires
 */
export async function fetchTMDBSimilarMovies(tmdbId: string): Promise<TMDBMovie[]> {
  if (!TMDB_API_KEY) {
    throw new Error("TMDB API key manquante.");
  }
  const res = await fetch(
    `${TMDB_BASE_URL}/movie/${tmdbId}/similar?api_key=${TMDB_API_KEY}&language=fr-FR`
  );
  if (!res.ok) throw new Error('Erreur TMDB (similar movies)');
  const data = await res.json();
  return (data.results || []).map((movie: any) => ({
    id: movie.id,
    title: movie.title,
    poster_path: movie.poster_path,
    backdrop_path: movie.backdrop_path,
    overview: movie.overview,
    release_date: movie.release_date,
    vote_average: movie.vote_average,
  }));
}

/**
 * Récupère les séries similaires via TMDB.
 * @param tmdbId L'identifiant TMDB de la série
 * @returns Liste de séries similaires
 */
export async function fetchTMDBSimilarSeries(tmdbId: string): Promise<TMDBMovie[]> {
  if (!TMDB_API_KEY) {
    throw new Error("TMDB API key manquante.");
  }
  const res = await fetch(
    `${TMDB_BASE_URL}/tv/${tmdbId}/similar?api_key=${TMDB_API_KEY}&language=fr-FR`
  );
  if (!res.ok) throw new Error('Erreur TMDB (similar series)');
  const data = await res.json();
  return (data.results || []).map((serie: any) => ({
    id: serie.id,
    title: serie.name,
    poster_path: serie.poster_path,
    backdrop_path: serie.backdrop_path,
    overview: serie.overview,
    release_date: serie.first_air_date,
    vote_average: serie.vote_average,
  }));
}

/**
 * Helper pour construire l'URL d'une image TMDB (HD ou placeholder).
 */
export function getTMDBImageUrl(path: string | null, size: 'w185' | 'w300' | 'original' = 'w185') {
  if (!path) return '/placeholder-poster.png';
  return `https://image.tmdb.org/t/p/${size}${path}`;
}