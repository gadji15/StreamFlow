"use client";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";

export default function AdminSeriesDetailPage() {
  const router = useRouter();
  const { id } = useParams();
  const [serie, setSerie] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSerie() {
      setLoading(true);
      const { data, error } = await supabase.from("series").select("*").eq("id", id).single();
      if (!error) setSerie(data);
      setLoading(false);
    }
    if (id) fetchSerie();
  }, [id]);

  if (loading) {
    return <div className="flex justify-center items-center py-12">Chargement...</div>;
  }

  if (!serie) {
    return <div className="text-center py-12 text-red-500">Série introuvable.</div>;
  }

  return (
    <div className="max-w-2xl mx-auto bg-gray-900 rounded-lg p-8 mt-6">
      <Button onClick={() => router.back()} variant="outline" className="mb-4">
        ← Retour
      </Button>
      <h1 className="text-3xl font-bold mb-2">{serie.title}</h1>
      <div className="flex gap-6 mb-4">
        {serie.poster && (
          <img src={serie.poster} alt={serie.title} className="h-40 rounded shadow" />
        )}
        <div>
          <div><b>Créateur :</b> {serie.creator || "-"}</div>
          <div><b>Année début :</b> {serie.start_year || "-"}</div>
          <div><b>Année fin :</b> {serie.end_year || "-"}</div>
          <div><b>Genres :</b> {Array.isArray(serie.genres) ? serie.genres.join(", ") : (serie.genre || "-")}</div>
          <div><b>Note :</b> {serie.vote_average || "-"}</div>
          {serie.tmdb_id && (
            <div>
              <a
                href={`https://www.themoviedb.org/tv/${serie.tmdb_id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-400 hover:underline"
              >
                Voir sur TMDB ↗
              </a>
            </div>
          )}
        </div>
      </div>
      <div className="mt-4">
        <b>Résumé :</b>
        <div className="mt-1 whitespace-pre-line">{serie.description || "Aucune description."}</div>
      </div>
    </div>
  );
}