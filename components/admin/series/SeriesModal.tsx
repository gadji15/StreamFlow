import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

export default function SeriesModal({ open, onClose, onSave, initialData = {}, tmdbSearch }) {
  const [form, setForm] = useState({
    title: initialData.title || "",
    creator: initialData.creator || "",
    start_year: initialData.start_year || "",
    end_year: initialData.end_year || "",
    genres: initialData.genres || [],
    vote_average: initialData.vote_average || "",
    published: !!initialData.published,
    isvip: !!initialData.isvip,
    poster: initialData.poster || "",
    tmdb_id: initialData.tmdb_id || "",
  });
  const [loading, setLoading] = useState(false);
  const [tmdbQuery, setTmdbQuery] = useState("");
  const { toast } = useToast();
  const firstInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open && firstInput.current) {
      firstInput.current.focus();
    }
  }, [open]);

  const handleChange = (field, value) => setForm(f => ({ ...f, [field]: value }));

  const handleTMDB = async () => {
    if (!tmdbQuery) return;
    setLoading(true);
    try {
      const data = await tmdbSearch(tmdbQuery);
      if (data) {
        setForm(f => ({
          ...f,
          title: data.title || f.title,
          poster: data.poster || f.poster,
          start_year: data.start_year || f.start_year,
          end_year: data.end_year || f.end_year,
          genres: data.genres || f.genres,
          tmdb_id: data.tmdb_id || f.tmdb_id,
        }));
        toast({ title: "Pré-rempli depuis TMDB" });
      } else {
        toast({ title: "Non trouvé sur TMDB", variant: "destructive" });
      }
    } catch (e) {
      toast({ title: "Erreur TMDB", description: String(e), variant: "destructive" });
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      toast({ title: "Titre requis", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      await onSave(form);
      toast({ title: "Série enregistrée" });
      onClose();
    } catch (e) {
      toast({ title: "Erreur", description: String(e), variant: "destructive" });
    }
    setLoading(false);
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="series-modal-title"
      tabIndex={-1}
      onClick={onClose}
    >
      <div className="bg-gray-900 p-6 rounded shadow-lg max-w-lg w-full relative" onClick={e => e.stopPropagation()}>
        <h2 className="text-lg font-bold mb-4" id="series-modal-title">
          {initialData.id ? "Modifier la série" : "Ajouter une série"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label htmlFor="title" className="block text-sm font-medium">
              Titre <span className="text-red-500">*</span>
              <span className="ml-1" tabIndex={0} aria-label="Ce champ est obligatoire.">ℹ️</span>
            </label>
            <input
              ref={firstInput}
              id="title"
              value={form.title}
              onChange={e => handleChange("title", e.target.value)}
              className="mt-1 w-full rounded border px-2 py-1 bg-gray-800 text-white"
              required
              aria-required="true"
            />
          </div>
          <div>
            <label htmlFor="creator" className="block text-sm font-medium">
              Créateur
              <span tabIndex={0} aria-label="Nom du showrunner ou créateur principal.">ℹ️</span>
            </label>
            <input
              id="creator"
              value={form.creator}
              onChange={e => handleChange("creator", e.target.value)}
              className="mt-1 w-full rounded border px-2 py-1 bg-gray-800 text-white"
            />
          </div>
          <div className="flex gap-2">
            <div>
              <label htmlFor="start_year" className="block text-sm font-medium">Année début</label>
              <input
                id="start_year"
                type="number"
                value={form.start_year}
                onChange={e => handleChange("start_year", e.target.value)}
                className="mt-1 w-full rounded border px-2 py-1 bg-gray-800 text-white"
                min="1900"
                max="2100"
              />
            </div>
            <div>
              <label htmlFor="end_year" className="block text-sm font-medium">Année fin</label>
              <input
                id="end_year"
                type="number"
                value={form.end_year}
                onChange={e => handleChange("end_year", e.target.value)}
                className="mt-1 w-full rounded border px-2 py-1 bg-gray-800 text-white"
                min="1900"
                max="2100"
              />
            </div>
          </div>
          <div>
            <label htmlFor="genres" className="block text-sm font-medium">
              Genres
              <span tabIndex={0} aria-label="Séparez les genres par des virgules ex: Drame,Comédie">ℹ️</span>
            </label>
            <input
              id="genres"
              value={Array.isArray(form.genres) ? form.genres.join(", ") : form.genres}
              onChange={e => handleChange("genres", e.target.value.split(",").map(g => g.trim()))}
              className="mt-1 w-full rounded border px-2 py-1 bg-gray-800 text-white"
              placeholder="Drame, Comédie"
            />
          </div>
          <div>
            <label htmlFor="vote_average" className="block text-sm font-medium">
              Note moyenne
              <span tabIndex={0} aria-label="Sur 10, exemple: 8.3">ℹ️</span>
            </label>
            <input
              id="vote_average"
              type="number"
              step="0.1"
              value={form.vote_average}
              onChange={e => handleChange("vote_average", e.target.value)}
              className="mt-1 w-full rounded border px-2 py-1 bg-gray-800 text-white"
              min="0"
              max="10"
            />
          </div>
          <div>
            <label htmlFor="poster" className="block text-sm font-medium">
              Affiche (URL)
              <span tabIndex={0} aria-label="Coller une URL d'image ou utiliser TMDB">ℹ️</span>
            </label>
            <input
              id="poster"
              value={form.poster}
              onChange={e => handleChange("poster", e.target.value)}
              className="mt-1 w-full rounded border px-2 py-1 bg-gray-800 text-white"
              placeholder="https://..."
            />
            {form.poster && (
              <img src={form.poster} alt="Poster" className="mt-2 h-24 rounded shadow" />
            )}
          </div>
          <div className="flex gap-3 items-center">
            <label className="flex items-center gap-1 cursor-pointer">
              <input
                type="checkbox"
                checked={form.published}
                onChange={e => handleChange("published", e.target.checked)}
                className="accent-green-500"
                aria-label="Publié"
              />
              Publié
            </label>
            <label className="flex items-center gap-1 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isvip}
                onChange={e => handleChange("isvip", e.target.checked)}
                className="accent-amber-500"
                aria-label="VIP"
              />
              VIP
            </label>
          </div>
          <div className="flex gap-2 items-end">
            <div>
              <label htmlFor="tmdb_id" className="block text-sm font-medium">TMDB ID</label>
              <input
                id="tmdb_id"
                value={form.tmdb_id}
                onChange={e => handleChange("tmdb_id", e.target.value)}
                className="mt-1 w-full rounded border px-2 py-1 bg-gray-800 text-white"
                placeholder="Ex: 1396"
              />
            </div>
            <div>
              <label htmlFor="tmdb_search" className="block text-xs mb-1">Recherche TMDB</label>
              <input
                id="tmdb_search"
                value={tmdbQuery}
                onChange={e => setTmdbQuery(e.target.value)}
                className="rounded border px-2 py-1 bg-gray-800 text-white"
                placeholder="Nom série ou ID"
                aria-describedby="tmdb-search-tooltip"
              />
              <button
                type="button"
                className="ml-2 px-2 py-1 rounded bg-indigo-600 text-white"
                onClick={handleTMDB}
                disabled={loading}
                aria-label="Pré-remplir via TMDB"
              >
                Importer TMDB
              </button>
              <span className="ml-1 text-xs" id="tmdb-search-tooltip" role="tooltip">
                Cherchez par titre ou ID TMDB
              </span>
            </div>
          </div>
          <div className="flex gap-2 mt-6 justify-end">
            <Button type="button" variant="outline" onClick={onClose} aria-label="Annuler">Annuler</Button>
            <Button type="submit" variant="success" disabled={loading} aria-label="Enregistrer la série">
              {loading ? "Chargement..." : "Enregistrer"}
            </Button>
          </div>
        </form>
        <button
          aria-label="Fermer"
          className="absolute top-2 right-2 text-gray-400 hover:text-white focus:outline-none"
          tabIndex={0}
          onClick={onClose}
        >✕</button>
      </div>
    </div>
  );
}