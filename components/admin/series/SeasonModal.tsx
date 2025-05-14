import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

// --- Autocomplete composant pour la recherche TMDB série ---
function AutocompleteSerieTMDB({ onSerieSelected }: { onSerieSelected: (id: string, name: string) => void }) {
  const [search, setSearch] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);

  return (
    <div className="relative mb-2">
      <input
        value={search}
        onChange={async e => {
          setSearch(e.target.value);
          setShow(true);
          if (e.target.value.length > 2) {
            setLoading(true);
            try {
              const resp = await fetch(`/api/tmdb/tv-search?query=${encodeURIComponent(e.target.value)}`);
              const data = await resp.json();
              setSuggestions(data.results || []);
            } catch {
              setSuggestions([]);
            }
            setLoading(false);
          } else {
            setSuggestions([]);
          }
        }}
        className="rounded-lg border border-neutral-700 px-2 py-1 bg-gray-800 text-white text-xs w-full"
        placeholder="Nom de la série"
        autoComplete="off"
        onBlur={() => setTimeout(() => setShow(false), 200)}
        onFocus={() => setShow(true)}
      />
      {show && !!search && (
        <ul className="absolute z-20 w-full bg-gray-900 border border-gray-700 mt-1 rounded shadow max-h-44 overflow-y-auto">
          {loading && (
            <li className="p-2 text-sm text-gray-400">Chargement…</li>
          )}
          {suggestions.map(suggestion => (
            <li
              key={suggestion.id}
              className="p-2 cursor-pointer hover:bg-blue-600/70 transition-colors"
              onClick={() => {
                setSearch(suggestion.name + (suggestion.first_air_date ? ` (${suggestion.first_air_date.slice(0, 4)})` : ""));
                setSuggestions([]);
                setShow(false);
                onSerieSelected(String(suggestion.id), suggestion.name);
              }}
            >
              <span className="font-medium">{suggestion.name}</span>
              {suggestion.first_air_date && (
                <span className="text-xs text-gray-400 ml-1">({suggestion.first_air_date.slice(0, 4)})</span>
              )}
            </li>
          ))}
          {!loading && suggestions.length === 0 && (
            <li className="p-2 text-sm text-gray-400">Aucune série trouvée…</li>
          )}
        </ul>
      )}
    </div>
  );
}

// --- SeasonModal complet ---
import { supabase } from "@/lib/supabaseClient";

