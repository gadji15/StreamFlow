import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import EpisodeList from "./EpisodeList";
import { useToast } from "@/components/ui/use-toast";

type Season = {
  id: string;
  season_number: number;
  title?: string;
  overview?: string;
  episode_count?: number;
  // ...autres champs utiles
};

interface SeasonListProps {
  seriesId: string;
}

export default function SeasonList({ seriesId }: SeasonListProps) {
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSeasonId, setSelectedSeasonId] = useState<string | null>(null);

  const { toast } = useToast();

  // Fetch les saisons de la série
  const fetchSeasons = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from("seasons")
        .select("*")
        .eq("series_id", seriesId)
        .order("season_number", { ascending: true });
      if (error) throw error;
      setSeasons(data || []);
      // Sélectionner la première saison par défaut
      if (data && data.length > 0) setSelectedSeasonId(data[0].id);
    } catch (e: any) {
      setError(e?.message || "Erreur de chargement des saisons");
      setSeasons([]);
      toast({ title: "Erreur", description: e?.message || "Erreur de chargement", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [seriesId, toast]);

  useEffect(() => { fetchSeasons(); }, [fetchSeasons]);

  if (loading) {
    return (
      <div className="py-6 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-6 text-red-400">
        <p>{error}</p>
        <Button onClick={fetchSeasons} className="mt-2">Réessayer</Button>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-lg font-semibold mb-2">Saisons</h2>
      {seasons.length === 0 ? (
        <div className="text-gray-400">Aucune saison enregistrée.</div>
      ) : (
        <div className="flex gap-2 mb-4 flex-wrap">
          {seasons.map(season => (
            <Button
              key={season.id}
              variant={season.id === selectedSeasonId ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedSeasonId(season.id)}
            >
              Saison {season.season_number} {season.title ? `- ${season.title}` : ""}
            </Button>
          ))}
        </div>
      )}

      {/* Liste des épisodes de la saison sélectionnée */}
      {selectedSeasonId && (
        <EpisodeList
          seasonId={selectedSeasonId}
          seriesId={seriesId}
          fetchEpisodesForSeason={async () => {}} {/* à adapter selon logique EpisodeList */}
          episodesLoading={false}
          episodes={undefined} {/* EpisodeList devra être adapté pour gérer le fetch interne ou via prop */}
        />
      )}
    </div>
  );
}
