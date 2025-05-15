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
  initialData = {},
  seriesTitle = "",
  tmdbSeriesId = "",
  parentSeasonNumber = "",
}) {
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
    tmdb_id: initialData.tmdb_id || "",
    description: initialData.description || "",
    published: !!initialData.published,
    isvip: !!initialData.isvip,
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [k: string]: string }>({});
  const [tmdbSearch, setTmdbSearch] = useState(
    (seriesTitle ? seriesTitle + " " : "") +
      (parentSeasonNumber ? `Saison ${parentSeasonNumber} ` : "") +
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
        tmdb_id: initialData.tmdb_id || "",
        description: initialData.description || "",
        published: !!initialData.published,
        isvip: !!initialData.isvip,
      });
      setTmdbSearch(
        (seriesTitle ? seriesTitle + " " : "") +
          (parentSeasonNumber ? `Saison ${parentSeasonNumber} ` : "") +
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
        tmdb_id: "",
        description: "",
        published: false,
        isvip: false,
      });
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
    if (field === "thumbnail_url") setTmdbError(null);
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
      // Nettoyage des champs
      const clean = (v: any) => (v === "" || v === undefined ? null : v);
      const submitData = {
        ...form,
        episode_number: clean(form.episode_number) !== null ? Number(form.episode_number) : null,
        tmdb_id: clean(form.tmdb_id) !== null ? Number(form.tmdb_id) : null,
        air_date: clean(form.air_date),
        thumbnail_url: clean(form.thumbnail_url),
        title: clean(form.title),
        description: clean(form.description),
        published: !!form.published,
        isvip: !!form.isvip,
      };
      await onSave(submitData);
      toast({ title: "Épisode enregistré" });
      onClose();
    } catch (e) {
      toast({ title: "Erreur", description: String(e), variant: "destructive" });
    }
    setLoading(false);
  };

  // Import TMDB pour un épisode
  const handleTMDBImport = async () => {
    setTmdbError(null);
    if (!tmdbSeriesId || !parentSeasonNumber || !form.episode_number) {
      setTmdbError("Renseignez l'ID TMDB de la série, la saison et le numéro d'épisode.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        `/api/tmdb/episode/${encodeURIComponent(tmdbSeriesId)}/${encodeURIComponent(
          parentSeasonNumber
        )}/${encodeURIComponent(form.episode_number)}`
      );
      if (!res.ok) throw new Error("Erreur réseau TMDB");
      const detail = await res.json();
      if (detail && detail.id) {
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
        {/* TMDB import zone */}
        <div className="flex gap-1 items-end px-3 pt-1">
          <div className="flex-1">
            <label htmlFor="tmdb_import" className="block text-[11px] mb-1 text-white/70 font-medium">
              Importer depuis TMDB (ID série, saison & n° épisode requis)
            </label>
            <div className="flex gap-1">
              <input
                id="num_saison"
                value={parentSeasonNumber}
                disabled
                className="rounded-lg border border-neutral-700 px-2 py-1 bg-gray-800 text-white w-14 text-xs opacity-70"
                placeholder="Saison"
                type="number"
                readOnly
              />
              <input
                id="num_episode"
                value={form.episode_number}
                onChange={e => handleChange("episode_number", e.target.value)}
                className="rounded-lg border border-neutral-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-300/40 px-2 py-1 bg-gray-800 text-white w-14 text-xs transition-shadow"
                placeholder="N° ep"
                type="number"
                min={1}
                disabled={loading}
              />
              <Button
                type="button"
                className="flex-shrink-0 text-xs py-1 px-2 transition rounded-lg"
                variant="outline"
                onClick={handleTMDBImport}
                disabled={
                  loading ||
                  !tmdbSeriesId ||
                  !parentSeasonNumber ||
                  !form.episode_number
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
          <div className="flex gap-1 items-end">
            <div className="flex-1">
              <label htmlFor="tmdb_id" className="block text-[11px] font-medium text-white/80">
                TMDB ID
              </label>
              <input
                id="tmdb_id"
                value={form.tmdb_id}
                onChange={(e) => handleChange("tmdb_id", e.target.value)}
                className={`mt-0.5 w-full rounded-lg border border-neutral-700 px-2 py-1 bg-gray-800 text-white text-xs ${
                  errors.tmdb_id ? "border-red-500" : ""
                }`}
                placeholder="Ex: 56789"
                type="number"
                min={1}
                disabled={loading}
                aria-label="TMDB ID"
              />
              {errors.tmdb_id && (
                <div className="text-xs text-red-400 mt-0.5">{errors.tmdb_id}</div>
              )}
            </div>
          </div>
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