export default function SeasonModal({
  open,
  onClose,
  onSave,
  initialData = {},
  seriesTitle = "",
  seriesId // id local de la série (pour la base)
}: any) {
  const { toast } = useToast();

  // --- États principaux ---
  const [selectedSerie, setSelectedSerie] = useState<{ id: string, name: string } | null>(null);
  const [form, setForm] = useState({
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
  const [loading, setLoading] = useState(false);

  // --- Recherche du TMDB ID de la saison ---
  const [seasonSearchLoading, setSeasonSearchLoading] = useState(false);

  // --- Recherche et remplissage automatique du TMDB ID de saison ---
  const handleFindSeasonTmdbId = async () => {
    if (!selectedSerie?.id) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner une série TMDB avant de rechercher la saison.",
        variant: "destructive",
      });
      return;
    }
    if (!form.season_number || isNaN(Number(form.season_number)) || Number(form.season_number) < 1) {
      toast({
        title: "Erreur",
        description: "Veuillez saisir un numéro de saison strictement positif.",
        variant: "destructive",
      });
      return;
    }
    setSeasonSearchLoading(true);
    try {
      const res = await fetch(`/api/tmdb/series/${encodeURIComponent(selectedSerie.id)}`);
      if (!res.ok) throw new Error("Erreur de connexion à TMDB.");
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
      const found = data.seasons.find((s: any) => Number(s.season_number) === num);
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
    }
    setSeasonSearchLoading(false);
  };

  // --- Import automatique des infos de la saison TMDB ---
  const handleTMDBImport = async () => {
    if (!selectedSerie?.id || !form.season_number || !form.tmdb_id) {
      toast({
        title: "Import impossible",
        description: "Veuillez rechercher et remplir le TMDB ID de la saison avant d'importer.",
        variant: "destructive",
      });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        `/api/tmdb/season/${encodeURIComponent(selectedSerie.id)}/${encodeURIComponent(form.season_number)}`
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

  // --- Handlers génériques ---
  const handleChange = (field: string, value: any) => {
    setForm((f) => ({ ...f, [field]: value }));
  };

  // --- Rendu ---
  return (
    <div className="p-4 w-full max-w-md mx-auto bg-gray-900 rounded-xl shadow-lg">
      <h2 className="text-lg font-bold mb-4">Ajouter une saison</h2>
      <AutocompleteSerieTMDB
        onSerieSelected={(id, name) => setSelectedSerie({ id, name })}
      />
      {selectedSerie && (
        <div className="mb-2 text-xs text-blue-400">Série sélectionnée : <span className="font-semibold">{selectedSerie.name}</span> (TMDB : {selectedSerie.id})</div>
      )}
      <div className="mb-2">
        <label className="block text-[11px] font-medium text-white/80 mb-1">Numéro de saison <span className="text-red-500">*</span></label>
        <input
          value={form.season_number}
          type="number"
          min={1}
          className="w-full rounded-lg border border-neutral-700 px-2 py-1 bg-gray-800 text-white text-xs"
          onChange={e => handleChange("season_number", e.target.value)}
        />
      </div>
      <div className="flex gap-2 mb-2">
        <Button
          type="button"
          onClick={handleFindSeasonTmdbId}
          disabled={!selectedSerie?.id || !form.season_number || Number(form.season_number) < 1 || seasonSearchLoading}
        >
          {seasonSearchLoading ? "Recherche..." : "Rechercher"}
        </Button>
        <Button
          type="button"
          onClick={handleTMDBImport}
          disabled={!selectedSerie?.id || !form.season_number || !form.tmdb_id || loading}
        >
          {loading ? "Import..." : "Importer"}
        </Button>
      </div>
      <div className="mb-2">
        <label className="block text-[11px] font-medium text-white/80 mb-1">TMDB ID (modifiable)</label>
        <input
          value={form.tmdb_id}
          onChange={e => handleChange("tmdb_id", e.target.value)}
          className="w-full rounded-lg border border-neutral-700 px-2 py-1 bg-gray-800 text-white text-xs"
          type="number"
          min={1}
        />
      </div>
      <div className="mb-2">
        <label className="block text-[11px] font-medium text-white/80 mb-1">Titre</label>
        <input
          value={form.title}
          onChange={e => handleChange("title", e.target.value)}
          className="w-full rounded-lg border border-neutral-700 px-2 py-1 bg-gray-800 text-white text-xs"
        />
      </div>
      <div className="mb-2">
        <label className="block text-[11px] font-medium text-white/80 mb-1">Description</label>
        <textarea
          value={form.description}
          onChange={e => handleChange("description", e.target.value)}
          className="w-full rounded-lg border border-neutral-700 px-2 py-1 bg-gray-800 text-white text-xs"
        />
      </div>
      <div className="mb-2">
        <label className="block text-[11px] font-medium text-white/80 mb-1">Date de diffusion</label>
        <input
          value={form.air_date}
          onChange={e => handleChange("air_date", e.target.value)}
          className="w-full rounded-lg border border-neutral-700 px-2 py-1 bg-gray-800 text-white text-xs"
          type="date"
        />
      </div>
      <div className="mb-2">
        <label className="block text-[11px] font-medium text-white/80 mb-1">Nombre d'épisodes</label>
        <input
          value={form.episode_count}
          onChange={e => handleChange("episode_count", e.target.value)}
          className="w-full rounded-lg border border-neutral-700 px-2 py-1 bg-gray-800 text-white text-xs"
          type="number"
          min={0}
        />
      </div>
      <div className="mb-2">
        <label className="block text-[11px] font-medium text-white/80 mb-1">Poster (URL)</label>
        <input
          value={form.poster}
          onChange={e => handleChange("poster", e.target.value)}
          className="w-full rounded-lg border border-neutral-700 px-2 py-1 bg-gray-800 text-white text-xs"
        />
        {form.poster && (
          <img src={form.poster} alt="Aperçu" className="h-12 mt-2 rounded border border-gray-700" />
        )}
      </div>
      <div className="flex gap-2 mt-4 justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
        >
          Annuler
        </Button>
        <Button
          type="button"
          variant="success"
          onClick={() => onSave(form)}
          disabled={loading}
        >
          Enregistrer
        </Button>
      </div>
    </div>
  );
}

