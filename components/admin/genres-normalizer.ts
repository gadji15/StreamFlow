// Liste officielle des genres TMDB (cinéma et séries, français ou anglais selon l'usage du projet !)
const TMDB_GENRES = [
  "Action", "Adventure", "Animation", "Comedy", "Crime", "Documentary", "Drama",
  "Family", "Fantasy", "History", "Horror", "Music", "Mystery", "Romance",
  "Science Fiction", "TV Movie", "Thriller", "War", "Western",
  // Séries spécifiques
  "Reality", "Sci-Fi & Fantasy", "Soap", "Talk", "War & Politics"
];

// Création d'un mapping insensible à la casse et aux variantes courantes
const GENRE_MAP = TMDB_GENRES.reduce((acc, genre) => {
  acc[normalizeString(genre)] = genre;
  return acc;
}, {} as Record<string, string>);

// Normalisation d'une string : minuscule, sans accents, sans tirets, sans espaces, sans & remplacé
function normalizeString(str: string): string {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // accents
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]/gi, "")
    .toLowerCase();
}

/**
 * Transforme une liste de genres utilisateurs/importés en liste normalisée TMDB.
 * - Si le genre correspond à un genre officiel (même partiel, insensible à la casse), il est remplacé.
 * - Sinon, il est laissé tel quel (pour flexibilité).
 */
export function normalizeGenres(input: string[]): string[] {
  return input.map(g => {
    const key = normalizeString(g);
    // Recherche exacte
    if (GENRE_MAP[key]) return GENRE_MAP[key];
    // Recherche partielle (début)
    const found = TMDB_GENRES.find(tmdb =>
      normalizeString(tmdb).startsWith(key) || key.startsWith(normalizeString(tmdb))
    );
    if (found) return found;
    return g.trim();
  });
}