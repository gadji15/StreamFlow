// Liste complète des genres utilisés pour le filtrage et l'affichage (id = slug de filtrage, label = affichage FR/EN)
export const GENRE_ID_LABELS: Record<string, string> = {
  // Films
  "action": "Action",
  "adventure": "Aventure",
  "animation": "Animation",
  "comedy": "Comédie",
  "crime": "Crime",
  "documentary": "Documentaire",
  "drama": "Drame",
  "family": "Famille",
  "fantasy": "Fantastique",
  "history": "Histoire",
  "horror": "Horreur",
  "music": "Musique",
  "mystery": "Mystère",
  "romance": "Romance",
  "sci-fi": "Science Fiction",
  "science-fiction": "Science Fiction",
  "tv-movie": "Téléfilm",
  "thriller": "Thriller",
  "war": "Guerre",
  "western": "Western",
  // Séries spécifiques
  "reality": "Téléréalité",
  "sci-fi-fantasy": "Sci-Fi & Fantasy",
  "soap": "Soap",
  "talk": "Talk-show",
  "war-politics": "Guerre & Politique",
};

const VARIANTS: Record<string, string> = {
  // English and French variants to canonical id (slug)
  "science fiction": "sci-fi",
  "science-fiction": "sci-fi",
  "sci fi": "sci-fi",
  "sci-fi": "sci-fi",
  "sf": "sci-fi",
  "séries science fiction": "sci-fi",
  "series science fiction": "sci-fi",
  "series science-fiction": "sci-fi",
  "sci-fi & fantasy": "sci-fi-fantasy",
  "sci fi & fantasy": "sci-fi-fantasy",
  "science fiction & fantasy": "sci-fi-fantasy",
  "science-fiction & fantastique": "sci-fi-fantasy",
  "science fiction et fantastique": "sci-fi-fantasy",
  "science-fiction et fantastique": "sci-fi-fantasy",
  "sf & fantastique": "sci-fi-fantasy",
  "scifi fantasy": "sci-fi-fantasy",
  "sci fi fantasy": "sci-fi-fantasy",
  "series science-fiction & fantasy": "sci-fi-fantasy",
  "series science fiction & fantasy": "sci-fi-fantasy",
  "tv movie": "tv-movie",
  "telefilm": "tv-movie",
  "music": "music",
  "musique": "music",
  "history": "history",
  "histoire": "history",
  "war & politics": "war-politics",
  "war and politics": "war-politics",
  "guerre & politique": "war-politics",
  "guerre et politique": "war-politics",
  "fantasy": "fantasy",
  "fantastique": "fantasy",
  "family": "family",
  "famille": "family",
  "documentary": "documentary",
  "documentaire": "documentary",
  "comedy": "comedy",
  "comédie": "comedy",
  "animation": "animation",
  "adventure": "adventure",
  "aventure": "adventure",
  "action": "action",
  "crime": "crime",
  "drama": "drama",
  "drame": "drama",
  "thriller": "thriller",
  "horror": "horror",
  "horreur": "horror",
  "romance": "romance",
  "mystery": "mystery",
  "mystère": "mystery",
  "western": "western",
  "soap": "soap",
  "talk": "talk",
  "téléréalité": "reality",
  "reality": "reality",
  "guerre": "war",
};

function normalizeString(str: string): string {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // accents
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]/gi, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Prend une liste de genres (importés, saisis, FR, EN, variantes...) et retourne la liste canonique (slug id)
 * qui sera utilisée pour le filtrage dans la DB.
 * Par exemple : ["Comédie", "Science fiction", "sci-fi", "science-fiction", "Comedy"] => ["comedy", "sci-fi"]
 */
export function normalizeGenres(input: string[]): string[] {
  const found = new Set<string>();
  input.forEach((g) => {
    const raw = normalizeString(g);
    let genreId: string | undefined = undefined;

    // Recherche directe dans VARIANTS
    if (VARIANTS[raw]) genreId = VARIANTS[raw];

    // Sinon, recherche stricte dans les ids
    if (!genreId && GENRE_ID_LABELS[raw]) genreId = raw;

    // Sinon, tentative de correspondance partielle
    if (!genreId) {
      // Cherche un id dont le label correspond à l'entrée utilisateur
      for (const [id, label] of Object.entries(GENRE_ID_LABELS)) {
        if (
          normalizeString(label) === raw ||
          id === raw ||
          label.toLowerCase() === g.toLowerCase()
        ) {
          genreId = id;
          break;
        }
      }
    }

    // Sinon, on prend le slug basique
    if (!genreId && raw.length > 0) genreId = raw;

    if (genreId) found.add(genreId);
  });

  return Array.from(found);
}

/**
 * Utilitaire pour obtenir le label d'affichage à partir d'un id de genre
 */
export function genreIdToLabel(genreId: string): string {
  return GENRE_ID_LABELS[genreId] || genreId;
}