"use client";
import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/components/ui/use-toast";
import SeasonModal from "@/components/admin/series/SeasonModal";
import EpisodeModal from "@/components/admin/series/EpisodeModal";
import SeasonList from "@/components/admin/series/SeasonList";
import EpisodeList from "@/components/admin/series/EpisodeList";

interface Series {
  id: string;
  title: string;
  tmdb_id?: string;
  // Ajouter d'autres champs si nécessaires
}

interface Season {
  id: string;
  season_number: number;
  title: string;
  series_id: string;
  tmdb_id?: string;
  // Ajouter d'autres champs si nécessaires
}

export default function AdminSeriesDetailPage() {
  const params = useParams<{ id: string }>();
  const seriesId = params?.id;
  const { toast } = useToast();
  const router = useRouter();

  // State série
  const [series, setSeries] = useState<Series | null>(null);
  const [seriesLoading, setSeriesLoading] = useState(true);
  const [seriesError, setSeriesError] = useState<string | null>(null);

  // State saisons
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [seasonsLoading, setSeasonsLoading] = useState<boolean>(true);
  const [seasonError, setSeasonError] = useState<string | null>(null);

  // State modales
  const [seasonModalOpen, setSeasonModalOpen] = useState(false);
  const [editSeason, setEditSeason] = useState<Season | null>(null);

  // État pour la gestion des épisodes (pour la saison sélectionnée)
  const [selectedSeason, setSelectedSeason] = useState<Season | null>(null);

  // Episodes
  const [episodes, setEpisodes] = useState<any[] | null>(null);
  const [episodesLoading, setEpisodesLoading] = useState(false);
  const [episodesError, setEpisodesError] = useState<string | null>(null);

  // Episode Modal
  const [episodeModalOpen, setEpisodeModalOpen] = useState(false);
  const [editEpisode, setEditEpisode] = useState<any | null>(null);

  // Fetch série
  const fetchSeries = useCallback(async () => {
    if (!seriesId) return;
    setSeriesLoading(true);
    setSeriesError(null);
    const { data, error } = await supabase.from("series").select("*").eq("id", seriesId).single();
    if (error || !data) {
      setSeriesError(error?.message || "Série introuvable");
      setSeries(null);
    } else {
      setSeries(data);
    }
    setSeriesLoading(false);
  }, [seriesId]);

  // Fetch saisons
  const fetchSeasons = useCallback(async () => {
    if (!seriesId) return;
    setSeasonsLoading(true);
    setSeasonError(null);
    const { data, error } = await supabase
      .from("seasons")
      .select("*")
      .eq("series_id", seriesId)
      .order("season_number", { ascending: true });
    if (error) {
      setSeasonError(error.message);
      setSeasons([]);
    } else {
      setSeasons(data || []);
    }
    setSeasonsLoading(false);
  }, [seriesId]);

  // Fetch épisodes pour la saison sélectionnée
  const fetchEpisodesForSeason = useCallback(async () => {
    if (!selectedSeason) return;
    setEpisodesLoading(true);
    setEpisodesError(null);
    const { data, error } = await supabase
      .from("episodes")
      .select("*")
      .eq("season_id", selectedSeason.id)
      .order("episode_number", { ascending: true });
    if (error) {
      setEpisodesError(error.message);
      setEpisodes(null);
    } else {
      setEpisodes(data || []);
    }
    setEpisodesLoading(false);
  }, [selectedSeason]);

  // Effets
  useEffect(() => { fetchSeries(); }, [fetchSeries]);
  useEffect(() => { fetchSeasons(); }, [fetchSeasons]);
  useEffect(() => { fetchEpisodesForSeason(); }, [fetchEpisodesForSeason]);

  // Rafraîchir saisons + épisodes
  const handleRefresh = () => {
    fetchSeries();
    fetchSeasons();
    if (selectedSeason) fetchEpisodesForSeason();
  };

  // Gestion modale saison
  const handleSeasonSave = async (form: any) => {
    if (editSeason) {
      // Update
      const { id, ...updateObj } = form;
      const { error } = await supabase.from("seasons").update(updateObj).eq("id", id);
      if (error) {
        toast({ title: "Erreur", description: error.message, variant: "destructive" });
        return;
      }
      toast({ title: "Saison modifiée !" });
    } else {
      // Insert
      const insertObj = {
        ...form,
        series_id: seriesId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      const { error } = await supabase.from("seasons").insert([insertObj]);
      if (error) {
        toast({ title: "Erreur", description: error.message, variant: "destructive" });
        return;
      }
      toast({ title: "Saison ajoutée !" });
    }
    setSeasonModalOpen(false);
    setEditSeason(null);
    fetchSeasons();
  };

  // Suppression Saison
  const handleDeleteSeason = async (id: string) => {
    if (!window.confirm("Supprimer cette saison et tous ses épisodes ?")) return;
    const { error } = await supabase.from("seasons").delete().eq("id", id);
    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Saison supprimée !" });
    // Si la saison supprimée était sélectionnée, désélectionner
    if (selectedSeason && selectedSeason.id === id) setSelectedSeason(null);
    fetchSeasons();
  };

  // Gestion épisode (Ajout/Édition)
  const handleEpisodeModal = (mode: "add" | "edit", episode?: any) => {
    setEpisodeModalOpen(true);
    setEditEpisode(mode === "edit" ? episode : null);
  };

  // Suppression épisode
  const handleDeleteEpisode = async (id: string) => {
    if (!window.confirm("Supprimer cet épisode ?")) return;
    const { error } = await supabase.from("episodes").delete().eq("id", id);
    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Épisode supprimé !" });
    fetchEpisodesForSeason();
  };

  // Gestion navigation retour
  const handleBack = () => {
    router.push("/admin/series");
  };

  // Gestion sélection saison (afficher épisodes)
  const handleSelectSeason = (season: Season) => {
    setSelectedSeason(season);
  };

  return (
    <div className="space-y-8 px-2 pt-6 pb-12 max-w-5xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={handleBack} aria-label="Retour à la liste">
          &larr; Retour aux séries
        </Button>
        <h1 className="text-2xl font-bold flex-1">
          {seriesLoading ? "Chargement..." : series?.title || "Série introuvable"}
        </h1>
        <Button variant="ghost" onClick={handleRefresh} aria-label="Rafraîchir">
          🔄
        </Button>
      </div>

      {seriesError && (
        <div className="text-red-400 text-center py-2">{seriesError}</div>
      )}

      {/* Gestion des saisons */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-semibold text-lg">Saisons</h2>
          <Button
            variant="success"
            onClick={() => { setSeasonModalOpen(true); setEditSeason(null); }}
            className="text-xs px-3 py-1"
            aria-label="Ajouter une saison"
          >+ Ajouter une saison</Button>
        </div>
        {seasonsLoading ? (
          <div className="py-3 flex justify-center">
            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : seasonError ? (
          <div className="text-red-400 text-center py-2">{seasonError}</div>
        ) : seasons.length === 0 ? (
          <div className="text-gray-500 py-2">Aucune saison enregistrée.</div>
        ) : (
          <div className="space-y-2">
            {seasons.map(season => (
              <div
                key={season.id}
                className={`flex items-center gap-2 p-2 rounded ${selectedSeason?.id === season.id ? "bg-indigo-950/40" : "hover:bg-gray-800/70"}`}
              >
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleSelectSeason(season)}
                  className="px-2 py-1"
                  aria-label={`Voir les épisodes de la saison ${season.season_number}`}
                >
                  Saison {season.season_number} {season.title ? `- ${season.title}` : ""}
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => { setEditSeason(season); setSeasonModalOpen(true); }}
                  aria-label="Modifier la saison"
                  title="Modifier la saison"
                >✏️</Button>
                <Button
                  size="icon"
                  variant="destructive"
                  onClick={() => handleDeleteSeason(season.id)}
                  aria-label="Supprimer la saison"
                  title="Supprimer la saison"
                >🗑️</Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal ajout/édition saison */}
      <SeasonModal
        open={seasonModalOpen}
        onClose={() => { setSeasonModalOpen(false); setEditSeason(null); }}
        onSave={handleSeasonSave}
        initial={editSeason}
        seriesId={seriesId}
      />

      {/* Gestion des épisodes pour la saison sélectionnée */}
      {selectedSeason && (
        <div>
          <div className="flex items-center justify-between mt-8 mb-2">
            <h2 className="font-semibold text-lg">
              Épisodes {selectedSeason.season_number}
              {selectedSeason.title ? <> — <span className="text-gray-400">{selectedSeason.title}</span></> : null}
            </h2>
            <Button
              variant="success"
              onClick={() => handleEpisodeModal("add")}
              className="text-xs px-3 py-1"
              aria-label="Ajouter un épisode"
            >+ Ajouter un épisode</Button>
          </div>
          <EpisodeList
            episodes={episodes}
            seasonId={selectedSeason.id}
            seriesId={seriesId}
            fetchEpisodesForSeason={fetchEpisodesForSeason}
            episodesLoading={episodesLoading}
            error={episodesError}
            seriesTitle={series?.title || ""}
            tmdbSeriesId={series?.tmdb_id ? String(series.tmdb_id) : ""}
            seasonNumber={selectedSeason.season_number}
          />
        </div>
      )}
    </div>
  );
}
import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";

// On suppose que ces composants existent ou sont à créer/compléter
import SeasonList from "@/components/admin/series/SeasonList";

type Series = {
  id: string;
  title: string;
  overview?: string;
  poster?: string;
  start_year?: string;
  end_year?: string;
  genres?: string;
  // ...autres champs utiles
};

export default function AdminSeriesDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();

  const [serie, setSerie] = useState<Series | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Chargement de la série
  const fetchSerie = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.from("series").select("*").eq("id", id).single();
      if (error) throw error;
      setSerie(data);
    } catch (e: any) {
      setError(e?.message || "Erreur de chargement");
      setSerie(null);
      toast({ title: "Erreur", description: e?.message || "Erreur de chargement", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [id, toast]);

  useEffect(() => { fetchSerie(); }, [fetchSerie]);

  if (loading) {
    return (
      <div className="py-12 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 bg-gray-800 rounded-lg text-red-400">
        <h2 className="text-xl font-semibold mb-2">Erreur</h2>
        <p>{error}</p>
        <Button onClick={fetchSerie} className="mt-4">Réessayer</Button>
      </div>
    );
  }

  if (!serie) {
    return (
      <div className="text-center py-12 bg-gray-800 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Série introuvable</h2>
        <p>Vérifiez l’URL ou sélectionnez une série valide.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-6">
      <div className="flex items-center gap-4 mb-4">
        {serie.poster && (
          <img src={serie.poster} alt={serie.title} className="w-16 h-24 rounded shadow" />
        )}
        <div>
          <h1 className="text-2xl font-bold mb-1">{serie.title}</h1>
          {serie.start_year && (
            <span className="text-gray-400 text-sm mr-2">Début : {serie.start_year}</span>
          )}
          {serie.end_year && (
            <span className="text-gray-400 text-sm">Fin : {serie.end_year}</span>
          )}
          {serie.genres && (
            <div className="text-xs text-gray-500 mt-1">{serie.genres}</div>
          )}
        </div>
      </div>
      {serie.overview && (
        <div className="mb-4 text-gray-300">{serie.overview}</div>
      )}

      {/* Gestion des saisons et épisodes */}
      <SeasonList seriesId={serie.id} />
    </div>
  );
}