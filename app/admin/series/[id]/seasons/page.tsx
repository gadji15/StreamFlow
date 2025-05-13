'use client';

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

type Season = {
  id: string;
  series_id: string;
  number: number;
  name: string | null;
  year: number | null;
  description: string | null;
  poster: string | null;
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
    number: "",
    name: "",
    year: "",
    description: "",
    poster: "",
  });
  const { toast } = useToast();

  // Charger les saisons de la série
  const fetchSeasons = async () => {
    setIsLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from("seasons")
      .select("*")
      .eq("series_id", seriesId)
      .order("number", { ascending: true });
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
  };

  const resetForm = () => {
    setForm({
      number: "",
      name: "",
      year: "",
      description: "",
      poster: "",
    });
    setEditing(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      series_id: seriesId,
      number: Number(form.number),
      name: form.name || null,
      year: form.year ? Number(form.year) : null,
      description: form.description || null,
      poster: form.poster || null,
    };

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
      number: season.number.toString(),
      name: season.name || "",
      year: season.year?.toString() || "",
      description: season.description || "",
      poster: season.poster || "",
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
                <label className="block text-sm">Numéro de saison *</label>
                <input
                  type="number"
                  name="number"
                  required
                  value={form.number}
                  onChange={handleChange}
                  className="input input-bordered w-full"
                  min={1}
                />
              </div>
              <div>
                <label className="block text-sm">Nom</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="input input-bordered w-full"
                  placeholder="Saison 1, Première partie, etc."
                />
              </div>
              <div>
                <label className="block text-sm">Année</label>
                <input
                  type="number"
                  name="year"
                  value={form.year}
                  onChange={handleChange}
                  className="input input-bordered w-full"
                  min={1900}
                  max={2100}
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
                    <th className="py-2 px-3 text-left">Nom</th>
                    <th className="py-2 px-3 text-left">Année</th>
                    <th className="py-2 px-3 text-left">Description</th>
                    <th className="py-2 px-3 text-left">Poster</th>
                    <th className="py-2 px-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {seasons.map((season) => (
                    <tr key={season.id}>
                      <td className="py-2 px-3">{season.number}</td>
                      <td className="py-2 px-3">{season.name}</td>
                      <td className="py-2 px-3">{season.year}</td>
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