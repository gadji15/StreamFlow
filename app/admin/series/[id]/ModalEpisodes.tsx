import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import EpisodeList from "@/components/admin/series/EpisodeList";

export default function ModalEpisodes({ seasonId, filteredSeasons, onClose, onEditEpisode }) {
  const [episodes, setEpisodes] = useState([]);
  const [loading, setLoading] = useState(true);

  async function fetchEpisodesForSeason() {
    setLoading(true);
    const { data } = await supabase
      .from("episodes")
      .select("*")
      .eq("season_id", seasonId)
      .order("episode_number", { ascending: true });
    setEpisodes(data || []);
    setLoading(false);
  }

  useEffect(() => {
    fetchEpisodesForSeason();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seasonId]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-800 rounded-xl shadow-xl p-4 w-full max-w-lg md:max-w-2xl max-h-[95vh] overflow-y-auto relative">
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-white"
          onClick={onClose}
          aria-label="Fermer"
          title="Fermer"
        >✕</button>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg md:text-xl font-bold">Épisodes de la saison</h3>
        </div>
        <EpisodeList
          episodes={episodes}
          seasonId={seasonId}
          seriesId={filteredSeasons.find(s => s.id === seasonId)?.series_id ?? ""}
          seasonNumber={filteredSeasons.find(s => s.id === seasonId)?.season_number ?? ""}
          fetchEpisodesForSeason={fetchEpisodesForSeason}
          episodesLoading={loading}
          onEditEpisode={onEditEpisode}
        />
      </div>
    </div>
  );
}