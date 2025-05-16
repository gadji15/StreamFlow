"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import SeasonModal from "@/components/admin/series/SeasonModal";

export default function AdminSeriesDetailPage() {
  const params = useParams();
  const seriesId = params?.id as string;
  const { toast } = useToast();

  const [serie, setSerie] = useState<any>(null);
  const [seasons, setSeasons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Gestion modal saison
  const [seasonModal, setSeasonModal] = useState<{ open: boolean, initial?: any }>({ open: false });

  // Charger la série
  useEffect(() => {
    async function fetchSerieAndSeasons() {
      setLoading(true);
      // Fetch serie
      const { data: serieData, error: serieError } = await supabase
        .from("series")
        .select("*")
        .eq("id", seriesId)
        .single();
      if (serieError) {
        toast({ title: "Erreur", description: "Série introuvable", variant: "destructive" });
        setLoading(false);
        return;
      }
      setSerie(serieData);

      // Fetch seasons
      const { data: seasonsData, error: seasonsError } = await supabase
        .from("seasons")
        .select("*")
        .eq("series_id", seriesId)
        .order("season_number", { ascending: true });
      if (seasonsError) {
        toast({ title: "Erreur", description: "Impossible de charger les saisons", variant: "destructive" });
        setSeasons([]);
      } else {
        setSeasons(seasonsData || []);
      }
      setLoading(false);
    }
    if (seriesId) fetchSerieAndSeasons();
  }, [seriesId, toast]);

  // Sauvegarde saison (ajout ou modif)
  const handleSaveSeason = async (values: any) => {
    const isEdit = !!values.id;
    try {
      if (!serie) throw new Error("Série introuvable");
      const payload = {
        ...values,
        season_number: Number(values.season_number),
        series_id: seriesId,
        tmdb_id: values.tmdb_id ? Number(values.tmdb_id) : null,
        episode_count: values.episode_count ? Number(values.episode_count) : null,
      };
      Object.keys(payload).forEach(k => {
        if (payload[k] === "" || payload[k] === undefined) payload[k] = null;
      });
      let result;
      if (isEdit) {
        result = await supabase.from("seasons").update(payload).eq("id", values.id);
      } else {
        result = await supabase.from("seasons").insert([payload]);
      }
      if (result.error) throw result.error;
      toast({ title: isEdit ? "Saison modifiée" : "Saison ajoutée" });
      setSeasonModal({ open: false });
      // Refresh seasons
      const { data: seasonsData } = await supabase
        .from("seasons")
        .select("*")
        .eq("series_id", seriesId)
        .order("season_number", { ascending: true });
      setSeasons(seasonsData || []);
    } catch (err: any) {
      toast({ title: "Erreur", description: err?.message || String(err), variant: "destructive" });
    }
  };

  if (loading) return <div className="p-8 text-xl">Chargement…</div>;
  if (!serie) return <div className="p-8 text-xl text-red-500">Série introuvable</div>;

  return (
    <div className="max-w-3xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-2">{serie.title}</h1>
      <div className="text-gray-400 mb-4">{serie.creator || "Créateur inconnu"}</div>
      <div className="mb-8">{serie.description}</div>

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Saisons</h2>
        <Button onClick={() => setSeasonModal({ open: true })}>
          Ajouter une saison
        </Button>
      </div>
      {seasons.length === 0 ? (
        <div className="text-gray-500 mb-8">Aucune saison pour cette série.</div>
      ) : (
        <table className="w-full mb-8 border border-gray-700 rounded">
          <thead>
            <tr className="bg-gray-800">
              <th className="py-2 px-3 text-left">#</th>
              <th className="py-2 px-3 text-left">Titre</th>
              <th className="py-2 px-3 text-left">Date</th>
              <th className="py-2 px-3 text-left">Épisodes</th>
              <th className="py-2 px-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {seasons.map(season => (
              <tr key={season.id} className="border-t border-gray-700">
                <td className="py-2 px-3">{season.season_number}</td>
                <td className="py-2 px-3">{season.title}</td>
                <td className="py-2 px-3">{season.air_date}</td>
                <td className="py-2 px-3">{season.episode_count}</td>
                <td className="py-2 px-3">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSeasonModal({ open: true, initial: season })}
                  >
                    Modifier
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <SeasonModal
        open={seasonModal.open}
        onClose={() => setSeasonModal({ open: false })}
        onSave={handleSaveSeason}
        initial={seasonModal.initial}
        seriesId={seriesId}
      />
    </div>
  );
}
