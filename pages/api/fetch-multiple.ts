import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/lib/supabaseClient";

/**
 * API dynamique : POST /api/fetch-multiple
 * 
 * Body attendu :
 * {
 *   "requests": [
 *     { "table": "films", "ids": ["filmId1", "filmId2"] },
 *     { "table": "episodes", "ids": ["epId1"] },
 *     { "table": "series", "ids": ["seriesId1"] }
 *   ]
 * }
 * 
 * Réponse :
 * {
 *   "films": [ ... ],
 *   "episodes": [ ... ],
 *   "series": [ ... ]
 * }
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Méthode non autorisée" });
  }
  const { requests } = req.body;
  if (!Array.isArray(requests) || requests.length === 0) {
    return res.status(400).json({ error: "Body mal formé : requests[] attendu" });
  }

  // Pour chaque table demandée, faire la requête
  const result: Record<string, any[]> = {};
  const errors: Record<string, string> = {};

  await Promise.all(requests.map(async ({ table, ids }) => {
    if (!table || !Array.isArray(ids) || ids.length === 0) {
      errors[table || "unknown"] = "Table ou ids manquants";
      result[table] = [];
      return;
    }
    // On sécurise le nom de table
    if (!["films", "episodes", "series"].includes(table)) {
      errors[table] = "Table non autorisée";
      result[table] = [];
      return;
    }
    // Requête supabase
    const { data, error } = await supabase
      .from(table)
      .select("*")
      .in("id", ids);
    if (error) {
      errors[table] = error.message;
      result[table] = [];
    } else {
      result[table] = data || [];
    }
  }));

  res.status(200).json({ ...result, errors: Object.keys(errors).length > 0 ? errors : undefined });
}