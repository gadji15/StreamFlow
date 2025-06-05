import React, { useState } from "react";
import EpisodeRow from "./EpisodeRow";
import EpisodeModal from "./EpisodeModal";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";

// Types TypeScript pour la clarté
export interface Episode {
  id: string;
  episode_number: number;
  title: string;
  // ... autres champs utiles
}

interface EpisodeFormInput {
  id?: string;
  episode_number: number;
  title: string;
  description?: string;
  published?: boolean;
  isvip?: boolean;
  air_date?: string | null;
  thumbnail_url?: string | null;
  streamtape_url?: string | null;
  uqload_url?: string | null;
  trailer_url?: string | null;
  video_unavailable?: boolean;
  tmdb_id?: number | null;
  tmdb_series_id?: string | null;
  sort_order?: number | null;
  // ajoute ici tous les champs éditables côté admin épisode
}

interface EpisodeListProps {
  episodes: Episode[] | null | undefined;
  seasonId: string;
  seriesId: string;
  fetchEpisodesForSeason: () => Promise<void>;
  episodesLoading?: boolean;
  error?: string | null;
  seriesTitle?: string;
  tmdbSeriesId?: string;
  seasonNumber?: number | string;
}

type ModalState =
  | { open: false }
  | { open: true; mode: "add" }
  | { open: true; mode: "edit"; initialData: Episode };

