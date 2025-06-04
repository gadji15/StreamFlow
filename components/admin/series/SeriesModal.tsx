import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { normalizeGenres } from "../genres-normalizer";

// Ajout de la déclaration de la propriété globale TMDB_GENRES_MAP
declare global {
  interface Window {
    __TMDB_GENRES_MAP__?: { [id: string]: string };
  }
}

/**
 * Modal d'ajout/édition d'une série. 
 * 
 * Props :
 * - open (bool) : ouverture du modal
 * - onClose (fn) : fermeture
 * - onSave (fn(payload)) : callback sauvegarde
 * - initialData (object) : données d'édition
 * - existingSeries (array) : liste des séries existantes [{title, tmdb_id, id}]
 * - tmdbSearch (function, optional): fonction asynchrone pour rechercher une série TMDB par query
 */
type SeriesModalProps = {
  open: boolean;
  onClose: () => void;
  onSave: (payload: any) => Promise<void>;
  initialData?: any;
  existingSeries?: Array<{ title: string; tmdb_id: number | string; id: number | string }>;
  tmdbSearch?: (query: string) => Promise<any>;
};

export default function SeriesModal({
  open,
  onClose,
  onSave,
  initialData = {},
  existingSeries = [],
  tmdbSearch,
}: SeriesModalProps) {
  const [form, setForm] = useState({
    title: initialData.title || "",
    creator: initialData.creator || "",
    start_year: initialData.start_year || "",
    end_year: initialData.end_year || "",
    genres: Array.isArray(initialData.genres)
      ? initialData.genres
      : (typeof initialData.genre === "string"
        ? initialData.genre.split(",").map((g: string) => g.trim())
        : []),
    genresInput: "",
    vote_average: initialData.vote_average || "",
    published: !!initialData.published,
    isvip: !!initialData.isvip,
    poster: initialData.poster || "",
    backdrop: initialData.backdrop || "",
    tmdb_id: initialData.tmdb_id || "",
    description: initialData.description || "",
  });

  // Définition du type Actor pour le cast importé depuis TMDB
  type Actor = {
    id: number | string;
    name: string;
    profile_path?: string;
    character?: string;
    [key: string]: any;
  };
  // Nouvel état pour le cast importé depuis TMDB
  const [cast, setCast] = useState<Actor[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [k: string]: string }>({});
  const [tmdbSearchValue, setTmdbSearchValue] = useState(initialData.title || "");
  const { toast } = useToast();
  const firstInput = useRef<HTMLInputElement>(null);

  // Utilitaire pour charger le cast d'une série TMDB
  const fetchCast = async (tmdbId: string | number) => {
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
            ? initialData.genre.split(",").map((g: string) => g.trim())
            : []),
        genresInput: "",
        vote_average: initialData.vote_average || "",
        published: !!initialData.published,
        isvip: !!initialData.isvip,
        poster: initialData.poster || "",
        backdrop: initialData.backdrop || "",
        tmdb_id,
        description: initialData.description || "",
      };
    });
    setTmdbSearchValue(initialData.title || "");
    setCast([]); // Réinitialise le cast à chaque ouverture ou changement de série
    if (initialData.tmdb_id) {
      fetchCast(initialData.tmdb_id);
    }
    // eslint-disable-next-line
  }, [open, initialData && initialData.id]);

  const handleChange = (field: string, value: any) => {
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

    // --- Vérification anti-doublon côté base ---
    try {
      // Vérifier doublon TMDB ID (hors édition de soi-même)
      if (form.tmdb_id) {
        const { data: doublonTmdb } = await (await import('@/lib/supabaseClient')).supabase
          .from("series")
          .select("id")
          .eq("tmdb_id", form.tmdb_id)
          .maybeSingle();
        if (doublonTmdb && (!initialData.id || doublonTmdb.id !== initialData.id)) {
          toast({
            title: "Doublon détecté",
            description: "Une série avec ce TMDB ID existe déjà.",
            variant: "destructive"
          });
          return;
        }
      }
      // Vérifier doublon Titre + Année (hors édition de soi-même)
      const { data: doublonTitle } = await (await import('@/lib/supabaseClient')).supabase
        .from("series")
        .select("id")
        .eq("title", form.title)
        .eq("start_year", form.start_year ? Number(form.start_year) : null)
        .maybeSingle();
      if (doublonTitle && (!initialData.id || doublonTitle.id !== initialData.id)) {
        toast({
          title: "Doublon détecté",
          description: "Une série avec ce titre et cette année existe déjà.",
          variant: "destructive"
        });
        return;
      }
    } catch (e) {
      toast({
        title: "Erreur",
        description: String(e),
        variant: "destructive"
      });
      return;
    }
    // -------------------------------------------------

    setLoading(true);

    try {
      // Construction du payload compatible Supabase
      const clean = (v: string | number | undefined | null) => (v === "" || v === undefined ? null : v);
      // Normalisation des genres avant sauvegarde (slugs uniquement)
      let genresArr: string[] = [];
      if (Array.isArray(form.genres)) {
        genresArr = normalizeGenres(form.genres.filter(Boolean));
      } else if (typeof form.genres === "string") {
        genresArr = normalizeGenres(form.genres.split(",").map((g: string) => g.trim()));
      }

      const payload = {
        // Champs obligatoires ou existants
        title: clean(form.title),
        creator: clean(form.creator),
        start_year: clean(form.start_year) !== null ? Number(form.start_year) : null,
        end_year: clean(form.end_year) !== null ? Number(form.end_year) : null,
        genre: genresArr.join(","),
        vote_average: clean(form.vote_average) !== null ? Number(form.vote_average) : null,
        published: !!form.published,
        isvip: !!form.isvip,
        poster: clean(form.poster),
        backdrop: clean(form.backdrop),
        tmdb_id: clean(form.tmdb_id) !== null ? Number(form.tmdb_id) : null,
        description: clean(form.description),
        // Optionnels
        // cast: Array.isArray(cast) && cast.length > 0 ? cast : null, // seulement si tu veux stocker le cast
      };

      // On retire les champs qui n'existent pas en base (ex: genres, genresInput, etc.)
      // Ne pas envoyer undefined/null si le champ est non nullable

      await onSave(payload);
      toast({ title: "Série enregistrée" });
      onClose();
    } catch (e) {
      toast({ title: "Erreur", description: String(e), variant: "destructive" });
    }
    setLoading(false);
  };

  // Suggestion TMDB (autocomplete)
  type SerieSuggestion = { id: number | string; name: string; first_air_date?: string; [key: string]: any };
  const [serieSuggestions, setSerieSuggestions] = useState<SerieSuggestion[]>([]);
  const [serieLoading, setSerieLoading] = useState(false);
  const [showSerieSuggestions, setShowSerieSuggestions] = useState(false);
  const [activeSerieSuggestion, setActiveSerieSuggestion] = useState(-1);
  const suggestionTimeout = useRef<NodeJS.Timeout | null>(null);

  // Correction : extraction fiable du créateur
  function extractCreator(detail: any) {
    if (detail && Array.isArray(detail.created_by) && detail.created_by.length > 0) {
      return detail.created_by.map((c: { name: string }) => c.name).join(", ");
    }
    return "";
  }

  // Suggestion temps réel
  const handleSerieSearchInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTmdbSearchValue(value);
    setShowSerieSuggestions(true);
    setSerieSuggestions([]);
    setActiveSerieSuggestion(-1);

    if (suggestionTimeout.current) clearTimeout(suggestionTimeout.current);
    if (value.trim().length < 2) {
      setSerieSuggestions([]);
      setSerieLoading(false);
      return;
    }
    setSerieLoading(true);
    suggestionTimeout.current = setTimeout(async () => {
      try {
        const resp = await fetch(`/api/tmdb/tv-search?query=${encodeURIComponent(value.trim())}`);
        const data = await resp.json();
        setSerieSuggestions(data.results || []);
      } catch {
        setSerieSuggestions([]);
      }
      setSerieLoading(false);
    }, 250);
  };

  // Import détaillé à partir d'un objet serie (mapping bulletproof pour creator/genres, + debug)
  const importSerieFromTMDB = async (serie: any) => {
    if (!serie || !serie.id) return;
    setLoading(true);
    try {
      // Try several endpoints if needed
      let detail = null;
      let detailRes = await fetch(`/api/tmdb/tv/${serie.id}`);
      if (detailRes.ok) {
        detail = await detailRes.json();
      } else {
        // Try alternative endpoint (newer code: /series)
        detailRes = await fetch(`/api/tmdb/series/${serie.id}`);
        if (detailRes.ok) {
          detail = await detailRes.json();
        } else {
          toast({
            title: "Erreur TMDB",
            description: "Aucune donnée TMDB trouvée pour cette série.",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }
      }
      // DEBUG: log detail to inspect structure
      console.log("[TMDB IMPORT] detail:", detail);
      // Créateur
      let creatorValue = "";
      if (detail && Array.isArray(detail.created_by) && detail.created_by.length > 0) {
        creatorValue = detail.created_by.map((c: { name: string }) => c.name).join(", ");
      } else if (serie && serie.created_by && Array.isArray(serie.created_by) && serie.created_by.length > 0) {
        creatorValue = serie.created_by.map((c: { name: string }) => c.name).join(", ");
      } else if (detail && detail.creator && typeof detail.creator === "string") {
        creatorValue = detail.creator;
      }
      // Genres
      let genresValue = [];
      if (detail && Array.isArray(detail.genres) && detail.genres.length > 0) {
        genresValue = detail.genres.map((g: any) => g.name).filter(Boolean);
      } else if (serie && Array.isArray(serie.genre_ids) && typeof window !== "undefined" && (window as any).__TMDB_GENRES_MAP__) {
        genresValue = serie.genre_ids.map((id: number | string) => (window as any).__TMDB_GENRES_MAP__[id] || id);
      } else if (detail && typeof detail.genre === "string" && detail.genre.length > 0) {
        genresValue = detail.genre.split(",").map((g: string) => g.trim()).filter(Boolean);
      } else if (serie && typeof serie.genre === "string" && serie.genre.length > 0) {
        genresValue = serie.genre.split(",").map((g: string) => g.trim()).filter(Boolean);
      } else if (serie && Array.isArray(serie.genre_ids) && typeof window !== "undefined" && window.__TMDB_GENRES_MAP__) {
        genresValue = serie.genre_ids.map((id: number | string) => (window.__TMDB_GENRES_MAP__?.[id] ?? id));
      }
      // Fallbacks
      if (!creatorValue) creatorValue = "";
      if (!genresValue || genresValue.length === 0) genresValue = [];

      setForm((f) => ({
        ...f,
        title: detail.name || serie.name || f.title,
        poster: (detail.poster_path || serie.poster_path)
          ? `https://image.tmdb.org/t/p/w500${detail.poster_path || serie.poster_path}` : f.poster,
        backdrop: (detail.backdrop_path || serie.backdrop_path)
          ? `https://image.tmdb.org/t/p/original${detail.backdrop_path || serie.backdrop_path}` : f.backdrop || "",
        start_year: (detail.first_air_date || serie.first_air_date)
          ? (detail.first_air_date || serie.first_air_date).slice(0, 4)
          : f.start_year,
        end_year: (detail.last_air_date || serie.last_air_date)
          ? (detail.last_air_date || serie.last_air_date).slice(0, 4)
          : f.end_year,
        genres: genresValue,
        vote_average: detail.vote_average ?? serie.vote_average ?? f.vote_average,
        description: detail.overview ?? serie.overview ?? f.description,
        tmdb_id: serie.id,
        creator: creatorValue,
      }));
      await fetchCast(serie.id);
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
    const cleanId = String(form.tmdb_id).trim();
    if (!cleanId || isNaN(Number(cleanId)) || Number(cleanId) <= 0) {
      toast({
        title: "ID TMDB invalide",
        description: "Veuillez saisir un identifiant TMDB numérique valide.",
        variant: "destructive",
      });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/tmdb/tv/${encodeURIComponent(cleanId)}`);
      if (!res.ok) throw new Error("Erreur réseau TMDB ou série non trouvée.");
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
          genres: data.genres ? data.genres.map((g: { name: string }) => g.name) : f.genres,
          vote_average: data.vote_average ?? f.vote_average,
          description: data.overview ?? f.description,
          creator: extractCreator(data) || f.creator,
          tmdb_id: data.id,
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
        {/* TMDB search zone (autocomplete + bouton Import) */}
        <div className="flex gap-1 items-end px-3 pt-1 relative">
          <div className="flex-1">
            <label htmlFor="tmdb_search" className="block text-[11px] mb-1 text-white/70 font-medium">
              Recherche TMDB
            </label>
            <input
              id="tmdb_search"
              autoComplete="off"
              value={tmdbSearchValue}
              onChange={handleSerieSearchInput}
              onFocus={() => setShowSerieSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSerieSuggestions(false), 150)}
              onKeyDown={e => {
                if (!showSerieSuggestions || serieSuggestions.length === 0) return;
                if (e.key === "ArrowDown") {
                  e.preventDefault();
                  setActiveSerieSuggestion((v) => (v + 1) % serieSuggestions.length);
                } else if (e.key === "ArrowUp") {
                  e.preventDefault();
                  setActiveSerieSuggestion((v) => (v - 1 + serieSuggestions.length) % serieSuggestions.length);
                } else if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  if (activeSerieSuggestion >= 0 && activeSerieSuggestion < serieSuggestions.length) {
                    const suggestion = serieSuggestions[activeSerieSuggestion];
                    setTmdbSearchValue(suggestion.name);
                    setShowSerieSuggestions(false);
                    setSerieSuggestions([]);
                    // NE PAS IMPORT AUTOMATIQUE, attendre bouton
                  }
                }
              }}
              className="rounded-lg border border-neutral-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-300/40 px-2 py-1 bg-gray-800 text-white w-full text-xs transition-shadow"
              placeholder="Titre de la série"
              disabled={loading}
            />
            {showSerieSuggestions && tmdbSearchValue && (
              <ul
                className="absolute z-30 w-full bg-gray-900 border border-gray-700 mt-1 rounded shadow max-h-44 overflow-y-auto"
                role="listbox"
                aria-label="Suggestions de séries"
              >
                {serieLoading ? (
                  <li className="p-2 text-sm text-gray-400">Chargement…</li>
                ) : (
                  <>
                    {serieSuggestions.map((suggestion, idx) => (
                      <li
                        key={suggestion.id}
                        className={`p-2 cursor-pointer hover:bg-blue-600/70 transition-colors ${activeSerieSuggestion === idx ? "bg-blue-600/80 text-white" : ""}`}
                        role="option"
                        aria-selected={activeSerieSuggestion === idx ? "true" : "false"}
                        onMouseEnter={() => setActiveSerieSuggestion(idx)}
                        onMouseDown={e => {
                          e.preventDefault();
                          setActiveSerieSuggestion(idx);
                          setTmdbSearchValue(suggestion.name);
                          setShowSerieSuggestions(false);
                        }}
                      >
                        <span className="font-medium">{suggestion.name}</span>
                        {suggestion.first_air_date && (
                          <span className="text-xs text-gray-400 ml-1">({suggestion.first_air_date.slice(0, 4)})</span>
                        )}
                      </li>
                    ))}
                    {serieSuggestions.length === 0 && (
                      <li className="p-2 text-sm text-gray-400">Aucune série trouvée…</li>
                    )}
                  </>
                )}
              </ul>
            )}
          </div>
          <Button
            type="button"
            className="ml-1 flex-shrink-0 text-xs py-1 px-2 transition rounded-lg"
            variant="outline"
            onClick={async () => {
              // On importe la suggestion sélectionnée, ou la première suggestion, ou on fait une recherche directe
              let toImport = null;
              if (activeSerieSuggestion >= 0 && serieSuggestions[activeSerieSuggestion]) {
                toImport = serieSuggestions[activeSerieSuggestion];
              } else if (serieSuggestions.length > 0) {
                toImport = serieSuggestions[0];
              }
              if (toImport) {
                await importSerieFromTMDB(toImport);
              } else if (tmdbSearchValue.trim().length > 0) {
                // Recherche directe si aucun résultat de suggestion
                setLoading(true);
                try {
                  const resp = await fetch(`/api/tmdb/tv-search?query=${encodeURIComponent(tmdbSearchValue.trim())}`);
                  const data = await resp.json();
                  if (data.results && data.results.length > 0) {
                    await importSerieFromTMDB(data.results[0]);
                  } else {
                    toast({
                      title: "Introuvable TMDB",
                      description: "Aucune série trouvée pour cette recherche.",
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
            disabled={loading || !tmdbSearchValue.trim()}
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
          style={{ minHeight: 0, display: "flex", flexDirection: "column" }}
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
          {/* ... (tous les autres champs du formulaire inchangés ici) ... */}
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
          {/* Action buttons placed as the last child for robust submit */}
          <div className="sticky bottom-0 z-30 bg-gradient-to-t from-gray-900 via-gray-900/80 to-transparent pt-1 pb-2 px-2 rounded-b-2xl flex gap-2 justify-end shadow mt-2">
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
              variant="default"
              disabled={loading}
              aria-label="Enregistrer la série"
              className="text-xs py-1 px-2"
            >
              {loading ? "..." : "Enregistrer"}
            </Button>
          </div>
        </form>
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