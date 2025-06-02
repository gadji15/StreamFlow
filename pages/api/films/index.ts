import type { NextApiRequest, NextApiResponse } from 'next'
import { getFilms, addFilm } from '../../../lib/supabaseFilms'
import { supabase } from '@/lib/supabaseClient'

/**
 * Validation utilitaire pour la création d'un film.
 * Retourne { valid: boolean, errors: string[], payload: any }
 */
function validateFilmPayload(body: any) {
  const errors: string[] = [];
  const {
    title,
    description,
    year,
    duration,
    director,
    genre,
    poster,
    backdrop,
    video_url,
    trailer_url,
    isvip,
    published,
    cast,
    homepage_categories,
    popularity,
    vote_average,
    vote_count,
    tmdb_id,
    imdb_id,
    language,
    no_video,
    release_date,
  } = body;

  // Champs obligatoires
  if (!title || typeof title !== "string" || !title.trim()) {
    errors.push("Le titre est requis et doit être une chaîne non vide.");
  }

  // Année
  let yearValue: number | null = null;
  if (year !== undefined && year !== null && year !== "") {
    yearValue = Number(year);
    if (isNaN(yearValue) || yearValue < 1900 || yearValue > 2100) {
      errors.push("L'année doit être un nombre valide entre 1900 et 2100.");
    }
  }

  // release_date (optionnel, doit être une date ISO)
  let releaseDateValue: string | null = null;
  if (release_date !== undefined && release_date !== null && release_date !== "") {
    const d = new Date(release_date);
    if (isNaN(d.getTime())) {
      errors.push("Le champ 'release_date' doit être une date valide (ISO).");
    } else {
      releaseDateValue = d.toISOString().slice(0, 10); // format YYYY-MM-DD
    }
  }

  // Durée
  let durationValue: number | null = null;
  if (duration !== undefined && duration !== null && duration !== "") {
    durationValue = Number(duration);
    if (isNaN(durationValue) || durationValue < 1) {
      errors.push("La durée doit être un nombre positif (en minutes).");
    }
  }

  // Genres (string ou tableau)
  let genreValue: string | null = null;
  if (genre) {
    if (Array.isArray(genre)) {
      genreValue = genre.filter(Boolean).join(", ");
    } else if (typeof genre === "string") {
      genreValue = genre;
    } else {
      errors.push("Le champ 'genre' doit être une chaîne ou un tableau de chaînes.");
    }
  }

  // Homepage categories (array of string)
  let homepageCategoriesValue: string[] = [];
  if (homepage_categories) {
    if (Array.isArray(homepage_categories)) {
      homepageCategoriesValue = homepage_categories.filter(Boolean);
    } else if (typeof homepage_categories === "string") {
      try {
        const parsed = JSON.parse(homepage_categories);
        if (Array.isArray(parsed)) {
          homepageCategoriesValue = parsed.filter(Boolean);
        } else {
          errors.push("Le champ 'homepage_categories' doit être un tableau de chaînes (ou stringifiable en JSON array).");
        }
      } catch {
        errors.push("Le champ 'homepage_categories' doit être un tableau ou une chaîne JSON valide.");
      }
    } else {
      errors.push("Le champ 'homepage_categories' doit être un tableau ou une chaîne JSON.");
    }
  }

  // Cast (array of {name, role, photo})
  let castValue: any[] = [];
  if (cast) {
    if (Array.isArray(cast)) {
      castValue = cast.filter(
        (m: any) => typeof m.name === "string" && m.name.trim() !== ""
      );
    } else if (typeof cast === "string") {
      try {
        const parsed = JSON.parse(cast);
        if (Array.isArray(parsed)) {
          castValue = parsed.filter(
            (m: any) => typeof m.name === "string" && m.name.trim() !== ""
          );
        } else {
          errors.push("Le champ 'cast' doit être un tableau d'acteurs.");
        }
      } catch {
        errors.push("Le champ 'cast' doit être un tableau ou une chaîne JSON valide.");
      }
    } else {
      errors.push("Le champ 'cast' doit être un tableau ou une chaîne JSON.");
    }
  }

  // Popularity
  let popValue: number | undefined = undefined;
  if (popularity !== undefined && popularity !== null && popularity !== "") {
    const p = Number(popularity);
    if (!isNaN(p)) popValue = p;
  }

  // Note moyenne
  let voteAverageValue: number | undefined = undefined;
  if (vote_average !== undefined && vote_average !== null && vote_average !== "") {
    const v = Number(vote_average);
    if (isNaN(v) || v < 0 || v > 10) {
      errors.push("La note doit être comprise entre 0 et 10.");
    } else {
      voteAverageValue = v;
    }
  }

  // Nombre de votes
  let voteCountValue: number | undefined = undefined;
  if (vote_count !== undefined && vote_count !== null && vote_count !== "") {
    const v = Number(vote_count);
    if (!isNaN(v)) voteCountValue = v;
  }

  // TMDB/IMDB IDs
  let tmdbIdValue: number | undefined = undefined;
  if (tmdb_id !== undefined && tmdb_id !== null && tmdb_id !== "") {
    const t = Number(tmdb_id);
    if (!isNaN(t)) tmdbIdValue = t;
    else errors.push("L'ID TMDB doit être un nombre.");
  }

  // Champs booléens
  const isvipValue = !!isvip;
  const publishedValue = !!published;
  const noVideoValue = !!no_video;

  // Construction du payload propre
  const payload: any = {
    title: title.trim(),
    description: description || null,
    year: yearValue,
    release_date: releaseDateValue,
    duration: durationValue,
    director: director || null,
    genre: genreValue,
    poster: poster || null,
    backdrop: backdrop || null,
    video_url: noVideoValue ? null : (video_url || null),
    trailer_url: trailer_url || null,
    isvip: isvipValue,
    published: publishedValue,
    homepage_categories: homepageCategoriesValue,
    cast: castValue,
    popularity: popValue,
    vote_average: voteAverageValue,
    vote_count: voteCountValue,
    tmdb_id: tmdbIdValue,
    imdb_id: imdb_id || null,
    language: language || null,
    no_video: noVideoValue,
  };

  return { valid: errors.length === 0, errors, payload };
}

