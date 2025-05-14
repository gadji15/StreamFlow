"use client";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import SeasonModal from "@/components/admin/series/SeasonModal";
import EpisodeModal from "@/components/admin/series/EpisodeModal";
import { useToast } from "@/components/ui/use-toast";

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
  const [editMode, setEditMode] = useState(false);

  // Saison
  const [seasons, setSeasons] = useState<any[]>([]);
  const [seasonLoading, setSeasonLoading] = useState(true);
  const [seasonModal, setSeasonModal] = useState<{ open: boolean, initial?: any }>({ open: false });

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

  // CRUD Saison
  const handleSaveSeason = async (data) => {
    if (data.id) {
      await supabase.from("seasons").update(data).eq("id", data.id);
    } else {
      await supabase.from("seasons").insert([data]);
    }
    fetchSeasons();
  };

  const handleDeleteSeason = async (seasonId) => {
    if (!window.confirm("Supprimer cette saison ?")) return;
    await supabase.from("seasons").delete().eq("id", seasonId);
    fetchSeasons();
  };

  if (loading) {
    return <div className="flex justify-center items-center py-12">Chargement...</div>;
  }

  if (!serie) {
    return <div className="text-center py-12 text-red-500">Série introuvable.</div>;
  }

  return (
    <div className="max-w-3xl mx-auto bg-gray-900 rounded-lg p-8 mt-6">
      <Button onClick={() => router.back()} variant="outline" className="mb-4">
        ← Retour
      </Button>
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-3xl font-bold">{serie.title}</h1>
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
      <div className="mt-8">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-bold">Saisons</h2>
          <Button onClick={() => setSeasonModal({ open: true })} variant="outline">
            + Ajouter une saison
          </Button>
        </div>
        {seasonLoading ? (
          <div className="py-4">Chargement des saisons...</div>
        ) : seasons.length === 0 ? (
          <div className="text-gray-400">Aucune saison pour cette série.</div>
        ) : (
          <div className="divide-y divide-gray-800">
            {seasons.map((season) => (
              <div key={season.id} className="flex items-center gap-4 py-2">
                <span className="font-semibold">Saison {season.season_number}: {season.title || <span className="text-gray-400">Sans titre</span>}</span>
                <Button size="sm" variant="ghost" onClick={() => setSeasonModal({ open: true, initial: season })}>Éditer</Button>
                <Button size="sm" variant="destructive" onClick={() => handleDeleteSeason(season.id)}>Supprimer</Button>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Modal Saison */}
      <SeasonModal
        open={seasonModal.open}
        onClose={() => setSeasonModal({ open: false })}
        onSubmit={handleSaveSeason}
        initial={seasonModal.initial}
        seriesId={id}
        refreshSeasons={fetchSeasons}
      />
    </div>
  );
}