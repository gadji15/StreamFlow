import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { normalizeGenres } from "../genres-normalizer";

// Pour upload local (images, vidéos)
import { supabase } from "@/lib/supabaseClient";

// Petite aide utilitaire
function getYoutubeTrailer(videos: any[]) {
  if (!Array.isArray(videos)) return "";
  const yt = videos.find(
    (v) => v.type === "Trailer" && v.site === "YouTube"
  );
  if (yt && yt.key) return `https://www.youtube.com/watch?v=${yt.key}`;
  return "";
}

type FilmModalProps = {
  open: boolean;
  onClose: () => void;
  onSave: (payload: any) => Promise<void>;
  initialData?: any;
};

export default function FilmModal({ open, onClose, onSave, initialData = {} }: FilmModalProps) {
  // STRUCTURE ÉTENDUE POUR TOUS LES CHAMPS SUPABASE
  // Initialisation du champ featured selon homepage_categories
  function computeFeaturedFromCategories(init: { homepage_categories?: any[]; featured?: boolean } = {}) {
    const cats = Array.isArray(init.homepage_categories) ? init.homepage_categories : [];
    return cats.includes('featured') || !!init.featured;
  }
  const [form, setForm] = useState({
    title: initialData.title || "",
    original_title: initialData.original_title || "",
    director: initialData.director || "",
    year: initialData.year || "",
    duration: initialData.duration || "",
    genres: Array.isArray(initialData.genres)
      ? initialData.genres
      : (typeof initialData.genre === "string"
        ? initialData.genre.split(",").map((g: string) => g.trim())
        : []),
    genresInput: "",
    vote_average: initialData.vote_average || "",
    vote_count: initialData.vote_count || "",
    published: !!initialData.published,
    isvip: !!initialData.isvip,
    featured: computeFeaturedFromCategories(initialData), // Synchronisation
    poster: initialData.poster || "",
    backdrop: initialData.backdrop || "",
    tmdb_id: initialData.tmdb_id || "",
    imdb_id: initialData.imdb_id || "",
    description: initialData.description || "",
    trailer_url: initialData.trailer_url || "",
    video_url: initialData.video_url || "",
    language: initialData.language || "",
    homepage_categories: Array.isArray(initialData.homepage_categories)
      ? initialData.homepage_categories
      : [],
    popularity: initialData.popularity || "",
    cast: Array.isArray(initialData.cast)
      ? initialData.cast
      : (typeof initialData.cast === "string"
        ? JSON.parse(initialData.cast)
        : []),
    no_video: !!initialData.no_video, // flag pour absence de vidéo
  });

  // CAST UI STATE
  const [castList, setCastList] = useState(form.cast);
  const [castName, setCastName] = useState("");
  const [castRole, setCastRole] = useState("");
  const [castPhoto, setCastPhoto] = useState("");
  const [castUploading, setCastUploading] = useState(false);

  // VIDEO UPLOAD
  const [localVideo, setLocalVideo] = useState<File | null>(null);
  const [localVideoUrl, setLocalVideoUrl] = useState("");

  // TMDB/TOAST/FOCUS
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [k: string]: string }>({});
  const [tmdbSearch, setTmdbSearch] = useState(initialData.title || "");
  const { toast } = useToast();
  const firstInput = useRef<HTMLInputElement>(null);

  // --- ACTUALISATION DU FORMULAIRE ---
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
        original_title: initialData.original_title || "",
        director: initialData.director || "",
        year: initialData.year || "",
        duration: initialData.duration || "",
        genres: Array.isArray(initialData.genres)
          ? initialData.genres
          : (typeof initialData.genre === "string"
            ? initialData.genre.split(",").map((g: string) => g.trim())
            : []),
        genresInput: "",
        vote_average: initialData.vote_average || "",
        vote_count: initialData.vote_count || "",
        published: !!initialData.published,
        isvip: !!initialData.isvip,
        featured: !!initialData.featured, // NOUVEAU CHAMP
        poster: initialData.poster || "",
        backdrop: initialData.backdrop || "",
        tmdb_id,
        imdb_id: initialData.imdb_id || "",
        description: initialData.description || "",
        trailer_url: initialData.trailer_url || "",
        video_url: initialData.video_url || "",
        language: initialData.language || "",
        homepage_categories: Array.isArray(initialData.homepage_categories)
          ? initialData.homepage_categories
          : [],
        popularity: initialData.popularity || "",
        cast: Array.isArray(initialData.cast)
          ? initialData.cast
          : (typeof initialData.cast === "string"
            ? JSON.parse(initialData.cast)
            : []),
        no_video: !!initialData.no_video,
      };
    });
    setCastList(initialData.cast ? (Array.isArray(initialData.cast) ? initialData.cast : JSON.parse(initialData.cast)) : []);
    setTmdbSearch(initialData.title || "");
    setLocalVideo(null);
    setLocalVideoUrl("");
    // eslint-disable-next-line
  }, [open, initialData && initialData.id]);

  // --- HANDLERS ---
  // Gestion spéciale pour la case "featured" liée à homepage_categories
  const handleChange = (field: string, value: any) => {
    if (field === "featured") {
      setForm((f) => {
        const categories = Array.isArray(f.homepage_categories) ? [...f.homepage_categories] : [];
        let newCats;
        if (value) {
          if (!categories.includes("featured")) newCats = [...categories, "featured"];
          else newCats = categories;
        } else {
          newCats = categories.filter((cat) => cat !== "featured");
        }
        return { ...f, featured: value, homepage_categories: newCats };
      });
      setErrors((e) => {
        const { featured, ...rest } = e;
        return rest;
      });
      return;
    }
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => {
      const { [field]: _, ...rest } = e;
      return rest;
    });
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
    if (!form.no_video && !form.video_url && !localVideo)
      err.video_url = "Veuillez fournir une vidéo ou cocher la case \"Pas de vidéo\"";
    return err;
  };

  // --- VIDEO UPLOAD ---
  const handleVideoUpload = async (file: File) => {
    setCastUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const filename = `film_${Date.now()}.${ext}`;
      const { data, error } = await supabase.storage
        .from('videos')
        .upload(`films/${filename}`, file, { cacheControl: "3600", upsert: false });
      if (error) throw error;
      const publicUrl = supabase.storage.from('videos').getPublicUrl(`films/${filename}`).data.publicUrl;
      setLocalVideoUrl(publicUrl);
      handleChange("video_url", publicUrl);
      toast({ title: "Vidéo importée", description: "La vidéo a été envoyée avec succès." });
    } catch (e) {
      toast({ title: "Erreur upload vidéo", description: String(e), variant: "destructive" });
    }
    setCastUploading(false);
  };

  // --- CAST ---
  const handleAddCast = () => {
    if (!castName.trim()) return;
    setCastList((prev: typeof castList) => [
      ...prev,
      { name: castName, role: castRole, photo: castPhoto },
    ]);
    setCastName("");
    setCastRole("");
    setCastPhoto("");
  };
  const handleDeleteCast = (idx: number) => {
    setCastList(castList.filter((_: any, i: number) => i !== idx));
  };

  const handleCastPhotoUpload = async (file: File) => {
    setCastUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const filename = `actor_${Date.now()}.${ext}`;
      const { data, error } = await supabase.storage
        .from('images')
        .upload(`casts/${filename}`, file, { cacheControl: "3600", upsert: false });
      if (error) throw error;
      const publicUrl = supabase.storage.from('images').getPublicUrl(`casts/${filename}`).data.publicUrl;
      setCastPhoto(publicUrl);
      toast({ title: "Photo importée", description: "Photo cast uploadée." });
    } catch (e) {
      toast({ title: "Erreur upload photo", description: String(e), variant: "destructive" });
    }
    setCastUploading(false);
  };

  // --- TMDB SEARCH ---
  type MovieSuggestion = { id: number; title: string; release_date?: string };
  const [movieSuggestions, setMovieSuggestions] = useState<MovieSuggestion[]>([]);
  const [movieLoading, setMovieLoading] = useState(false);
  const [showMovieSuggestions, setShowMovieSuggestions] = useState(false);
  const [activeMovieSuggestion, setActiveMovieSuggestion] = useState(-1);
  const suggestionTimeout = useRef<NodeJS.Timeout | null>(null);

  const handleMovieSearchInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

  // --- TMDB IMPORT DÉTAILLÉ ---
  const importMovieFromTMDB = async (movie: any) => {
    if (!movie || !movie.id) return;
    setLoading(true);
    try {
      // Appel enrichi
      const detailRes = await fetch(`/api/tmdb/movie/${movie.id}?append_to_response=credits,videos,images`);
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
      // Director
      let director = "";
      if (detail.credits && Array.isArray(detail.credits.crew)) {
        const dir = detail.credits.crew.find((c: { job: string }) => c.job === "Director");
        if (dir) director = dir.name;
      }
      // Genres
      let genres = [];
      if (Array.isArray(detail.genres) && detail.genres.length > 0) {
        genres = detail.genres.map((g: any) => typeof g === "string" ? g : g.name).filter(Boolean);
      }
      // Trailer (YouTube)
      let trailer_url = getYoutubeTrailer(detail.videos?.results || []);
      // Images
      let poster = detail.poster_path ? `https://image.tmdb.org/t/p/w500${detail.poster_path}` : "";
      let backdrop = detail.backdrop_path ? `https://image.tmdb.org/t/p/w780${detail.backdrop_path}` : "";
      // Cast (limité aux principaux, mapping nom/role/photo)
      let castArr = [];
      if (Array.isArray(detail.credits?.cast)) {
        castArr = detail.credits.cast.slice(0, 10).map((actor: any) => ({
          name: actor.name,
          role: actor.character,
          photo: actor.profile_path ? `https://image.tmdb.org/t/p/w185${actor.profile_path}` : "",
        }));
      }
      // Vidéo principale (champ video_url) : TMDB ne fournit pas de vidéo directe, on laisse vide.
      setForm((f) => ({
        ...f,
        title: detail.title || movie.title || f.title,
        original_title: detail.original_title || f.original_title,
        director: director || f.director,
        year: (detail.release_date || movie.release_date)
          ? (detail.release_date || movie.release_date).slice(0, 4)
          : f.year,
        duration: detail.runtime ?? f.duration ?? "",
        genres: genres.length > 0 ? genres : f.genres,
        vote_average: detail.vote_average ?? f.vote_average,
        vote_count: detail.vote_count ?? f.vote_count,
        poster: poster || f.poster,
        backdrop: backdrop || f.backdrop,
        tmdb_id: movie.id,
        imdb_id: detail.imdb_id ?? f.imdb_id,
        description: detail.overview ?? movie.overview ?? f.description,
        trailer_url: trailer_url || f.trailer_url,
        language: detail.original_language || f.language,
        popularity: detail.popularity ?? f.popularity,
        cast: castArr.length > 0 ? castArr : f.cast,
        // video_url: "", // volontairement laissé vide : l'admin peut uploader ou cocher "pas de vidéo"
      }));
      setCastList(castArr.length > 0 ? castArr : []);
      toast({
        title: "Import TMDB réussi",
        description: "Champs pré-remplis depuis TMDB !",
      });
    } catch (e) {
      setCastList([]);
      toast({
        title: "Erreur TMDB",
        description: String(e),
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  // --- IMPORT TMDB PAR ID ---
  const handleTMDBById = async () => {
    if (!form.tmdb_id) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/tmdb/movie/${encodeURIComponent(form.tmdb_id)}?append_to_response=credits,videos,images`);
      if (!res.ok) throw new Error("Erreur réseau TMDB");
      const data = await res.json();
      // Director
      let director = "";
      if (data.credits && Array.isArray(data.credits.crew)) {
        const dir = data.credits.crew.find((c: { job: string; name: string }) => c.job === "Director");
        if (dir) director = dir.name;
      }
      // Genres
      let genres = [];
      if (Array.isArray(data.genres) && data.genres.length > 0) {
        genres = data.genres.map((g: any) => typeof g === "string" ? g : g.name).filter(Boolean);
      }
      // Trailer (YouTube)
      let trailer_url = getYoutubeTrailer(data.videos?.results || []);
      // Images
      let poster = data.poster_path ? `https://image.tmdb.org/t/p/w500${data.poster_path}` : "";
      let backdrop = data.backdrop_path ? `https://image.tmdb.org/t/p/w780${data.backdrop_path}` : "";
      // Cast
      let castArr = [];
      if (Array.isArray(data.credits?.cast)) {
        castArr = data.credits.cast.slice(0, 10).map((actor: any) => ({
          name: actor.name,
          role: actor.character,
          photo: actor.profile_path ? `https://image.tmdb.org/t/p/w185${actor.profile_path}` : "",
        }));
      }
      setForm((f) => ({
        ...f,
        title: data.title || f.title,
        original_title: data.original_title || f.original_title,
        director: director || f.director,
        year: data.release_date ? data.release_date.slice(0, 4) : f.year,
        duration: data.runtime ?? f.duration ?? "",
        genres: genres.length > 0 ? genres : f.genres,
        vote_average: data.vote_average ?? f.vote_average,
        vote_count: data.vote_count ?? f.vote_count,
        poster: poster || f.poster,
        backdrop: backdrop || f.backdrop,
        tmdb_id: data.id,
        imdb_id: data.imdb_id ?? f.imdb_id,
        description: data.overview ?? f.description,
        trailer_url: trailer_url || f.trailer_url,
        language: data.original_language || f.language,
        popularity: data.popularity ?? f.popularity,
        cast: castArr.length > 0 ? castArr : f.cast,
        // video_url: "", // volontairement laissé vide
      }));
      setCastList(castArr.length > 0 ? castArr : []);
      toast({
        title: "Import TMDB réussi",
        description: "Champs pré-remplis depuis TMDB !",
      });
    } catch (e) {
      setCastList([]);
      toast({
        title: "Erreur TMDB",
        description: String(e),
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  // --- SUBMIT ---
  // Fonction utilitaire pour formater le payload
  function prepareFilmPayload(form: any, castList: any[], localVideoUrl: string) {
    // Genres : array => string (canonical slugs séparés par virgule, ex: "sci-fi,comedy")
    let genresArr: string[] = [];
    let genre: string | null = null;
    if (Array.isArray(form.genres) && form.genres.length > 0) {
      genresArr = normalizeGenres(form.genres);
      genre = genresArr.join(",");
    } else if (typeof form.genres === "string") {
      genresArr = normalizeGenres(form.genres.split(",").map((g: string) => g.trim()));
      genre = genresArr.join(",");
    }

    // Homepage_categories : array obligatoire (pas de stringification JSON)
    let homepage_categories: string[] = [];
    if (Array.isArray(form.homepage_categories)) {
      homepage_categories = form.homepage_categories.filter(
        (cat: string) => typeof cat === "string" && cat.trim() !== ""
      );
    }

    // Cast : array d’objets (pas de string JSON !)
    let cast = [];
    if (Array.isArray(castList)) {
      cast = castList.filter(
        (m) => typeof m.name === "string" && m.name.trim() !== ""
      );
    }

    // release_date : string YYYY-MM-DD ou null
    let release_date: string | null = null;
    if (form.release_date) {
      const d = new Date(form.release_date);
      if (!isNaN(d.getTime())) {
        release_date = d.toISOString().slice(0, 10);
      }
    }

    // duration, year : nombre ou null
    const duration =
      form.duration !== undefined && form.duration !== ""
        ? Number(form.duration)
        : null;
    const year =
      form.year !== undefined && form.year !== "" ? Number(form.year) : null;

    // tmdb_id : nombre ou null
    const tmdb_id =
      form.tmdb_id !== undefined && form.tmdb_id !== ""
        ? Number(form.tmdb_id)
        : null;

    // vote_average, popularity, vote_count : nombres ou null
    const vote_average =
      form.vote_average !== undefined && form.vote_average !== ""
        ? Number(form.vote_average)
        : null;
    const popularity =
      form.popularity !== undefined && form.popularity !== ""
        ? Number(form.popularity)
        : null;
    const vote_count =
      form.vote_count !== undefined && form.vote_count !== ""
        ? Number(form.vote_count)
        : null;

    // Boolean fields : forcer le cast
    const isvip = !!form.isvip;
    const published = !!form.published;
    const no_video = !!form.no_video;

    // Toujours synchroniser la catégorie "featured" selon le champ featured
    let homepage_categories_sync = Array.isArray(form.homepage_categories)
      ? [...form.homepage_categories]
      : [];
    if (form.featured && !homepage_categories_sync.includes("featured")) {
      homepage_categories_sync.push("featured");
    }
    if (!form.featured && homepage_categories_sync.includes("featured")) {
      homepage_categories_sync = homepage_categories_sync.filter((cat) => cat !== "featured");
    }

    return {
      title: form.title?.trim() || "",
      original_title: form.original_title?.trim() || null,
      director: form.director?.trim() || null,
      year,
      release_date,
      duration,
      genre,
      vote_average,
      vote_count,
      published,
      isvip,
      // featured: !!form.featured, // Optionnel, pour backward compat
      poster: form.poster || null,
      backdrop: form.backdrop || null,
      tmdb_id,
      imdb_id: form.imdb_id || null,
      description: form.description?.trim() || null,
      trailer_url: form.trailer_url || null,
      video_url: no_video ? null : (form.video_url || localVideoUrl || null),
      language: form.language || null,
      homepage_categories: homepage_categories_sync,
      popularity,
      cast,
      no_video,
    };
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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
      const payload = prepareFilmPayload(form, castList, localVideoUrl);

      await onSave(payload);
      toast({ title: "Film enregistré" });
      onClose();
    } catch (e) {
      toast({ title: "Erreur", description: String(e), variant: "destructive" });
    }
    setLoading(false);
  };

  // --- UI ---
  if (!open) return null;

  return (
    <div
      className={`fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity duration-200 ${
        open ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="film-modal-title"
      tabIndex={-1}
      onClick={onClose}
      style={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        minHeight: "100vh",
        overflowY: "auto",
        paddingTop: 24,
        paddingBottom: 24,
      }}
    >
      <div
        className="animate-[fadeInScale_0.25s_ease] bg-gradient-to-br from-gray-900 via-gray-900/95 to-gray-800 rounded-2xl shadow-2xl border border-neutral-800 w-full max-w-xs sm:max-w-sm md:max-w-md relative flex flex-col"
        style={{
          maxHeight: "90vh",
          minHeight: "0",
          overflowY: "auto",
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
              let importedTitle = "";
              let importedYear = "";
              if (toImport) {
                importedTitle = (toImport.title || "").trim().toLowerCase();
                importedYear = (toImport.release_date || "").slice(0, 4);
              } else if (tmdbSearch.trim().length > 0) {
                setLoading(true);
                try {
                  const resp = await fetch(`/api/tmdb/movie-search?query=${encodeURIComponent(tmdbSearch.trim())}`);
                  const data = await resp.json();
                  if (data.results && data.results.length > 0) {
                    toImport = data.results[0];
                    importedTitle = (toImport.title || "").trim().toLowerCase();
                    importedYear = (toImport.release_date || "").slice(0, 4);
                  } else {
                    toast({
                      title: "Introuvable TMDB",
                      description: "Aucun film trouvé pour cette recherche.",
                      variant: "destructive",
                    });
                    setLoading(false);
                    return;
                  }
                } catch (e) {
                  toast({
                    title: "Erreur TMDB",
                    description: String(e),
                    variant: "destructive",
                  });
                  setLoading(false);
                  return;
                }
                setLoading(false);
              }

              // Vérification anti-doublon AVANT import
              if (importedTitle && importedYear) {
                // Vérification côté base (la plus sûre, car le FilmModal ne reçoit pas la liste globale des films)
                const { data: dataCheck, error: errorCheck } = await supabase
                  .from('films')
                  .select('id')
                  .eq('title', importedTitle)
                  .eq('year', Number(importedYear))
                  .limit(1);

                if (errorCheck) {
                  toast({ title: "Erreur", description: String(errorCheck), variant: "destructive" });
                  return;
                }
                if (dataCheck && dataCheck.length > 0) {
                  toast({
                    title: "Ce film existe déjà",
                    description: `Un film avec ce titre et cette année existe déjà dans votre base. L'import a été annulé.`,
                    variant: "destructive",
                  });
                  setShowMovieSuggestions(false); // Fermer la liste le cas échéant
                  setLoading(false); // Stopper le spinner
                  return;
                }
              }

              if (toImport) {
                await importMovieFromTMDB(toImport);
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
        {/* Cast importé & édition */}
        <div className="px-3 pt-2 pb-1">
          <label className="block text-[11px] font-medium text-white/80 mb-1">
            Acteurs principaux (modifiables)
          </label>
          <div
            className="flex flex-wrap gap-2 mb-2"
            style={{
              maxHeight: "92px",
              overflowY: "auto",
            }}
          >
            {castList.map((actor: { name: string; role?: string; photo?: string }, idx: number) => (
              <div key={idx} className="flex flex-col items-center w-16 relative group">
                <img
                  src={actor.photo || "/no-image.png"}
                  alt={actor.name}
                  className="rounded-full h-12 w-12 object-cover border border-gray-700 bg-gray-800"
                  style={{ objectFit: "cover" }}
                />
                <span className="text-xs text-center mt-1 text-white/80 truncate w-14">{actor.name}</span>
                {actor.role && (
                  <span className="text-[10px] text-gray-400 text-center truncate w-14">{actor.role}</span>
                )}
                <button
                  type="button"
                  className="absolute top-0 right-0 text-xs text-red-500 bg-black/60 rounded-full h-5 w-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                  onClick={() => handleDeleteCast(idx)}
                  title="Supprimer"
                >×</button>
              </div>
            ))}
          </div>
          <div className="flex gap-1 items-end">
            <input
              type="text"
              placeholder="Nom"
              value={castName}
              onChange={e => setCastName(e.target.value)}
              className="w-20 rounded border border-gray-700 px-2 py-1 bg-gray-800 text-xs text-white"
            />
            <input
              type="text"
              placeholder="Rôle"
              value={castRole}
              onChange={e => setCastRole(e.target.value)}
              className="w-20 rounded border border-gray-700 px-2 py-1 bg-gray-800 text-xs text-white"
            />
            <input
              type="file"
              accept="image/*"
              id="cast-photo-file"
              style={{ display: "none" }}
              onChange={e => {
                if (e.target.files && e.target.files.length > 0) {
                  handleCastPhotoUpload(e.target.files[0]);
                }
              }}
            />
            <label htmlFor="cast-photo-file" className="bg-gray-700 text-gray-200 px-2 py-1 rounded text-xs cursor-pointer hover:bg-indigo-600">
              Photo
            </label>
            {castPhoto && (
              <img src={castPhoto} alt="cast" className="h-6 w-6 rounded-full border ml-1" />
            )}
            <Button type="button" size="sm" className="ml-1" onClick={handleAddCast} disabled={castUploading || !castName}>
              Ajouter
            </Button>
          </div>
        </div>
        {/* Content scrollable (formulaire principal) */}
        <form
          id="film-form"
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
            <label htmlFor="original_title" className="block text-[11px] font-medium text-white/80">
              Titre Original
            </label>
            <input
              id="original_title"
              value={form.original_title}
              onChange={(e) => handleChange("original_title", e.target.value)}
              className="mt-0.5 w-full rounded-lg border border-neutral-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-300/40 px-2 py-1 bg-gray-800 text-white text-xs transition-shadow"
            />
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
                        form.genres.filter((x: string, i: number) => i !== idx)
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
            <label htmlFor="backdrop" className="block text-[11px] font-medium text-white/80">
              Backdrop (URL)
            </label>
            <input
              id="backdrop"
              value={form.backdrop}
              onChange={(e) => handleChange("backdrop", e.target.value)}
              className="mt-0.5 w-full rounded-lg border border-neutral-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-300/40 px-2 py-1 bg-gray-800 text-white text-xs transition-shadow"
              placeholder="https://..."
            />
            {form.backdrop && (
              <div className="flex flex-col items-start mt-1">
                <img
                  src={form.backdrop}
                  alt="Aperçu backdrop"
                  className="h-10 rounded shadow border border-gray-700"
                  style={{ maxWidth: "100%" }}
                />
                <button
                  type="button"
                  className="text-[10px] text-red-400 hover:underline mt-1"
                  onClick={() => handleChange("backdrop", "")}
                >
                  Supprimer le backdrop
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
          <div>
            <label htmlFor="video_url" className="block text-[11px] font-medium text-white/80">
              Lien vidéo
            </label>
            <input
              id="video_url"
              name="video_url"
              type="text"
              value={form.video_url}
              onChange={e => setForm({ ...form, video_url: e.target.value })}
              placeholder="https://..."
              className="input input-bordered w-full"
              required
            />
            {/* Aperçu pour les liens Uqload/Doodstream/etc. */}
            {form.video_url && (
              <div className="flex flex-col items-start mt-1">
                {(form.video_url.startsWith("https://uqload.io/")
                  || form.video_url.startsWith("https://dood")
                  || form.video_url.startsWith("https://www.dood")
                  || form.video_url.startsWith("https://streamtape.com")
                  || form.video_url.startsWith("https://vidmoly.to")
                  || form.video_url.startsWith("https://mycloud.to")
                  || form.video_url.startsWith("https://upstream.to")
                  || form.video_url.startsWith("https://voe.sx")
                  || form.video_url.startsWith("https://filelions.to")
                ) ? (
                  <iframe
                    src={form.video_url}
                    allowFullScreen
                    className="rounded border border-gray-700"
                    style={{ width: 220, height: 124, maxWidth: "100%" }}
                    frameBorder={0}
                    allow="autoplay; fullscreen"
                    sandbox="allow-scripts allow-same-origin allow-presentation allow-popups"
                    title="Aperçu vidéo"
                  />
                ) : form.video_url.match(/\.(mp4|webm|ogg)$/i) ? (
                  <video
                    src={form.video_url}
                    controls
                    className="h-20 rounded border border-gray-700"
                    style={{ maxWidth: "100%" }}
                  />
                ) : (
                  <a
                    href={form.video_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-indigo-400 underline"
                  >
                    Voir la vidéo
                  </a>
                )}
                <button
                  type="button"
                  className="text-[10px] text-red-400 hover:underline mt-1"
                  onClick={() => setForm({ ...form, video_url: "" })}
                  aria-label="Supprimer la vidéo"
                >
                  Supprimer la vidéo
                </button>
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-2 items-center">
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
            {/* Ajout de la case à cocher "Mettre en avant dans le Hero" */}
            <label className="flex items-center gap-1 cursor-pointer text-[11px] text-white/80">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) => handleChange("featured", e.target.checked)}
                className="accent-indigo-500"
                aria-label="Mettre dans le Hero"
              />
              Mettre en avant dans le Hero
            </label>
            <label className="flex items-center gap-1 cursor-pointer text-[11px] text-white/80">
              <input
                type="checkbox"
                checked={form.no_video}
                onChange={(e) => handleChange("no_video", e.target.checked)}
                className="accent-red-500"
                aria-label="Pas de vidéo"
              />
              Pas de vidéo
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
            variant="default"
            disabled={loading}
            aria-label="Enregistrer le film"
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
        /* Correction pour le modal: garantir visibilité du haut du modal même si le contenu déborde */
        .modal-root-fix {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          height: 100vh;
          overflow-y: auto;
          padding-top: 16px;
          padding-bottom: 16px;
        }
      `}</style>
    </div>
  );
}