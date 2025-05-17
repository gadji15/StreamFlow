import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

export default function FilmModal({ open, onClose, onSave, initialData = {} }) {
  const [form, setForm] = useState({
    title: initialData.title || "",
    director: initialData.director || "",
    year: initialData.year || "",
    duration: initialData.duration || "",
    genres: Array.isArray(initialData.genres)
      ? initialData.genres
      : (typeof initialData.genre === "string"
        ? initialData.genre.split(",").map((g) => g.trim())
        : []),
    genresInput: "",
    vote_average: initialData.vote_average || "",
    vote_count: initialData.vote_count || "",
    published: !!initialData.published,
    isvip: !!initialData.isvip,
    poster: initialData.poster || "",
    tmdb_id: initialData.tmdb_id || "",
    description: initialData.description || "",
    trailer_url: initialData.trailer_url || "",
  });

  const [cast, setCast] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [k: string]: string }>({});
  const [tmdbSearch, setTmdbSearch] = useState(initialData.title || "");
  const { toast } = useToast();
  const firstInput = useRef<HTMLInputElement>(null);

  // Utilitaire pour charger le cast d'un film TMDB
  const fetchCast = async (tmdbId) => {
    if (!tmdbId) {
      setCast([]);
      return;
    }
    try {
      const res = await fetch(`/api/tmdb/movie/${tmdbId}/credits`);
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
        director: initialData.director || "",
        year: initialData.year || "",
        duration: initialData.duration || "",
        genres: Array.isArray(initialData.genres)
          ? initialData.genres
          : (typeof initialData.genre === "string"
            ? initialData.genre.split(",").map((g) => g.trim())
            : []),
        genresInput: "",
        vote_average: initialData.vote_average || "",
        vote_count: initialData.vote_count || "",
        published: !!initialData.published,
        isvip: !!initialData.isvip,
        poster: initialData.poster || "",
        tmdb_id,
        description: initialData.description || "",
        trailer_url: initialData.trailer_url || "",
      };
    });
    setTmdbSearch(initialData.title || "");
    setCast([]);
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
      form.year &&
      (isNaN(Number(form.year)) ||
        Number(form.year) < 1900 ||
        Number(form.year) > 2100)
    )
      err.year = "Année invalide";
    if (form.duration && (isNaN(Number(form.duration)) || Number(form.duration) < 1))
      err.duration = "Durée invalide";
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
      const clean = (v) => (v === "" || v === undefined ? null : v);
      const payload = {
        title: clean(form.title),
        director: clean(form.director),
        year: clean(form.year) !== null ? Number(form.year) : null,
        duration: clean(form.duration) !== null ? Number(form.duration) : null,
        genre:
          Array.isArray(form.genres)
            ? form.genres.filter(Boolean).join(", ")
            : typeof form.genres === "string"
              ? form.genres
              : "",
        vote_average: clean(form.vote_average) !== null ? Number(form.vote_average) : null,
        vote_count: clean(form.vote_count) !== null ? Number(form.vote_count) : null,
        published: !!form.published,
        isvip: !!form.isvip,
        poster: clean(form.poster),
        tmdb_id: clean(form.tmdb_id) !== null ? Number(form.tmdb_id) : null,
        description: clean(form.description),
        trailer_url: clean(form.trailer_url),
        // cast: Array.isArray(cast) && cast.length > 0 ? cast : null,
      };

      await onSave(payload);
      toast({ title: "Film enregistré" });
      onClose();
    } catch (e) {
      toast({ title: "Erreur", description: String(e), variant: "destructive" });
    }
    setLoading(false);
  };

  // TMDB search logic
  const [movieSuggestions, setMovieSuggestions] = useState([]);
  const [movieLoading, setMovieLoading] = useState(false);
  const [showMovieSuggestions, setShowMovieSuggestions] = useState(false);
  const [activeMovieSuggestion, setActiveMovieSuggestion] = useState(-1);
  const suggestionTimeout = useRef<NodeJS.Timeout | null>(null);

  const handleMovieSearchInput = async (e) => {
    const value = e.target.value;
    setTmdbSearch(value);
    setShowMovieSuggestions(true);
    setMovieSuggestions([]);
    setActiveMovieSuggestion(-1);

    if (suggestionTimeout.current) clearTimeout(suggestionTimeout.current);
    if (value.trim().length < 2) {
      setMovieSuggestions([]);
      setMovieLoading(false);
      return;
    }
    setMovieLoading(true);
    suggestionTimeout.current = setTimeout(async () => {
      try {
        const resp = await fetch(`/api/tmdb/movie-search?query=${encodeURIComponent(value.trim())}`);
        const data = await resp.json();
        setMovieSuggestions(data.results || []);
      } catch {
        setMovieSuggestions([]);
      }
      setMovieLoading(false);
    }, 250);
  };

  // Import depuis TMDB (corrigé pour tout remplir)
  const importMovieFromTMDB = async (movie) => {
    if (!movie || !movie.id) return;
    setLoading(true);
    try {
      // On obtient credits et videos en même temps
      const detailRes = await fetch(`/api/tmdb/movie/${movie.id}?append_to_response=credits,videos`);
      let detail = null;
      if (detailRes.ok) {
        detail = await detailRes.json();
      } else {
        toast({
          title: "Erreur TMDB",
          description: "Aucune donnée TMDB trouvée pour ce film.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }
      // Director extraction
      let director = "";
      if (detail.credits && Array.isArray(detail.credits.crew)) {
        const dir = detail.credits.crew.find((c) => c.job === "Director");
        if (dir) director = dir.name;
      }
      // Genres
      let genres = [];
      if (Array.isArray(detail.genres) && detail.genres.length > 0) {
        genres = detail.genres.map((g) => typeof g === "string" ? g : g.name).filter(Boolean);
      }
      // Trailer extraction (YouTube)
      let trailer_url = "";
      if (detail.videos && Array.isArray(detail.videos.results)) {
        const yt = detail.videos.results.find(
          (v) => v.type === "Trailer" && v.site === "YouTube"
        );
        if (yt && yt.key) trailer_url = `https://www.youtube.com/watch?v=${yt.key}`;
      }
      // Affiche
      let poster = "";
      if (detail.poster_path) {
        poster = `https://image.tmdb.org/t/p/w500${detail.poster_path}`;
      } else if (movie.poster_path) {
        poster = `https://image.tmdb.org/t/p/w500${movie.poster_path}`;
      }
      // Champs principaux
      setForm((f) => ({
        ...f,
        title: detail.title || movie.title || f.title,
        director: director || f.director,
        year: (detail.release_date || movie.release_date)
          ? (detail.release_date || movie.release_date).slice(0, 4)
          : f.year,
        duration: detail.runtime ?? f.duration ?? "",
        genres: genres.length > 0 ? genres : f.genres,
        vote_average: detail.vote_average ?? f.vote_average,
        vote_count: detail.vote_count ?? f.vote_count,
        poster: poster || f.poster,
        description: detail.overview ?? movie.overview ?? f.description,
        tmdb_id: movie.id,
        trailer_url: trailer_url || f.trailer_url,
      }));
      await fetchCast(movie.id);
      toast({
        title: "Import TMDB réussi",
        description: "Champs pré-remplis depuis TMDB !",
      });
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
      // Appel enrichi avec credits et videos
      const res = await fetch(`/api/tmdb/movie/${encodeURIComponent(form.tmdb_id)}?append_to_response=credits,videos`);
      if (!res.ok) throw new Error("Erreur réseau TMDB");
      const data = await res.json();
      if (data && data.id) {
        // Director extraction
        let director = "";
        if (data.credits && Array.isArray(data.credits.crew)) {
          const dir = data.credits.crew.find((c) => c.job === "Director");
          if (dir) director = dir.name;
        }
        // Genres
        let genres = [];
        if (Array.isArray(data.genres) && data.genres.length > 0) {
          genres = data.genres.map((g) => typeof g === "string" ? g : g.name).filter(Boolean);
        }
        // Trailer extraction (YouTube)
        let trailer_url = "";
        if (data.videos && Array.isArray(data.videos.results)) {
          const yt = data.videos.results.find(
            (v) => v.type === "Trailer" && v.site === "YouTube"
          );
          if (yt && yt.key) trailer_url = `https://www.youtube.com/watch?v=${yt.key}`;
        }
        // Affiche
        let poster = "";
        if (data.poster_path) {
          poster = `https://image.tmdb.org/t/p/w500${data.poster_path}`;
        }
        setForm((f) => ({
          ...f,
          title: data.title || f.title,
          director: director || f.director,
          year: data.release_date ? data.release_date.slice(0, 4) : f.year,
          duration: data.runtime ?? f.duration ?? "",
          genres: genres.length > 0 ? genres : f.genres,
          vote_average: data.vote_average ?? f.vote_average,
          vote_count: data.vote_count ?? f.vote_count,
          poster: poster || f.poster,
          description: data.overview ?? f.description,
          tmdb_id: data.id,
          trailer_url: trailer_url || f.trailer_url,
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
          description: "Aucun film trouvé pour cet ID.",
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
      aria-labelledby="film-modal-title"
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
            {initialData.id ? "Modifier le film" : "Ajouter un film"}
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
        {/* TMDB search zone (autocomplete + bouton Import) */}
        <div className="flex gap-1 items-end px-3 pt-1 relative">
          <div className="flex-1">
            <label htmlFor="tmdb_search" className="block text-[11px] mb-1 text-white/70 font-medium">
              Recherche TMDB
            </label>
            <input
              id="tmdb_search"
              autoComplete="off"
              value={tmdbSearch}
              onChange={handleMovieSearchInput}
              onFocus={() => setShowMovieSuggestions(true)}
              onBlur={() => setTimeout(() => setShowMovieSuggestions(false), 150)}
              onKeyDown={e => {
                if (!showMovieSuggestions || movieSuggestions.length === 0) return;
                if (e.key === "ArrowDown") {
                  e.preventDefault();
                  setActiveMovieSuggestion((v) => (v + 1) % movieSuggestions.length);
                } else if (e.key === "ArrowUp") {
                  e.preventDefault();
                  setActiveMovieSuggestion((v) => (v - 1 + movieSuggestions.length) % movieSuggestions.length);
                } else if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  if (activeMovieSuggestion >= 0 && activeMovieSuggestion < movieSuggestions.length) {
                    const suggestion = movieSuggestions[activeMovieSuggestion];
                    setTmdbSearch(suggestion.title);
                    setShowMovieSuggestions(false);
                    setMovieSuggestions([]);
                  }
                }
              }}
              className="rounded-lg border border-neutral-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-300/40 px-2 py-1 bg-gray-800 text-white w-full text-xs transition-shadow"
              placeholder="Titre du film"
              disabled={loading}
            />
            {showMovieSuggestions && tmdbSearch && (
              <ul
                className="absolute z-30 w-full bg-gray-900 border border-gray-700 mt-1 rounded shadow max-h-44 overflow-y-auto"
                role="listbox"
                aria-label="Suggestions de films"
              >
                {movieLoading && (
                  <li className="p-2 text-sm text-gray-400">Chargement…</li>
                )}
                {movieSuggestions.map((suggestion, idx) => (
                  <li
                    key={suggestion.id}
                    className={`p-2 cursor-pointer hover:bg-blue-600/70 transition-colors ${activeMovieSuggestion === idx ? "bg-blue-600/80 text-white" : ""}`}
                    role="option"
                    aria-selected={activeMovieSuggestion === idx}
                    tabIndex={0}
                    onMouseEnter={() => setActiveMovieSuggestion(idx)}
                    onMouseDown={e => {
                      e.preventDefault();
                      setActiveMovieSuggestion(idx);
                      setTmdbSearch(suggestion.title);
                      setShowMovieSuggestions(false);
                    }}
                  >
                    <span className="font-medium">{suggestion.title}</span>
                    {suggestion.release_date && (
                      <span className="text-xs text-gray-400 ml-1">({suggestion.release_date.slice(0, 4)})</span>
                    )}
                  </li>
                ))}
                {!movieLoading && movieSuggestions.length === 0 && (
                  <li className="p-2 text-sm text-gray-400">Aucun film trouvé…</li>
                )}
              </ul>
            )}
          </div>
          <Button
            type="button"
            className="ml-1 flex-shrink-0 text-xs py-1 px-2 transition rounded-lg"
            variant="outline"
            onClick={async () => {
              let toImport = null;
              if (activeMovieSuggestion >= 0 && movieSuggestions[activeMovieSuggestion]) {
                toImport = movieSuggestions[activeMovieSuggestion];
              } else if (movieSuggestions.length > 0) {
                toImport = movieSuggestions[0];
              }
              if (toImport) {
                await importMovieFromTMDB(toImport);
              } else if (tmdbSearch.trim().length > 0) {
                setLoading(true);
                try {
                  const resp = await fetch(`/api/tmdb/movie-search?query=${encodeURIComponent(tmdbSearch.trim())}`);
                  const data = await resp.json();
                  if (data.results && data.results.length > 0) {
                    await importMovieFromTMDB(data.results[0]);
                  } else {
                    toast({
                      title: "Introuvable TMDB",
                      description: "Aucun film trouvé pour cette recherche.",
                      variant: "destructive",
                    });
                  }
                } catch (e) {
                  toast({
                    title: "Erreur TMDB",
                    description: String(e),
                    variant: "destructive",
                  });
                }
                setLoading(false);
              }
            }}
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
            <div
              className="flex flex-wrap gap-2"
              style={{
                maxHeight: "92px",
                overflowY: "auto",
                marginBottom: "6px",
              }}
            >
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
            <label htmlFor="director" className="block text-[11px] font-medium text-white/80">
              Réalisateur
            </label>
            <input
              id="director"
              value={form.director}
              onChange={(e) => handleChange("director", e.target.value)}
              className="mt-0.5 w-full rounded-lg border border-neutral-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-300/40 px-2 py-1 bg-gray-800 text-white text-xs transition-shadow"
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-1">
            <div className="flex-1">
              <label htmlFor="year" className="block text-[11px] font-medium text-white/80">
                Année
              </label>
              <input
                id="year"
                type="number"
                value={form.year}
                onChange={(e) => handleChange("year", e.target.value)}
                className={`mt-0.5 w-full rounded-lg border border-neutral-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-300/40 px-2 py-1 bg-gray-800 text-white text-xs transition-shadow ${
                  errors.year ? "border-red-500" : ""
                }`}
                min="1900"
                max="2100"
              />
              {errors.year && (
                <div className="text-xs text-red-400 mt-0.5">{errors.year}</div>
              )}
            </div>
            <div className="flex-1">
              <label htmlFor="duration" className="block text-[11px] font-medium text-white/80">
                Durée (minutes)
              </label>
              <input
                id="duration"
                type="number"
                value={form.duration}
                onChange={(e) => handleChange("duration", e.target.value)}
                className={`mt-0.5 w-full rounded-lg border border-neutral-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-300/40 px-2 py-1 bg-gray-800 text-white text-xs transition-shadow ${
                  errors.duration ? "border-red-500" : ""
                }`}
                min="1"
              />
              {errors.duration && (
                <div className="text-xs text-red-400 mt-0.5">{errors.duration}</div>
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
          <div className="flex flex-col sm:flex-row gap-1">
            <div className="flex-1">
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
            <div className="flex-1">
              <label htmlFor="vote_count" className="block text-[11px] font-medium text-white/80">
                Nombre de votes
              </label>
              <input
                id="vote_count"
                type="number"
                value={form.vote_count}
                onChange={(e) => handleChange("vote_count", e.target.value)}
                className="mt-0.5 w-full rounded-lg border border-neutral-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-300/40 px-2 py-1 bg-gray-800 text-white text-xs transition-shadow"
                min="0"
              />
            </div>
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
          <div>
            <label htmlFor="trailer_url" className="block text-[11px] font-medium text-white/80">
              Bande-annonce (YouTube)
            </label>
            <input
              id="trailer_url"
              value={form.trailer_url}
              onChange={(e) => handleChange("trailer_url", e.target.value)}
              className="mt-0.5 w-full rounded-lg border border-neutral-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-300/40 px-2 py-1 bg-gray-800 text-white text-xs transition-shadow"
              placeholder="https://www.youtube.com/watch?v=..."
            />
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
                  placeholder="Ex: 603"
                  type="number"
                  min={1}
                />
                {form.tmdb_id && (
                  <a
                    href={`https://www.themoviedb.org/movie/${form.tmdb_id}`}
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
                  aria-label="Importer ce film depuis TMDB via l'ID"
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
            form="film-form"
            variant="success"
            disabled={loading}
            aria-label="Enregistrer le film"
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