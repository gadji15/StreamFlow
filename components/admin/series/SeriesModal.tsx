import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

export default function SeriesModal({ open, onClose, onSave, initialData = {} }) {
  const [form, setForm] = useState({
    title: initialData.title || "",
    creator: initialData.creator || "",
    start_year: initialData.start_year || "",
    end_year: initialData.end_year || "",
    genres: Array.isArray(initialData.genres)
      ? initialData.genres
      : (typeof initialData.genre === "string"
        ? initialData.genre.split(",").map((g) => g.trim())
        : []),
    genresInput: "",
    vote_average: initialData.vote_average || "",
    published: !!initialData.published,
    isvip: !!initialData.isvip,
    poster: initialData.poster || "",
    tmdb_id: initialData.tmdb_id || "",
    description: initialData.description || "",
  });

  // Nouvel état pour le cast importé depuis TMDB
  const [cast, setCast] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [k: string]: string }>({});
  const [tmdbSearch, setTmdbSearch] = useState(initialData.title || "");
  const { toast } = useToast();
  const firstInput = useRef<HTMLInputElement>(null);

  // Utilitaire pour charger le cast d'une série TMDB
  const fetchCast = async (tmdbId) => {
    if (!tmdbId) {
      setCast([]);
      return;
    }
    try {
      const res = await fetch(`/api/tmdb/series/${tmdbId}/credits`);
      if (!res.ok) {
        setCast([]);
        return;
      }
      const data = await res.json();
      setCast(Array.isArray(data.cast) ? data.cast : []);
    } catch {
      setCast([]);
    }
  };

  useEffect(() => {
    if (open && firstInput.current) {
      firstInput.current.focus();
    }
    setErrors({});
    setForm((prev) => {
      let tmdb_id = prev.tmdb_id || initialData.tmdb_id || "";
      return {
        ...prev,
        title: initialData.title || "",
        creator: initialData.creator || "",
        start_year: initialData.start_year || "",
        end_year: initialData.end_year || "",
        genres: Array.isArray(initialData.genres)
          ? initialData.genres
          : (typeof initialData.genre === "string"
            ? initialData.genre.split(",").map((g) => g.trim())
            : []),
        genresInput: "",
        vote_average: initialData.vote_average || "",
        published: !!initialData.published,
        isvip: !!initialData.isvip,
        poster: initialData.poster || "",
        tmdb_id,
        description: initialData.description || "",
      };
    });
    setTmdbSearch(initialData.title || "");
    setCast([]); // Réinitialise le cast à chaque ouverture ou changement de série
    if (initialData.tmdb_id) {
      fetchCast(initialData.tmdb_id);
    }
    // eslint-disable-next-line
  }, [open, initialData && initialData.id]);

  const handleChange = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  };

  const validate = () => {
    const err: { [k: string]: string } = {};
    if (!form.title || !form.title.trim())
      err.title = "Le titre est requis";
    if (
      form.vote_average &&
      (isNaN(Number(form.vote_average)) ||
        Number(form.vote_average) < 0 ||
        Number(form.vote_average) > 10)
    )
      err.vote_average = "La note doit être comprise entre 0 et 10";
    if (
      form.start_year &&
      (isNaN(Number(form.start_year)) ||
        Number(form.start_year) < 1900 ||
        Number(form.start_year) > 2100)
    )
      err.start_year = "Année invalide";
    if (
      form.end_year &&
      (isNaN(Number(form.end_year)) ||
        Number(form.end_year) < 1900 ||
        Number(form.end_year) > 2100)
    )
      err.end_year = "Année invalide";
    if (form.tmdb_id && isNaN(Number(form.tmdb_id)))
      err.tmdb_id = "ID TMDB invalide";
    return err;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    setErrors(err);
    if (Object.keys(err).length > 0) {
      toast({
        title: "Erreur de validation",
        description: Object.values(err)[0],
        variant: "destructive",
      });
      return;
    }
    setLoading(true);
    try {
      const submitData = {
        ...form,
        genres: Array.isArray(form.genres)
          ? form.genres
          : typeof form.genres === "string"
            ? form.genres.split(",").map((g) => g.trim())
            : [],
      };
      await onSave(submitData);
      toast({ title: "Série enregistrée" });
      onClose();
    } catch (e) {
      toast({ title: "Erreur", description: String(e), variant: "destructive" });
    }
    setLoading(false);
  };

  function extractCreator(detail) {
    if (detail && Array.isArray(detail.created_by) && detail.created_by.length > 0) {
      return detail.created_by.map(c => c.name).join(", ");
    }
    return "";
  }

  const handleTMDBImport = async () => {
    if (!tmdbSearch.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/tmdb/tv-search?query=${encodeURIComponent(tmdbSearch.trim())}`);
      if (!res.ok) throw new Error("Erreur réseau TMDB");
      const data = await res.json();
      const serie = data.results && data.results.length > 0 ? data.results[0] : null;
      if (serie && serie.id) {
        const detailRes = await fetch(`/api/tmdb/tv/${serie.id}`);
        const detail = detailRes.ok ? await detailRes.json() : {};
        setForm((f) => ({
          ...f,
          title: detail.name || serie.name || f.title,
          poster: (detail.poster_path || serie.poster_path)
            ? `https://image.tmdb.org/t/p/w500${detail.poster_path || serie.poster_path}` : f.poster,
          start_year: (detail.first_air_date || serie.first_air_date)
            ? (detail.first_air_date || serie.first_air_date).slice(0, 4)
            : f.start_year,
          end_year: (detail.last_air_date || serie.last_air_date)
            ? (detail.last_air_date || serie.last_air_date).slice(0, 4)
            : f.end_year,
          genres: detail.genres ? detail.genres.map((g) => g.name) : f.genres,
          vote_average: detail.vote_average ?? serie.vote_average ?? f.vote_average,
          description: detail.overview ?? serie.overview ?? f.description,
          tmdb_id: serie.id,
          creator: extractCreator(detail) || f.creator,
        }));
        // Nouvelle étape : importer le cast après le succès de l'import série
        await fetchCast(serie.id);
        toast({
          title: "Import TMDB réussi",
          description: "Champs pré-remplis depuis TMDB !",
        });
      } else {
        setCast([]);
        toast({
          title: "Introuvable TMDB",
          description: "Aucune série trouvée pour cette recherche.",
          variant: "destructive",
        });
      }
    } catch (e) {
      setCast([]);
      toast({
        title: "Erreur TMDB",
        description: String(e),
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  const handleTMDBById = async () => {
    if (!form.tmdb_id) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/tmdb/tv/${encodeURIComponent(form.tmdb_id)}`);
      if (!res.ok) throw new Error("Erreur réseau TMDB");
      const data = await res.json();
      if (data && data.id) {
        setForm((f) => ({
          ...f,
          title: data.name || f.title,
          poster: data.poster_path
            ? `https://image.tmdb.org/t/p/w500${data.poster_path}`
            : f.poster,
          start_year: data.first_air_date
            ? data.first_air_date.slice(0, 4)
            : f.start_year,
          end_year: data.last_air_date
            ? data.last_air_date.slice(0, 4)
            : f.end_year,
          genres: data.genres ? data.genres.map((g) => g.name) : f.genres,
          vote_average: data.vote_average ?? f.vote_average,
          description: data.overview ?? f.description,
          creator: extractCreator(data) || f.creator,
        }));
        await fetchCast(data.id);
        toast({
          title: "Import TMDB réussi",
          description: "Champs pré-remplis depuis TMDB !",
        });
      } else {
        setCast([]);
        toast({
          title: "Introuvable TMDB",
          description: "Aucune série trouvée pour cet ID.",
          variant: "destructive",
        });
      }
    } catch (e) {
      setCast([]);
      toast({
        title: "Erreur TMDB",
        description: String(e),
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  if (!open) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity duration-200 ${
        open ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="series-modal-title"
      tabIndex={-1}
      onClick={onClose}
    >
      <div
        className="animate-[fadeInScale_0.25s_ease] bg-gradient-to-br from-gray-900 via-gray-900/95 to-gray-800 rounded-2xl shadow-2xl border border-neutral-800 w-full max-w-xs sm:max-w-sm md:max-w-md relative flex flex-col"
        style={{
          maxHeight: "70vh",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header sticky */}
        <div className="sticky top-0 z-30 bg-transparent pt-2 pb-1 px-3 rounded-t-2xl flex items-center justify-between">
          <h2 className="text-base font-bold tracking-tight text-white/90">
            {initialData.id ? "Modifier la série" : "Ajouter une série"}
          </h2>
          <button
            aria-label="Fermer"
            className="text-gray-400 hover:text-white text-base p-1 transition-colors"
            tabIndex={0}
            onClick={onClose}
          >
            ✕
          </button>
        </div>
        {/* TMDB search zone */}
        <div className="flex gap-1 items-end px-3 pt-1">
          <div className="flex-1">
            <label htmlFor="tmdb_search" className="block text-[11px] mb-1 text-white/70 font-medium">
              Recherche TMDB
            </label>
            <input
              id="tmdb_search"
              value={tmdbSearch}
              onChange={e => setTmdbSearch(e.target.value)}
              className="rounded-lg border border-neutral-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-300/40 px-2 py-1 bg-gray-800 text-white w-full text-xs transition-shadow"
              placeholder="Titre de la série"
            />
          </div>
          <Button
            type="button"
            className="ml-1 flex-shrink-0 text-xs py-1 px-2 transition rounded-lg"
            variant="outline"
            onClick={handleTMDBImport}
            disabled={loading || !tmdbSearch.trim()}
            aria-label="Chercher et importer depuis TMDB"
          >
            {loading ? (
              <svg className="animate-spin h-4 w-4 mr-1 text-indigo-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-60" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
              </svg>
            ) : "Importer"}
          </Button>
        </div>
        {/* Affichage des acteurs importés */}
        {cast && cast.length > 0 && (
          <div className="px-3 pt-2 pb-1">
            <label className="block text-[11px] font-medium text-white/80 mb-1">
              Acteurs principaux (importés TMDB)
            </label>
            <div className="flex flex-wrap gap-2">
              {cast.map((actor) => (
                <div key={actor.id} className="flex flex-col items-center w-16">
                  <img
                    src={actor.profile_path ? `https://image.tmdb.org/t/p/w185${actor.profile_path}` : "/no-image.png"}
                    alt={actor.name}
                    className="rounded-full h-12 w-12 object-cover border border-gray-700 bg-gray-800"
                    style={{ objectFit: "cover" }}
                  />
                  <span className="text-xs text-center mt-1 text-white/80">{actor.name}</span>
                  {actor.character && (
                    <span className="text-[10px] text-gray-400 text-center">{actor.character}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        {/* Content scrollable */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto px-3 pb-2 pt-1 space-y-1"
          style={{ minHeight: 0 }}
        >
          <div>
            <label htmlFor="title" className="block text-[11px] font-medium text-white/80">
              Titre <span className="text-red-500">*</span>
            </label>
            <input
              ref={firstInput}
              id="title"
              value={form.title}
              onChange={(e) => handleChange("title", e.target.value)}
              className={`mt-0.5 w-full rounded-lg border border-neutral-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-300/40 px-2 py-1 bg-gray-800 text-white text-xs transition-shadow ${
                errors.title ? "border-red-500" : ""
              }`}
              required
              aria-required="true"
            />
            {errors.title && (
              <div className="text-xs text-red-400 mt-0.5">{errors.title}</div>
            )}
          </div>
          <div>
            <label htmlFor="creator" className="block text-[11px] font-medium text-white/80">
              Créateur
            </label>
            <input
              id="creator"
              value={form.creator}
              onChange={(e) => handleChange("creator", e.target.value)}
              className="mt-0.5 w-full rounded-lg border border-neutral-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-300/40 px-2 py-1 bg-gray-800 text-white text-xs transition-shadow"
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-1">
            <div className="flex-1">
              <label htmlFor="start_year" className="block text-[11px] font-medium text-white/80">
                Année début
              </label>
              <input
                id="start_year"
                type="number"
                value={form.start_year}
                onChange={(e) => handleChange("start_year", e.target.value)}
                className={`mt-0.5 w-full rounded-lg border border-neutral-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-300/40 px-2 py-1 bg-gray-800 text-white text-xs transition-shadow ${
                  errors.start_year ? "border-red-500" : ""
                }`}
                min="1900"
                max="2100"
              />
              {errors.start_year && (
                <div className="text-xs text-red-400 mt-0.5">{errors.start_year}</div>
              )}
            </div>
            <div className="flex-1">
              <label htmlFor="end_year" className="block text-[11px] font-medium text-white/80">
                Année fin
              </label>
              <input
                id="end_year"
                type="number"
                value={form.end_year}
                onChange={(e) => handleChange("end_year", e.target.value)}
                className={`mt-0.5 w-full rounded-lg border border-neutral-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-300/40 px-2 py-1 bg-gray-800 text-white text-xs transition-shadow ${
                  errors.end_year ? "border-red-500" : ""
                }`}
                min="1900"
                max="2100"
              />
              {errors.end_year && (
                <div className="text-xs text-red-400 mt-0.5">{errors.end_year}</div>
              )}
            </div>
          </div>
          <div>
            <label htmlFor="genres" className="block text-[11px] font-medium text-white/80">
              Genres
            </label>
            <div className="flex flex-wrap gap-1 mb-1">
              {(Array.isArray(form.genres) ? form.genres : []).map((g, idx) => (
                <span
                  key={g + idx}
                  className="inline-flex items-center px-2 py-0.5 bg-indigo-700/30 text-indigo-200 rounded text-[11px] mr-1"
                >
                  {g}
                  <button
                    type="button"
                    aria-label={`Supprimer le genre ${g}`}
                    className="ml-1 text-indigo-300 hover:text-red-400 text-xs"
                    onClick={() =>
                      handleChange(
                        "genres",
                        form.genres.filter((x, i) => i !== idx)
                      )
                    }
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <input
              id="genres"
              value={form.genresInput || ""}
              onChange={(e) => handleChange("genresInput", e.target.value)}
              onKeyDown={(e) => {
                if (
                  (e.key === "Enter" || e.key === ",") &&
                  form.genresInput?.trim()
                ) {
                  e.preventDefault();
                  const genre = form.genresInput.trim();
                  if (genre.length > 0 && !(form.genres || []).includes(genre)) {
                    handleChange("genres", [...(form.genres || []), genre]);
                  }
                  handleChange("genresInput", "");
                }
                if (
                  e.key === "Backspace" &&
                  !form.genresInput &&
                  Array.isArray(form.genres) &&
                  form.genres.length > 0
                ) {
                  handleChange("genres", form.genres.slice(0, -1));
                }
              }}
              className="mt-0.5 w-full rounded-lg border border-neutral-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-300/40 px-2 py-1 bg-gray-800 text-white text-xs transition-shadow"
              placeholder="Ajoutez un genre puis Entrée ou ,"
              autoComplete="off"
            />
          </div>
          <div>
            <label htmlFor="vote_average" className="block text-[11px] font-medium text-white/80">
              Note
            </label>
            <input
              id="vote_average"
              type="number"
              step="0.1"
              value={form.vote_average}
              onChange={(e) => handleChange("vote_average", e.target.value)}
              className={`mt-0.5 w-full rounded-lg border border-neutral-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-300/40 px-2 py-1 bg-gray-800 text-white text-xs transition-shadow ${
                errors.vote_average ? "border-red-500" : ""
              }`}
              min="0"
              max="10"
            />
            {errors.vote_average && (
              <div className="text-xs text-red-400 mt-0.5">{errors.vote_average}</div>
            )}
          </div>
          <div>
            <label htmlFor="description" className="block text-[11px] font-medium text-white/80">
              Description
            </label>
            <textarea
              id="description"
              value={form.description}
              onChange={(e) => handleChange("description", e.target.value)}
              className="mt-0.5 w-full rounded-lg border border-neutral-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-300/40 px-2 py-1 bg-gray-800 text-white text-xs transition-shadow"
              rows={1}
            />
          </div>
          <div>
            <label htmlFor="poster" className="block text-[11px] font-medium text-white/80">
              Affiche (URL)
            </label>
            <input
              id="poster"
              value={form.poster}
              onChange={(e) => handleChange("poster", e.target.value)}
              className="mt-0.5 w-full rounded-lg border border-neutral-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-300/40 px-2 py-1 bg-gray-800 text-white text-xs transition-shadow"
              placeholder="https://..."
            />
            {form.poster && (
              <div className="flex flex-col items-start mt-1">
                <img
                  src={form.poster}
                  alt="Aperçu affiche"
                  className="h-10 rounded shadow border border-gray-700"
                  style={{ maxWidth: "100%" }}
                />
                <button
                  type="button"
                  className="text-[10px] text-red-400 hover:underline mt-1"
                  onClick={() => handleChange("poster", "")}
                >
                  Supprimer l'affiche
                </button>
              </div>
            )}
          </div>
          <div className="flex gap-2 items-center">
            <label className="flex items-center gap-1 cursor-pointer text-[11px] text-white/80">
              <input
                type="checkbox"
                checked={form.published}
                onChange={(e) => handleChange("published", e.target.checked)}
                className="accent-green-500"
                aria-label="Publié"
              />
              Publié
            </label>
            <label className="flex items-center gap-1 cursor-pointer text-[11px] text-white/80">
              <input
                type="checkbox"
                checked={form.isvip}
                onChange={(e) => handleChange("isvip", e.target.checked)}
                className="accent-amber-500"
                aria-label="VIP"
              />
              VIP
            </label>
          </div>
          <div className="flex gap-1 items-end">
            <div className="flex-1">
              <label htmlFor="tmdb_id" className="block text-[11px] font-medium text-white/80">
                TMDB ID
              </label>
              <div className="flex items-center gap-2">
                <input
                  id="tmdb_id"
                  value={form.tmdb_id}
                  onChange={(e) => handleChange("tmdb_id", e.target.value)}
                  className={`mt-0.5 w-full rounded-lg border border-neutral-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-300/40 px-2 py-1 bg-gray-800 text-white text-xs transition-shadow ${
                    errors.tmdb_id ? "border-red-500" : ""
                  }`}
                  placeholder="Ex: 1396"
                  type="number"
                  min={1}
                />
                {form.tmdb_id && (
                  <a
                    href={`https://www.themoviedb.org/tv/${form.tmdb_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-1 text-indigo-400 hover:text-indigo-200 underline text-xs"
                    title="Voir sur TMDB"
                    tabIndex={0}
                    aria-label="Ouvrir la fiche TMDB dans un nouvel onglet"
                  >
                    TMDB ↗
                  </a>
                )}
              </div>
              {errors.tmdb_id && (
                <div className="text-xs text-red-400 mt-0.5">{errors.tmdb_id}</div>
              )}
            </div>
            {form.tmdb_id && (
              <div className="flex items-end">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleTMDBById}
                  disabled={loading}
                  aria-label="Importer cette série depuis TMDB via l'ID"
                  className="text-xs py-1 px-2"
                >
                  {loading ? "..." : "Importer par ID"}
                </Button>
              </div>
            )}
          </div>
        </form>
        {/* Actions sticky */}
        <div className="sticky bottom-0 z-30 bg-gradient-to-t from-gray-900 via-gray-900/80 to-transparent pt-1 pb-2 px-2 rounded-b-2xl flex gap-2 justify-end shadow">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            aria-label="Annuler"
            className="text-xs py-1 px-2"
          >
            Annuler
          </Button>
          <Button
            type="submit"
            form="series-form"
            variant="success"
            disabled={loading}
            aria-label="Enregistrer la série"
            onClick={handleSubmit}
            className="text-xs py-1 px-2"
          >
            {loading ? "..." : "Enregistrer"}
          </Button>
        </div>
      </div>
      <style jsx global>{`
        @keyframes fadeInScale {
          0% { opacity: 0; transform: scale(.95);}
          100% { opacity: 1; transform: scale(1);}
        }
        .animate-\[fadeInScale_0\.25s_ease\] {
          animation: fadeInScale 0.25s ease;
        }
      `}</style>
    </div>
  );
}