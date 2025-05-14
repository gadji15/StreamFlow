'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus, Edit, Trash2, Tv, Layers, ChevronRight } from 'lucide-react';

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
        </>
      )}
    </div>
  );
}