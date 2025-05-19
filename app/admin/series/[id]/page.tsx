"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import SeasonModal from "@/components/admin/series/SeasonModal";
import EpisodeList from "@/components/admin/series/EpisodeList";
import EpisodeModal from "@/components/admin/series/EpisodeModal";
import {
  Plus,
  Pencil,
  Trash2,
  Clapperboard,
  Rows,
  Users,
  Star,
  Eye,
  EyeOff
} from "lucide-react";

export default function AdminSeriesDetailPage() {
  const params = useParams();
  const seriesId = params?.id as string;
  const { toast } = useToast();

  const [serie, setSerie] = useState<any>(null);
  const [seasons, setSeasons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [seasonModal, setSeasonModal] = useState<{ open: boolean, initial?: any }>({ open: false });
  const [episodesModal, setEpisodesModal] = useState<{ open: boolean, seasonId?: string }>({ open: false });
  const [episodeModal, setEpisodeModal] = useState<{ open: boolean, seasonId?: string, initial?: any }>({ open: false });

  // State for episodes of the selected season
  const [seasonEpisodes, setSeasonEpisodes] = useState<any[]>([]);
  const [episodesLoading, setEpisodesLoading] = useState(false);
  const [episodesError, setEpisodesError] = useState<string | null>(null);

  // Fetch episodes for a season (with debug logging)
  const fetchEpisodesForSeason = async (seasonId: string) => {
    setEpisodesLoading(true);
    setEpisodesError(null);
    try {
      const { data, error } = await supabase
        .from("episodes")
        .select("*")
        .eq("season_id", seasonId)
        .order("episode_number", { ascending: true });
      console.log("Episodes fetched for season:", seasonId, data, error);
      if (error) throw error;
      setSeasonEpisodes(data || []);
    } catch (err: any) {
      setEpisodesError(err?.message || String(err));
      setSeasonEpisodes([]);
    } finally {
      setEpisodesLoading(false);
    }
  };

  // When opening the episodes modal, fetch episodes for the selected season
  useEffect(() => {
    if (episodesModal.open && episodesModal.seasonId) {
      fetchEpisodesForSeason(episodesModal.seasonId);
    }
    // Ne pas vider setSeasonEpisodes ici : on garde les données affichées tant que la modale est ouverte
    // On ne vide qu'à la fermeture de la modale
    if (!episodesModal.open) {
      setTimeout(() => {
        setSeasonEpisodes([]);
        setEpisodesError(null);
      }, 300); // délai pour laisser le temps à la fermeture d'animations éventuelles
    }
  }, [episodesModal.open, episodesModal.seasonId]);

  const [search, setSearch] = useState("");
  const filteredSeasons = useMemo(
    () =>
      search.trim()
        ? seasons.filter(
            s =>
              (s.title || "")
                .toLowerCase()
                .includes(search.trim().toLowerCase()) ||
              String(s.season_number).includes(search.trim())
          )
        : seasons,
    [search, seasons]
  );

  useEffect(() => {
    async function fetchSerieAndSeasons() {
      setLoading(true);
      const { data: serieData, error: serieError } = await supabase
        .from("series")
        .select("*")
        .eq("id", seriesId)
        .single();
      if (serieError) {
        toast({
          title: "Erreur",
          description: "Série introuvable",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }
      setSerie(serieData);

      const { data: seasonsData, error: seasonsError } = await supabase
        .from("seasons")
        .select("*")
        .eq("series_id", seriesId)
        .order("season_number", { ascending: true });
      if (seasonsError) {
        toast({
          title: "Erreur",
          description: "Impossible de charger les saisons",
          variant: "destructive"
        });
        setSeasons([]);
      } else {
        setSeasons(seasonsData || []);
      }
      setLoading(false);
    }
    if (seriesId) fetchSerieAndSeasons();
  }, [seriesId, toast]);

  // Ajout/édition saison
  const handleSaveSeason = async (values: any) => {
    const isEdit = !!values.id;
    try {
      if (!serie) throw new Error("Série introuvable");
      // Correction : on force la récupération de tmdb_series_id depuis values ET on vérifie sa présence
      const tmdbSeriesIdForInsert = values.tmdb_series_id || (serie && serie.tmdb_id) || null;
      if (!tmdbSeriesIdForInsert) {
        toast({
          title: "Erreur",
          description: "L'identifiant TMDB de la série est obligatoire. Merci de le renseigner dans le formulaire.",
          variant: "destructive"
        });
        return;
      }

      const payload = {
        ...values,
        title: values.title || null,
        season_number: values.season_number ? Number(values.season_number) : null,
        series_id: seriesId || null,
        tmdb_id: values.tmdb_id ? Number(values.tmdb_id) : null,
        episode_count: values.episode_count ? Number(values.episode_count) : null,
        air_date: values.air_date || null,
        poster: values.poster || null,
        description: values.description || null,
        tmdb_series_id: Number(tmdbSeriesIdForInsert),
      };
      Object.keys(payload).forEach(
        k => {
          if (payload[k] === "" || payload[k] === undefined) payload[k] = null;
        }
      );
      console.log("Saison payload (après correction tmdb_series_id)", payload);
      let result;
      if (isEdit) {
        result = await supabase.from("seasons").update(payload).eq("id", values.id);
      } else {
        result = await supabase.from("seasons").insert([payload]).select().single();
      }
      if (result.error) throw result.error;
      if (!result.data) {
        toast({
          title: "Erreur à l'insertion",
          description: "La saison n'a pas été créée. Vérifiez vos règles de sécurité (RLS), les champs obligatoires, ou la validité du payload.",
          variant: "destructive"
        });
        if (process.env.NODE_ENV === "development") {
          console.error("SAISON NON INSÉRÉE", { result, payload });
        }
        return;
      }
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
      toast({
        title: "Erreur",
        description: err?.message || String(err),
        variant: "destructive"
      });
    }
  };

  // Suppression saison
  const handleDeleteSeason = async (seasonId: string) => {
    if (!window.confirm("Supprimer définitivement cette saison ?")) return;
    try {
      const { error } = await supabase.from("seasons").delete().eq("id", seasonId);
      if (error) throw error;
      toast({ title: "Saison supprimée" });
      setSeasons(seasons => seasons.filter(s => s.id !== seasonId));
    } catch (err: any) {
      toast({
        title: "Erreur",
        description: err?.message || String(err),
        variant: "destructive"
      });
    }
  };

  // Ajout/édition épisode
  const handleSaveEpisode = async (values: any, seasonId: string) => {
    try {
      const payload = {
        ...values,
        season_id: seasonId,
        tmdb_id: values.tmdb_id ? Number(values.tmdb_id) : null,
        episode_number: values.episode_number ? Number(values.episode_number) : null
      };
      Object.keys(payload).forEach(
        k => {
          if (payload[k] === "" || payload[k] === undefined) payload[k] = null;
        }
      );
      let result;
      if (values.id) {
        result = await supabase.from("episodes").update(payload).eq("id", values.id);
      } else {
        result = await supabase.from("episodes").insert([payload]);
      }
      if (result.error) throw result.error;
      toast({ title: values.id ? "Épisode modifié" : "Épisode ajouté" });
      setEpisodeModal({ open: false });
    } catch (err: any) {
      toast({
        title: "Erreur",
        description: err?.message || String(err),
        variant: "destructive"
      });
    }
  };

  if (loading) return <div className="p-8 text-xl">Chargement…</div>;
  if (!serie) return <div className="p-8 text-xl text-red-500">Série introuvable</div>;

  return (
    <div className="mx-auto px-2 py-4 max-w-6xl w-full">
      {/* Header Série */}
      <section
        className="
          flex flex-col md:flex-row md:gap-8 gap-4 border-b border-gray-700 pb-5 mb-8
          bg-gradient-to-b from-gray-900/80 to-gray-950/80 rounded-xl shadow
          md:items-center
        "
      >
        <div className="mx-auto md:mx-0 flex-shrink-0">
          <img
            src={serie.poster || "/placeholder-backdrop.jpg"}
            alt={serie.title}
            className="w-36 h-52 md:w-40 md:h-60 object-cover rounded-lg shadow border border-gray-800 bg-gray-900 transition-all"
            style={{ maxWidth: "100%", height: "auto" }}
          />
        </div>
        <div className="flex-1 min-w-0 flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-3 mb-1">
            <h1 className="text-2xl md:text-3xl font-bold text-white break-words">{serie.title}</h1>
            {serie.tmdb_id && (
              <a
                href={`https://www.themoviedb.org/tv/${serie.tmdb_id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-300 hover:text-indigo-100 transition underline text-xs"
                title="Voir sur TMDB"
              >
                <Clapperboard className="inline h-4 w-4 mr-1" /> TMDB
              </a>
            )}
          </div>
          <div className="flex flex-wrap gap-4 mb-1 text-gray-400 text-sm">
            <span><Users className="inline h-4 w-4 mr-1" /> Créateur : <b className="text-white">{serie.creator || "N/A"}</b></span>
            <span><Eye className="inline h-4 w-4 mr-1" /> Statut : <b className="text-white">{serie.published ? "Publiée" : "Brouillon"}</b></span>
            <span><Star className="inline h-4 w-4 mr-1" /> Note : <b className="text-white">{serie.vote_average ? Number(serie.vote_average).toFixed(1) : "-"}</b></span>
            <span><Rows className="inline h-4 w-4 mr-1" /> Années : <b className="text-white">{serie.start_year || "?"} - {serie.end_year || "?"}</b></span>
            <span><EyeOff className={`inline h-4 w-4 mr-1 ${serie.isvip ? "text-amber-400" : "text-gray-400"}`} /> VIP : <b className="text-white">{serie.isvip ? "Oui" : "Non"}</b></span>
          </div>
          <div className="flex flex-wrap gap-2 mb-1">
            {Array.isArray(serie.genres)
              ? serie.genres.map((g: string) => (
                  <span key={g} className="px-2 py-0.5 bg-indigo-700/20 text-indigo-100 rounded text-xs">{g}</span>
                ))
              : null}
          </div>
          <div className="text-sm text-gray-300 leading-relaxed max-w-2xl">{serie.description}</div>
        </div>
      </section>

      {/* Recherche saisons & ajout */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-3">
        <input
          type="search"
          className="w-full md:max-w-xs border border-gray-700 rounded px-3 py-2 text-sm bg-gray-900 text-white focus:ring-2 focus:ring-indigo-400"
          placeholder="Rechercher une saison (titre ou numéro)…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <Button
          onClick={() => {
            if (serie && serie.tmdb_id) {
              setSeasonModal({ open: true });
            } else {
              alert("Impossible d’ajouter une saison tant que l’identifiant TMDB de la série n’est pas chargé !");
            }
          }}
          className="ml-0 md:ml-auto flex gap-2 items-center"
          variant="outline"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Ajouter une saison</span>
        </Button>
      </div>

      {/* Liste des saisons */}
      {filteredSeasons.length === 0 ? (
        <div className="text-gray-400 italic mb-8 text-center">Aucune saison trouvée.</div>
      ) : (
        <div className="grid gap-4 mb-12">
          {filteredSeasons.map(season => (
            <div
              key={season.id}
              className="
                bg-gray-900 border border-gray-800 rounded-lg shadow flex flex-col md:flex-row items-stretch md:items-center p-3 md:p-4 gap-4 
                hover:shadow-lg transition-all
              "
            >
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <img
                  src={season.poster || "/placeholder-backdrop.jpg"}
                  alt={season.title || `Saison ${season.season_number}`}
                  className="w-16 h-24 md:w-20 md:h-28 object-cover rounded shadow border border-gray-800 bg-gray-900"
                  style={{ maxWidth: "100%", height: "auto" }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-base md:text-lg font-bold text-white">Saison {season.season_number}</span>
                    {season.tmdb_id && (
                      <a
                        href={`https://www.themoviedb.org/tv/${serie.tmdb_id}/season/${season.season_number}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-indigo-300 hover:text-indigo-100 transition underline"
                        title="Voir sur TMDB"
                      >
                        <Clapperboard className="inline h-4 w-4 mr-1" /> TMDB
                      </a>
                    )}
                  </div>
                  <div className="text-gray-300 text-xs md:text-sm mb-1">{season.title}</div>
                  <div className="flex gap-3 text-xs text-gray-400">
                    <span>Date : <b className="text-white">{season.air_date || "-"}</b></span>
                    <span>Épisodes : <b className="text-white">{season.episode_count || "-"}</b></span>
                  </div>
                </div>
              </div>
              <div className="flex flex-row md:flex-col gap-2 md:items-end items-center mt-3 md:mt-0">
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => setSeasonModal({ open: true, initial: season })}
                  aria-label="Modifier la saison"
                  title="Modifier la saison"
                  className="p-2"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="destructive"
                  onClick={() => handleDeleteSeason(season.id)}
                  aria-label="Supprimer la saison"
                  title="Supprimer la saison"
                  className="p-2"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="secondary"
                  onClick={() => setEpisodesModal({ open: true, seasonId: season.id })}
                  aria-label="Voir les épisodes"
                  title="Gérer les épisodes"
                  className="p-2"
                >
                  <Rows className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modale Saison */}
      <SeasonModal
        open={seasonModal.open}
        onClose={() => setSeasonModal({ open: false })}
        onSave={handleSaveSeason}
        initialData={seasonModal.initial}
        seriesId={seriesId}
        tmdbSeriesId={serie.tmdb_id}
      />

      {/* Modale EpisodeList */}
      {episodesModal.open && episodesModal.seasonId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-gray-900 border border-gray-800 rounded-xl shadow-xl p-4 w-full max-w-lg md:max-w-2xl max-h-[95vh] overflow-y-auto relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-white"
              onClick={() => setEpisodesModal({ open: false })}
              aria-label="Fermer"
              title="Fermer"
            >✕</button>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg md:text-xl font-bold">Épisodes de la saison</h3>
            </div>
            <EpisodeList
              seriesId={seriesId}
              seasonId={episodesModal.seasonId}
              seasonNumber={
                filteredSeasons.find(s => s.id === episodesModal.seasonId)?.season_number ?? ""
              }
              episodes={seasonEpisodes}
              fetchEpisodesForSeason={() => fetchEpisodesForSeason(episodesModal.seasonId!)}
              episodesLoading={episodesLoading}
              error={episodesError}
              seriesTitle={serie.title}
              tmdbSeriesId={serie.tmdb_id}
            />
          </div>
        </div>
      )}

      {/* Modale Episode Add/Edit */}
      <EpisodeModal
        open={episodeModal.open}
        onClose={() => setEpisodeModal({ open: false })}
        seasonId={episodeModal.seasonId}
        initial={episodeModal.initial}
        onSubmit={values => {
          if (episodeModal.seasonId)
            return handleSaveEpisode(values, episodeModal.seasonId);
        }}
      />
    </div>
  );
}