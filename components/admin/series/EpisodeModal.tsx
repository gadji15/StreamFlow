import React, { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

// Validation simple d'URL d'image
function isValidImageUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return /^https?:/.test(u.protocol) && /\.(jpe?g|png|gif|webp|bmp|svg)$/i.test(u.pathname);
  } catch {
    return false;
  }
}

export default function EpisodeModal({
  open,
  onClose,
  onSave,
  initialData,
  seriesTitle = "",
  tmdbSeriesId = "",
  parentSeasonNumber = "",
}) {
  // Protection : si initialData est null ou undefined, on force un objet vide
  initialData = initialData || {};
  // Vérification stricte de parentSeasonNumber
  const validParentSeasonNumber = parentSeasonNumber !== undefined && parentSeasonNumber !== null && parentSeasonNumber !== ""
    ? String(parentSeasonNumber)
    : "";

  // Form state
  const [form, setForm] = useState({
    id: initialData.id,
    title: initialData.title || "",
    episode_number:
      initialData.episode_number !== undefined && initialData.episode_number !== null
        ? String(initialData.episode_number)
        : "",
    air_date: initialData.air_date || "",
    thumbnail_url: initialData.thumbnail_url || "",
    video_url: initialData.video_url || "",
    trailer_url: initialData.trailer_url || "",
    tmdb_id: initialData.tmdb_id || "",
    description: initialData.description || "",
    published: !!initialData.published,
    isvip: !!initialData.isvip,
    video_unavailable: !!initialData.video_unavailable,
    tmdb_series_id: tmdbSeriesId || initialData.tmdb_series_id || "",
    local_video_file: null,
    parentSeasonNumber: validParentSeasonNumber, // Ajout dans le form state pour cohérence
  });

  // Pour la recherche TMDB série (autocomplete)
  const [serieSearch, setSerieSearch] = useState("");
  const [serieSuggestions, setSerieSuggestions] = useState<any[]>([]);
  const [serieLoading, setSerieLoading] = useState(false);
  const [showSerieSuggestions, setShowSerieSuggestions] = useState(false);
  const [activeSerieSuggestion, setActiveSerieSuggestion] = useState(-1);

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [k: string]: string }>({});
  const [tmdbSearch, setTmdbSearch] = useState(
    (seriesTitle ? seriesTitle + " " : "") +
      (validParentSeasonNumber ? `Saison ${validParentSeasonNumber} ` : "") +
      (initialData.episode_number ? `Épisode ${initialData.episode_number}` : "")
  );
  const [tmdbError, setTmdbError] = useState<string | null>(null);

  const firstInput = useRef<HTMLInputElement>(null);
  const wasOpen = useRef(false);
  const { toast } = useToast();

  // Pour fermer la modal uniquement sur overlay
  const handleOverlayClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) onClose();
    },
    [onClose]
  );

  // Gestion ESC
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    // Reset à l'ouverture/fermeture
    if (open && (!wasOpen.current || initialData?.id !== form?.id)) {
      setErrors({});
      setTmdbError(null);
      setForm({
        id: initialData.id,
        title: initialData.title || "",
        episode_number:
          initialData.episode_number !== undefined && initialData.episode_number !== null
            ? String(initialData.episode_number)
            : "",
        air_date: initialData.air_date || "",
        thumbnail_url: initialData.thumbnail_url || "",
        video_url: initialData.video_url || "",
        trailer_url: initialData.trailer_url || "",
        tmdb_id: initialData.tmdb_id || "",
        description: initialData.description || "",
        published: !!initialData.published,
        isvip: !!initialData.isvip,
        video_unavailable: !!initialData.video_unavailable,
        tmdb_series_id: tmdbSeriesId || initialData.tmdb_series_id || "",
        local_video_file: null,
        parentSeasonNumber: validParentSeasonNumber,
      });
      setTmdbSearch(
        (seriesTitle ? seriesTitle + " " : "") +
          (validParentSeasonNumber ? `Saison ${validParentSeasonNumber} ` : "") +
          (initialData.episode_number ? `Épisode ${initialData.episode_number}` : "")
      );
      if (firstInput.current) {
        setTimeout(() => firstInput.current && firstInput.current.focus(), 0);
      }
    }
    if (!open && wasOpen.current) {
      setForm({
        title: "",
        episode_number: "",
        air_date: "",
        thumbnail_url: "",
        video_url: "",
        trailer_url: "",
        tmdb_id: "",
        description: "",
        published: false,
        isvip: false,
        video_unavailable: false,
        tmdb_series_id: "",
        local_video_file: null,
        parentSeasonNumber: "",
      });
      setSerieSearch("");
      setSerieSuggestions([]);
      setActiveSerieSuggestion(-1);
      setShowSerieSuggestions(false);
      setErrors({});
      setTmdbSearch("");
      setTmdbError(null);
    }
    wasOpen.current = open;
    // eslint-disable-next-line
  }, [open, initialData?.id, seriesTitle, parentSeasonNumber]);

  const handleChange = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
    if (field === "thumbnail_url" || field === "video_url" || field === "trailer_url") setTmdbError(null);
    if (field === "local_video_file" && value) {
      // Si upload local, vider video_url
      setForm(f => ({ ...f, video_url: "" }));
    }
    if (field === "video_url" && value) {
      // Si lien vidéo, vider upload local
      setForm(f => ({ ...f, local_video_file: null }));
    }
  };

  const validate = () => {
    const err: { [k: string]: string } = {};
    if (!form.title || !form.title.trim())
      err.title = "Le titre est requis";
    if (
      form.episode_number === "" ||
      isNaN(Number(form.episode_number)) ||
      !/^\d+$/.test(form.episode_number) ||
      Number(form.episode_number) < 1
    )
      err.episode_number = "Numéro d'épisode requis (entier positif)";
    // TMDB ID facultatif mais si présent doit être numérique positif
    if (form.tmdb_id && (isNaN(Number(form.tmdb_id)) || Number(form.tmdb_id) < 1)) {
      err.tmdb_id = "Le TMDB ID doit être un entier positif ou vide.";
    }
    // Vérification URL image
    if (form.thumbnail_url && !isValidImageUrl(form.thumbnail_url)) {
      err.thumbnail_url = "URL d'image invalide (jpg, png, gif, webp, bmp, svg)";
    }
    // Vérification URL vidéo principale
    if (form.video_url && !/^https?:\/\/.+/.test(form.video_url)) {
      err.video_url = "URL de la vidéo invalide";
    }
    // Vérification URL trailer
    if (form.trailer_url && !/^https?:\/\/.+/.test(form.trailer_url)) {
      err.trailer_url = "URL du trailer invalide";
    }
    // Vérification fichier vidéo local
    if (form.local_video_file && form.local_video_file.type && !/^video\/(mp4|webm|ogg)$/i.test(form.local_video_file.type)) {
      err.local_video_file = "Format vidéo non supporté (mp4, webm, ogg)";
    }
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

    // Vérification côté client de l'unicité du numéro d'épisode pour la saison
    try {
      const { data: existing, error } = await supabase
        .from("episodes")
        .select("id")
        .eq("parent_season_number", form.parentSeasonNumber)
        .eq("episode_number", Number(form.episode_number));
      if (
        existing &&
        existing.length > 0 &&
        (!form.id || !existing.some(e => e.id === form.id))
      ) {
        setErrors(prev => ({
          ...prev,
          episode_number: "Un épisode avec ce numéro existe déjà dans cette saison.",
        }));
        toast({
          title: "Doublon",
          description: "Un épisode avec ce numéro existe déjà dans cette saison.",
          variant: "destructive",
        });
        return;
      }
    } catch (e) {
      // Si l'appel à la base échoue, on peut continuer, la contrainte sera levée côté serveur.
    }

    setLoading(true);
    try {
      // Nettoyage des champs
      const clean = (v: any) => (v === "" || v === undefined ? null : v);
      // Nettoyer explicitement tous les champs non présents en base (plus de "order" !)
      const {
        local_video_file,
        parentSeasonNumber,
        thumbnail_url, // va être nettoyé plus bas
        video_url,     // idem
        trailer_url,   // idem
        ...restForm
      } = form;

      // Seuls les champs explicitement listés sont envoyés à la base
      const submitData = {
        episode_number: clean(form.episode_number) !== null ? Number(form.episode_number) : null,
        tmdb_id: clean(form.tmdb_id) !== null ? Number(form.tmdb_id) : null,
        air_date: clean(form.air_date),
        thumbnail_url: clean(thumbnail_url),
        video_url: clean(video_url),
        trailer_url: clean(trailer_url),
        title: clean(form.title),
        description: clean(form.description),
        published: !!form.published,
        isvip: !!form.isvip,
        video_unavailable: !!form.video_unavailable,
        tmdb_series_id: clean(form.tmdb_series_id),
        sort_order: clean(form.sort_order) !== null ? Number(form.sort_order) : null,
        // autres champs persistants de la table (si besoin : ajouter ici)
      };
      await onSave(submitData);
      toast({ title: "Épisode enregistré" });
      onClose();
    } catch (e) {
      // Gestion spécifique du code d'erreur 23505 (doublon)
      if (e.code === "23505" || (e.message && e.message.includes("duplicate key"))) {
        setErrors(prev => ({
          ...prev,
          episode_number: "Un épisode avec ce numéro existe déjà dans cette saison.",
        }));
        toast({
          title: "Doublon",
          description: "Un épisode avec ce numéro existe déjà dans cette saison.",
          variant: "destructive",
        });
      } else {
        toast({ title: "Erreur", description: String(e), variant: "destructive" });
      }
    }
    setLoading(false);
  };

  // Import TMDB pour un épisode
  const handleTMDBImport = async () => {
    setTmdbError(null);

    // Vérification explicite de la présence de parentSeasonNumber
    if (!form.tmdb_series_id) {
      setTmdbError("Veuillez sélectionner une série via la recherche TMDB.");
      return;
    }
    if (!form.parentSeasonNumber) {
      setTmdbError("Numéro de saison parent absent ou invalide. Veuillez réouvrir la modale depuis la bonne saison.");
      return;
    }
    if (!form.episode_number) {
      setTmdbError("Veuillez saisir le numéro d'épisode.");
      return;
    }

    // Pour debuggage (désactiver en prod)
    // console.log("DEBUG TMDB import params", {
    //   tmdb_series_id: form.tmdb_series_id,
    //   parentSeasonNumber: form.parentSeasonNumber,
    //   episode_number: form.episode_number,
    // });

    // DEBUG LOG : affiche les paramètres du fetch TMDB épisode
    console.log('IMPORT TMDB DEBUG', {
      tmdb_series_id: form.tmdb_series_id,
      parentSeasonNumber: form.parentSeasonNumber,
      episode_number: form.episode_number,
      fetch_url: `/api/tmdb/episode/${encodeURIComponent(form.tmdb_series_id)}/${encodeURIComponent(
        form.parentSeasonNumber
      )}/${encodeURIComponent(form.episode_number)}`
    });

    setLoading(true);
    try {
      const res = await fetch(
        `/api/tmdb/episode/${encodeURIComponent(form.tmdb_series_id)}/${encodeURIComponent(
          form.parentSeasonNumber
        )}/${encodeURIComponent(form.episode_number)}`
      );
      if (!res.ok) throw new Error("Erreur réseau TMDB");
      const detail = await res.json();
      if (detail && detail.id) {
        let trailerUrl = "";
        let videoUrl = "";
        if (detail.videos && Array.isArray(detail.videos.results)) {
          const ytTrailer = detail.videos.results.find(
            v =>
              v.type === "Trailer" &&
              v.site === "YouTube" &&
              v.key
          );
          if (ytTrailer) {
            trailerUrl = `https://www.youtube.com/watch?v=${ytTrailer.key}`;
          }
        }
        setForm((f) => ({
          ...f,
          title: detail.name || f.title,
          description: detail.overview || f.description,
          air_date: detail.air_date || f.air_date,
          tmdb_id: detail.id,
          episode_number: detail.episode_number ? String(detail.episode_number) : f.episode_number,
          thumbnail_url: detail.still_path
            ? `https://image.tmdb.org/t/p/w500${detail.still_path}`
            : f.thumbnail_url,
          trailer_url: trailerUrl || f.trailer_url,
          video_url: videoUrl || f.video_url,
        }));
        toast({
          title: "Import TMDB réussi",
          description: "Épisode prérempli depuis TMDB !",
        });
      } else {
        setTmdbError("Aucun épisode trouvé pour ces paramètres.");
      }
    } catch (e) {
      setTmdbError("Erreur TMDB ou connexion.");
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
      aria-labelledby="episode-modal-title"
      tabIndex={-1}
      onClick={handleOverlayClick}
    >
      <div
        className="animate-[fadeInScale_0.25s_ease] bg-gradient-to-br from-gray-900 via-gray-900/95 to-gray-800 rounded-2xl shadow-2xl border border-neutral-800 w-full max-w-xs sm:max-w-sm md:max-w-md relative flex flex-col"
        style={{
          maxHeight: "70vh",
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-30 bg-transparent pt-2 pb-1 px-3 rounded-t-2xl flex items-center justify-between">
          <h2 className="text-base font-bold tracking-tight text-white/90" id="episode-modal-title">
            {initialData.id ? "Modifier l'épisode" : "Ajouter un épisode"}
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
        {/* TMDB import zone - harmonisée avec SeasonModal */}
        <div className="flex flex-col gap-1 px-3 pt-1">
          {/* Affichage d'un avertissement si le numéro de saison parent est absent */}
          {(!validParentSeasonNumber || validParentSeasonNumber === "") && (
            <div className="mb-2 text-xs text-red-400 font-semibold">
              ⚠️ Impossible d'importer un épisode sans contexte de saison. Veuillez ouvrir la modale depuis une saison.
            </div>
          )}
          {/* Recherche série TMDB, logique identique à SeasonModal */}
          {!tmdbSeriesId && !initialData.tmdb_series_id && (
            <div className="mb-2 relative">
              <label htmlFor="serie_tmdb_search" className="block text-[11px] mb-1 text-white/70 font-medium">
                Rechercher la série sur TMDB
              </label>
              <input
                id="serie_tmdb_search"
                value={serieSearch}
                onChange={async e => {
                  setSerieSearch(e.target.value);
                  setShowSerieSuggestions(true);
                  setSerieSuggestions([]);
                  setActiveSerieSuggestion(-1);
                  if (e.target.value.length > 2) {
                    setSerieLoading(true);
                    try {
                      const resp = await fetch(`/api/tmdb/tv-search?query=${encodeURIComponent(e.target.value)}`);
                      const data = await resp.json();
                      setSerieSuggestions(data.results || []);
                    } catch { setSerieSuggestions([]); }
                    setSerieLoading(false);
                  }
                }}
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
                      setForm(f => ({
                        ...f,
                        tmdb_series_id: String(suggestion.id)
                      }));
                      setSerieSearch(suggestion.name);
                      setSerieSuggestions([]);
                      setShowSerieSuggestions(false);
                    }
                  }
                }}
                className="rounded-lg border border-neutral-700 px-2 py-1 bg-gray-800 text-white text-xs w-full mb-1"
                placeholder="Nom de la série"
                autoComplete="off"
                aria-label="Recherche série TMDB"
                disabled={loading}
              />
              {showSerieSuggestions && !!serieSearch && (
                <ul
                  className="absolute z-20 w-full bg-gray-900 border border-gray-700 mt-1 rounded shadow max-h-44 overflow-y-auto"
                  role="listbox"
                  aria-label="Suggestions de séries"
                >
                  {serieLoading && (
                    <li className="p-2 text-sm text-gray-400">Chargement…</li>
                  )}
                  {serieSuggestions.map((suggestion, idx) => (
                    <li
                      key={suggestion.id}
                      className={`p-2 cursor-pointer hover:bg-blue-600/70 transition-colors ${activeSerieSuggestion === idx ? "bg-blue-600/80 text-white" : ""}`}
                      role="option"
                      aria-selected={activeSerieSuggestion === idx}
                      tabIndex={0}
                      onClick={() => {
                        setForm(f => ({
                          ...f,
                          tmdb_series_id: String(suggestion.id)
                        }));
                        setSerieSearch(suggestion.name);
                        setSerieSuggestions([]);
                        setShowSerieSuggestions(false);
                      }}
                      onMouseEnter={() => setActiveSerieSuggestion(idx)}
                    >
                      <span className="font-medium">{suggestion.name}</span>
                      {suggestion.first_air_date && (
                        <span className="text-xs text-gray-400 ml-1">({suggestion.first_air_date.slice(0, 4)})</span>
                      )}
                    </li>
                  ))}
                  {!serieLoading && serieSuggestions.length === 0 && (
                    <li className="p-2 text-sm text-gray-400">Aucune série trouvée…</li>
                  )}
                </ul>
              )}
              {/* TMDB Series ID stocké caché */}
              <input
                id="serie_tmdb_id"
                value={form.tmdb_series_id}
                readOnly
                style={{ display: "none" }}
                tabIndex={-1}
              />
            </div>
          )}
          <div className="flex gap-1 items-end">
            <div className="flex-1">
              <label htmlFor="num_episode" className="block text-[11px] mb-1 text-white/70 font-medium">
                Numéro d'épisode <span className="text-red-500">*</span>
              </label>
              <input
                id="num_episode"
                value={form.episode_number}
                onChange={e => handleChange("episode_number", e.target.value)}
                className="rounded-lg border border-neutral-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-300/40 px-2 py-1 bg-gray-800 text-white w-24 text-xs transition-shadow"
                placeholder="N° ep"
                type="number"
                min={1}
                disabled={loading}
                aria-required="true"
              />
            </div>
            <Button
              type="button"
              className="flex-shrink-0 text-xs py-1 px-2 transition rounded-lg"
              variant="outline"
              onClick={handleTMDBImport}
              disabled={
                loading ||
                !form.tmdb_series_id ||
                !form.episode_number ||
                !validParentSeasonNumber // Désactive le bouton si le numéro de saison parent est manquant
              }
              aria-label="Importer cet épisode depuis TMDB"
            >
              {loading ? (
                <svg className="animate-spin h-4 w-4 mr-1 text-indigo-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-60" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                </svg>
              ) : "Importer"}
            </Button>
          </div>
          {tmdbError && (
            <div className="px-2 py-1 text-xs text-red-400">{tmdbError}</div>
          )}
        </div>
        <form
          id="episode-form"
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto px-3 pb-2 pt-1 space-y-1"
          style={{ minHeight: 0 }}
          autoComplete="off"
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
              disabled={loading}
            />
            {errors.title && (
              <div className="text-xs text-red-400 mt-0.5">{errors.title}</div>
            )}
          </div>
          <div className="flex flex-col sm:flex-row gap-1">
            <div className="flex-1">
              <label htmlFor="episode_number" className="block text-[11px] font-medium text-white/80">
                Numéro d'épisode <span className="text-red-500">*</span>
              </label>
              <input
                id="episode_number"
                type="number"
                inputMode="numeric"
                step="1"
                min="1"
                pattern="[0-9]*"
                autoComplete="off"
                value={form.episode_number}
                onChange={(e) => handleChange("episode_number", e.target.value)}
                className={`mt-0.5 w-full rounded-lg border border-neutral-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-300/40 px-2 py-1 bg-gray-800 text-white text-xs transition-shadow ${
                  errors.episode_number ? "border-red-500" : ""
                }`}
                disabled={loading}
                aria-label="Numéro d'épisode"
              />
              {errors.episode_number && (
                <div className="text-xs text-red-400 mt-0.5">{errors.episode_number}</div>
              )}
            </div>
            <div className="flex-1">
              <label htmlFor="air_date" className="block text-[11px] font-medium text-white/80">
                Date de diffusion
              </label>
              <input
                id="air_date"
                type="date"
                value={form.air_date}
                onChange={(e) => handleChange("air_date", e.target.value)}
                className="mt-0.5 w-full rounded-lg border border-neutral-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-300/40 px-2 py-1 bg-gray-800 text-white text-xs transition-shadow"
                disabled={loading}
                aria-label="Date de diffusion"
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
              disabled={loading}
              aria-label="Description de l'épisode"
            />
          </div>
          <div>
            <label htmlFor="thumbnail_url" className="block text-[11px] font-medium text-white/80">
              Image (URL)
            </label>
            <input
              id="thumbnail_url"
              value={form.thumbnail_url}
              onChange={(e) => handleChange("thumbnail_url", e.target.value)}
              className={`mt-0.5 w-full rounded-lg border border-neutral-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-300/40 px-2 py-1 bg-gray-800 text-white text-xs transition-shadow ${
                errors.thumbnail_url ? "border-red-500" : ""
              }`}
              placeholder="https://..."
              disabled={loading}
              aria-label="URL de l'image"
            />
            {errors.thumbnail_url && (
              <div className="text-xs text-red-400 mt-0.5">{errors.thumbnail_url}</div>
            )}
            {form.thumbnail_url && (
              <div className="flex flex-col items-start mt-1">
                <img
                  src={isValidImageUrl(form.thumbnail_url) ? form.thumbnail_url : "/no-image.png"}
                  alt="Aperçu miniature"
                  className="h-10 rounded shadow border border-gray-700"
                  style={{ maxWidth: "100%" }}
                  onError={e => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = "/no-image.png";
                  }}
                />
                <button
                  type="button"
                  className="text-[10px] text-red-400 hover:underline mt-1"
                  onClick={() => handleChange("thumbnail_url", "")}
                  disabled={loading}
                  aria-label="Supprimer l'image"
                >
                  Supprimer l'image
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
                disabled={loading}
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
                disabled={loading}
              />
              VIP
            </label>
          </div>

          {/* Champ vidéo principale + upload local + indisponibilité */}
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <label htmlFor="video_url" className="block text-[11px] font-medium text-white/80">
                Vidéo principale (URL ou upload)
              </label>
              <label className="flex items-center gap-1 cursor-pointer text-[11px] text-red-400 font-medium">
                <input
                  type="checkbox"
                  checked={form.video_unavailable}
                  onChange={e => handleChange("video_unavailable", e.target.checked)}
                  className="accent-rose-500"
                  aria-label="Vidéo non disponible"
                  disabled={loading}
                />
                Vidéo non disponible
              </label>
            </div>
            <div className="flex flex-col gap-1 mt-0.5">
              <input
                id="video_url"
                value={form.video_url}
                onChange={e => handleChange("video_url", e.target.value)}
                className={`rounded-lg border border-neutral-700 focus:border-indigo-500 px-2 py-1 bg-gray-800 text-white text-xs transition-shadow ${
                  errors.video_url ? "border-red-500" : ""
                }`}
                placeholder="https://..."
                disabled={loading || form.video_unavailable || !!form.local_video_file}
                aria-label="URL de la vidéo principale"
              />
              <input
                id="local_video_file"
                type="file"
                accept="video/mp4,video/webm,video/ogg"
                onChange={e => {
                  const file = e.target.files && e.target.files[0];
                  handleChange("local_video_file", file || null);
                }}
                className="block w-full text-xs text-gray-400 bg-gray-800 border border-neutral-700 rounded-lg px-2 py-1"
                disabled={loading || form.video_unavailable || !!form.video_url}
                aria-label="Uploader une vidéo locale"
              />
            </div>
            {errors.video_url && (
              <div className="text-xs text-red-400 mt-0.5">{errors.video_url}</div>
            )}
            {errors.local_video_file && (
              <div className="text-xs text-red-400 mt-0.5">{errors.local_video_file}</div>
            )}
            {/* Aperçu vidéo locale */}
            {form.local_video_file && !form.video_unavailable && (
              <div className="flex flex-col items-start mt-1">
                <video
                  src={form.local_video_file instanceof File ? URL.createObjectURL(form.local_video_file) : ""}
                  controls
                  className="h-20 rounded border border-gray-700"
                  style={{ maxWidth: "100%" }}
                />
                <button
                  type="button"
                  className="text-[10px] text-red-400 hover:underline mt-1"
                  onClick={() => handleChange("local_video_file", null)}
                  disabled={loading}
                  aria-label="Supprimer la vidéo locale"
                >
                  Supprimer la vidéo locale
                </button>
              </div>
            )}
            {/* Aperçu vidéo externe si pas de vidéo locale */}
            {form.video_url && !form.local_video_file && !form.video_unavailable && (
              <div className="flex flex-col items-start mt-1">
                {form.video_url.includes("youtube.com") || form.video_url.includes("youtu.be") ? (
                  <iframe
                    width="180"
                    height="101"
                    src={form.video_url.replace("watch?v=", "embed/")}
                    title="Aperçu vidéo"
                    frameBorder="0"
                    allowFullScreen
                    className="rounded border border-gray-700"
                  ></iframe>
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
                  onClick={() => handleChange("video_url", "")}
                  disabled={loading}
                  aria-label="Supprimer la vidéo"
                >
                  Supprimer la vidéo
                </button>
              </div>
            )}
            {form.video_unavailable && (
              <div className="mt-1 text-xs text-rose-400 font-medium">La vidéo n'est pas encore disponible pour cet épisode.</div>
            )}
          </div>

          {/* Champ trailer */}
          <div>
            <label htmlFor="trailer_url" className="block text-[11px] font-medium text-white/80">
              Trailer (URL)
            </label>
            <input
              id="trailer_url"
              value={form.trailer_url}
              onChange={e => handleChange("trailer_url", e.target.value)}
              className={`mt-0.5 w-full rounded-lg border border-neutral-700 focus:border-indigo-500 px-2 py-1 bg-gray-800 text-white text-xs transition-shadow ${
                errors.trailer_url ? "border-red-500" : ""
              }`}
              placeholder="https://..."
              disabled={loading}
              aria-label="URL du trailer"
            />
            {errors.trailer_url && (
              <div className="text-xs text-red-400 mt-0.5">{errors.trailer_url}</div>
            )}
            {form.trailer_url && (
              <div className="flex flex-col items-start mt-1">
                {form.trailer_url.includes("youtube.com") || form.trailer_url.includes("youtu.be") ? (
                  <iframe
                    width="180"
                    height="101"
                    src={form.trailer_url.replace("watch?v=", "embed/")}
                    title="Aperçu trailer"
                    frameBorder="0"
                    allowFullScreen
                    className="rounded border border-gray-700"
                  ></iframe>
                ) : form.trailer_url.match(/\.(mp4|webm|ogg)$/i) ? (
                  <video
                    src={form.trailer_url}
                    controls
                    className="h-20 rounded border border-gray-700"
                    style={{ maxWidth: "100%" }}
                  />
                ) : (
                  <a
                    href={form.trailer_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-indigo-400 underline"
                  >
                    Voir le trailer
                  </a>
                )}
                <button
                  type="button"
                  className="text-[10px] text-red-400 hover:underline mt-1"
                  onClick={() => handleChange("trailer_url", "")}
                  disabled={loading}
                  aria-label="Supprimer le trailer"
                >
                  Supprimer le trailer
                </button>
              </div>
            )}
          </div>

          {/* TMDB ID de l'épisode est maintenant totalement caché à l'utilisateur */}
          <input
            type="hidden"
            value={form.tmdb_id}
            readOnly
            tabIndex={-1}
            name="tmdb_id"
          />
        </form>
        <div className="sticky bottom-0 z-30 bg-gradient-to-t from-gray-900 via-gray-900/80 to-transparent pt-1 pb-2 px-2 rounded-b-2xl flex gap-2 justify-end shadow">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            aria-label="Annuler"
            className="text-xs py-1 px-2"
            disabled={loading}
          >
            Annuler
          </Button>
          <button
            type="submit"
            form="episode-form"
            disabled={loading}
            aria-label="Enregistrer l'épisode"
            className="text-xs py-1 px-2 bg-green-600 hover:bg-green-700 rounded-lg text-white font-semibold transition"
          >
            {loading ? "..." : "Enregistrer"}
          </button>
        </div>
        <div role="alert" aria-live="assertive" style={{ position: "absolute", left: -9999, top: "auto", width: "1px", height: "1px", overflow: "hidden" }}>
          {Object.values(errors).length > 0 ? Object.values(errors).join(" ") : ""}
          {tmdbError ? tmdbError : ""}
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
        input[disabled], textarea[disabled] {
          background: #222 !important;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}