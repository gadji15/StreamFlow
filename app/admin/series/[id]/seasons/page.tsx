'use client';

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

type Season = {
  id: string;
  series_id: string;
  season_number: number;
  title: string | null;
  description: string | null;
  poster: string | null;
  air_date: string | null;
  tmdb_id: number | null;
  episode_count: number | null;
  created_at: string;
  updated_at: string;
};

export default function AdminSeriesSeasonsPage() {
  const params = useParams();
  const seriesId = params?.id as string;
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Season | null>(null);
  const [form, setForm] = useState({
    season_number: "",
    title: "",
    description: "",
    poster: "",
    air_date: "",
    tmdb_id: "",
    episode_count: "",
    tmdb_series_id: "", // Pour la recherche TMDB
  });
  const [tmdbPreview, setTmdbPreview] = useState<any>(null);
  const [isTmdbLoading, setIsTmdbLoading] = useState(false);
  const { toast } = useToast();

  // Charger les saisons de la série
  const fetchSeasons = async () => {
    setIsLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from("seasons")
      .select("*")
      .eq("series_id", seriesId)
      .order("season_number", { ascending: true });
    if (error) {
      setError("Erreur lors du chargement des saisons.");
    } else {
      setSeasons(data || []);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (seriesId) fetchSeasons();
  }, [seriesId]);

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

  // Recherche TMDB temps réel
  const fetchSeasonFromTMDB = async (seriesTmdbId: string, seasonNum: string) => {
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
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      series_id: seriesId,
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

    if (editing) {
      // Update
      const { error } = await supabase
        .from("seasons")
        .update(payload)
        .eq("id", editing.id);
      if (error) {
        toast({
          title: "Erreur",
          description: "Impossible de modifier la saison.",
          variant: "destructive",
        });
      } else {
        toast({ title: "Saison modifiée avec succès." });
        fetchSeasons();
        resetForm();
      }
    } else {
      // Insert
      const { error } = await supabase.from("seasons").insert([payload]);
      if (error) {
        toast({
          title: "Erreur",
          description: "Impossible d'ajouter la saison.",
          variant: "destructive",
        });
      } else {
        toast({ title: "Saison ajoutée avec succès." });
        fetchSeasons();
        resetForm();
      }
    }
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
    });
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Supprimer définitivement cette saison ?")) return;
    const { error } = await supabase.from("seasons").delete().eq("id", id);
    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la saison.",
        variant: "destructive",
      });
    } else {
      toast({ title: "Saison supprimée." });
      fetchSeasons();
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Gestion des saisons</h1>

      {isLoading ? (
        <div>Chargement…</div>
      ) : error ? (
        <div className="text-red-500 mb-4">{error}</div>
      ) : (
        <>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Saisons de la série</h2>
            <Button onClick={() => { setShowForm(!showForm); resetForm(); }}>
              {showForm ? "Annuler" : "Ajouter une saison"}
            </Button>
          </div>

          {showForm && (
            <form onSubmit={handleSubmit} className="mb-8 p-4 border rounded-lg bg-gray-900 space-y-3">
              <div>
                <label className="block text-sm">ID TMDB de la série (obligatoire pour recherche)</label>
                <input
                  type="text"
                  name="tmdb_series_id"
                  value={form.tmdb_series_id}
                  onChange={handleChange}
                  className="input input-bordered w-full"
                  placeholder="ex: 1399 (Game of Thrones)"
                />
              </div>
              <div>
                <label className="block text-sm">Numéro de saison *</label>
                <input
                  type="number"
                  name="season_number"
                  required
                  value={form.season_number}
                  onChange={handleChange}
                  className="input input-bordered w-full"
                  min={1}
                />
              </div>
              {/* Recherche TMDB en temps réel */}
              {(form.tmdb_series_id && form.season_number) && (
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => fetchSeasonFromTMDB(form.tmdb_series_id, form.season_number)}
                    disabled={isTmdbLoading}
                  >
                    {isTmdbLoading ? "Recherche TMDB..." : "Rechercher sur TMDB"}
                  </Button>
                  {tmdbPreview && (
                    <Button type="button" size="sm" onClick={importFromTMDB}>
                      Importer les infos
                    </Button>
                  )}
                </div>
              )}
              {tmdbPreview && (
                <div className="flex gap-4 items-center mt-2 p-2 border bg-gray-800 rounded">
                  {tmdbPreview.poster_path && (
                    <img
                      src={`https://image.tmdb.org/t/p/w92${tmdbPreview.poster_path}`}
                      alt=""
                      className="h-20 rounded"
                    />
                  )}
                  <div>
                    <div className="text-sm font-bold">{tmdbPreview.name} (Saison {tmdbPreview.season_number})</div>
                    <div className="text-xs text-gray-400">{tmdbPreview.air_date}</div>
                    <div className="text-xs">{tmdbPreview.overview?.slice(0, 100)}{tmdbPreview.overview?.length > 100 ? "…" : ""}</div>
                  </div>
                </div>
              )}
              <div>
                <label className="block text-sm">Titre</label>
                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  className="input input-bordered w-full"
                  placeholder="Ex: Saison 1, Première partie..."
                />
              </div>
              <div>
                <label className="block text-sm">Date de diffusion (AAAA-MM-JJ)</label>
                <input
                  type="date"
                  name="air_date"
                  value={form.air_date}
                  onChange={handleChange}
                  className="input input-bordered w-full"
                />
              </div>
              <div>
                <label className="block text-sm">Nombre d'épisodes</label>
                <input
                  type="number"
                  name="episode_count"
                  value={form.episode_count}
                  onChange={handleChange}
                  className="input input-bordered w-full"
                  min={0}
                />
              </div>
              <div>
                <label className="block text-sm">TMDB ID (saison)</label>
                <input
                  type="number"
                  name="tmdb_id"
                  value={form.tmdb_id}
                  onChange={handleChange}
                  className="input input-bordered w-full"
                />
              </div>
              <div>
                <label className="block text-sm">Description</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  className="input input-bordered w-full"
                  rows={2}
                />
              </div>
              <div>
                <label className="block text-sm">Poster (URL)</label>
                <input
                  type="text"
                  name="poster"
                  value={form.poster}
                  onChange={handleChange}
                  className="input input-bordered w-full"
                  placeholder="https://..."
                />
              </div>
              <div className="flex gap-2 mt-2">
                <Button type="submit" className="bg-green-600">{editing ? "Modifier" : "Ajouter"}</Button>
                <Button type="button" variant="outline" onClick={resetForm}>Annuler</Button>
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