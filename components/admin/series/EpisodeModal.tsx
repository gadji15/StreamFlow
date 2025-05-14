import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

export default function EpisodeModal({
  open,
  onClose,
  onSave,
  initialData = {},
  seriesTitle = "",
  tmdbSeriesId = "",
  parentSeasonNumber = "", // numéro de la saison parente (string ou number)
}) {
  const [form, setForm] = useState({
    title: initialData.title || "",
    episode_number: initialData.episode_number || "",
    air_date: initialData.air_date || "",
    thumbnail_url: initialData.thumbnail_url || "",
    tmdb_id: initialData.tmdb_id || "",
    description: initialData.description || "",
    published: !!initialData.published,
    isvip: !!initialData.isvip,
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [k: string]: string }>({});
  // Recherche TMDB préremplie avec le titre, saison & épisode si présents
  const [tmdbSearch, setTmdbSearch] = useState(
    (seriesTitle ? seriesTitle + " " : "") +
      (parentSeasonNumber ? `Saison ${parentSeasonNumber} ` : "") +
      (initialData.episode_number ? `Épisode ${initialData.episode_number}` : "")
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
      episode_number: initialData.episode_number || "",
      air_date: initialData.air_date || "",
      thumbnail_url: initialData.thumbnail_url || "",
      tmdb_id: initialData.tmdb_id || "",
      description: initialData.description || "",
      published: !!initialData.published,
      isvip: !!initialData.isvip,
    }));
    setTmdbSearch(
      (seriesTitle ? seriesTitle + " " : "") +
        (parentSeasonNumber ? `Saison ${parentSeasonNumber} ` : "") +
        (initialData.episode_number ? `Épisode ${initialData.episode_number}` : "")
    );
    // eslint-disable-next-line
  }, [open, initialData, seriesTitle, parentSeasonNumber]);

  const handleChange = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  };

  const validate = () => {
    const err: { [k: string]: string } = {};
    if (!form.title || !form.title.trim())
      err.title = "Le titre est requis";
    if (!form.episode_number || isNaN(Number(form.episode_number)))
      err.episode_number = "Numéro d'épisode requis";
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
      await onSave(form);
      toast({ title: "Épisode enregistré" });
      onClose();
    } catch (e) {
      toast({ title: "Erreur", description: String(e), variant: "destructive" });
    }
    setLoading(false);
  };

  // Import TMDB intelligent pour un épisode
  const handleTMDBImport = async () => {
    if (!tmdbSeriesId || !parentSeasonNumber || !form.episode_number) {
      toast({
        title: "Renseignez l'ID TMDB de la série, la saison et le numéro d'épisode",
        variant: "destructive",
      });
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
        toast({
          title: "Introuvable TMDB",
          description: "Aucun épisode trouvé pour ces paramètres.",
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
      aria-labelledby="episode-modal-title"
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
              />
              <Button
                type="button"
                className="flex-shrink-0 text-xs py-1 px-2 transition rounded-lg"
                variant="outline"
                onClick={handleTMDBImport}
                disabled={loading || !tmdbSeriesId || !parentSeasonNumber || !form.episode_number}
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
              <label htmlFor="episode_number" className="block text-[11px] font-medium text-white/80">
                Numéro d'épisode <span className="text-red-500">*</span>
              </label>
              <input
                id="episode_number"
                type="number"
                value={form.episode_number}
                onChange={(e) => handleChange("episode_number", e.target.value)}
                className={`mt-0.5 w-full rounded-lg border border-neutral-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-300/40 px-2 py-1 bg-gray-800 text-white text-xs transition-shadow ${
                  errors.episode_number ? "border-red-500" : ""
                }`}
                min="1"
              />
              {errors.episode_number && (
                <div className="text-xs text-red-400 mt-0.5">{errors.episode_number}</div>
              )}
            </div>
            <div className="flex-1">
              <label htmlFor="air_date" className="block text-[11px] font-medium text-white/80">
                Date diffusion
              </label>
              <input
                id="air_date"
                type="date"
                value={form.air_date}
                onChange={(e) => handleChange("air_date", e.target.value)}
                className="mt-0.5 w-full rounded-lg border border-neutral-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-300/40 px-2 py-1 bg-gray-800 text-white text-xs transition-shadow"
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
            <label htmlFor="thumbnail_url" className="block text-[11px] font-medium text-white/80">
              Image (URL)
            </label>
            <input
              id="thumbnail_url"
              value={form.thumbnail_url}
              onChange={(e) => handleChange("thumbnail_url", e.target.value)}
              className="mt-0.5 w-full rounded-lg border border-neutral-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-300/40 px-2 py-1 bg-gray-800 text-white text-xs transition-shadow"
              placeholder="https://..."
            />
            {form.thumbnail_url && (
              <div className="flex flex-col items-start mt-1">
                <img
                  src={form.thumbnail_url}
                  alt="Aperçu miniature"
                  className="h-10 rounded shadow border border-gray-700"
                  style={{ maxWidth: "100%" }}
                />
                <button
                  type="button"
                  className="text-[10px] text-red-400 hover:underline mt-1"
                  onClick={() => handleChange("thumbnail_url", "")}
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
              <input
                id="tmdb_id"
                value={form.tmdb_id}
                onChange={(e) => handleChange("tmdb_id", e.target.value)}
                className="mt-0.5 w-full rounded-lg border border-neutral-700 px-2 py-1 bg-gray-800 text-white text-xs"
                placeholder="Ex: 56789"
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
            form="episode-form"
            variant="success"
            disabled={loading}
            aria-label="Enregistrer l'épisode"
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