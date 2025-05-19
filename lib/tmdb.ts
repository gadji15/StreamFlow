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

export async function fetchTMDBCredits(tmdbId: string): Promise<TMDBCastMember[]> {
  if (!TMDB_API_KEY) {
    throw new Error("TMDB API key manquante.");
  }
  const res = await fetch(
    `${TMDB_BASE_URL}/movie/${tmdbId}/credits?api_key=${TMDB_API_KEY}&language=fr-FR`
  );
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
 * Helper pour construire l'URL d'une image TMDB (HD ou placeholder).
 */
export function getTMDBImageUrl(path: string | null, size: 'w185' | 'w300' | 'original' = 'w185') {
  if (!path) return '/placeholder-avatar.png';
  return `https://image.tmdb.org/t/p/${size}${path}`;
}