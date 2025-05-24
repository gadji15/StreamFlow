'use client';

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useSeasons } from "@/hooks/useSeasons";

// Définition du type Season pour TypeScript
type Season = {
  id: string;
  season_number: number;
  title?: string | null;
  description?: string | null;
  poster?: string | null;
  air_date?: string | null;
  tmdb_id?: number | null;
  episode_count?: number | null;
};

export default function AdminSeriesSeasonsPage() {
  const params = useParams();
  const seriesId = params?.id as string;
  const { toast } = useToast();

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

  // Séparez l'état de chargement de la liste et du formulaire
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
    tmdb_series_id: "",
    series_autocomplete: "",
  });
  const [tmdbPreview, setTmdbPreview] = useState<any>(null);
  const [isTmdbLoading, setIsTmdbLoading] = useState(false);
  const [seriesSuggestions, setSeriesSuggestions] = useState<any[]>([]);
  const [seriesLoading, setSeriesLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);

  // Synchronisation initiale si besoin (optionnel car le hook est auto)
  useEffect(() => {
    const load = async () => {
      setLoadingList(true);
      await fetchSeasons();
      setLoadingList(false);
    };
    if (seriesId) load();
  }, [seriesId, fetchSeasons]);

  // Gestion du formulaire
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    // Recherche TMDB temps réel si tmdb_series_id ET season_number
    if (
      (e.target.name === "season_number" || e.target.name === "tmdb_series_id") &&
      (e.target.value || form.season_number || form.tmdb_series_id)
    ) {
      const seriesId = e.target.name === "tmdb_series_id" ? e.target.value : form.tmdb_series_id;
      const seasonNum = e.target.name === "season_number" ? e.target.value : form.season_number;
      if (seriesId && seasonNum) {
        fetchSeasonFromTMDB(seriesId, seasonNum);
      } else {
        setTmdbPreview(null);
      }
    }
  };

  // Recherche TMDB temps réel via API route Next.js
  const fetchSeasonFromTMDB = async (seriesTmdbId: string, seasonNum: string) => {
    if (!seriesTmdbId || !seasonNum) {
      setTmdbPreview(null);
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner une série TMDB et indiquer un numéro de saison.",
        variant: "destructive",
      });
      return;
    }
    setIsTmdbLoading(true);
    setTmdbPreview(null);
    try {
      const res = await fetch(
        `/api/tmdb/season/${encodeURIComponent(seriesTmdbId)}/${encodeURIComponent(seasonNum)}`
      );
      if (!res.ok) {
        setTmdbPreview(null);
        setIsTmdbLoading(false);
        toast({
          title: "Erreur TMDB",
          description: "Impossible de récupérer la saison depuis TMDB (réponse invalide).",
          variant: "destructive",
        });
        return;
      }
      const data = await res.json();
      if (!data || Object.keys(data).length === 0 || data.success === false) {
        setTmdbPreview(null);
        toast({
          title: "Erreur TMDB",
          description: "Aucune saison trouvée pour ces paramètres.",
          variant: "destructive",
        });
        setIsTmdbLoading(false);
        return;
      }
      setTmdbPreview(data);
    } catch (err: any) {
      setTmdbPreview(null);
      toast({
        title: "Erreur TMDB",
        description: "Erreur lors de la récupération de la saison : " + (err?.message || String(err)),
        variant: "destructive",
      });
    }
    setIsTmdbLoading(false);
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

  const resetForm = () => {
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
    setShowForm(false);
    setTmdbPreview(null);
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

  const handleEdit = (season: Season) => {
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
      tmdb_series_id: "", // valeur par défaut ou issue de l'objet season si dispo
      series_autocomplete: "", // valeur par défaut ou issue de l'objet season si dispo
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
              {/* Recherche série TMDB */}
              <div className="relative">
                <label className="block text-sm font-medium mb-1" htmlFor="series-autocomplete">
                  Série TMDB <span className="text-red-500">*</span>
                </label>
                <input
                  id="series-autocomplete"
                  name="series_autocomplete"
                  type="search"
                  autoComplete="off"
                  className="input input-bordered w-full text-base px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Rechercher une série TMDB…"
                  value={form.series_autocomplete || ""}
                  onChange={async (e) => {
                    setForm(f => ({
                      ...f,
                      series_autocomplete: e.target.value,
                      tmdb_series_id: ""
                    }));
                    setSeriesSuggestions([]);
                    setShowSuggestions(true);
                    if (e.target.value.length > 2) {
                      setSeriesLoading(true);
                      try {
                        const resp = await fetch(`/api/tmdb/tv-search?query=${encodeURIComponent(e.target.value)}`);
                        const data = await resp.json();
                        setSeriesSuggestions(data.results || []);
                      } catch { setSeriesSuggestions([]); }
                      setSeriesLoading(false);
                    }
                  }}
                  aria-autocomplete="list"
                  aria-controls="series-suggestions"
                  aria-expanded={!!showSuggestions}
                  aria-activedescendant={activeSuggestionIndex >= 0 ? `series-suggestion-${activeSuggestionIndex}` : undefined}
                  role="combobox"
                  required
                />
                {/* Suggestions dropdown */}
                {showSuggestions && !!form.series_autocomplete && (
                  <ul
                    id="series-suggestions"
                    className="absolute z-10 w-full bg-gray-900 border border-gray-700 mt-1 rounded shadow max-h-60 overflow-y-auto"
                    role="listbox"
                  >
                    {seriesLoading && (
                      <li className="p-2 text-sm text-gray-400">Chargement…</li>
                    )}
                    {seriesSuggestions.map((suggestion, idx) => (
                      <li
                        key={suggestion.id}
                        id={`series-suggestion-${idx}`}
                        className={`p-2 cursor-pointer hover:bg-blue-600/70 transition-colors ${activeSuggestionIndex === idx ? "bg-blue-600/80 text-white" : ""}`}
                        role="option"
                        aria-selected={activeSuggestionIndex === idx}
                        onClick={() => {
                          setForm(f => ({
                            ...f,
                            series_autocomplete: suggestion.name + (suggestion.first_air_date ? " (" + suggestion.first_air_date.slice(0, 4) + ")" : ""),
                            tmdb_series_id: suggestion.id.toString()
                          }));
                          setSeriesSuggestions([]);
                          setShowSuggestions(false);
                        }}
                      >
                        <span className="font-medium">{suggestion.name}</span>{" "}
                        {suggestion.first_air_date && (
                          <span className="text-xs text-gray-400 ml-1">({suggestion.first_air_date.slice(0, 4)})</span>
                        )}
                        {suggestion.poster_path && (
                          <img
                            src={`https://image.tmdb.org/t/p/w45${suggestion.poster_path}`}
                            alt=""
                            className="inline-block ml-2 h-6 w-auto rounded"
                          />
                        )}
                      </li>
                    ))}
                    {!seriesLoading && seriesSuggestions.length === 0 && (
                      <li className="p-2 text-sm text-gray-400">Aucune série trouvée…</li>
                    )}
                  </ul>
                )}
              </div>
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