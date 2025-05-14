import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

export default function SeasonModal({
  open,
  onClose,
  onSubmit,
  initial,
  seriesId,
  refreshSeasons, // nouveau prop
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  initial?: any;
  seriesId: string;
  refreshSeasons?: () => void; // callback optionnel
}) {
  const [form, setForm] = useState({
    season_number: initial?.season_number?.toString() || "",
    title: initial?.title || "",
    description: initial?.description || "",
    poster: initial?.poster || "",
    air_date: initial?.air_date || "",
    tmdb_id: initial?.tmdb_id?.toString() || "",
    episode_count: initial?.episode_count?.toString() || "",
    tmdb_series_id: initial?.tmdb_series_id?.toString() || "",
    series_autocomplete: "",
  });
  const [tmdbPreview, setTmdbPreview] = useState<any>(null);
  const [tmdbLoading, setTmdbLoading] = useState(false);
  const [seriesSuggestions, setSeriesSuggestions] = useState<any[]>([]);
  const [seriesLoading, setSeriesLoading] = useState(false);

  const { toast } = useToast();

  // Recherche série TMDB
  const handleTMDBSeriesSearch = async (query: string) => {
    setSeriesLoading(true);
    setSeriesSuggestions([]);
    try {
      const resp = await fetch(`/api/tmdb/tv-search?query=${encodeURIComponent(query)}`);
      const data = await resp.json();
      setSeriesSuggestions(data.results || []);
    } catch {
      setSeriesSuggestions([]);
    }
    setSeriesLoading(false);
  };

  // Recherche saison TMDB
  const fetchSeasonFromTMDB = async (seriesTmdbId: string, seasonNum: string) => {
    if (!seriesTmdbId || !seasonNum) return;
    setTmdbLoading(true);
    setTmdbPreview(null);
    try {
      const res = await fetch(
        `/api/tmdb/season/${encodeURIComponent(seriesTmdbId)}/${encodeURIComponent(seasonNum)}`
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
      poster: tmdbPreview.poster_path
        ? `https://image.tmdb.org/t/p/w500${tmdbPreview.poster_path}`
        : "",
      air_date: tmdbPreview.air_date || "",
      tmdb_id: tmdbPreview.id ? String(tmdbPreview.id) : "",
      episode_count: tmdbPreview.episodes ? String(tmdbPreview.episodes.length) : (tmdbPreview.episode_count ? String(tmdbPreview.episode_count) : ""),
    }));
    toast({ title: "Champs pré-remplis depuis TMDB !" });
  };

  const [duplicate, setDuplicate] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setDuplicate(false);
    // Vérification doublon côté client
    const { data: existing, error } = await fetch(`/api/admin/check-season-duplicate?series_id=${encodeURIComponent(seriesId)}&season_number=${encodeURIComponent(form.season_number)}`).then(res=>res.json());
    if (existing && existing.length > 0) {
      setDuplicate(true);
      toast({ title: "Doublon", description: "Une saison avec ce numéro existe déjà pour cette série.", variant: "destructive" });
      return;
    }
    await onSubmit({
      ...form,
      season_number: form.season_number ? Number(form.season_number) : undefined,
      tmdb_id: form.tmdb_id ? Number(form.tmdb_id) : undefined,
      episode_count: form.episode_count ? Number(form.episode_count) : undefined,
      tmdb_series_id: form.tmdb_series_id ? Number(form.tmdb_series_id) : undefined,
      series_id: seriesId,
    });
    if (refreshSeasons) {
      refreshSeasons();
    }
    onClose();
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/40 ${!open && "hidden"}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="season-modal-title"
      onKeyDown={e => { if (e.key === "Escape") onClose(); }}
    >
      <div className="bg-gray-900 rounded-lg shadow-xl w-full max-w-lg p-6 relative outline-none"
        tabIndex={-1}
        style={{maxWidth: '95vw'}}
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          aria-label="Fermer la fenêtre"
        >
          ×
        </button>
        <h2 className="text-xl font-bold mb-4" id="season-modal-title">{initial ? "Modifier la saison" : "Ajouter une saison"}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Recherche série TMDB */}
          <div>
            <label className="block text-sm font-medium mb-1">Série TMDB *</label>
            <Input
              type="search"
              placeholder="Rechercher une série sur TMDB…"
              value={form.series_autocomplete}
              onChange={async (e) => {
                setForm(f => ({
                  ...f,
                  series_autocomplete: e.target.value,
                  tmdb_series_id: ""
                }));
                if (e.target.value.length > 2) {
                  await handleTMDBSeriesSearch(e.target.value);
                } else {
                  setSeriesSuggestions([]);
                }
              }}
              autoComplete="off"
              required
              aria-autocomplete="list"
            />
            {seriesSuggestions.length > 0 && (
              <ul className="bg-gray-800 rounded mt-1 max-h-40 overflow-y-auto">
                {seriesSuggestions.map((s, idx) => (
                  <li key={s.id}
                    className="p-2 hover:bg-indigo-600 cursor-pointer"
                    onClick={() => {
                      setForm(f => ({
                        ...f,
                        series_autocomplete: `${s.name} (${s.first_air_date?.slice(0,4) || ""})`,
                        tmdb_series_id: s.id.toString()
                      }));
                      setSeriesSuggestions([]);
                    }}
                  >
                    <span className="font-semibold">{s.name}</span>
                    {s.first_air_date && <span className="ml-2 text-xs text-gray-400">({s.first_air_date.slice(0,4)})</span>}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Numéro de saison *</label>
            <Input
              type="number"
              min={1}
              value={form.season_number}
              onChange={e => setForm(f => ({...f, season_number: e.target.value}))}
              required
            />
            {(form.tmdb_series_id && form.season_number) && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={async () => {
                  setTmdbLoading(true);
                  try {
                    const res = await fetch(`/api/tmdb/season/${encodeURIComponent(form.tmdb_series_id)}/${encodeURIComponent(form.season_number)}`);
                    if (!res.ok) throw new Error("Erreur réseau TMDB");
                    const tmdbPreview = await res.json();
                    setForm(f => ({
                      ...f,
                      title: tmdbPreview.name || f.title,
                      description: tmdbPreview.overview || f.description,
                      poster: tmdbPreview.poster_path
                        ? `https://image.tmdb.org/t/p/w500${tmdbPreview.poster_path}`
                        : f.poster,
                      air_date: tmdbPreview.air_date || f.air_date,
                      tmdb_id: tmdbPreview.id ? String(tmdbPreview.id) : f.tmdb_id,
                      episode_count: tmdbPreview.episodes ? String(tmdbPreview.episodes.length) : (tmdbPreview.episode_count ? String(tmdbPreview.episode_count) : f.episode_count),
                    }));
                    toast({ title: "Import TMDB réussi", description: "Champs pré-remplis depuis TMDB !" });
                  } catch (e) {
                    toast({ title: "Erreur TMDB", description: String(e), variant: "destructive" });
                  }
                  setTmdbLoading(false);
                }}
                disabled={tmdbLoading}
                className="mt-2"
              >
                {tmdbLoading ? "Chargement..." : "Importer TMDB"}
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
            placeholder="Nombre d'épisodes"
            type="number"
            min={0}
            value={form.episode_count}
            onChange={e => setForm(f => ({...f, episode_count: e.target.value}))}
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
            placeholder="Poster (URL)"
            value={form.poster}
            onChange={e => setForm(f => ({...f, poster: e.target.value}))}
          />
          {form.poster && (
            <img src={form.poster} alt="Aperçu" className="h-20 mt-2 rounded" />
          )}
          <div className="flex justify-end gap-2 mt-4">
            <Button type="button" variant="outline" onClick={onClose}>Annuler</Button>
            <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white">{initial ? "Enregistrer" : "Ajouter"}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}