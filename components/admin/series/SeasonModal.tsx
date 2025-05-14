import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

/**
 * Amélioration : robustesse du champ numéro de saison (number >= 1)
 */

export default function SeasonModal({
  open,
  onClose,
  onSave,
  initialData = {},
  seriesTitle = "",
  tmdbSeriesId = "",
}) {
  const [form, setForm] = useState({
    title: initialData.title || "",
    // Toujours string pour les inputs contrôlés
    season_number:
      initialData.season_number !== undefined && initialData.season_number !== null
        ? String(initialData.season_number)
        : "",
    air_date: initialData.air_date || "",
    episode_count:
      initialData.episode_count !== undefined && initialData.episode_count !== null
        ? String(initialData.episode_count)
        : "",
    poster: initialData.poster || "",
    tmdb_id: initialData.tmdb_id || "",
    description: initialData.description || "",
    genres: Array.isArray(initialData.genres)
      ? initialData.genres
      : (typeof initialData.genre === "string"
        ? initialData.genre.split(",").map((g) => g.trim())
        : []),
    genresInput: "",
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [k: string]: string }>({});
  const [tmdbSearch, setTmdbSearch] = useState(
    (seriesTitle ? seriesTitle + " " : "") +
      (initialData.season_number ? `Saison ${initialData.season_number}` : "")
  );
  const firstInput = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (open && firstInput.current) {
      firstInput.current.focus();
    }
    setErrors({});
    setForm((prev) => ({
      ...prev,
      title: initialData.title || "",
      season_number:
        initialData.season_number !== undefined && initialData.season_number !== null
          ? String(initialData.season_number)
          : "",
      air_date: initialData.air_date || "",
      episode_count:
        initialData.episode_count !== undefined && initialData.episode_count !== null
          ? String(initialData.episode_count)
          : "",
      poster: initialData.poster || "",
      tmdb_id: initialData.tmdb_id || "",
      description: initialData.description || "",
      genres: Array.isArray(initialData.genres)
        ? initialData.genres
        : (typeof initialData.genre === "string"
          ? initialData.genre.split(",").map((g) => g.trim())
          : []),
      genresInput: "",
    }));
    setTmdbSearch(
      (seriesTitle ? seriesTitle + " " : "") +
        (initialData.season_number ? `Saison ${initialData.season_number}` : "")
    );
    // eslint-disable-next-line
  }, [open, initialData, seriesTitle]);

  // Gère le changement de champs : laisse l'utilisateur saisir librement, contrôle à la validation
  const handleChange = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  };

  const validate = () => {
    const err: { [k: string]: string } = {};
    if (!form.title || !form.title.trim())
      err.title = "Le titre est requis";
    // Pour le numéro de saison : doit être un entier >=1
    if (
      form.season_number === "" ||
      isNaN(Number(form.season_number)) ||
      !/^\d+$/.test(form.season_number) ||
      Number(form.season_number) < 1
    )
      err.season_number = "Numéro de saison requis (entier positif)";
    // Pour le nombre d'épisodes : doit être un entier >=0 (optionnel)
    if (
      form.episode_count &&
      (isNaN(Number(form.episode_count)) || !/^\d+$/.test(form.episode_count) || Number(form.episode_count) < 0)
    )
      err.episode_count = "Nombre d'épisodes invalide";
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
        // Conversion sûre
        season_number: form.season_number === "" ? "" : Number(form.season_number),
        episode_count:
          form.episode_count === "" || form.episode_count === undefined
            ? ""
            : Number(form.episode_count),
        genres: Array.isArray(form.genres)
          ? form.genres
          : typeof form.genres === "string"
            ? form.genres.split(",").map((g) => g.trim())
            : [],
      };
      await onSave(submitData);
      toast({ title: "Saison enregistrée" });
      onClose();
    } catch (e) {
      toast({ title: "Erreur", description: String(e), variant: "destructive" });
    }
    setLoading(false);
  };

  // Import TMDB intelligent pour une saison
  const handleTMDBImport = async () => {
    if (!tmdbSeriesId || !form.season_number) {
      toast({
        title: "Renseignez le numéro de saison et l'ID TMDB de la série",
        variant: "destructive",
      });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        `/api/tmdb/season/${encodeURIComponent(tmdbSeriesId)}/${encodeURIComponent(form.season_number)}`
      );
      if (!res.ok) throw new Error("Erreur réseau TMDB");
      const detail = await res.json();
      if (detail && detail.id) {
        setForm((f) => ({
          ...f,
          title: detail.name || f.title,
          description: detail.overview || f.description,
          poster: detail.poster_path
            ? `https://image.tmdb.org/t/p/w500${detail.poster_path}`
            : f.poster,
          air_date: detail.air_date || f.air_date,
          tmdb_id: detail.id,
          episode_count: detail.episodes ? String(detail.episodes.length) : (detail.episode_count ? String(detail.episode_count) : f.episode_count),
        }));
        toast({
          title: "Import TMDB réussi",
          description: "Saison préremplie depuis TMDB !",
        });
      } else {
        toast({
          title: "Introuvable TMDB",
          description: "Aucune saison trouvée pour ces paramètres.",
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
  };

  if (!open) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity duration-200 ${
        open ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="season-modal-title"
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
          <h2 className="text-base font-bold tracking-tight text-white/90" id="season-modal-title">
            {initialData.id ? "Modifier la saison" : "Ajouter une saison"}
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
              Importer depuis TMDB (ID série requis)
            </label>
            <div className="flex gap-1">
              <input
                id="tmdb_import"
                value={form.season_number}
                onChange={e => handleChange("season_number", e.target.value)}
                className="rounded-lg border border-neutral-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-300/40 px-2 py-1 bg-gray-800 text-white w-16 text-xs transition-shadow"
                placeholder="N°"
                type="number"
                inputMode="numeric"
                step="1"
                min={1}
                pattern="[0-9]*"
                autoComplete="off"
              />
              <Button
                type="button"
                className="flex-shrink-0 text-xs py-1 px-2 transition rounded-lg"
                variant="outline"
                onClick={handleTMDBImport}
                disabled={loading || !tmdbSeriesId || !form.season_number}
                aria-label="Importer cette saison depuis TMDB"
              >
                {loading ? (
                  <svg className="animate-spin h-4 w-4 mr-1 text-indigo-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-60" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                  </svg>
                ) : "Importer"}
              </Button>
            </div>
          </div>
        </div>
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
          <div className="flex flex-col sm:flex-row gap-1">
            <div className="flex-1">
              <label htmlFor="season_number" className="block text-[11px] font-medium text-white/80">
                Numéro de saison <span className="text-red-500">*</span>
              </label>
              <input
                id="season_number"
                type="number"
                inputMode="numeric"
                step="1"
                min="1"
                pattern="[0-9]*"
                autoComplete="off"
                value={form.season_number}
                onChange={(e) => handleChange("season_number", e.target.value)}
                className={`mt-0.5 w-full rounded-lg border border-neutral-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-300/40 px-2 py-1 bg-gray-800 text-white text-xs transition-shadow ${
                  errors.season_number ? "border-red-500" : ""
                }`}
              />
              {errors.season_number && (
                <div className="text-xs text-red-400 mt-0.5">{errors.season_number}</div>
              )}
            </div>
            <div className="flex-1">
              <label htmlFor="episode_count" className="block text-[11px] font-medium text-white/80">
                Nb épisodes
              </label>
              <input
                id="episode_count"
                type="number"
                value={form.episode_count}
                onChange={(e) => handleChange("episode_count", e.target.value)}
                className={`mt-0.5 w-full rounded-lg border border-neutral-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-300/40 px-2 py-1 bg-gray-800 text-white text-xs transition-shadow ${
                  errors.episode_count ? "border-red-500" : ""
                }`}
                min="0"
              />
              {errors.episode_count && (
                <div className="text-xs text-red-400 mt-0.5">{errors.episode_count}</div>
              )}
            </div>
          </div>
          <div>
            <label htmlFor="air_date" className="block text-[11px] font-medium text-white/80">
              Date de diffusion
            </label>
            <input
              id="air_date"
              type="date"
              value={form.air_date}
              onChange={(e) => handleChange("air_date", e.target.value)}
              className="mt-0.5 w-full rounded-lg border border-neutral-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-300/40 px-2 py-1 bg-gray-800 text-white text-xs transition-shadow"
            />
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
          <div className="flex gap-1 items-end">
            <div className="flex-1">
              <label htmlFor="tmdb_id" className="block text-[11px] font-medium text-white/80">
                TMDB ID
              </label>
              <input
                id="tmdb_id"
                value={form.tmdb_id}
                onChange={(e) => handleChange("tmdb_id", e.target.value)}
                className="mt-0.5 w-full rounded-lg border border-neutral-700 px-2 py-1 bg-gray-800 text-white text-xs"
                placeholder="Ex: 1234"
                type="number"
                min={1}
              />
            </div>
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
            form="season-form"
            variant="success"
            disabled={loading}
            aria-label="Enregistrer la saison"
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