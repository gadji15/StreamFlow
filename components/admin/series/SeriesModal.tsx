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
      <div
        className="bg-gray-900 p-4 sm:p-6 rounded shadow-xl w-full max-w-md sm:max-w-lg md:max-w-xl relative"
        style={{
          minHeight: 'fit-content',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxSizing: 'border-box',
        }}
        onClick={e => e.stopPropagation()}
      >
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
              <span tabIndex={0} aria-label="Tapez puis appuyez sur Entrée ou virgule pour ajouter">ℹ️</span>
            </label>
            <div className="flex flex-wrap gap-1 mb-1">
              {(Array.isArray(form.genres) ? form.genres : []).map((g, idx) => (
                <span key={g+idx} className="inline-flex items-center px-2 py-1 bg-indigo-700/30 text-indigo-200 rounded text-xs mr-1">
                  {g}
                  <button
                    type="button"
                    aria-label={`Supprimer le genre ${g}`}
                    className="ml-1 text-indigo-300 hover:text-red-400 text-xs"
                    onClick={() => handleChange("genres", form.genres.filter((x, i) => i !== idx))}
                  >×</button>
                </span>
              ))}
            </div>
            <input
              id="genres"
              value={form.genresInput || ""}
              onChange={e => handleChange("genresInput", e.target.value)}
              onKeyDown={e => {
                if ((e.key === "Enter" || e.key === ",") && form.genresInput?.trim()) {
                  e.preventDefault();
                  const genre = form.genresInput.trim();
                  if (genre.length > 0 && !(form.genres || []).includes(genre)) {
                    handleChange("genres", [...(form.genres || []), genre]);
                  }
                  handleChange("genresInput", "");
                }
                if (e.key === "Backspace" && !form.genresInput && Array.isArray(form.genres) && form.genres.length > 0) {
                  handleChange("genres", form.genres.slice(0, -1));
                }
              }}
              className="mt-1 w-full rounded border px-2 py-1 bg-gray-800 text-white"
              placeholder="Ajoutez un genre puis Entrée ou ,"
              autoComplete="off"
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
              <div className="flex flex-col items-start mt-2">
                <img
                  src={form.poster}
                  alt="Aperçu affiche"
                  className="h-24 sm:h-32 rounded shadow border border-gray-700"
                  style={{maxWidth:"100%"}}
                />
                <button
                  type="button"
                  className="text-xs text-red-400 hover:underline mt-1"
                  onClick={() => handleChange("poster", "")}
                >
                  Supprimer l'affiche
                </button>
              </div>
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
            <div className="flex-1">
              <label htmlFor="tmdb_id" className="block text-sm font-medium">TMDB ID</label>
              <div className="flex items-center gap-2">
                <input
                  id="tmdb_id"
                  value={form.tmdb_id}
                  onChange={e => handleChange("tmdb_id", e.target.value)}
                  className="mt-1 w-full rounded border px-2 py-1 bg-gray-800 text-white"
                  placeholder="Ex: 1396"
                  type="number"
                  min={1}
                />
                {form.tmdb_id && (
                  <a
                    href={`https://www.themoviedb.org/tv/${form.tmdb_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-1 text-indigo-400 hover:text-indigo-200 underline"
                    title="Voir sur TMDB"
                    tabIndex={0}
                    aria-label="Ouvrir la fiche TMDB dans un nouvel onglet"
                  >
                    TMDB ↗
                  </a>
                )}
              </div>
            </div>
            {form.tmdb_id && (
              <div className="flex items-end">
                <button
                  type="button"
                  className="ml-2 px-2 py-1 rounded bg-indigo-600 text-white flex items-center"
                  onClick={async () => {
                    setLoading(true);
                    try {
                      const res = await fetch(`/api/tmdb/tv/${encodeURIComponent(form.tmdb_id)}`);
                      if (!res.ok) throw new Error("Erreur réseau TMDB");
                      const data = await res.json();
                      if (data && data.id) {
                        setForm(f => ({
                          ...f,
                          title: data.name || f.title,
                          poster: data.poster_path ? `https://image.tmdb.org/t/p/w500${data.poster_path}` : f.poster,
                          start_year: data.first_air_date ? data.first_air_date.slice(0, 4) : f.start_year,
                          end_year: data.last_air_date ? data.last_air_date.slice(0, 4) : f.end_year,
                          genres: data.genres ? data.genres.map((g) => g.name) : f.genres,
                          vote_average: data.vote_average ?? f.vote_average,
                          description: data.overview ?? f.description,
                        }));
                        toast({ title: "Import TMDB réussi", description: "Champs pré-remplis depuis TMDB !" });
                      } else {
                        toast({ title: "Introuvable TMDB", description: "Aucune série trouvée pour cet ID.", variant: "destructive" });
                      }
                    } catch (e) {
                      toast({ title: "Erreur TMDB", description: String(e), variant: "destructive" });
                    }
                    setLoading(false);
                  }}
                  disabled={loading}
                  aria-label="Importer les infos TMDB"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-4 w-4 mr-1 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                      </svg>
                      Chargement...
                    </>
                  ) : (
                    "Importer TMDB"
                  )}
                </button>
              </div>
            )}
          </div>
          </div>
          {/* Actions sticky en bas */}
          <div className="flex gap-2 mt-8 justify-end sticky bottom-0 bg-gray-900 py-3 z-10">
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