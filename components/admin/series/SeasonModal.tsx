import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

/**
 * Amélioration : robustesse du champ numéro de saison (number >= 1)
 */

import { supabase } from "@/lib/supabaseClient";

export default function SeasonModal({
  open,
  onClose,
  onSave,
  initialData = {},
  seriesTitle = "",
  tmdbSeriesId = "",
  seriesId, // Ajouté pour la vérification dupliqué
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

  // Pour feedback recherche TMDB saison par numéro
  const [seasonSearchLoading, setSeasonSearchLoading] = useState(false);
  const [seasonSearchError, setSeasonSearchError] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [k: string]: string }>({});
  const [tmdbSearch, setTmdbSearch] = useState(
    (seriesTitle ? seriesTitle + " " : "") +
      (initialData.season_number ? `Saison ${initialData.season_number}` : "")
  );
  const firstInput = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Stocker le nombre de saisons TMDB
  const [tmdbSeasonCount, setTmdbSeasonCount] = useState<number | null>(null);
  const [tmdbSeasonError, setTmdbSeasonError] = useState<string | null>(null);
  const [checkingDuplicate, setCheckingDuplicate] = useState(false);

  // Reset le formulaire UNIQUEMENT à l'ouverture ou quand on change de saison à éditer
  const wasOpen = useRef(false);
  useEffect(() => {
    // Si on vient d'ouvrir la modale, ou si on change de saison à éditer
    if (open && (!wasOpen.current || initialData?.id !== form?.id)) {
      setErrors({});
      setForm({
        ...form,
        // Pour édition, garder l'id caché dans le form si présent
        id: initialData.id,
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
      });
      setTmdbSearch(
        (seriesTitle ? seriesTitle + " " : "") +
          (initialData.season_number ? `Saison ${initialData.season_number}` : "")
      );
      // Focus input à l'ouverture
      if (firstInput.current) {
        setTimeout(() => firstInput.current && firstInput.current.focus(), 0);
      }
      // Charger le nombre de saisons TMDB si possible
      setTmdbSeasonCount(null);
      setTmdbSeasonError(null);
      if (tmdbSeriesId) {
        fetch(`/api/tmdb/series/${encodeURIComponent(tmdbSeriesId)}`)
          .then(res => res.ok ? res.json() : Promise.reject(res.statusText))
          .then(data => {
            if (data && Array.isArray(data.seasons)) {
              setTmdbSeasonCount(data.seasons.length);
            } else {
              setTmdbSeasonError("Impossible d'obtenir le nombre de saisons sur TMDB.");
            }
          })
          .catch(err => {
            setTmdbSeasonError("Erreur lors de la récupération TMDB.");
          });
      }
    }
    wasOpen.current = open;
    // eslint-disable-next-line
  }, [open, initialData?.id]);

  // Gère le changement de champs : laisse l'utilisateur saisir librement, contrôle à la validation
  const handleChange = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
    // Si l'admin change le numéro de saison, on vide l'ID TMDB et l'erreur associée (nouvelle recherche possible)
    if (field === "season_number") {
      setForm((f) => ({ ...f, tmdb_id: "" }));
      setSeasonSearchError(null);
    }
  };

  const validate = async () => {
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
    // Vérification anti-doublon à la création
    if (!initialData.id && form.season_number && seriesId) {
      const { data: existing } = await supabase
        .from("seasons")
        .select("id")
        .eq("series_id", seriesId)
        .eq("season_number", Number(form.season_number));
      if (existing && existing.length > 0) {
        err.season_number = "Une saison avec ce numéro existe déjà pour cette série.";
      }
    }
    return err;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = await validate();
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
  // Recherche TMDB de l'id de saison à partir du numéro (pour lier automatiquement)
  const handleFindSeasonTmdbId = async () => {
    console.log("handleFindSeasonTmdbId called!", { tmdbSeriesId, sn: form.season_number });
    setSeasonSearchError(null);
    setSeasonSearchLoading(true);

    if (!form.season_number || Number(form.season_number) < 1) {
      toast({
        title: "Erreur",
        description: "Veuillez saisir un numéro de saison strictement positif.",
        variant: "destructive",
      });
      setSeasonSearchLoading(false);
      return;
    }
    if (!tmdbSeriesId) {
      toast({
        title: "Erreur",
        description: "Impossible de rechercher la saison : l'ID TMDB de la série est manquant.",
        variant: "destructive",
      });
      setSeasonSearchLoading(false);
      return;
    }

    try {
      const res = await fetch(`/api/tmdb/series/${encodeURIComponent(tmdbSeriesId)}`);
      if (!res.ok) {
        toast({
          title: "Erreur TMDB",
          description: "Erreur de connexion à l'API TMDB.",
          variant: "destructive",
        });
        setSeasonSearchLoading(false);
        return;
      }
      const data = await res.json();
      const num = Number(form.season_number);
      if (!data || !Array.isArray(data.seasons)) {
        toast({
          title: "Erreur TMDB",
          description: "Impossible d'obtenir la liste des saisons TMDB (structure inattendue).",
          variant: "destructive",
        });
        setForm(f => ({ ...f, tmdb_id: "" }));
        setSeasonSearchLoading(false);
        return;
      }
      const found = data.seasons.find((s) => Number(s.season_number) === num);
      if (found && found.id) {
        setForm((f) => ({ ...f, tmdb_id: String(found.id) }));
        toast({
          title: "Saison trouvée",
          description: `ID TMDB de la saison ${num} : ${found.id}`,
        });
      } else {
        setForm((f) => ({ ...f, tmdb_id: "" }));
        toast({
          title: "Saison introuvable",
          description: `La saison n°${num} n'existe pas sur TMDB pour cette série.`,
          variant: "destructive",
        });
      }
    } catch (e: any) {
      toast({
        title: "Erreur",
        description: "Erreur TMDB ou connexion.",
        variant: "destructive",
      });
    } finally {
      setSeasonSearchLoading(false);
      console.log("handleFindSeasonTmdbId finished");
    }
  };

  // Import TMDB complet et anti-doublon
  const handleTMDBImport = async () => {
    // On utilise le tmdb_id du form (renseigné par la recherche) en priorité
    const tmdbIdToUse = tmdbSeriesId || form.tmdb_id;
    if (!tmdbIdToUse || !form.season_number) {
      toast({
        title: "Import impossible",
        description: "Renseignez l'ID TMDB de la série ET le numéro de saison.",
        variant: "destructive",
      });
      return;
    }
    // Vérification anti-doublon
    setCheckingDuplicate(true);
    const { data: existing, error } = await supabase
      .from("seasons")
      .select("id")
      .eq("series_id", seriesId)
      .eq("season_number", Number(form.season_number));
    setCheckingDuplicate(false);
    if (existing && existing.length > 0 && !initialData.id) {
      toast({
        title: "Doublon détecté",
        description: "Une saison avec ce numéro existe déjà pour cette série.",
        variant: "destructive",
      });
      return;
    }
    setLoading(true);
    try {
      // Utilisation de l'API backend qui prend le numéro, pas l'id de saison car c'est l'usage de l'endpoint
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
        {/* Indication du nombre de saisons TMDB */}
        <div className="px-3 pt-1 pb-0.5 text-xs font-medium">
          {tmdbSeasonCount !== null && (
            <span className="text-blue-300">
              Nombre de saisons disponibles sur TMDB : <b>{tmdbSeasonCount}</b>
            </span>
          )}
          {tmdbSeasonError && (
            <span className="text-red-400">Erreur TMDB : {tmdbSeasonError}</span>
          )}
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
                disabled={loading || checkingDuplicate || seasonSearchLoading}
              />
              <Button
                type="button"
                className="flex-shrink-0 text-xs py-1 px-2 transition rounded-lg"
                variant="outline"
                onClick={handleFindSeasonTmdbId}
                disabled={seasonSearchLoading || !form.season_number || Number(form.season_number) < 1}
                aria-label="Rechercher la saison sur TMDB"
              >
                {seasonSearchLoading ? (
                  <svg className="animate-spin h-4 w-4 mr-1 text-indigo-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-60" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                  </svg>
                ) : "Rechercher"}
              </Button>
              <Button
                type="button"
                className="flex-shrink-0 text-xs py-1 px-2 transition rounded-lg"
                variant="outline"
                onClick={handleTMDBImport}
                disabled={loading || !(tmdbSeriesId || form.tmdb_id) || !form.season_number || checkingDuplicate}
                aria-label="Importer cette saison depuis TMDB"
              >
                {(loading || checkingDuplicate) ? (
                  <svg className="animate-spin h-4 w-4 mr-1 text-indigo-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-60" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                  </svg>
                ) : "Importer"}
              </Button>
            </div>
          </div>
        </div>
        {/* Feedback recherche TMDB saison */}
        {seasonSearchError && (
          <div className="px-3 pb-1 text-xs text-red-400">{seasonSearchError}</div>
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
              TMDB ID (rempli automatiquement après recherche)
            </label>
            <input
              id="tmdb_id"
              value={form.tmdb_id}
              onChange={(e) => handleChange("tmdb_id", e.target.value)}
              className="mt-0.5 w-full rounded-lg border border-neutral-700 px-2 py-1 bg-gray-800 text-white text-xs"
              placeholder="Ex: 1234"
              type="number"
              min={1}
              readOnly={true}
              tabIndex={-1}
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