import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

export default function EpisodeModal({
  open,
  onClose,
  onSubmit,
  initial,
  seasonId,
  tmdbSeriesId,
  seasonNumber,
  importAllEpisodes,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  initial?: any;
  seasonId: string;
  tmdbSeriesId: string;
  seasonNumber: number;
  importAllEpisodes?: () => Promise<void>;
}) {
  const [form, setForm] = useState({
    episode_number: initial?.episode_number?.toString() || "",
    title: initial?.title || "",
    description: initial?.description || "",
    duration: initial?.duration?.toString() || "",
    tmdb_id: initial?.tmdb_id?.toString() || "",
    air_date: initial?.air_date || "",
    thumbnail_url: initial?.thumbnail_url || "",
    is_vip: initial?.is_vip || false,
    published: initial?.published || false,
  });
  const [tmdbPreview, setTmdbPreview] = useState<any>(null);
  const [tmdbLoading, setTmdbLoading] = useState(false);

  const { toast } = useToast();

  // Recherche épisode TMDB
  const fetchEpisodeFromTMDB = async (episodeNum: string) => {
    if (!tmdbSeriesId || !seasonNumber || !episodeNum) return;
    setTmdbLoading(true);
    setTmdbPreview(null);
    try {
      const res = await fetch(
        `/api/tmdb/episode/${encodeURIComponent(tmdbSeriesId)}/${encodeURIComponent(
          seasonNumber
        )}/${encodeURIComponent(episodeNum)}`
      );
      if (!res.ok) {
        setTmdbPreview(null);
      } else {
        const data = await res.json();
        setTmdbPreview(data);
      }
    } catch {
      setTmdbPreview(null);
    }
    setTmdbLoading(false);
  };

  // Importation TMDB → formulaire
  const importFromTMDB = () => {
    if (!tmdbPreview) return;
    setForm((prev) => ({
      ...prev,
      title: tmdbPreview.name || "",
      description: tmdbPreview.overview || "",
      air_date: tmdbPreview.air_date || "",
      tmdb_id: tmdbPreview.id ? String(tmdbPreview.id) : "",
      episode_number: tmdbPreview.episode_number ? String(tmdbPreview.episode_number) : "",
      thumbnail_url: tmdbPreview.still_path
        ? `https://image.tmdb.org/t/p/w500${tmdbPreview.still_path}`
        : "",
    }));
    toast({ title: "Champs pré-remplis depuis TMDB !" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      ...form,
      episode_number: form.episode_number ? Number(form.episode_number) : undefined,
      tmdb_id: form.tmdb_id ? Number(form.tmdb_id) : undefined,
      duration: form.duration ? Number(form.duration) : undefined,
      season_id: seasonId,
      is_vip: !!form.is_vip,
      published: !!form.published,
    });
    onClose();
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/40 ${!open && "hidden"}`}>
      <div className="bg-gray-900 rounded-lg shadow-xl w-full max-w-lg p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-400 hover:text-white"
          aria-label="Fermer"
        >
          ×
        </button>
        <h2 className="text-xl font-bold mb-4">{initial ? "Modifier l'épisode" : "Ajouter un épisode"}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Numéro d'épisode *</label>
            <Input
              type="number"
              min={1}
              value={form.episode_number}
              onChange={e => setForm(f => ({...f, episode_number: e.target.value}))}
              required
            />
            {(tmdbSeriesId && seasonNumber && form.episode_number) && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => fetchEpisodeFromTMDB(form.episode_number)}
                disabled={tmdbLoading}
                className="mt-2"
              >
                {tmdbLoading ? "Recherche TMDB..." : "Rechercher sur TMDB"}
              </Button>
            )}
            {tmdbPreview && (
              <Button
                type="button"
                size="sm"
                onClick={importFromTMDB}
                className="mt-2 bg-green-600 hover:bg-green-700 text-white"
              >
                Importer les infos TMDB
              </Button>
            )}
          </div>
          <Input
            placeholder="Titre"
            value={form.title}
            onChange={e => setForm(f => ({...f, title: e.target.value}))}
          />
          <Input
            placeholder="Date de diffusion"
            type="date"
            value={form.air_date}
            onChange={e => setForm(f => ({...f, air_date: e.target.value}))}
          />
          <Input
            placeholder="Durée (en minutes)"
            type="number"
            min={0}
            value={form.duration}
            onChange={e => setForm(f => ({...f, duration: e.target.value}))}
          />
          <Input
            placeholder="TMDB ID"
            type="number"
            value={form.tmdb_id}
            onChange={e => setForm(f => ({...f, tmdb_id: e.target.value}))}
          />
          <textarea
            placeholder="Description"
            value={form.description}
            onChange={e => setForm(f => ({...f, description: e.target.value}))}
            className="w-full p-2 rounded bg-gray-800 text-gray-100 border border-gray-700"
            rows={2}
          />
          <Input
            placeholder="Vignette (URL)"
            value={form.thumbnail_url}
            onChange={e => setForm(f => ({...f, thumbnail_url: e.target.value}))}
          />
          {form.thumbnail_url && (
            <img src={form.thumbnail_url} alt="Aperçu" className="h-20 mt-2 rounded" />
          )}
          <div className="flex space-x-2 items-center">
            <label>
              <input
                type="checkbox"
                checked={!!form.is_vip}
                onChange={e => setForm(f => ({...f, is_vip: e.target.checked}))}
                className="mr-2"
              />
              VIP
            </label>
            <label>
              <input
                type="checkbox"
                checked={!!form.published}
                onChange={e => setForm(f => ({...f, published: e.target.checked}))}
                className="mr-2"
              />
              Publié
            </label>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            {importAllEpisodes && (
              <Button
                type="button"
                variant="outline"
                onClick={importAllEpisodes}
                className="mr-auto"
              >
                Importer tous les épisodes via TMDB
              </Button>
            )}
            <Button type="button" variant="outline" onClick={onClose}>Annuler</Button>
            <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white">{initial ? "Enregistrer" : "Ajouter"}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}