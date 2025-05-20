import React, { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";

// À adapter selon vos utilitaires
// import { fetchTMDBSeriesDetails, fetchTMDBSeriesCast } from "@/lib/tmdb";

type CastMember = { name: string; role?: string; photoUrl?: string };

interface SeriesModalProps {
  initialData?: any; // Pour édition, sinon undefined pour création
  onSave: (data: any) => Promise<void>;
  onClose: () => void;
}

export default function SeriesModal({ initialData, onSave, onClose }: SeriesModalProps) {
  // Champs principaux (state)
  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [poster, setPoster] = useState(initialData?.poster || "");
  const [backdrop, setBackdrop] = useState(initialData?.backdrop || "");
  const [tmdbId, setTmdbId] = useState(initialData?.tmdb_id || "");
  const [cast, setCast] = useState<CastMember[]>(initialData?.cast || []);
  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [backdropFile, setBackdropFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  // Upload d'image (poster ou backdrop)
  async function uploadImage(file: File, type: "poster" | "backdrop") {
    const fileExt = file.name.split(".").pop();
    const filePath = `${type}s/${Date.now()}-${Math.random()}.${fileExt}`;
    const { data, error } = await supabase.storage.from("series-images").upload(filePath, file);
    if (error) throw error;
    return data?.path ? supabase.storage.from("series-images").getPublicUrl(data.path).publicURL : "";
  }

  // Simulé : à adapter si des utilitaires existent dans votre code
  async function fetchTMDBSeriesDetails(tmdbId: string) {
    // Doit retourner { name, overview, poster_path, backdrop_path }
    return {
      name: "Titre TMDB",
      overview: "Description TMDB",
      poster_path: "/fake-poster.jpg",
      backdrop_path: "/fake-backdrop.jpg"
    };
  }
  async function fetchTMDBSeriesCast(tmdbId: string) {
    // Doit retourner [{ name, character, profile_path }]
    return [
      { name: "Acteur 1", character: "Rôle 1", profile_path: "/fake.jpg" },
      { name: "Acteur 2", character: "Rôle 2", profile_path: "/fake2.jpg" }
    ];
  }

  // Import TMDB
  async function handleImportTMDB() {
    if (!tmdbId) return;
    setLoading(true);
    try {
      const tmdbData = await fetchTMDBSeriesDetails(tmdbId);
      setTitle(tmdbData.name || "");
      setDescription(tmdbData.overview || "");
      setPoster(tmdbData.poster_path ? "/" + tmdbData.poster_path.replace(/^\//, "") : "");
      setBackdrop(tmdbData.backdrop_path ? "/" + tmdbData.backdrop_path.replace(/^\//, "") : "");
    } catch (e) {
      alert("Erreur import TMDB");
    } finally {
      setLoading(false);
    }
  }
  async function handleImportCastTMDB() {
    if (!tmdbId) return;
    setLoading(true);
    try {
      const tmdbCast = await fetchTMDBSeriesCast(tmdbId);
      setCast(
        tmdbCast.slice(0, 12).map((person: any) => ({
          name: person.name,
          role: person.character,
          photoUrl: person.profile_path ? "/" + person.profile_path.replace(/^\//, "") : "",
        }))
      );
    } catch {
      alert("Erreur import casting TMDB");
    } finally {
      setLoading(false);
    }
  }

  // Sauvegarde
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      let posterUrl = poster;
      let backdropUrl = backdrop;
      if (posterFile) posterUrl = await uploadImage(posterFile, "poster");
      if (backdropFile) backdropUrl = await uploadImage(backdropFile, "backdrop");
      await onSave({
        title,
        description,
        poster: posterUrl,
        backdrop: backdropUrl,
        tmdb_id: tmdbId,
        cast,
      });
      onClose();
    } catch (e: any) {
      alert("Erreur lors de la sauvegarde: " + e.message);
    } finally {
      setLoading(false);
    }
  }

  // Gestion du cast
  function addCastMember() {
    setCast([...cast, { name: "", role: "", photoUrl: "" }]);
  }
  function updateCastMember(idx: number, member: CastMember) {
    setCast(cast.map((m, i) => (i === idx ? member : m)));
  }
  function removeCastMember(idx: number) {
    setCast(cast.filter((_, i) => i !== idx));
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center overflow-auto">
      <form
        className="bg-gray-900 rounded-lg shadow-xl w-full max-w-2xl mx-auto p-6 space-y-6"
        onSubmit={handleSubmit}
        aria-label="Édition série"
      >
        <h2 className="text-xl font-bold mb-4">{initialData ? "Modifier la série" : "Ajouter une série"}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-200 font-medium mb-1" htmlFor="title">Titre *</label>
            <input
              id="title"
              className="w-full px-3 py-2 rounded bg-gray-800 text-gray-100"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-gray-200 font-medium mb-1" htmlFor="tmdbid">TMDB ID</label>
            <input
              id="tmdbid"
              className="w-full px-3 py-2 rounded bg-gray-800 text-gray-100"
              value={tmdbId}
              onChange={(e) => setTmdbId(e.target.value)}
              placeholder="ex: 1668"
              inputMode="numeric"
            />
            <Button type="button" size="sm" className="mt-2" onClick={handleImportTMDB} disabled={loading || !tmdbId}>
              Importer titre/images depuis TMDB
            </Button>
            <Button type="button" size="sm" className="mt-2 ml-2" onClick={handleImportCastTMDB} disabled={loading || !tmdbId}>
              Importer casting TMDB
            </Button>
          </div>
        </div>
        <div>
          <label className="block text-gray-200 font-medium mb-1" htmlFor="description">Description</label>
          <textarea
            id="description"
            className="w-full px-3 py-2 rounded bg-gray-800 text-gray-100 min-h-[72px]"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Poster */}
          <div>
            <label className="block text-gray-200 font-medium mb-1">Affiche (poster)</label>
            <input
              type="file"
              accept="image/*"
              className="block w-full"
              onChange={(e) => setPosterFile(e.target.files?.[0] || null)}
              aria-label="Importer une affiche"
            />
            <input
              type="text"
              className="w-full mt-2 px-3 py-2 rounded bg-gray-800 text-gray-100"
              value={poster}
              onChange={(e) => setPoster(e.target.value)}
              placeholder="URL complète, chemin TMDB ou URL Supabase"
              aria-label="Saisir le chemin de l'affiche"
            />
            <div className="mt-1 flex items-center gap-2">
              {poster && (
                <img
                  src={
                    poster.startsWith("http")
                      ? poster
                      : poster.startsWith("/")
                        ? "https://image.tmdb.org/t/p/w185" + poster
                        : poster
                  }
                  alt="Aperçu affiche"
                  className="w-16 h-24 rounded shadow border border-gray-700 object-cover"
                  style={{ background: "#222" }}
                  onError={e => { e.currentTarget.src = "/placeholder-poster.jpg"; }}
                />
              )}
            </div>
          </div>
          {/* Backdrop */}
          <div>
            <label className="block text-gray-200 font-medium mb-1">Backdrop (arrière-plan)</label>
            <input
              type="file"
              accept="image/*"
              className="block w-full"
              onChange={(e) => setBackdropFile(e.target.files?.[0] || null)}
              aria-label="Importer un backdrop"
            />
            <input
              type="text"
              className="w-full mt-2 px-3 py-2 rounded bg-gray-800 text-gray-100"
              value={backdrop}
              onChange={(e) => setBackdrop(e.target.value)}
              placeholder="URL complète, chemin TMDB ou URL Supabase"
              aria-label="Saisir le chemin du backdrop"
            />
            <div className="mt-1 flex items-center gap-2">
              {backdrop && (
                <img
                  src={
                    backdrop.startsWith("http")
                      ? backdrop
                      : backdrop.startsWith("/")
                        ? "https://image.tmdb.org/t/p/w300" + backdrop
                        : backdrop
                  }
                  alt="Aperçu backdrop"
                  className="w-28 h-16 rounded shadow border border-gray-700 object-cover"
                  style={{ background: "#222" }}
                  onError={e => { e.currentTarget.src = "/placeholder-backdrop.jpg"; }}
                />
              )}
            </div>
          </div>
        </div>
        {/* Casting */}
        <div>
          <label className="block text-gray-200 font-medium mb-2">Casting</label>
          <div className="space-y-2">
            {cast.map((member, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  className="w-1/3 px-2 py-1 rounded bg-gray-800 text-gray-100"
                  placeholder="Nom"
                  value={member.name}
                  onChange={e => updateCastMember(idx, { ...member, name: e.target.value })}
                  required
                />
                <input
                  className="w-1/3 px-2 py-1 rounded bg-gray-800 text-gray-100"
                  placeholder="Rôle"
                  value={member.role}
                  onChange={e => updateCastMember(idx, { ...member, role: e.target.value })}
                />
                <input
                  className="w-1/3 px-2 py-1 rounded bg-gray-800 text-gray-100"
                  placeholder="Photo URL"
                  value={member.photoUrl}
                  onChange={e => updateCastMember(idx, { ...member, photoUrl: e.target.value })}
                />
                <Button type="button" size="icon" variant="destructive" onClick={() => removeCastMember(idx)} aria-label="Supprimer membre">x</Button>
              </div>
            ))}
            <Button type="button" size="sm" onClick={addCastMember}>Ajouter membre</Button>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Button type="button" variant="secondary" onClick={onClose}>Annuler</Button>
          <Button type="submit" disabled={loading}>Enregistrer</Button>
        </div>
      </form>
    </div>
  );
}