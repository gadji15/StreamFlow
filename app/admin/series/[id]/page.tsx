"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import SeasonModal from "@/components/admin/series/SeasonModal";
import EpisodeList from "@/components/admin/series/EpisodeList";
import EpisodeModal from "@/components/admin/series/EpisodeModal";

export default function AdminSeriesDetailPage() {
  const params = useParams();
  const seriesId = params?.id as string;
  const { toast } = useToast();

  const [serie, setSerie] = useState<any>(null);
  const [seasons, setSeasons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [seasonModal, setSeasonModal] = useState<{ open: boolean, initial?: any }>({ open: false });
  // EpisodeList modal state
  const [episodesModal, setEpisodesModal] = useState<{ open: boolean, seasonId?: string }>({ open: false });
  // EpisodeModal state
  const [episodeModal, setEpisodeModal] = useState<{ open: boolean, seasonId?: string, initial?: any }>({ open: false });

  // Recherche dynamique des saisons
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

  // Fetch série + saisons
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
        toast({
          title: "Erreur",
          description: "Série introuvable",
          variant: "destructive"
        });
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
      const payload = {
        ...values,
        season_number: Number(values.season_number),
        series_id: seriesId,
        tmdb_id: values.tmdb_id ? Number(values.tmdb_id) : null,
        episode_count: values.episode_count ? Number(values.episode_count) : null
      };
      Object.keys(payload).forEach(
        k => {
          if (payload[k] === "" || payload[k] === undefined) payload[k] = null;
        }
      );
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
    <div className="max-w-4xl mx-auto p-6">
      {/* Header Série */}
      <div className="flex flex-col md:flex-row gap-8 border-b border-gray-700 pb-6 mb-8">
        <img
          src={serie.poster || "/placeholder-backdrop.jpg"}
          alt={serie.title}
          className="w-40 h-60 object-cover rounded shadow border border-gray-700 bg-gray-800"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-4 mb-2">
            <h1 className="text-3xl font-bold">{serie.title}</h1>
            {serie.tmdb_id && (
              <a
                href={`https://www.themoviedb.org/tv/${serie.tmdb_id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-indigo-400 hover:underline"
                title="Voir sur TMDB"
              >
                TMDB ↗
              </a>
            )}
          </div>
          <div className="text-gray-400 mb-2">Créateur : <b>{serie.creator || "N/A"}</b></div>
          <div className="flex gap-6 mb-2">
            <div>Première diffusion : <b>{serie.start_year || "?"}</b></div>
            <div>Dernière diffusion : <b>{serie.end_year || "?"}</b></div>
            <div>Note : <b>{serie.vote_average ? Number(serie.vote_average).toFixed(1) : "-"}</b></div>
            <div>Statut : <b>{serie.published ? "Publiée" : "Brouillon"}</b></div>
            <div>VIP : <b>{serie.isvip ? "Oui" : "Non"}</b></div>
          </div>
          <div className="flex flex-wrap gap-2 mb-2">
            {Array.isArray(serie.genres)
              ? serie.genres.map((g: string) => (
                  <span key={g} className="px-2 py-0.5 bg-indigo-700/30 text-indigo-200 rounded text-xs">{g}</span>
                ))
              : null}
          </div>
          <div className="text-sm mt-2 text-gray-300">{serie.description}</div>
        </div>
      </div>

      {/* Recherche saisons & ajout */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-2">
        <input
          type="search"
          className="w-full max-w-xs border border-gray-600 rounded px-3 py-2 text-sm bg-gray-900 text-white"
          placeholder="Rechercher une saison (titre ou numéro)…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <Button onClick={() => setSeasonModal({ open: true })} className="ml-auto">
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v8M8 12h8" />
          </svg>
        </Button>
      </div>

      {/* Liste des saisons */}
      {filteredSeasons.length === 0 ? (
        <div className="text-gray-400 italic mb-8">Aucune saison trouvée.</div>
      ) : (
        <div className="grid gap-6 mb-12">
          {filteredSeasons.map(season => (
            <div
              key={season.id}
              className="bg-gray-900 border border-gray-700 rounded-lg shadow flex flex-col md:flex-row items-stretch md:items-center p-4 gap-6"
            >
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <img
                  src={season.poster || "/placeholder-backdrop.jpg"}
                  alt={season.title || `Saison ${season.season_number}`}
                  className="w-20 h-28 object-cover rounded shadow border border-gray-700 bg-gray-800"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold">Saison {season.season_number}</span>
                    {season.tmdb_id && (
                      <a
                        href={`https://www.themoviedb.org/tv/${serie.tmdb_id}/season/${season.season_number}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-indigo-400 hover:underline"
                        title="Voir sur TMDB"
                      >
                        TMDB ↗
                      </a>
                    )}
                  </div>
                  <div className="text-gray-300 mb-1">{season.title}</div>
                  <div className="flex gap-4 text-sm text-gray-400">
                    <span>Date : <b>{season.air_date || "-"}</b></span>
                    <span>Épisodes : <b>{season.episode_count || "-"}</b></span>
                  </div>
                  {/* Description intentionally omitted */}
                </div>
              </div>
              <div className="flex md:flex-col gap-2 md:items-end items-center mt-4 md:mt-0">
                {/* Edit icon */}
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => setSeasonModal({ open: true, initial: season })}
                  aria-label="Modifier la saison"
                  title="Modifier la saison"
                  className="p-2"
                >
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828A2 2 0 019 17H7v-2a2 2 0 01.586-1.414L15.232 5.232z" />
                  </svg>
                </Button>
                {/* Delete icon */}
                <Button
                  size="icon"
                  variant="destructive"
                  onClick={() => handleDeleteSeason(season.id)}
                  aria-label="Supprimer la saison"
                  title="Supprimer la saison"
                  className="p-2"
                >
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M6 19a2 2 0 002 2h8a2 2 0 002-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                  </svg>
                </Button>
                {/* Episodes icon */}
                <Button
                  size="icon"
                  variant="secondary"
                  onClick={() => setEpisodesModal({ open: true, seasonId: season.id })}
                  aria-label="Voir les épisodes"
                  title="Gérer les épisodes"
                  className="p-2"
                >
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <rect x="4" y="4" width="16" height="16" rx="2" />
                    <path d="M8 8h8v8H8z" />
                  </svg>
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
        initial={seasonModal.initial}
        seriesId={seriesId}
      />

      {/* Modale EpisodeList */}
      {episodesModal.open && episodesModal.seasonId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-gray-900 border border-gray-700 rounded-xl shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-white"
              onClick={() => setEpisodesModal({ open: false })}
              aria-label="Fermer"
              title="Fermer"
            >✕</button>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Épisodes de la saison</h3>
              <Button
                size="icon"
                variant="secondary"
                onClick={() =>
                  setEpisodeModal({
                    open: true,
                    seasonId: episodesModal.seasonId,
                    initial: undefined
                  })
                }
                aria-label="Ajouter un épisode"
                title="Ajouter un épisode"
                className="p-2"
              >
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 8v8M8 12h8" />
                </svg>
              </Button>
            </div>
            <EpisodeList
              seasonId={episodesModal.seasonId}
              onEditEpisode={ep =>
                setEpisodeModal({
                  open: true,
                  seasonId: episodesModal.seasonId,
                  initial: ep
                })
              }
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