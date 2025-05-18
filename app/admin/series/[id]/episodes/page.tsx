"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import EpisodeList from "@/components/admin/series/EpisodeList";
import { useToast } from "@/components/ui/use-toast";
throw new Error("TEST ERROR -- DEV SERVER DOIT CRASHER !");
// DEBUG MARKER
if (typeof window !== "undefined") {
  document.body.style.background = "red";
  alert("CECI EST LE BON FICHIER page.tsx !");
}
throw new Error("DEBUG: Ceci est bien app/admin/series/[id]/episodes/page.tsx");


export default function EpisodesPage() {
  // ...
  const params = useParams();
  // Analyse défensive : log l’URL et les params côté client, à chaque rendu

  useEffect(() => {
    if (typeof window !== "undefined") {
      console.log("DEBUG PATHNAME", window.location.pathname);
      console.log("DEBUG PARAMS OBJECT", params);
    }
  }, [params]);

  // Extraction robuste du bon paramètre (id, seriesId, series, etc.)
  let seriesId =
    params?.id ||
    params?.seriesId ||
    params?.series ||
    (Array.isArray(params) && params[0]) ||
    undefined;
  if (Array.isArray(seriesId)) seriesId = seriesId[0];

  // Sécurité : si jamais sérieId est absent, on bloque tout
  if (!seriesId) {
    return (
      <div className="p-4 text-red-500 font-bold">
        Erreur : impossible de déterminer l’identifiant de la série depuis l’URL.<br />
        <pre>{JSON.stringify(params, null, 2)}</pre>
        <pre>{typeof window !== "undefined" ? window.location.pathname : ""}</pre>
      </div>
    );
  }
  console.log("EpisodesPage seriesId (ALWAYS DEFINED, robust extraction)", seriesId, "params", params);
  const [episodes, setEpisodes] = useState([]);
  const [episodesLoading, setEpisodesLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Pour le header
  const [seriesTitle, setSeriesTitle] = useState("");
  const [tmdbSeriesId, setTmdbSeriesId] = useState("");

  // Gestion des saisons
  const [seasons, setSeasons] = useState<{ id: any; season_number: any; title: any; }[]>([]);
  const [seasonId, setSeasonId] = useState("");
  const [seasonNumber, setSeasonNumber] = useState("");

  // Fetch série info (title, tmdb_id)
  // Affichage du debug params sur la page pour diagnostiquer
  const [showParams, setShowParams] = useState(true);

  useEffect(() => {
    async function fetchSeriesInfo() {
      if (!seriesId) return;
      const { data, error } = await supabase
        .from("series")
        .select("id, title, tmdb_id")
        .eq("id", seriesId)
        .single();
      if (error) {
        setSeriesTitle("");
        setTmdbSeriesId("");
        toast({ title: "Erreur", description: "Erreur lors de la récupération de la série.", variant: "destructive" });
        return;
      }
      setSeriesTitle(data.title || "");
      setTmdbSeriesId(data.tmdb_id ? String(data.tmdb_id) : "");
    }
    fetchSeriesInfo();
  }, [seriesId, toast]);

  // Fetch saisons (pour le sélecteur de saison)
  useEffect(() => {
    async function fetchSeasons() {
      if (!seriesId) return;
      const { data, error } = await supabase
        .from("seasons")
        .select("id, season_number, title")
        .eq("series_id", seriesId)
        .order("season_number", { ascending: true });
      if (error) {
        toast({ title: "Erreur", description: "Erreur lors de la récupération des saisons.", variant: "destructive" });
        setSeasons([]);
      } else {
        setSeasons(data || []);
        // Sélectionne la première saison par défaut s'il y en a au moins une
        if (data && data.length > 0 && !seasonId) {
          setSeasonId(data[0].id);
          setSeasonNumber(data[0].season_number);
        }
      }
    }
    fetchSeasons();
    // eslint-disable-next-line
  }, [seriesId]);

  // Quand la saison courante change, on recharge les épisodes de cette saison
  const fetchEpisodesForSeason = async () => {
    setEpisodesLoading(true);
    setError(null);
    try {
      if (!seriesId) throw new Error("seriesId non défini");
      if (!seasonId) throw new Error("seasonId non défini");
      const { data, error } = await supabase
        .from("episodes")
        .select("*")
        .eq("series_id", seriesId)
        .eq("season_id", seasonId)
        .order("episode_number", { ascending: true });
      if (error) {
        setError(error.message);
        setEpisodes([]);
      } else {
        setEpisodes(data || []);
      }
    } catch (err) {
      setError(String(err));
      setEpisodes([]);
    } finally {
      setEpisodesLoading(false);
    }
  };

  useEffect(() => {
    if (seriesId && seasonId) fetchEpisodesForSeason();
    // eslint-disable-next-line
  }, [seriesId, seasonId]);

  // Sélecteur de saison
  const handleSeasonChange = (e) => {
    const selected = seasons.find(s => s.id === e.target.value);
    setSeasonId(selected?.id || "");
    setSeasonNumber(selected?.season_number || "");
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-4">Épisodes de la série</h1>
      {/* Bloc debug toujours affiché, même si showParams est false */}
      <div className="bg-red-900 text-yellow-200 rounded p-3 mb-4 text-xs">
        <b>DEBUG PARAMS (useParams):</b>
        <pre style={{ whiteSpace: "pre-wrap" }}>{JSON.stringify(params, null, 2)}</pre>
        <b>seriesId extrait :</b> {String(seriesId)}
      </div>
      <div className="mb-3">
        <label htmlFor="season-picker" className="block text-sm text-white font-medium mb-1">
          Saison :
        </label>
        <select
          id="season-picker"
          value={seasonId}
          onChange={handleSeasonChange}
          className="border rounded px-2 py-1 text-sm"
        >
          {seasons.map(season => (
            <option key={season.id} value={season.id}>
              {season.title || `Saison ${season.season_number}`}
            </option>
          ))}
        </select>
      </div>
      <EpisodeList
        episodes={episodes}
        seasonId={seasonId}
        seriesId={seriesId}
        fetchEpisodesForSeason={fetchEpisodesForSeason}
        episodesLoading={episodesLoading}
        error={error}
        seriesTitle={seriesTitle}
        tmdbSeriesId={tmdbSeriesId}
        seasonNumber={seasonNumber}
      />
    </div>
  );
}
