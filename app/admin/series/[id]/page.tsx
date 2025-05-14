'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus, Edit, Trash2, Tv, Layers, ChevronRight, Download, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

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
  const { toast } = useToast();

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
          toast({
            title: "Erreur",
            description: "Série introuvable.",
            variant: "destructive"
          });
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
      toast({
        title: "Import réussi",
        description: `Import de ${toImport.length} saison(s) réussi !`
      });
      // Refresh la liste
      await new Promise((res) => setTimeout(res, 700));
      setShowBulkModal(false);
      window.location.reload();
    } catch (e: any) {
      toast({
        title: "Erreur import TMDb",
        description: e?.message || "Erreur lors de l'import.",
        variant: "destructive"
      });
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

  // State for edit modal
  const [editModalSeason, setEditModalSeason] = useState<Season | null>(null);
  const [editForm, setEditForm] = useState({ title: '', description: '', poster: '' });
  const [editFormLoading, setEditFormLoading] = useState(false);
  const [editFormError, setEditFormError] = useState<string | null>(null);
  const [editFormSuccess, setEditFormSuccess] = useState<string | null>(null);

  // State for delete modal
  const [deleteModalSeason, setDeleteModalSeason] = useState<Season | null>(null);
  const [deleteFormLoading, setDeleteFormLoading] = useState(false);
  const [deleteFormError, setDeleteFormError] = useState<string | null>(null);
  const [deleteFormSuccess, setDeleteFormSuccess] = useState<string | null>(null);

  // Handler open/close edit modal
  const openEditModal = (season: Season) => {
    setEditModalSeason(season);
    setEditForm({
      title: season.title || '',
      description: season.description || '',
      poster: season.poster || '',
    });
    setEditFormError(null);
    setEditFormSuccess(null);
  };
  const closeEditModal = () => {
    setEditModalSeason(null);
    setEditForm({ title: '', description: '', poster: '' });
    setEditFormError(null);
    setEditFormSuccess(null);
  };

  // Handler open/close delete modal
  const openDeleteModal = (season: Season) => {
    setDeleteModalSeason(season);
    setDeleteFormError(null);
    setDeleteFormSuccess(null);
  };
  const closeDeleteModal = () => {
    setDeleteModalSeason(null);
    setDeleteFormError(null);
    setDeleteFormSuccess(null);
  };

  // Edit submit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editModalSeason) return;
    setEditFormLoading(true);
    setEditFormError(null);
    setEditFormSuccess(null);
    try {
      const { error } = await supabase
        .from('seasons')
        .update({
          title: editForm.title,
          description: editForm.description,
          poster: editForm.poster,
        })
        .eq('id', editModalSeason.id);
      if (error) {
        toast({
          title: "Erreur",
          description: error.message || "Erreur lors de l'édition.",
          variant: "destructive"
        });
        setEditFormLoading(false);
        return;
      }
      toast({
        title: "Saison modifiée",
        description: "La saison a bien été enregistrée."
      });
      setTimeout(() => {
        closeEditModal();
        window.location.reload();
      }, 900);
    } catch (e: any) {
      toast({
        title: "Erreur inattendue",
        description: e?.message || "Erreur inattendue.",
        variant: "destructive"
      });
    } finally {
      setEditFormLoading(false);
    }
  };

  // Delete confirm
  const handleDeleteConfirm = async () => {
    if (!deleteModalSeason) return;
    setDeleteFormLoading(true);
    setDeleteFormError(null);
    setDeleteFormSuccess(null);
    try {
      // Supprimer tous les épisodes liés
      await supabase.from('episodes').delete().eq('season_id', deleteModalSeason.id);
      // Supprimer la saison
      const { error } = await supabase.from('seasons').delete().eq('id', deleteModalSeason.id);
      if (error) {
        toast({
          title: "Erreur",
          description: error.message || "Erreur lors de la suppression.",
          variant: "destructive"
        });
        setDeleteFormLoading(false);
        return;
      }
      toast({
        title: "Saison supprimée",
        description: "La saison et ses épisodes ont été supprimés."
      });
      setTimeout(() => {
        closeDeleteModal();
        window.location.reload();
      }, 900);
    } catch (e: any) {
      toast({
        title: "Erreur inattendue",
        description: e?.message || "Erreur inattendue.",
        variant: "destructive"
      });
      setDeleteFormLoading(false);
    }
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

      {/* Les feedbacks inline sont désormais gérés par toasts */}

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
                      <Button size="sm" variant="outline" onClick={() => openEditModal(season)}>
                        <Edit className="h-4 w-4 mr-1" /> Éditer
                      </Button>
                      <Button size="sm" variant="default" onClick={() => handleAddEpisode(season.id)}>
                        <Plus className="h-4 w-4 mr-1" /> Ajouter épisode
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => openDeleteModal(season)}>
                        <Trash2 className="h-4 w-4 mr-1" /> Supprimer
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Modale édition saison */}
          {editModalSeason && (
            <div className="fixed z-50 inset-0 bg-black/60 flex items-center justify-center">
              <div className="bg-gray-900 rounded-lg max-w-md w-full p-6 shadow-2xl relative">
                <button
                  onClick={closeEditModal}
                  className="absolute top-2 right-3 text-gray-400 hover:text-red-500"
                  aria-label="Fermer"
                >✕</button>
                <h2 className="text-xl font-bold mb-3 flex items-center">
                  <Edit className="h-5 w-5 mr-2" />
                  Éditer la saison {editModalSeason.number}
                </h2>
                <form onSubmit={handleEditSubmit}>
                  <div className="mb-4">
                    <label className="block font-medium text-gray-200 mb-1" htmlFor="edit-title">Titre</label>
                    <input
                      id="edit-title"
                      className="input input-bordered w-full px-3 py-2 rounded"
                      value={editForm.title}
                      onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))}
                      disabled={editFormLoading}
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block font-medium text-gray-200 mb-1" htmlFor="edit-description">Description</label>
                    <textarea
                      id="edit-description"
                      className="input input-bordered w-full px-3 py-2 rounded"
                      rows={3}
                      value={editForm.description}
                      onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))}
                      disabled={editFormLoading}
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block font-medium text-gray-200 mb-1" htmlFor="edit-poster">URL poster</label>
                    <input
                      id="edit-poster"
                      className="input input-bordered w-full px-3 py-2 rounded"
                      value={editForm.poster}
                      onChange={e => setEditForm(f => ({ ...f, poster: e.target.value }))}
                      disabled={editFormLoading}
                    />
                    {editForm.poster && (
                      <img src={editForm.poster} alt="Poster" className="mt-2 w-20 h-28 object-cover rounded shadow" />
                    )}
                  </div>
                  {editFormError && <div className="text-red-500 mb-2">{editFormError}</div>}
                  {editFormSuccess && <div className="text-green-500 mb-2">{editFormSuccess}</div>}
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" type="button" onClick={closeEditModal} disabled={editFormLoading}>Annuler</Button>
                    <Button variant="default" type="submit" disabled={editFormLoading}>
                      {editFormLoading ? (
                        <>
                          <Loader2 className="animate-spin h-4 w-4 mr-1" />
                          Enregistrement...
                        </>
                      ) : (
                        <>Enregistrer</>
                      )}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Modale suppression saison */}
          {deleteModalSeason && (
            <div className="fixed z-50 inset-0 bg-black/60 flex items-center justify-center">
              <div className="bg-gray-900 rounded-lg max-w-md w-full p-6 shadow-2xl relative">
                <button
                  onClick={closeDeleteModal}
                  className="absolute top-2 right-3 text-gray-400 hover:text-red-500"
                  aria-label="Fermer"
                >✕</button>
                <h2 className="text-xl font-bold mb-3 flex items-center text-red-400">
                  <Trash2 className="h-5 w-5 mr-2" />
                  Supprimer la saison {deleteModalSeason.number}
                </h2>
                <div className="mb-4 text-gray-200">
                  Es-tu sûr de vouloir supprimer cette saison ?<br />
                  <span className="text-sm text-red-400">
                    Cette action supprimera aussi tous les épisodes associés.
                  </span>
                </div>
                {deleteFormError && <div className="text-red-500 mb-2">{deleteFormError}</div>}
                {deleteFormSuccess && <div className="text-green-500 mb-2">{deleteFormSuccess}</div>}
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={closeDeleteModal} disabled={deleteFormLoading}>Annuler</Button>
                  <Button variant="destructive" onClick={handleDeleteConfirm} disabled={deleteFormLoading}>
                    {deleteFormLoading ? (
                      <>
                        <Loader2 className="animate-spin h-4 w-4 mr-1" />
                        Suppression...
                      </>
                    ) : (
                      <>Supprimer</>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
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