"use client";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import SeasonModal from "@/components/admin/series/SeasonModal";
import EpisodeModal from "@/components/admin/series/EpisodeModal";
import { useToast } from "@/components/ui/use-toast";

// Petite utilité pour tooltips
function Tooltip({ children, text }) {
  const [show, setShow] = useState(false);
  return (
    <span
      className="relative"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      tabIndex={0}
      onFocus={() => setShow(true)}
      onBlur={() => setShow(false)}
    >
      {children}
      {show && (
        <span className="absolute z-50 left-1/2 -translate-x-1/2 bottom-full mb-2 px-2 py-1 bg-black text-white text-xs rounded shadow">
          {text}
        </span>
      )}
    </span>
  );
}

// Utilitaire pour normaliser les genres
function getGenres(serie) {
  if (Array.isArray(serie.genres)) return serie.genres;
  if (typeof serie.genre === "string") return serie.genre.split(",").map(g => g.trim());
  return [];
}

import EpisodeList from "@/components/admin/series/EpisodeList";

export default function AdminSeriesDetailPage() {
  const router = useRouter();
  const { id } = useParams();
  const [serie, setSerie] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);

  // Saison
  const [seasons, setSeasons] = useState<any[]>([]);
  const [seasonLoading, setSeasonLoading] = useState(true);
  const [seasonModal, setSeasonModal] = useState<{ open: boolean, initial?: any }>({ open: false });

  // Episodes modal state
  const [selectedSeason, setSelectedSeason] = useState<any>(null);
  const [episodesList, setEpisodesList] = useState<any[]>([]);
  const [episodesLoading, setEpisodesLoading] = useState(false);

  // Toast
  const { toast } = useToast();

  // Fetch série
  const fetchSerie = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("series").select("*").eq("id", id).single();
    if (!error) setSerie(data);
    setLoading(false);
  };

  // Fetch saisons
  const fetchSeasons = async () => {
    setSeasonLoading(true);
    const { data, error } = await supabase.from("seasons").select("*").eq("series_id", id).order("season_number", { ascending: true });
    if (!error) setSeasons(data || []);
    setSeasonLoading(false);
  };

  useEffect(() => {
    if (id) {
      fetchSerie();
      fetchSeasons();
    }
    // eslint-disable-next-line
  }, [id]);

  // CRUD Série (édition avancée)
  const [form, setForm] = useState<any>(null);
  useEffect(() => {
    if (serie) setForm({ ...serie, genres: getGenres(serie) });
  }, [serie]);

  const handleEditSerie = async (e) => {
    e.preventDefault();
    const update = { ...form, genres: Array.isArray(form.genres) ? form.genres : String(form.genres) };
    const { error } = await supabase.from("series").update(update).eq("id", id);
    if (!error) {
      toast({ title: "Série modifiée !" });
      setEditMode(false);
      fetchSerie();
    } else {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    }
  };

  // Loader ciblé pour actions saisons
  const [seasonActionLoading, setSeasonActionLoading] = useState<string | null>(null);

  // CRUD Saison avec feedback dynamique
  const handleSaveSeason = async (data) => {
    setSeasonActionLoading(data.id ? `edit-${data.id}` : "add");
    try {
      if (data.id) {
        await supabase.from("seasons").update(data).eq("id", data.id);
        toast({ title: "Saison modifiée !" });
      } else {
        await supabase.from("seasons").insert([data]);
        toast({ title: "Saison ajoutée !" });
      }
      fetchSeasons();
    } catch (e) {
      toast({ title: "Erreur", description: String(e), variant: "destructive" });
    }
    setSeasonActionLoading(null);
  };

  // Ouvre le modal d'épisodes et charge la liste pour la saison sélectionnée
  const handleOpenEpisodes = async (season: any) => {
    setSelectedSeason(season);
    setEpisodesLoading(true);
    const { data, error } = await supabase.from("episodes")
      .select("*")
      .eq("season_id", season.id)
      .order("episode_number", { ascending: true });
    if (!error) setEpisodesList(data || []);
    setEpisodesLoading(false);
  };

  // Pour rafraîchir la liste après ajout/suppression
  const fetchEpisodesForSelectedSeason = async () => {
    if (!selectedSeason) return;
    setEpisodesLoading(true);
    const { data, error } = await supabase.from("episodes")
      .select("*")
      .eq("season_id", selectedSeason.id)
      .order("episode_number", { ascending: true });
    if (!error) setEpisodesList(data || []);
    setEpisodesLoading(false);
  };

  const handleDeleteSeason = async (seasonId) => {
    if (!window.confirm("Supprimer cette saison ?")) return;
    setSeasonActionLoading(`delete-${seasonId}`);
    try {
      await supabase.from("seasons").delete().eq("id", seasonId);
      toast({ title: "Saison supprimée !" });
      fetchSeasons();
    } catch (e) {
      toast({ title: "Erreur", description: String(e), variant: "destructive" });
    }
    setSeasonActionLoading(null);
  };

  if (loading) {
    return <div className="flex justify-center items-center py-12">Chargement...</div>;
  }

  if (!serie) {
    return <div className="text-center py-12 text-red-500">Série introuvable.</div>;
  }

  return (
    <div className="max-w-3xl mx-auto bg-gray-900 rounded-lg p-8 mt-6">
      {/* Breadcrumbs */}
      <nav className="mb-4 flex items-center text-sm text-gray-400 gap-2">
        <Button asChild variant="ghost" size="sm">
          <a href="/admin/series">Séries</a>
        </Button>
        <span className="mx-1">&rsaquo;</span>
        <span className="font-semibold text-white">{serie.title}</span>
      </nav>
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          <Button onClick={() => router.back()} variant="outline" className="mr-2">
            ← Retour
          </Button>
          <Tooltip text="Aperçu côté public">
            <Button
              asChild
              variant="ghost"
              size="sm"
              aria-label="Voir la fiche publique"
              title="Voir la fiche publique"
            >
              <a href={`/series/${serie.id}`} target="_blank" rel="noopener noreferrer">
                👁️
              </a>
            </Button>
          </Tooltip>
        </div>
        <Button onClick={() => setEditMode(m => !m)} variant="secondary">
          {editMode ? "Annuler édition" : "Éditer la série"}
        </Button>
      </div>
      <div className="flex gap-6 mb-4">
        {serie.poster && (
          <img src={serie.poster} alt={serie.title} className="h-40 rounded shadow" />
        )}
        {!editMode ? (
          <div>
            <div><b>Créateur :</b> {serie.creator || "-"}</div>
            <div><b>Année début :</b> {serie.start_year || "-"}</div>
            <div><b>Année fin :</b> {serie.end_year || "-"}</div>
            <div><b>Genres :</b> {getGenres(serie).join(", ") || "-"}</div>
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
        ) : (
          <form onSubmit={handleEditSerie} className="space-y-2">
            <div>
              <label className="block text-sm">Titre</label>
              <input className="w-full rounded bg-gray-800 text-white px-2 py-1" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm">Créateur</label>
              <input className="w-full rounded bg-gray-800 text-white px-2 py-1" value={form.creator || ""} onChange={e => setForm(f => ({ ...f, creator: e.target.value }))} />
            </div>
            <div className="flex gap-2">
              <div>
                <label className="block text-sm">Année début</label>
                <input type="number" className="w-full rounded bg-gray-800 text-white px-2 py-1" value={form.start_year || ""} onChange={e => setForm(f => ({ ...f, start_year: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm">Année fin</label>
                <input type="number" className="w-full rounded bg-gray-800 text-white px-2 py-1" value={form.end_year || ""} onChange={e => setForm(f => ({ ...f, end_year: e.target.value }))} />
              </div>
            </div>
            <div>
              <label className="block text-sm">Genres</label>
              <input className="w-full rounded bg-gray-800 text-white px-2 py-1" value={Array.isArray(form.genres) ? form.genres.join(", ") : form.genres} onChange={e => setForm(f => ({ ...f, genres: e.target.value.split(",").map(g => g.trim()) }))} />
            </div>
            <div>
              <label className="block text-sm">Note</label>
              <input type="number" step="0.1" className="w-full rounded bg-gray-800 text-white px-2 py-1" value={form.vote_average || ""} onChange={e => setForm(f => ({ ...f, vote_average: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm">Affiche (URL)</label>
              <input className="w-full rounded bg-gray-800 text-white px-2 py-1" value={form.poster || ""} onChange={e => setForm(f => ({ ...f, poster: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm">TMDB ID</label>
              <input className="w-full rounded bg-gray-800 text-white px-2 py-1" value={form.tmdb_id || ""} onChange={e => setForm(f => ({ ...f, tmdb_id: e.target.value }))} />
            </div>
            <Button type="submit" variant="success" className="mt-2">Enregistrer</Button>
          </form>
        )}
      </div>
      <div className="mt-4">
        <b>Résumé :</b>
        <div className="mt-1 whitespace-pre-line">{serie.description || "Aucune description."}</div>
      </div>
      {/* Gestion arborescence saisons */}
      {/* Episodes Modal */}
      {/** Ajout du composant d'affichage des épisodes d'une saison sélectionnée */}
      {selectedSeason && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity duration-200"
          role="dialog"
          aria-modal="true"
          aria-labelledby="episodes-modal-title"
          tabIndex={-1}
          onClick={() => setSelectedSeason(null)}
        >
          <div
            className="bg-gray-900 rounded-2xl shadow-2xl border border-neutral-800 w-full max-w-2xl relative flex flex-col"
            style={{ maxHeight: "85vh" }}
            onClick={e => e.stopPropagation()}
          >
            <div className="sticky top-0 z-30 bg-transparent pt-2 pb-1 px-3 rounded-t-2xl flex items-center justify-between">
              <h2 className="text-base font-bold tracking-tight text-white/90" id="episodes-modal-title">
                Épisodes de la saison {selectedSeason.season_number}
              </h2>
              <button
                aria-label="Fermer"
                className="text-gray-400 hover:text-white text-base p-1 transition-colors"
                tabIndex={0}
                onClick={() => setSelectedSeason(null)}
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-3 pb-2 pt-1 space-y-1">
              <EpisodeList
                episodes={episodesList}
                seasonId={selectedSeason.id}
                seriesId={serie.id}
                fetchEpisodesForSeason={fetchEpisodesForSelectedSeason}
                seriesTitle={serie.title}
                tmdbSeriesId={serie.tmdb_id}
                seasonNumber={selectedSeason.season_number}
              />
            </div>
          </div>
        </div>
      )}

      <div className="mt-8">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-bold">Saisons</h2>
          <Tooltip text="Ajouter une nouvelle saison à cette série">
            <Button onClick={() => setSeasonModal({ open: true })} variant="outline">
              + Ajouter une saison
            </Button>
          </Tooltip>
        </div>
        {seasonLoading ? (
          <div className="py-4">Chargement des saisons...</div>
        ) : seasons.length === 0 ? (
          <div className="text-gray-400">Aucune saison pour cette série.</div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {seasons.map((season) => (
              <div
                key={season.id}
                className="bg-gray-800 rounded-xl shadow p-3 hover:shadow-lg transition group min-h-[64px] flex items-center gap-3"
              >
                {/* Poster compact */}
                <div className="flex-shrink-0 flex items-center">
                  <img
                    src={season.poster || "/placeholder-backdrop.jpg"}
                    alt={season.title || `Saison ${season.season_number}`}
                    className="h-14 w-10 rounded border border-gray-700 object-cover bg-gray-900"
                    onError={e => { e.target.src = "/placeholder-backdrop.jpg"; }}
                  />
                </div>
                {/* Infos essentielles */}
                <div className="flex-1 flex flex-col min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-indigo-300">
                      S{season.season_number}
                    </span>
                    {season.air_date && (
                      <span className="text-xs text-gray-400">
                        {new Date(season.air_date).getFullYear()}
                      </span>
                    )}
                  </div>
                  <div className="font-semibold text-base text-white truncate max-w-full">
                    <InlineEditSeasonTitle
                      season={season}
                      onSave={async (newTitle) => {
                        setSeasonActionLoading(`inlineedit-${season.id}`);
                        await handleSaveSeason({ ...season, title: newTitle });
                        setSeasonActionLoading(null);
                      }}
                    />
                  </div>
                </div>
                {/* Actions compactes (icônes seules avec tooltips) */}
                <div className="flex flex-row gap-1 items-center justify-end ml-2">
                  <Tooltip text="Épisodes">
                    <Button
                      size="icon"
                      variant="success"
                      onClick={() => handleOpenEpisodes(season)}
                      className="rounded-full"
                    >
                      <span role="img" aria-label="Episodes">🎬</span>
                    </Button>
                  </Tooltip>
                  <Tooltip text="Éditer la saison">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => setSeasonModal({ open: true, initial: season })}
                      className="rounded-full"
                    >
                      <span role="img" aria-label="Modifier">✏️</span>
                    </Button>
                  </Tooltip>
                  <Tooltip text="Supprimer la saison">
                    <Button
                      size="icon"
                      variant="destructive"
                      onClick={() => handleDeleteSeason(season.id)}
                      disabled={seasonActionLoading === `delete-${season.id}`}
                      className="rounded-full"
                    >
                      {seasonActionLoading === `delete-${season.id}` ? (
                        <span className="animate-spin inline-block">⏳</span>
                      ) : (
                        <span role="img" aria-label="Supprimer">🗑️</span>
                      )}
                    </Button>
                  </Tooltip>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Modal Saison */}
      <SeasonModal
        open={seasonModal.open}
        onClose={() => setSeasonModal({ open: false })}
        onSave={handleSaveSeason}
        initial={seasonModal.initial}
        seriesId={id}
        refreshSeasons={fetchSeasons}
      />

      {/* Inline edit composant en local */}
      {/* Ajout du composant InlineEditSeasonTitle */}
      <style jsx>{`
        .inline-edit-input {
          background: #222;
          color: white;
          border: 1px solid #444;
          border-radius: 4px;
          padding: 0 6px;
          font-size: 1em;
          margin-left: 2px;
          width: 160px;
        }
      `}</style>
    </div>
  );
}

// Édition inline du titre de saison
function InlineEditSeasonTitle({ season, onSave }) {
  const [edit, setEdit] = useState(false);
  const [value, setValue] = useState(season.title || "");
  const inputRef = useRef(null);

  useEffect(() => {
    if (edit && inputRef.current) inputRef.current.focus();
  }, [edit]);

  useEffect(() => {
    setValue(season.title || "");
  }, [season.title]);

  function handleBlurOrEnter() {
    setEdit(false);
    if (value.trim() !== season.title) {
      onSave(value.trim());
    }
  }

  return edit ? (
    <input
      className="inline-edit-input"
      ref={inputRef}
      value={value}
      onChange={e => setValue(e.target.value)}
      onBlur={handleBlurOrEnter}
      onKeyDown={e => {
        if (e.key === "Enter") handleBlurOrEnter();
        if (e.key === "Escape") setEdit(false);
      }}
      maxLength={80}
    />
  ) : (
    <span
      className="inline-block hover:bg-gray-700/40 px-1 rounded cursor-pointer"
      title="Double-cliquez pour éditer"
      tabIndex={0}
      onDoubleClick={() => setEdit(true)}
      onKeyDown={e => { if (e.key === "Enter") setEdit(true); }}
    >
      {season.title || <span className="text-gray-400">Sans titre</span>}
    </span>
  );
}