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
  // Le champ genres est retiré du form state (non exposé dans l'UI, à réintégrer si besoin)
  // S'assurer que tmdb_id existe toujours dans le form state (même caché)
  const [form, setForm] = useState({
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
  });
  // Pour garder la valeur originelle du numéro pour la détection de modification
  const originalSeasonNumber = useRef(
    initialData.season_number !== undefined && initialData.season_number !== null
      ? String(initialData.season_number)
      : ""
  );

  // Pour feedback recherche TMDB saison par numéro
  const [seasonSearchLoading, setSeasonSearchLoading] = useState(false);
  const [seasonSearchError, setSeasonSearchError] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [k: string]: string }>({});
  // Pour désactiver tous les champs lors du loading
  const isDisabled = loading || checkingDuplicate || seasonSearchLoading || serieLoading;
  // Gestion d'image poster erreur
  const [posterError, setPosterError] = useState(false);

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

  // Ajout : champ de recherche (autocomplete) série TMDB SI le tmdbSeriesId n'est pas fourni
  const [serieTmdbIdInput, setSerieTmdbIdInput] = useState(tmdbSeriesId || initialData.tmdb_series_id || "");
  const [serieSearch, setSerieSearch] = useState("");
  const [serieSuggestions, setSerieSuggestions] = useState<any[]>([]);
  const [serieLoading, setSerieLoading] = useState(false);
  const [showSerieSuggestions, setShowSerieSuggestions] = useState(false);
  const [activeSerieSuggestion, setActiveSerieSuggestion] = useState(-1);

  // Reset le formulaire UNIQUEMENT à l'ouverture ou quand on change de saison à éditer
  const wasOpen = useRef(false);
  // Pour abort les fetch TMDB au besoin
  const tmdbSeriesAbortController = useRef<AbortController | null>(null);

  // Gestion d'abort des fetch TMDB
  const tmdbAbortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    // Si on vient d'ouvrir la modale, ou si on change de saison à éditer
    if (open && (!wasOpen.current || initialData?.id !== form?.id)) {
      setErrors({});
      setForm({
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
      });
      originalSeasonNumber.current =
        initialData.season_number !== undefined && initialData.season_number !== null
          ? String(initialData.season_number)
          : "";
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
      // Abort previous fetch if any
      if (tmdbAbortControllerRef.current) {
        tmdbAbortControllerRef.current.abort();
      }
      if (tmdbSeriesId) {
        const abortController = new AbortController();
        tmdbAbortControllerRef.current = abortController;
        fetch(`/api/tmdb/series/${encodeURIComponent(tmdbSeriesId)}`, {
          signal: abortController.signal
        })
          .then(res => res.ok ? res.json() : Promise.reject(res.statusText))
          .then(data => {
            if (data && Array.isArray(data.seasons)) {
              setTmdbSeasonCount(data.seasons.length);
            } else {
              setTmdbSeasonError("Impossible d'obtenir le nombre de saisons sur TMDB.");
            }
          })
          .catch(err => {
            if (err.name !== "AbortError") {
              setTmdbSeasonError("Erreur lors de la récupération TMDB.");
            }
          });
      }
    }
    // Reset complet du formulaire lors de la fermeture
    if (!open && wasOpen.current) {
      setForm({
        title: "",
        season_number: "",
        air_date: "",
        episode_count: "",
        poster: "",
        tmdb_id: "",
        description: "",
      });
      setErrors({});
      setTmdbSearch("");
      setSeasonSearchError(null);
      setSeasonSearchLoading(false);
      setSerieSearch("");
      setSerieSuggestions([]);
      setActiveSerieSuggestion(-1);
      setTmdbSeasonCount(null);
      setTmdbSeasonError(null);
      // Abort TMDB fetch en cours si fermeture
      if (tmdbAbortControllerRef.current) {
        tmdbAbortControllerRef.current.abort();
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
    // Exiger tmdb_id si on veut que l'import TMDB soit obligatoire
    if (!form.tmdb_id || isNaN(Number(form.tmdb_id)) || Number(form.tmdb_id) < 1) {
      err.tmdb_id = "L'import TMDB de la saison est obligatoire.";
    }
    // Vérification anti-doublon à la création ET à l'édition si le numéro a changé
    if (
      form.season_number &&
      seriesId &&
      (
        (!initialData.id) ||
        (initialData.id && String(form.season_number) !== String(originalSeasonNumber.current))
      )
    ) {
      const { data: existing } = await supabase
        .from("seasons")
        .select("id")
        .eq("series_id", seriesId)
        .eq("season_number", Number(form.season_number));
      // Si création OU édition et la saison existante n'est pas celle qu'on édite
      if (
        existing &&
        existing.length > 0 &&
        (!initialData.id || !existing.some(s => s.id === initialData.id))
      ) {
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
      // Nettoyage des données envoyées : "" --> null, conversion nombre, etc.
      const clean = (v: any) => (v === "" || v === undefined ? null : v);

      const submitData = {
        ...form,
        season_number: clean(form.season_number) !== null ? Number(form.season_number) : null,
        episode_count: clean(form.episode_count) !== null ? Number(form.episode_count) : null,
        tmdb_id: clean(form.tmdb_id) !== null ? Number(form.tmdb_id) : null,
        air_date: clean(form.air_date),
        poster: clean(form.poster),
        title: clean(form.title),
        description: clean(form.description),
      };
      await onSave(submitData);
      toast({ title: "Saison enregistrée" });
      onClose();
    } catch (e) {
      toast({ title: "Erreur", description: String(e), variant: "destructive" });
    }
    setLoading(false);
  };
      await onSave(submitData);
      toast({ title: "Saison enregistrée" });
      onClose();
    } catch (e) {
      toast({ title: "Erreur", description: String(e), variant: "destructive" });
    }
    setLoading(false);
  };


  // Suppression de handleFindSeasonTmdbIdCustom : la recherche de tmdb_id est intégrée à handleTMDBImport

  // Import TMDB complet et anti-doublon (champ tmdb_id modifiable manuellement ou automatiquement)
  const handleTMDBImport = async () => {
    setSeasonSearchError(null);

    // Détermination de la série TMDB sélectionnée (prop ou autocomplete)
    const serieTmdbId = tmdbSeriesId || serieTmdbIdInput || "";
    const seasonNumber = form.season_number;

    if (!serieTmdbId || !seasonNumber || isNaN(Number(seasonNumber)) || Number(seasonNumber) < 1) {
      setSeasonSearchError("Veuillez sélectionner une série TMDB et saisir un numéro de saison valide.");
      return;
    }

    // Vérification anti-doublon (création ou édition ET numéro modifié)
    setCheckingDuplicate(true);
    const { data: existing } = await supabase
      .from("seasons")
      .select("id")
      .eq("series_id", seriesId)
      .eq("season_number", Number(seasonNumber));
    setCheckingDuplicate(false);
    if (
      existing &&
      existing.length > 0 &&
      (!initialData.id || !existing.some(s => s.id === initialData.id))
    ) {
      setSeasonSearchError("Une saison avec ce numéro existe déjà pour cette série.");
      return;
    }
    setLoading(true);
    try {
      // Abort previous fetch if any
      if (tmdbAbortControllerRef.current) {
        tmdbAbortControllerRef.current.abort();
      }
      const abortController = new AbortController();
      tmdbAbortControllerRef.current = abortController;
      // On va chercher les infos détaillées de la saison sur TMDB via le TMDB ID série et le numéro de saison
      const res = await fetch(
        `/api/tmdb/season/${encodeURIComponent(serieTmdbId)}/${encodeURIComponent(seasonNumber)}`,
        { signal: abortController.signal }
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
          // tmdb_id géré en interne, pas affiché
          tmdb_id: detail.id,
          episode_count: detail.episodes ? String(detail.episodes.length) : (detail.episode_count ? String(detail.episode_count) : f.episode_count),
        }));
        toast({
          title: "Import TMDB réussi",
          description: "Saison préremplie depuis TMDB !",
        });
      } else {
        setSeasonSearchError("Aucune saison trouvée pour ces paramètres.");
      }
    } catch (e) {
      if (e.name !== "AbortError") {
        setSeasonSearchError("Erreur TMDB ou connexion.");
      }
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
            {/* Si tmdbSeriesId absent, proposer un champ de recherche série TMDB */}
            {!tmdbSeriesId && !initialData.tmdb_series_id && (
              <div className="mb-2">
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
                  className="rounded-lg border border-neutral-700 px-2 py-1 bg-gray-800 text-white text-xs w-full mb-1"
                  placeholder="Nom de la série"
                  autoComplete="off"
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
                          setSerieTmdbIdInput(String(suggestion.id));
                          setSerieSearch(suggestion.name);
                          setSerieSuggestions([]);
                          setShowSerieSuggestions(false);
                        }}
                        onKeyDown={e => {
                          if (e.key === "Enter" || e.key === " ") {
                            setSerieTmdbIdInput(String(suggestion.id));
                            setSerieSearch(suggestion.name);
                            setSerieSuggestions([]);
                            setShowSerieSuggestions(false);
                          }
                        }}
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
                <input
                  id="serie_tmdb_id"
                  value={serieTmdbIdInput}
                  onChange={e => setSerieTmdbIdInput(e.target.value)}
                  className="rounded-lg border border-neutral-700 px-2 py-1 bg-gray-800 text-white text-xs w-full mt-1"
                  placeholder="TMDB ID série"
                  type="text"
                />
              </div>
            )}
            <label htmlFor="season_number" className="block text-[11px] mb-1 text-white/70 font-medium">
              Importer depuis TMDB
            </label>
            <div className="flex gap-1">
              <input
                id="season_number"
                value={form.season_number}
                onChange={e => {
                  handleChange("season_number", e.target.value);
                  // reset tmdb_id à chaque changement de numéro
                  setForm(f => ({ ...f, tmdb_id: "" }));
                }}
                className="rounded-lg border border-neutral-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-300/40 px-2 py-1 bg-gray-800 text-white w-16 text-xs transition-shadow"
                placeholder="N°"
                type="number"
                inputMode="numeric"
                step="1"
                min={1}
                pattern="[0-9]*"
                autoComplete="off"
                disabled={isDisabled}
                aria-invalid={!!errors.season_number}
                aria-describedby={errors.season_number ? "err-season_number" : undefined}
              />
              <Button
                type="button"
                className="flex-shrink-0 text-xs py-1 px-2 transition rounded-lg"
                variant="outline"
                onClick={handleTMDBImport}
                disabled={
                  isDisabled ||
                  !(tmdbSeriesId || serieTmdbIdInput) ||
                  !form.season_number ||
                  isNaN(Number(form.season_number)) ||
                  Number(form.season_number) < 1
                }
                aria-label="Importer la saison depuis TMDB"
              >
                {(loading || checkingDuplicate) ? (
                  <svg className="animate-spin h-4 w-4 mr-1 text-indigo-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-60" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                  </svg>
                ) : "Importer depuis TMDB"}
              </Button>
            </div>
            {/* Feedback erreur import */}
            {seasonSearchError && (
              <div className="px-3 pb-1 text-xs text-red-400" role="alert" aria-live="assertive">{seasonSearchError}</div>
            )}
          </div>
        </div>

        {/* Content scrollable */}
        <form
          id="season-form"
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
                  onError={e => {
                    // Fallback si l'image ne charge pas
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = "/no-image.png";
                  }}
                />
                <button
                  type="button"
                  className="text-[10px] text-red-400 hover:underline mt-1"
                  onClick={() => handleChange("poster", "")}
                  disabled={loading}
                >
                  Supprimer l'affiche
                </button>
              </div>
            )}
          </div>
          {/* Le champ tmdb_id est géré en interne, on ne l'affiche plus à l'admin */}
        </form>
        {/* Actions sticky */}
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
            form="season-form"
            disabled={loading}
            aria-label="Enregistrer la saison"
            className="text-xs py-1 px-2 bg-green-600 hover:bg-green-700 rounded-lg text-white font-semibold transition"
          >
            {loading ? "..." : "Enregistrer"}
          </button>
        </div>
        {/* ARIA live pour retour d’erreur critique */}
        <div role="alert" aria-live="assertive" style={{ position: "absolute", left: -9999, top: "auto", width: "1px", height: "1px", overflow: "hidden" }}>
          {Object.values(errors).length > 0 ? Object.values(errors).join(" ") : ""}
          {seasonSearchError ? seasonSearchError : ""}
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