// Utilitaire pour extraire le token Bearer du header Authorization
function getBearerToken(req: NextApiRequest): string | null {
  const auth = req.headers.authorization || "";
  if (auth.startsWith("Bearer ")) {
    return auth.replace("Bearer ", "");
  }
  return null;
}

// Vérification du rôle de l'utilisateur dans user_roles_flat
async function userIsAdminOrSuperAdmin(userId: string): Promise<boolean> {
  // Utilise la table user_roles_flat, colonne 'role'
  const { data, error } = await supabase
    .from('user_roles_flat')
    .select('role')
    .eq('user_id', userId);
  if (error || !data) return false;
  const roles = data.map((r: any) => r.role);
  return roles.includes('admin') || roles.includes('super_admin');
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const films = await getFilms();
      return res.status(200).json(films);
    } catch (error: any) {
      return res.status(500).json({ error: error.message || "Erreur serveur" });
    }
  } else if (req.method === 'POST') {
    // 1. Authentification obligatoire via Bearer ou cookie Supabase
    let userId: string | null = null;
    try {
      let token = getBearerToken(req);
      if (!token && req.cookies['sb-access-token']) {
        token = req.cookies['sb-access-token'];
      }
      if (!token) {
        return res.status(401).json({ error: "Authentification requise." });
      }
      // Décoder le token avec Supabase pour obtenir l'user id
      const { data: userData, error: userError } = await supabase.auth.getUser(token);
      if (userError || !userData?.user) {
        return res.status(401).json({ error: "Utilisateur non authentifié." });
      }
      userId = userData.user.id;
    } catch (e) {
      return res.status(401).json({ error: "Authentification impossible." });
    }

    // 2. Vérification du rôle admin/super_admin
    const isAdmin = await userIsAdminOrSuperAdmin(userId);
    if (!isAdmin) {
      return res.status(403).json({ error: "Seuls les administrateurs peuvent ajouter un film." });
    }

    // 3. Validation stricte des données
    const { valid, errors, payload } = validateFilmPayload(req.body);
    if (!valid) {
      return res.status(400).json({ error: errors.join(' ') });
    }

    // 4. Vérification unicité (title + year)
    if (payload.title && payload.year) {
      const { data: existing, error: dupErr } = await supabase
        .from('films')
        .select('id')
        .eq('title', payload.title)
        .eq('year', payload.year)
        .maybeSingle();
      if (existing) {
        return res.status(409).json({ error: "Un film avec ce titre et cette année existe déjà." });
      }
    }

    try {
      const result = await addFilm(payload);
      if (!result) {
        return res.status(500).json({ error: "Erreur lors de l'ajout du film en base de données." });
      }
      return res.status(201).json({ success: true });
    } catch (error: any) {
      // Gestion des erreurs de contraintes SQL
      if (
        error?.code === "23505" ||
        (typeof error?.message === "string" && error.message.toLowerCase().includes("unique"))
      ) {
        return res.status(409).json({ error: "Un film avec ce titre et cette année existe déjà." });
      }
      return res.status(500).json({ error: error.message || "Erreur serveur" });
    }
  }
  res.setHeader('Allow', ['GET', 'POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}