'use client';

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useSeasons } from "@/hooks/useSeasons";
import { supabase } from "@/lib/supabaseClient";

export default function AdminSeriesSeasonsPage() {
  const params = useParams();
  const seriesId = params?.id as string;
  const { toast } = useToast();

  // On charge le tmdb_id de la série courante (une seule fois)
  const [seriesTmdbId, setSeriesTmdbId] = useState<number | null>(null);
  const [seriesTitle, setSeriesTitle] = useState<string>("");
  const [loadingSeries, setLoadingSeries] = useState(true);

  useEffect(() => {
    async function fetchSeries() {
      setLoadingSeries(true);
      const { data, error } = await supabase.from("series").select("tmdb_id, title").eq("id", seriesId).single();
      if (!error && data) {
        setSeriesTmdbId(data.tmdb_id || null);
        setSeriesTitle(data.title || "");
      }
      setLoadingSeries(false);
    }
    if (seriesId) fetchSeries();
  }, [seriesId]);

  const {
    seasons,
    fetchSeasons,
    addSeason,
    updateSeason,
    deleteSeason,
  } = useSeasons(seriesId, {
    onError: msg => toast({ title: "Erreur", description: msg, variant: "destructive" }),
    onSuccess: msg => toast({ title: msg }),
  });

  // Chargement liste et formulaire
  const [loadingList, setLoadingList] = useState(false);
  const [loadingForm, setLoadingForm] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({
    season_number: "",
    title: "",
    description: "",
    poster: "",
    air_date: "",
    tmdb_id: "",
    episode_count: "",
  });
  const [tmdbPreview, setTmdbPreview] = useState<any>(null);
  const [isTmdbLoading, setIsTmdbLoading] = useState(false);

  // Charger les saisons au montage
  useEffect(() => {
    const load = async () => {
      setLoadingList(true);
      await fetchSeasons();
      setLoadingList(false);
    };
    if (seriesId) load();
  }, [seriesId, fetchSeasons]);

  // Fetch saison TMDb pour un numéro donné
  const fetchSeasonFromTMDB = async (seasonNum: string) => {
    if (!seriesTmdbId || !seasonNum) {
      setTmdbPreview(null);
      return;
    }
    setIsTmdbLoading(true);
    setTmdbPreview(null);
    try {
      const res = await fetch(
        `https://api.themoviedb.org/3/tv/${seriesTmdbId}/season/${seasonNum}?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}&language=fr-FR`
      );
      if (!res.ok) {
        setTmdbPreview(null);
        setIsTmdbLoading(false);
        return;
      }
      const data = await res.json();
      setTmdbPreview(data);
    } catch (err) {
      setTmdbPreview(null);
    }
    setIsTmdbLoading(false);
  };

  // Importation TMDB → formulaire
  const importFromTMDB = () => {
    if (!tmdbPreview) return;
    setForm((prev) => ({
      ...prev,
      season_number: tmdbPreview.season_number ? String(tmdbPreview.season_number) : prev.season_number,
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

  const resetForm = () => {
    setForm({
      season_number: "",
      title: "",
      description: "",
      poster: "",
      air_date: "",
      tmdb_id: "",
      episode_count: "",
    });
    setEditing(null);
    setShowForm(false);
    setTmdbPreview(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (e.target.name === "season_number" && e.target.value && seriesTmdbId) {
      fetchSeasonFromTMDB(e.target.value);
    } else if (e.target.name === "season_number") {
      setTmdbPreview(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      season_number: form.season_number ? Number(form.season_number) : undefined,
      title: form.title || null,
      description: form.description || null,
      poster: form.poster || null,
      air_date: form.air_date || null,
      tmdb_id: form.tmdb_id ? Number(form.tmdb_id) : null,
      episode_count: form.episode_count ? Number(form.episode_count) : null,
    };

    if (!payload.season_number || !seriesId) {
      toast({ title: "Numéro de saison et série requis", variant: "destructive" });
      return;
    }

    setLoadingForm(true);
    let result = false;
    if (editing) {
      result = await updateSeason(editing.id, payload);
    } else {
      result = await addSeason(payload as any);
    }
    setLoadingForm(false);
    if (result) resetForm();
  };

  const handleEdit = (season: any) => {
    setEditing(season);
    setShowForm(true);
    setForm({
      season_number: season.season_number.toString(),
      title: season.title || "",
      description: season.description || "",
      poster: season.poster || "",
      air_date: season.air_date || "",
      tmdb_id: season.tmdb_id?.toString() || "",
      episode_count: season.episode_count?.toString() || "",
    });
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Supprimer définitivement cette saison ?")) return;
    await deleteSeason(id);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Gestion des saisons</h1>

      {loadingList ? (
        <div>Chargement…</div>
      ) : (
        <>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Saisons de la série</h2>
            <Button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                if (showForm) {
                  resetForm();
                } else {
                  setShowForm(true);
                  setForm({
                    season_number: "",
                    title: "",
                    description: "",
                    poster: "",
                    air_date: "",
                    tmdb_id: "",
                    episode_count: "",
                    tmdb_series_id: "",
                    series_autocomplete: "",
                  });
                  setEditing(null);
                  setTmdbPreview(null);
                }
              }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2 rounded transition"
              aria-label={showForm ? "Annuler" : "Ajouter une saison"}
            >
              {showForm ? "Annuler" : "Ajouter une saison"}
            </Button>
          </div>

          {showForm && (
            <form
              onSubmit={handleSubmit}
              className="mb-8 max-w-2xl mx-auto bg-white/5 border border-gray-800 shadow-xl rounded-xl px-8 py-6 space-y-6 relative"
              autoComplete="off"
              aria-label={editing ? "Modifier une saison" : "Ajouter une saison"}
            >
              <h3 className="text-xl font-bold mb-2 text-center">
                {editing ? "Modifier la saison" : "Ajouter une nouvelle saison"}
              </h3>
              {/* Import TMDb contextuel */}
              {seriesTmdbId && (
                <div className="mb-2 flex flex-col gap-1">
                  <label className="block text-sm font-medium mb-1" htmlFor="season_number">
                    Importer depuis TMDb
                  </label>
                  <div className="flex gap-2 items-center">
                    <input
                      id="season_number"
                      type="number"
                      min={1}
                      name="season_number"
                      value={form.season_number}
                      onChange={handleChange}
                      className="input input-bordered w-32 text-base px-4 py-2 rounded-lg"
                      placeholder="Numéro"
                      aria-label="Numéro de saison"
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => fetchSeasonFromTMDB(form.season_number)}
                      disabled={isTmdbLoading || !form.season_number}
                      aria-label="Importer la saison depuis TMDb"
                    >
                      {isTmdbLoading ? "Recherche TMDb..." : "Importer TMDb"}
                    </Button>
                    {tmdbPreview && (
                      <Button type="button" size="sm" onClick={importFromTMDB} aria-label="Pré-remplir">
                        Pré-remplir
                      </Button>
                    )}
                  </div>
                  {tmdbPreview && (
                    <div className="flex gap-4 items-center mt-2 p-2 border bg-gray-800 rounded shadow">
                      {tmdbPreview.poster_path && (
                        <img
                          src={`https://image.tmdb.org/t/p/w154${tmdbPreview.poster_path}`}
                          alt=""
                          className="h-24 rounded shadow"
                        />
                      )}
                      <div>
                        <div className="text-base font-bold">{tmdbPreview.name} (Saison {tmdbPreview.season_number})</div>
                        <div className="text-xs text-gray-400">{tmdbPreview.air_date}</div>
                        <div className="text-xs">{tmdbPreview.overview?.slice(0, 180)}{tmdbPreview.overview?.length > 180 ? "…" : ""}</div>
                      </div>
                    </div>
                  )}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="season_number">
                  Numéro de saison <span className="text-red-500">*</span>
                </label>
                <input
                  id="season_number"
                  type="number"
                  name="season_number"
                  required
                  value={form.season_number}
                  onChange={handleChange}
                  className="input input-bordered w-full text-base px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500"
                  min={1}
                  aria-required="true"
                  autoComplete="off"
                  placeholder="1"
                />
              </div>
              {/* Recherche TMDB améliorée */}
              {(form.tmdb_series_id && form.season_number) && (
                <div className="flex items-center gap-2 mt-1">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => fetchSeasonFromTMDB(form.tmdb_series_id, form.season_number)}
                    disabled={isTmdbLoading}
                    aria-label="Rechercher la saison sur TMDB"
                    className="rounded bg-blue-600/80 hover:bg-blue-700/90 text-white font-semibold"
                  >
                    {isTmdbLoading ? "Recherche TMDB..." : "Rechercher sur TMDB"}
                  </Button>
                  {tmdbPreview && (
                    <Button type="button" size="sm" onClick={importFromTMDB} aria-label="Importer les infos de TMDB"
                      className="rounded bg-green-600/80 hover:bg-green-700/90 text-white font-semibold"
                    >
                      Importer les infos
                    </Button>
                  )}
                </div>
              )}
              {tmdbPreview && (
                <div className="flex gap-4 items-center mt-2 p-2 border bg-gray-800 rounded shadow">
                  {tmdbPreview.poster_path && (
                    <img
                      src={`https://image.tmdb.org/t/p/w154${tmdbPreview.poster_path}`}
                      alt=""
                      className="h-24 rounded shadow"
                    />
                  )}
                  <div>
                    <div className="text-base font-bold">{tmdbPreview.name} (Saison {tmdbPreview.season_number})</div>
                    <div className="text-xs text-gray-400">{tmdbPreview.air_date}</div>
                    <div className="text-xs">{tmdbPreview.overview?.slice(0, 180)}{tmdbPreview.overview?.length > 180 ? "…" : ""}</div>
                  </div>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1" htmlFor="title">
                    Titre
                  </label>
                  <input
                    id="title"
                    type="text"
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    className="input input-bordered w-full text-base px-4 py-2 rounded-lg"
                    placeholder="Ex: Saison 1, Première partie..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" htmlFor="air_date">
                    Date de diffusion (AAAA-MM-JJ)
                  </label>
                  <input
                    id="air_date"
                    type="date"
                    name="air_date"
                    value={form.air_date}
                    onChange={handleChange}
                    className="input input-bordered w-full text-base px-4 py-2 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" htmlFor="episode_count">
                    Nombre d'épisodes
                  </label>
                  <input
                    id="episode_count"
                    type="number"
                    name="episode_count"
                    value={form.episode_count}
                    onChange={handleChange}
                    className="input input-bordered w-full text-base px-4 py-2 rounded-lg"
                    min={0}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" htmlFor="tmdb_id">
                    TMDB ID (saison)
                  </label>
                  <input
                    id="tmdb_id"
                    type="number"
                    name="tmdb_id"
                    value={form.tmdb_id}
                    onChange={handleChange}
                    className="input input-bordered w-full text-base px-4 py-2 rounded-lg"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="description">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  className="input input-bordered w-full text-base px-4 py-2 rounded-lg"
                  rows={2}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="poster">
                  Poster (URL)
                </label>
                <input
                  id="poster"
                  type="text"
                  name="poster"
                  value={form.poster}
                  onChange={handleChange}
                  className="input input-bordered w-full text-base px-4 py-2 rounded-lg"
                  placeholder="https://..."
                />
                {form.poster && (
                  <img alt="Poster preview" src={form.poster} className="mt-2 h-24 rounded shadow border border-gray-700" />
                )}
              </div>
              <div className="flex gap-2 mt-4 justify-end">
                <Button
                  type="submit"
                  className="rounded bg-green-600/90 hover:bg-green-700 text-white px-6 py-2 font-semibold"
                  disabled={loadingForm}
                  aria-label={editing ? "Enregistrer les modifications" : "Ajouter cette saison"}
                >
                  {loadingForm ? "Enregistrement..." : (editing ? "Enregistrer" : "Ajouter")}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetForm}
                  className="rounded px-6 py-2"
                  aria-label="Annuler"
                >
                  Annuler
                </Button>
              </div>
            </form>
          )}

          {seasons.length === 0 ? (
            <div className="text-gray-400">Aucune saison disponible pour cette série.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm divide-y divide-gray-700">
                <thead>
                  <tr>
                    <th className="py-2 px-3 text-left">#</th>
                    <th className="py-2 px-3 text-left">Titre</th>
                    <th className="py-2 px-3 text-left">Date</th>
                    <th className="py-2 px-3 text-left">Épisodes</th>
                    <th className="py-2 px-3 text-left">TMDB ID</th>
                    <th className="py-2 px-3 text-left">Description</th>
                    <th className="py-2 px-3 text-left">Poster</th>
                    <th className="py-2 px-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {seasons.map((season) => (
                    <tr key={season.id}>
                      <td className="py-2 px-3">{season.season_number}</td>
                      <td className="py-2 px-3">{season.title}</td>
                      <td className="py-2 px-3">{season.air_date}</td>
                      <td className="py-2 px-3">{season.episode_count}</td>
                      <td className="py-2 px-3">{season.tmdb_id}</td>
                      <td className="py-2 px-3 max-w-xs truncate">{season.description}</td>
                      <td className="py-2 px-3">
                        {season.poster ? (
                          <img src={season.poster} alt="" className="h-12 rounded shadow" />
                        ) : (
                          <span className="text-gray-500 italic">Aucun</span>
                        )}
                      </td>
                      <td className="py-2 px-3">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(season)}>
                          Modifier
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="ml-2"
                          onClick={() => handleDelete(season.id)}
                        >
                          Supprimer
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}