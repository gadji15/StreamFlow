import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/lib/supabaseClient";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  const { title, video_url, image, description, source } = req.body;
  if (!title || !video_url) return res.status(400).json({ message: "Titre et vidéo requis" });

  // Anti-doublon simple
  const { data: existing, error: searchError } = await supabase
    .from("films")
    .select("id")
    .eq("video_url", video_url)
    .maybeSingle();

  if (existing) return res.status(409).json({ message: "Ce film existe déjà" });

  const { data, error } = await supabase
    .from("films")
    .insert([{ title, video_url, poster: image, description, source }])
    .select()
    .maybeSingle();

  if (error) return res.status(500).json({ message: error.message });
  return res.status(200).json(data);
}