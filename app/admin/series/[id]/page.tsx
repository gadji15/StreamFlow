'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus, Edit, Trash2, Tv, Layers, ChevronRight, Download, Loader2, CheckCircle2, XCircle } from 'lucide-react';

type Series = {
  id: string;
  title: string;
  original_title?: string;
  description?: string;
  start_year?: number;
  end_year?: number | null;
  creator?: string;
  poster?: string | null;
  backdrop?: string | null;
  tmdb_id?: number | null;
};

type Season = {
  id: string;
  number: number;
  title?: string;
  poster?: string | null;
  description?: string | null;
  series_id: string;
  episodes_count?: number;
};

export default function SeriesDetailPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();

  const [series, setSeries] = useState<Series | null>(null);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // Bulk import modal
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkError, setBulkError] = useState<string | null>(null);
  const [bulkSuccess, setBulkSuccess] = useState<string | null>(null);
  const [tmdbSaisons, setTmdbSaisons] = useState<any[]>([]);
  const [selectedBulk, setSelectedBulk] = useState<number[]>([]);
  const [bulkMap, setBulkMap] = useState<{ [season_number: number]: boolean }>({});
  const [bulkInserting, setBulkInserting] = useState(false);
  const bulkButtonRef = useRef<HTMLButtonElement>(null);

  // Fetch series and its seasons
  useEffect(() => {
    const fetchSeriesAndSeasons = async () => {
      setLoading(true);
      setErr(null);
      try {
        // Fetch series
        const { data: seriesData, error: seriesError } = await supabase
          .from('series')
          .select('*')
          .eq('id', id)
          .single();
        if (seriesError || !seriesData) {
          setErr("Série introuvable.");
          setSeries(null);
          setSeasons([]);
          setLoading(false);
          return;
        }
        setSeries(seriesData);

        // Fetch seasons with episodes count
        const { data: seasonsData, error: seasonsError } = await supabase
          .from('seasons')
          .select('id, number, title, poster, description, series_id')
          .eq('series_id', id)
          .order('number', { ascending: true });

        if (seasonsError) throw seasonsError;

        // For each season, fetch episodes count
        const seasonsWithCount: Season[] = [];
        if (seasonsData && seasonsData.length > 0) {
          for (const season of seasonsData) {
            const { count, error: epError } = await supabase
              .from('episodes')
              .select('id', { count: 'exact', head: true })
              .eq('season_id', season.id);
            if (epError) {
              seasonsWithCount.push({ ...season, episodes_count: 0 });
            } else {
              seasonsWithCount.push({ ...season, episodes_count: count || 0 });
            }
          }
        }
        setSeasons(seasonsWithCount);
      } catch (e: any) {
        setErr(e?.message || "Erreur inattendue.");
        setSeries(null);
        setSeasons([]);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchSeriesAndSeasons();
  }, [id]);

  // Handler for add season
  const handleAddSeason = () => {
    router.push(`/admin/series/${id}/add-season`);
  };

  // Handler for bulk import modal
  const handleBulkModal = () => {
    setShowBulkModal(true);
    setBulkError(null);
    setBulkSuccess(null);
    setTmdbSaisons([]);
    setSelectedBulk([]);
    setBulkMap({});
    setBulkLoading(true);
    // fetch TMDb seasons
    fetchTmdbSaisons();
  };

  // Fetch TMDb seasons for the series
  const fetchTmdbSaisons = async () => {
    setBulkLoading(true);
    setBulkError(null);
    setBulkSuccess(null);
    try {
      if (!series?.tmdb_id) {
        setBulkError("Aucun tmdb_id renseigné pour cette série.");
        setBulkLoading(false);
        return;
      }
      const res = await fetch(
        `https://api.themoviedb.org/3/tv/${series.tmdb_id}?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}&language=fr-FR`
      );
      const data = await res.json();
      if (data.status_code) throw new Error(data.status_message || "Erreur TMDb.");
      let saisons = Array.isArray(data.seasons) ? data.seasons : [];
      // On retire les doublons déjà présents
      const numsExistants = new Set(seasons.map(s => s.number));
      const manquantes = saisons.filter(s => !numsExistants.has(s.season_number) && s.season_number > 0);
      setTmdbSaisons(manquantes);
      setSelectedBulk(manquantes.map(s => s.season_number));
      setBulkMap(Object.fromEntries(manquantes.map(s => [s.season_number, true])));
    } catch (e: any) {
      setBulkError(e?.message || "Erreur lors du fetch TMDb.");
    } finally {
      setBulkLoading(false);
    }
  };

  // Handle checkbox selection
  const handleBulkCheckbox = (season_number: number, checked: boolean) => {
    setBulkMap(prev => ({ ...prev, [season_number]: checked }));
    setSelectedBulk(prev =>
      checked
        ? [...prev, season_number]
        : prev.filter(num => num !== season_number)
    );
  };

  // Handle bulk import action
  const handleBulkImport = async () => {
    setBulkInserting(true);
    setBulkError(null);
    setBulkSuccess(null);
    try {
      if (!series) throw new Error("Série introuvable.");
      // Sélectionne les saisons cochées
      const toImport = tmdbSaisons.filter(s => bulkMap[s.season_number]);
      if (toImport.length === 0) {
        setBulkError("Aucune saison sélectionnée pour l'import.");
        setBulkInserting(false);
        return;
      }
      // Prépare et insère en batch
      const inserts = toImport.map(s => ({
        series_id: series.id,
        number: s.season_number,
        title: s.name || '',
        description: s.overview || '',
        poster: s.poster_path ? `https://image.tmdb.org/t/p/w500${s.poster_path}` : '',
        tmdb_id: s.id,
      }));
      const { data, error } = await supabase
        .from('seasons')
        .insert(inserts);
      if (error) throw error;
      setBulkSuccess(`Import de ${toImport.length} saison(s) réussi !`);
      // Refresh la liste
      await new Promise((res) => setTimeout(res, 700));
      setShowBulkModal(false);
      window.location.reload();
    } catch (e: any) {
      setBulkError(e?.message || "Erreur lors de l'import.");
    } finally {
      setBulkInserting(false);
    }
  };

  // Handler for edit series
  const handleEditSeries = () => {
    router.push(`/admin/series/${id}/edit`);
  };

  // Handler for add episode (to contextualize later)
  const handleAddEpisode = (seasonId: string) => {
    router.push(`/admin/series/${id}/seasons/${seasonId}/add-episode`);
  };

  // Handler for edit season (to contextualize later)
  const handleEditSeason = (seasonId: string) => {
    router.push(`/admin/series/${id}/seasons/${seasonId}/edit`);
  };

  // Handler for view season (could be a detail page)
  const handleViewSeason = (seasonId: string) => {
    router.push(`/admin/series/${id}/seasons/${seasonId}`);
  };

  // Handler for deleting season (confirmation to be implemented)
  // const handleDeleteSeason = async (seasonId: string) => { ... }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="mb-4 text-sm text-gray-400 flex items-center gap-2" aria-label="breadcrumb">
        <Link href="/admin/series" className="hover:underline flex items-center">
          <Tv className="h-4 w-4 mr-1" /> Séries
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-white font-medium">{series?.title || "..."}</span>
      </nav>

      {/* Retour */}
      <Button variant="ghost" size="sm" className="mb-6" asChild>
        <Link href="/admin/series">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Retour aux séries
        </Link>
      </Button>

      {/* Loading / Error */}
      {loading && (
        <div className="flex items-center justify-center min-h-[30vh]">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      )}

      {err && (
        <div className="text-red-500 text-center py-8">{err}</div>
      )}

      {!loading && series && (
        <>
          {/* Header série */}
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-8">
            {series.poster && (
              <img
                src={series.poster}
                alt={`Affiche ${series.title}`}
                className="w-32 h-48 object-cover rounded shadow"
              />
            )}
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-white mb-1">{series.title}</h1>
              {series.original_title && (
                <div className="text-gray-400 text-base italic mb-1">{series.original_title}</div>
              )}
              <div className="text-gray-300 text-sm mb-2">
                {series.start_year}
                {series.end_year ? ` - ${series.end_year}` : series.end_year === null ? " - en cours" : ""}
                {series.creator && (
                  <span className="ml-3 text-gray-400">Créateur(s) : {series.creator}</span>
                )}
              </div>
              {series.description && (
                <div className="text-gray-200 text-base mb-2">{series.description}</div>
              )}
              <div className="flex flex-wrap gap-2 mt-2">
                <Button size="sm" variant="outline" onClick={handleEditSeries}>
                  <Edit className="h-4 w-4 mr-1" /> Éditer la série
                </Button>
                <Button size="sm" variant="default" onClick={handleAddSeason}>
                  <Plus className="h-4 w-4 mr-1" /> Ajouter une saison
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex items-center"
                  onClick={handleBulkModal}
                  ref={bulkButtonRef}
                  disabled={!series?.tmdb_id}
                  title={series?.tmdb_id ? "Importer les saisons TMDb manquantes" : "Aucun tmdb_id renseigné"}
                >
                  <Download className="h-4 w-4 mr-1" />
                  Importer saisons TMDb
                </Button>
              </div>
            </div>
          </div>

          {/* Liste des saisons */}
          <div className="mt-8">
            <h2 className="text-2xl font-semibold text-white mb-4 flex items-center">
              <Layers className="h-5 w-5 mr-2" /> Saisons
            </h2>
            {seasons.length === 0 ? (
              <div className="text-gray-400 italic px-4 py-8">
                Aucune saison trouvée pour cette série.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {seasons.map((season) => (
                  <div key={season.id} className="bg-gray-800 rounded-lg shadow-lg p-6 flex flex-col relative">
                    <div className="flex items-center gap-4 mb-2">
                      {season.poster && (
                        <img src={season.poster} alt="Poster saison" className="w-16 h-24 object-cover rounded" />
                      )}
                      <div>
                        <div className="text-lg font-semibold text-white">
                          Saison {season.number}{season.title ? ` — ${season.title}` : ""}
                        </div>
                        {season.description && (
                          <div className="text-gray-400 text-sm mt-1 line-clamp-3">{season.description}</div>
                        )}
                        <div className="text-gray-300 text-xs mt-2">
                          {season.episodes_count ?? 0} épisode{(season.episodes_count ?? 0) > 1 ? "s" : ""}
                        </div>
                      </div>
                    </div>
                    <div className="mt-auto flex flex-wrap gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleViewSeason(season.id)}>
                        Voir détails
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleEditSeason(season.id)}>
                        <Edit className="h-4 w-4 mr-1" /> Éditer
                      </Button>
                      <Button size="sm" variant="default" onClick={() => handleAddEpisode(season.id)}>
                        <Plus className="h-4 w-4 mr-1" /> Ajouter épisode
                      </Button>
                      {/* <Button size="sm" variant="destructive" onClick={() => handleDeleteSeason(season.id)}>
                        <Trash2 className="h-4 w-4 mr-1" /> Supprimer
                      </Button> */}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        {/* Modal import bulk saisons */}
        {showBulkModal && (
          <div className="fixed z-50 inset-0 bg-black/60 flex items-center justify-center">
            <div className="bg-gray-900 rounded-lg max-w-md w-full p-6 shadow-2xl relative">
              <button
                onClick={() => setShowBulkModal(false)}
                className="absolute top-2 right-3 text-gray-400 hover:text-red-500"
                aria-label="Fermer"
              >✕</button>
              <h2 className="text-xl font-bold mb-3 flex items-center">
                <Download className="h-5 w-5 mr-2" />
                Importer saisons TMDb
              </h2>
              {bulkLoading ? (
                <div className="flex items-center justify-center my-12">
                  <Loader2 className="animate-spin h-8 w-8 text-indigo-500" />
                </div>
              ) : bulkError ? (
                <div className="text-red-500 mb-2">{bulkError}</div>
              ) : tmdbSaisons.length === 0 ? (
                <div className="text-gray-400 my-8">
                  Toutes les saisons TMDb existantes sont déjà présentes dans la base.
                </div>
              ) : (
                <>
                  <div className="mb-2 text-sm text-gray-300">
                    Cochez les saisons à importer :
                  </div>
                  <ul className="max-h-64 overflow-y-auto mb-4 divide-y divide-gray-800">
                    {tmdbSaisons.map(s => (
                      <li key={s.season_number} className="flex items-center py-2">
                        <input
                          type="checkbox"
                          className="mr-3"
                          checked={!!bulkMap[s.season_number]}
                          onChange={e => handleBulkCheckbox(s.season_number, e.target.checked)}
                          id={`bulk-saison-${s.season_number}`}
                        />
                        <label htmlFor={`bulk-saison-${s.season_number}`} className="flex-1 cursor-pointer select-none">
                          {s.name} (Saison {s.season_number})
                        </label>
                        {s.poster_path && (
                          <img src={`https://image.tmdb.org/t/p/w92${s.poster_path}`} alt="Poster" className="ml-2 w-8 h-12 object-cover rounded" />
                        )}
                      </li>
                    ))}
                  </ul>
                  {bulkSuccess && (
                    <div className="flex items-center text-green-500 mb-2">
                      <CheckCircle2 className="h-5 w-5 mr-2" /> {bulkSuccess}
                    </div>
                  )}
                  {bulkError && (
                    <div className="flex items-center text-red-500 mb-2">
                      <XCircle className="h-5 w-5 mr-2" /> {bulkError}
                    </div>
                  )}
                  <div className="flex justify-end gap-2 mt-4">
                    <Button variant="outline" onClick={() => setShowBulkModal(false)}>
                      Annuler
                    </Button>
                    <Button
                      variant="default"
                      onClick={handleBulkImport}
                      disabled={bulkInserting || selectedBulk.length === 0}
                    >
                      {bulkInserting ? (
                        <>
                          <Loader2 className="animate-spin h-4 w-4 mr-2" />
                          Import...
                        </>
                      ) : (
                        <>
                          <Download className="h-4 w-4 mr-2" />
                          Importer {selectedBulk.length > 1 ? `${selectedBulk.length} saisons` : `1 saison`}
                        </>
                      )}
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
        </>
      )}
    </div>
  );
}