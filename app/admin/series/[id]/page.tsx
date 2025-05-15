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

export default function AdminSeriesDetailPage() {
  const router = useRouter();
  const { id } = useParams();
  const [serie, setSerie] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false); // à supprimer plus tard
  const [seriesModalOpen, setSeriesModalOpen] = useState(false);

  // Saison
  const [seasons, setSeasons] = useState<any[]>([]);
  const [seasonLoading, setSeasonLoading] = useState(true);
  const [seasonModal, setSeasonModal] = useState<{ open: boolean, initial?: any }>({ open: false });

  // Épisodes (ajout d'un épisode)
  const [episodeModal, setEpisodeModal] = useState<{ open: boolean, season?: any }>({ open: false });
  const [episodesBySeason, setEpisodesBySeason] = useState<{ [seasonId: string]: any[] }>({});
  const [episodesLoadingBySeason, setEpisodesLoadingBySeason] = useState<{ [seasonId: string]: boolean }>({});

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

  // Fetch épisodes d'une saison (pour accordéon)
  const fetchEpisodesForSeason = async (seasonId) => {
    setEpisodesLoadingBySeason((prev) => ({ ...prev, [seasonId]: true }));
    const { data, error } = await supabase.from("episodes").select("*").eq("season_id", seasonId).order("episode_number", { ascending: true });
    setEpisodesBySeason((prev) => ({ ...prev, [seasonId]: error ? [] : data || [] }));
    setEpisodesLoadingBySeason((prev) => ({ ...prev, [seasonId]: false }));
  };

  useEffect(() => {
    if (id) {
      fetchSerie();
      fetchSeasons();
    }
    // eslint-disable-next-line
  }, [id]);

  // CRUD Série via SeriesModal
  const handleSaveSerie = async (data) => {
    // On retire les champs inutiles avant d'envoyer à la base
    const { id: _id, ...updateData } = data;
    const { error } = await supabase.from("series").update(updateData).eq("id", id);
    if (!error) {
      toast({ title: "Série modifiée !" });
      setSeriesModalOpen(false);
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

  // Ajout d'épisode
  const handleSaveEpisode = async (episodeData) => {
    try {
      // On retire id si présent et on injecte le bon season_id (sécurité)
      const { id: _id, ...rest } = episodeData;
      const dataToSave = { ...rest, season_id: episodeData.season_id };
      await supabase.from("episodes").insert([dataToSave]);
      toast({ title: "Épisode ajouté !" });
      setEpisodeModal({ open: false, season: undefined });
      // Rafraîchir la liste des épisodes pour la saison concernée
      if (episodeData.season_id) fetchEpisodesForSeason(episodeData.season_id);
    } catch (e) {
      toast({ title: "Erreur", description: String(e), variant: "destructive" });
    }
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
      {/* ...tout le début inchangé... */}
      <div className="mt-8">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-bold">Saisons</h2>
          <Tooltip text="Ajouter une nouvelle saison à cette série">
            <Button onClick={() => setSeasonModal({ open: true })} variant="outline">
              + Ajouter une saison
            </Button>
          </Tooltip>
        </div>
        {/* Nouvelle intégration du tableau avec gestion épisodes */}
        <SeasonList
          seasons={seasons}
          seriesId={id}
          expandedSeason={expandedSeason}
          setExpandedSeason={setExpandedSeason}
          fetchEpisodesForSeason={fetchEpisodesForSeason}
          seasonEpisodes={episodesBySeason}
          seasonEpisodesLoading={episodesLoadingBySeason}
          onAction={(action, { season, seriesId }) => {
            if (action === "edit") setSeasonModal({ open: true, initial: season });
            if (action === "add-episode") setEpisodeModal({ open: true, season });
            if (action === "refresh") fetchSeasons();
            if (action === "refresh-episodes" && season) fetchEpisodesForSeason(season.id);
          }}
        />
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

      {/* Modal Épisode */}
      <EpisodeModal
        open={episodeModal.open}
        onClose={() => setEpisodeModal({ open: false, season: undefined })}
        onSave={data => {
          // On injecte l'id de la saison dans l'épisode à créer
          handleSaveEpisode({ ...data, season_id: episodeModal.season?.id });
        }}
        season={episodeModal.season}
      />

      {/* Modal Série */}
      <SeriesModal
        open={seriesModalOpen}
        onClose={() => setSeriesModalOpen(false)}
        onSave={handleSaveSerie}
        initialData={serie}
      />

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