export default function EpisodeList({
  episodes,
  seasonId,
  seriesId,
  fetchEpisodesForSeason,
  episodesLoading = false,
  error = null,
  seriesTitle = "",
  tmdbSeriesId = "",
  seasonNumber = ""
}: EpisodeListProps) {
  // Défense : log les IDs reçus
  if (process.env.NODE_ENV === "development") {
    console.log("EpisodeList received seriesId:", seriesId, "seasonId:", seasonId);
  }
  // Défense : episodes toujours un tableau pour éviter les bugs d’affichage
  episodes = Array.isArray(episodes) ? episodes : [];
  // Log pour analyse du contenu des épisodes reçus
  console.log("EpisodeList episodes prop:", episodes);
  // DEBUG : Log reçu
  if (process.env.NODE_ENV !== "production") {
    console.log("[DEBUG] EpisodeList episodes prop:", episodes);
  }

  // Champ de recherche dynamique (filtrage local)
  const [searchTerm, setSearchTerm] = useState("");
  const filteredEpisodes = searchTerm.trim()
    ? episodes.filter(
        ep =>
          (ep.title || "").toLowerCase().includes(searchTerm.trim().toLowerCase()) ||
          String(ep.episode_number).includes(searchTerm.trim())
      )
    : episodes;

  const { toast } = useToast();
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // Unification de la gestion de la modale d'ajout/édition
  const [modalState, setModalState] = useState<ModalState>({ open: false });

  // Pour gérer le chargement lors d'une action (ajout/édition/suppression)
  const [actionLoading, setActionLoading] = useState(false);

  // Ajout d'un épisode
  async function handleAddEpisode(form: EpisodeFormInput & { [key: string]: any }) {
    if (!seriesId) {
      toast({ title: "Erreur", description: "Série introuvable (seriesId manquant)", variant: "destructive" });
      if (process.env.NODE_ENV === "development") console.error("handleAddEpisode: seriesId is missing", { form, seasonId, seriesId });
      return;
    }
    if (!seasonId) {
      toast({ title: "Erreur", description: "Saison introuvable (seasonId manquant)", variant: "destructive" });
      if (process.env.NODE_ENV === "development") console.error("handleAddEpisode: seasonId is missing", { form, seasonId, seriesId });
      return;
    }
    setActionLoading(true);
    try {
      // Log the form received
      if (process.env.NODE_ENV === "development") {
        console.log("handleAddEpisode: form received", form);
      }
      // Remap fields to match the database
      const insertObj = {
        season_id: seasonId,
        series_id: seriesId,
        episode_number: form.episode_number,
        title: form.title,
        description: form.description || '',
        video_url: form.video_url || null,
        streamtape_url: form.streamtape_url || null,
        uqload_url: form.uqload_url || null,
        trailer_url: form.trailer_url || null,
        thumbnail_url: form.thumbnail_url || null,
        air_date: form.air_date || null,
        isvip: form.isvip ?? false,
        published: form.published ?? false,
        video_unavailable: form.video_unavailable ?? false,
        tmdb_id: form.tmdb_id ? Number(form.tmdb_id) : null,
        tmdb_series_id: form.tmdb_series_id || null,
        sort_order: (episodes ? episodes.length : 0),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        runtime: form.runtime ? Number(form.runtime) : null, // correspond à la durée
        poster: form.poster || null,
        vote_count: form.vote_count ? Number(form.vote_count) : null,
        vote_average: form.vote_average ? Number(form.vote_average) : null
      };
      console.log("handleAddEpisode: insertObj for Supabase", insertObj);
      const { data: userData } = await supabase.auth.getUser();
      const { data, error } = await supabase.from("episodes").insert([insertObj]).select().single();
      if (error) {
        // Gère l'unicité (conflit 409 ou code erreur 23505 Postgres)
        if (error.code === "23505" || error.message?.includes("duplicate key")) {
          toast({
            title: "Doublon d'épisode",
            description: "Un épisode avec ce numéro existe déjà dans cette saison.",
            variant: "destructive"
          });
        } else {
          toast({ title: "Erreur", description: error.message, variant: "destructive" });
        }
        if (process.env.NODE_ENV === "development") console.error("Supabase insert error", error);
        return;
      }
      if (!data) {
        toast({ 
          title: "Problème d’insertion (RLS ?)", 
          description: `Aucun épisode créé. user_id courant : ${(userData && userData.user && userData.user.id) || "non connecté"}. Vérifiez le rôle dans user_roles_flat.`,
          variant: "destructive"
        });
        if (process.env.NODE_ENV === "development") console.error("Insert result:", { data, error, user: userData });
        return;
      }
      await fetchEpisodesForSeason?.();
      setModalState({ open: false });
      toast({ title: "Épisode ajouté !" });
    } catch (err) {
      toast({ title: "Erreur inconnue", description: String(err), variant: "destructive" });
      if (process.env.NODE_ENV === "development") console.error("handleAddEpisode: catch error", err);
    } finally {
      setActionLoading(false);
    }
  }

  // Edition d'un épisode
  async function handleEditEpisode(form: EpisodeFormInput) {
    setActionLoading(true);
    try {
      const { id, ...rest } = form;
      if (!id) {
        toast({ title: "Erreur", description: "ID d'épisode manquant", variant: "destructive" });
        return;
      }
      // On prépare explicitement tous les champs à mettre à jour
      const updateObj: any = {
        episode_number: rest.episode_number,
        title: rest.title,
        description: rest.description ?? '',
        published: rest.published ?? false,
        isvip: rest.isvip ?? false,
        air_date: rest.air_date || null,
        thumbnail_url: rest.thumbnail_url || null,
        streamtape_url: rest.streamtape_url || null,
        uqload_url: rest.uqload_url || null,
        trailer_url: rest.trailer_url || null,
        video_unavailable: rest.video_unavailable ?? false,
        tmdb_id: rest.tmdb_id ?? null,
        tmdb_series_id: rest.tmdb_series_id ?? null,
        sort_order: rest.sort_order ?? null,
        // ajoute ici tout autre champ éditable
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase.from("episodes").update(updateObj).eq("id", id);
      if (error) {
        toast({ title: "Erreur", description: error.message, variant: "destructive" });
        if (process.env.NODE_ENV === "development") console.error(error);
        return;
      }
      await fetchEpisodesForSeason?.();
      setModalState({ open: false });
      toast({ title: "Épisode modifié !" });
    } catch (err) {
      toast({ title: "Erreur inconnue", description: String(err), variant: "destructive" });
      if (process.env.NODE_ENV === "development") console.error(err);
    } finally {
      setActionLoading(false);
    }
  }

  // Suppression d'un épisode avec confirmation modal custom
  async function handleDeleteEpisode(id: string) {
    // Vous pouvez remplacer window.confirm par une modale UI si dispo
    if (!window.confirm("Supprimer cet épisode ?")) return;
    setActionLoading(true);
    try {
      const { error } = await supabase.from("episodes").delete().eq("id", id);
      if (error) {
        toast({ title: "Erreur", description: error.message, variant: "destructive" });
        if (process.env.NODE_ENV === "development") console.error(error);
        return;
      }
      await fetchEpisodesForSeason?.();
      toast({ title: "Épisode supprimé !" });
    } catch (err) {
      toast({ title: "Erreur inconnue", description: String(err), variant: "destructive" });
      if (process.env.NODE_ENV === "development") console.error(err);
    } finally {
      setActionLoading(false);
    }
  }

  // Drag & drop reorder logic
  const moveEpisode = async (fromIdx: number, toIdx: number) => {
    if (fromIdx === toIdx) return;
    setActionLoading(true);
    try {
      const reordered = [...episodes];
      const [removed] = reordered.splice(fromIdx, 1);
      reordered.splice(toIdx, 0, removed);
      // Idéalement, remplacer par une mutation en lot si Supabase le permet
      await Promise.all(
        reordered.map((ep, idx) =>
          supabase.from("episodes").update({ sort_order: idx }).eq("id", ep.id)
        )
      );
      await fetchEpisodesForSeason?.();
      toast({ title: "Ordre des épisodes mis à jour" });
    } catch (err) {
      toast({ title: "Erreur lors du réordonnancement", description: String(err), variant: "destructive" });
      if (process.env.NODE_ENV === "development") console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  // Rendu principal
  return (
    <div>
      {/* Bouton Ajouter un épisode & champ de recherche */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-2">
        <h3 className="font-semibold text-white/90 text-base flex-shrink-0">Épisodes</h3>
        <div className="flex flex-1 gap-2 items-center">
          <input
            type="search"
            className="w-full sm:w-52 px-2 py-1 rounded border border-gray-700 bg-gray-900 text-white text-xs focus:ring-1 focus:ring-indigo-400 outline-none transition"
            placeholder="Rechercher (titre ou numéro)…"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            aria-label="Recherche épisodes"
          />
          <Button
            variant="default"
            onClick={() => {
              if (!seriesId) {
                alert("Impossible d’ajouter un épisode : série introuvable (seriesId manquant)");
                return;
              }
              if (!seasonNumber) {
                alert("Impossible d’ajouter un épisode : sélectionnez une saison.");
                return;
              }
              setModalState({ open: true, mode: "add" });
            }}
            className="text-xs px-3 py-1"
            aria-label="Ajouter un épisode"
            disabled={!seasonNumber || !seriesId || actionLoading}
            title={
              !seriesId
                ? "Impossible d’ajouter un épisode : série introuvable."
                : !seasonNumber
                ? "Veuillez sélectionner une saison avant d’ajouter un épisode."
                : ""
            }
          >
            {actionLoading && modalState.open && modalState.mode === "add" ? (
              <span className="animate-spin mr-2 inline-block h-4 w-4 border-t-2 border-b-2 border-white rounded-full"></span>
            ) : null}
            + Ajouter un épisode
          </Button>
        </div>
      </div>
      {/* Modal ajout/édition unique */}
      <EpisodeModal
        open={modalState.open}
        onClose={() => setModalState({ open: false })}
        onSave={
          modalState.open && modalState.mode === "edit"
            ? handleEditEpisode
            : handleAddEpisode
        }
        initialData={modalState.open && modalState.mode === "edit" ? modalState.initialData : undefined}
        seriesTitle={seriesTitle}
        tmdbSeriesId={tmdbSeriesId}
        parentSeasonNumber={seasonNumber}
      />
      {/* Gestion loading/erreur */}
      {episodesLoading ? (
        <div className="py-3 flex justify-center">
          <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : error ? (
        <div className="text-red-400 text-center py-2">{error}</div>
      ) : (
        // Scroll dynamique pour la table : la hauteur reste compacte, seul le contenu scroll
        <div className="relative" style={{ maxHeight: "410px", minHeight: "120px", overflow: "hidden" }}>
          <div className="overflow-y-auto scroll-smooth custom-scrollbar"
               style={{ maxHeight: "380px", minHeight: "80px" }}>
            <table className="w-full text-xs bg-gray-950 rounded"
              role="table"
              aria-label="Liste des épisodes"
            >
              <thead>
                <tr>
                  <th className="py-1" scope="col"></th>
                  <th className="py-1 text-center" scope="col">Numéro</th>
                  <th className="py-1" scope="col">Titre</th>
                  <th className="py-1 text-center" scope="col">Durée</th>
                  <th className="py-1 text-center" scope="col">Statut</th>
                  <th className="py-1 text-center" scope="col">VIP</th>
                  <th className="py-1 text-center" scope="col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEpisodes.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-gray-500 text-center py-2">
                      Aucun épisode enregistré.
                    </td>
                  </tr>
                ) : (
                  filteredEpisodes.map((episode, idx) => (
                    <EpisodeRow
                      key={episode.id}
                      episode={episode}
                      seasonId={seasonId}
                      fetchEpisodesForSeason={fetchEpisodesForSeason}
                      onEdit={() =>
                        setModalState({ open: true, mode: "edit", initialData: episode })
                      }
                      onDelete={() => handleDeleteEpisode(episode.id)}
                      draggableProps={{
                        draggable: true,
                        onDragStart: () => setDraggedIndex(idx),
        onDragOver: (e: React.DragEvent<HTMLTableRowElement>) => { e.preventDefault(); },
        onDrop: () => {
          if (draggedIndex !== null && draggedIndex !== idx) {
            moveEpisode(draggedIndex, idx);
          }
          setDraggedIndex(null);
        },
        onDragEnd: () => setDraggedIndex(null),
        style: {
          cursor: "grab",
          background: draggedIndex === idx ? "rgba(99,102,241,0.1)" : undefined
        }
      }}
      actionLoading={actionLoading}
    />
  ))
)}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
