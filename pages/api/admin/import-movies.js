/**
 * API d'import de films en lot.
 * Attendu : POST JSON (array d'objets film avec { title, video_url, image, description, source, ... })
 * Doublons filtrés sur video_url.
 * Retourne { added: X, skipped: Y }
 */
import { supabase } from '../../../lib/supabaseClient';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const films = req.body;
  if (!Array.isArray(films)) return res.status(400).json({ error: "Invalid payload" });
  let added = 0, skipped = 0, errors = [];
  for (const film of films) {
    if (!film.video_url || !film.title) {
      skipped++; // ou errors.push({ film, error: "Manque titre/video_url" });
      continue;
    }
    // Anti-doublon par video_url
    const { data: exists } = await supabase
      .from('films')
      .select('id')
      .eq('video_url', film.video_url)
      .maybeSingle();
    if (exists) {
      skipped++;
      continue;
    }
    const { error } = await supabase.from('films').insert([film]);
    if (!error) added++;
    else errors.push({ film, error });
  }
  res.status(200).json({ added, skipped, errors });
}

// NOTE : ce fichier suppose que vous avez bien un fichier lib/supabaseClient.js ou .ts exportant votre client supabase initialisé.