'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Plus, Edit, ChevronRight, Loader2, Download, Save, ListVideo } from 'lucide-react';

type Series = { id: string; title: string; tmdb_id?: number | null };
type Season = {
  id: string;
  number: number;
  title?: string;
  poster?: string;
  description?: string;
  tmdb_id?: number | null;
  series_id: string;
};
type Episode = {
  id: string;
  number: number;
  title?: string;
  description?: string;
  duration?: number | null;
  poster?: string;
  video_url?: string;
  season_id: string;
};

export default function SeasonDetailPage() {
  const { id: seriesId, seasonId } = useParams() as { id: string; seasonId: string };
  const router = useRouter();

  const [series, setSeries] = useState<Series | null>(null);
  const [season, setSeason] = useState<Season | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // Add episode modal/form
  const [showAdd, setShowAdd] = useState(false);
  const [epNumber, setEpNumber] = useState<number>(1);
  const [epTitle, setEpTitle] = useState<string>('');
  const [epDescription, setEpDescription] = useState<string>('');
  const [epDuration, setEpDuration] = useState<number | ''>('');
  const [epPoster, setEpPoster] = useState<string>('');
  const [epVideoUrl, setEpVideoUrl] = useState<string>('');
  const [epImporting, setEpImporting] = useState(false);
  const [epFormLoading, setEpFormLoading] = useState(false);
  const [epFormError, setEpFormError] = useState<string | null>(null);
  const [epFormSuccess, setEpFormSuccess] = useState<string | null>(null);
  const epImportRef = useRef(false);

  // Fetch season, series, and episodes
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setErr(null);
      try {
        // Series
        const { data: seriesData, error: seriesErr } = await supabase
          .from('series')
          .select('id, title, tmdb_id')
          .eq('id', seriesId)
          .single();
        setSeries(seriesData || null);

        // Season
        const { data: seasonData, error: seasonErr } = await supabase
          .from('seasons')
          .select('id, number, title, poster, description, series_id, tmdb_id')
          .eq('id', seasonId)
          .single();
        setSeason(seasonData || null);

        // Episodes
        const { data: episodesData, error: epErr } = await supabase
          .from('episodes')
          .select('id, number, title, description, duration, poster, video_url, season_id')
          .eq('season_id', seasonId)
          .order('number', { ascending: true });
        setEpisodes(episodesData || []);
      } catch (e: any) {
        setErr(e?.message || "Erreur inattendue.");
        setSeries(null);
        setSeason(null);
        setEpisodes([]);
      } finally {
        setLoading(false);
      }
    };
    if (seriesId && seasonId) fetchData();
  }, [seriesId, seasonId]);

  // Import TMDb
  const handleImportTmdb = async () => {
    if (!(series?.tmdb_id && season?.number && epNumber) || epImportRef.current) return;
    setEpImporting(true);
    setEpFormError(null);
    epImportRef.current = true;
    try {
      const res = await fetch(
        `https://api.themoviedb.org/3/tv/${series.tmdb_id}/season/${season.number}?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}&language=fr-FR`
      );
      const tmdb = await res.json();
      if (tmdb.status_code) throw new Error(tmdb.status_message || "Erreur TMDb.");
      const ep = Array.isArray(tmdb.episodes)
        ? tmdb.episodes.find((e: any) => e.episode_number === epNumber)
        : null;
      if (!ep) throw new Error("Épisode non trouvé sur TMDb.");
      setEpTitle(ep.name || '');
      setEpDescription(ep.overview || '');
      setEpDuration(typeof ep.runtime === 'number' ? ep.runtime : '');
      setEpPoster(ep.still_path ? `https://image.tmdb.org/t/p/w500${ep.still_path}` : '');
      setEpVideoUrl('');
      setEpFormSuccess("Import TMDb réussi, veuillez vérifier les champs.");
    } catch (e: any) {
      setEpFormError(e?.message || "Erreur lors de l'import TMDb.");
    } finally {
      setEpImporting(false);
      epImportRef.current = false;
    }
  };

  // Ajout d'un épisode
  const handleAddEpisode = async (e: React.FormEvent) => {
    e.preventDefault();
    setEpFormLoading(true);
    setEpFormError(null);
    setEpFormSuccess(null);
    try {
      // Vérif doublon
      const { data: existing } = await supabase
        .from('episodes')
        .select('id')
        .eq('season_id', seasonId)
        .eq('number', epNumber)
        .maybeSingle();
      if (existing) {
        setEpFormError("Cet épisode existe déjà.");
        setEpFormLoading(false);
        return;
      }
      // Insert
      const { data, error } = await supabase
        .from('episodes')
        .insert([{
          season_id: seasonId,
          number: epNumber,
          title: epTitle,
          description: epDescription,
          duration: epDuration ? Number(epDuration) : null,
          poster: epPoster,
          video_url: epVideoUrl,
        }])
        .select()
        .single();
      if (error || !data) {
        setEpFormError(error?.message || "Erreur lors de l'ajout.");
        setEpFormLoading(false);
        return;
      }
      setEpFormSuccess("Épisode ajouté avec succès !");
      setEpNumber(epNumber + 1);
      setEpTitle('');
      setEpDescription('');
      setEpDuration('');
      setEpPoster('');
      setEpVideoUrl('');
      // Refresh episodes
      const { data: episodesData } = await supabase
        .from('episodes')
        .select('id, number, title, description, duration, poster, video_url, season_id')
        .eq('season_id', seasonId)
        .order('number', { ascending: true });
      setEpisodes(episodesData || []);
      setEpFormLoading(false);
    } catch (e: any) {
      setEpFormError(e?.message || "Erreur inattendue.");
      setEpFormLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="mb-4 text-sm text-gray-400 flex items-center gap-2" aria-label="breadcrumb">
        <Link href="/admin/series" className="hover:underline flex items-center">
          <ListVideo className="h-4 w-4 mr-1" /> Séries
        </Link>
        <ChevronRight className="h-4 w-4" />
        <Link href={`/admin/series/${seriesId}`} className="hover:underline">{series?.title || '...'}</Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-white font-medium">{season ? `Saison ${season.number}` : "Saison..."}</span>
      </nav>

      {/* Retour */}
      <Button asChild variant="ghost" size="sm" className="mb-6">
        <Link href={`/admin/series/${seriesId}`}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Retour fiche série
        </Link>
      </Button>

      {/* Loading / Error */}
      {loading && (
        <div className="flex items-center justify-center min-h-[30vh]">
          <Loader2 className="animate-spin h-10 w-10 text-indigo-500" />
        </div>
      )}
      {err && (
        <div className="text-red-500 text-center py-8">{err}</div>
      )}
      {!loading && season && (
        <>
          {/* Saison header */}
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-8">
            {season.poster && (
              <img
                src={season.poster}
                alt={`Poster saison ${season.number}`}
                className="w-24 h-36 object-cover rounded shadow"
              />
            )}
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-white mb-1">
                Saison {season.number}{season.title ? ` — ${season.title}` : ""}
              </h1>
              {season.description && (
                <div className="text-gray-200 text-base mb-2">{season.description}</div>
              )}
              <Button size="sm" variant="default" onClick={() => setShowAdd(true)}>
                <Plus className="h-4 w-4 mr-1" /> Ajouter un épisode
              </Button>
            </div>
          </div>

          {/* Ajout d'un épisode */}
          {showAdd && (
            <form
              onSubmit={handleAddEpisode}
              className="mb-8 bg-gray-800 p-6 rounded-lg shadow-lg max-w-lg"
            >
              <div className="mb-4 flex justify-between items-center">
                <h2 className="text-xl font-semibold text-white">Ajouter un épisode</h2>
                <Button type="button" size="sm" variant="outline" onClick={() => setShowAdd(false)}>
                  Annuler
                </Button>
              </div>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="epNumber">Numéro d'épisode <span className="text-red-500">*</span></Label>
                  <Input
                    id="epNumber"
                    type="number"
                    min={1}
                    value={epNumber}
                    onChange={e => setEpNumber(parseInt(e.target.value) || 1)}
                    required
                    disabled={epFormLoading}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleImportTmdb}
                    disabled={epImporting || !series?.tmdb_id || !season?.number || !epNumber}
                    title={series?.tmdb_id ? "Importer depuis TMDb" : "Aucun tmdb_id disponible"}
                  >
                    {epImporting ? <Loader2 className="animate-spin h-4 w-4 mr-1" /> : <Download className="h-4 w-4 mr-1" />}
                    Import TMDb
                  </Button>
                  <span className="text-xs text-gray-400">Pré-remplit les champs si trouvés sur TMDb</span>
                </div>
                <div>
                  <Label htmlFor="epTitle">Titre</Label>
                  <Input
                    id="epTitle"
                    value={epTitle}
                    onChange={e => setEpTitle(e.target.value)}
                    disabled={epFormLoading}
                    placeholder="Titre de l'épisode"
                  />
                </div>
                <div>
                  <Label htmlFor="epDescription">Synopsis</Label>
                  <Textarea
                    id="epDescription"
                    value={epDescription}
                    onChange={e => setEpDescription(e.target.value)}
                    rows={3}
                    disabled={epFormLoading}
                    placeholder="Résumé épisode"
                  />
                </div>
                <div>
                  <Label htmlFor="epDuration">Durée (minutes)</Label>
                  <Input
                    id="epDuration"
                    type="number"
                    min={1}
                    value={epDuration}
                    onChange={e => setEpDuration(e.target.value ? parseInt(e.target.value) : '')}
                    disabled={epFormLoading}
                  />
                </div>
                <div>
                  <Label htmlFor="epPoster">URL visuel épisode (optionnel)</Label>
                  <Input
                    id="epPoster"
                    value={epPoster}
                    onChange={e => setEpPoster(e.target.value)}
                    disabled={epFormLoading}
                    placeholder="Lien image TMDb ou upload personnalisé"
                  />
                  {epPoster && (
                    <img src={epPoster} alt="Poster épisode" className="mt-2 w-28 h-16 object-cover rounded shadow" />
                  )}
                </div>
                <div>
                  <Label htmlFor="epVideoUrl">URL vidéo (optionnel)</Label>
                  <Input
                    id="epVideoUrl"
                    value={epVideoUrl}
                    onChange={e => setEpVideoUrl(e.target.value)}
                    disabled={epFormLoading}
                    placeholder="URL vidéo (YouTube, mp4, etc.)"
                  />
                </div>
                {epFormError && (
                  <div className="text-red-500">{epFormError}</div>
                )}
                {epFormSuccess && (
                  <div className="text-green-500">{epFormSuccess}</div>
                )}
                <div className="flex justify-end">
                  <Button type="submit" disabled={epFormLoading}>
                    {epFormLoading ? (
                      <>
                        <Loader2 className="animate-spin h-4 w-4 mr-2" />
                        Enregistrement...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Enregistrer l'épisode
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </form>
          )}

          {/* Liste des épisodes */}
          <div>
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
              <ListVideo className="h-5 w-5 mr-2" /> Épisodes
            </h2>
            {episodes.length === 0 ? (
              <div className="text-gray-400 italic px-4 py-8">
                Aucun épisode trouvé pour cette saison.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-lg">
                <table className="min-w-full divide-y divide-gray-700 bg-gray-900">
                  <thead>
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-400">#</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-400">Titre</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-400">Synopsis</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-400">Durée</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-400">Vidéo</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {episodes.map(ep => (
                      <tr key={ep.id} className="hover:bg-gray-800 transition">
                        <td className="px-4 py-2 font-bold">{ep.number}</td>
                        <td className="px-4 py-2">{ep.title || <span className="text-gray-500">-</span>}</td>
                        <td className="px-4 py-2 text-xs max-w-xs truncate">{ep.description || <span className="text-gray-500">-</span>}</td>
                        <td className="px-4 py-2">{ep.duration ? `${ep.duration} min` : '-'}</td>
                        <td className="px-4 py-2">
                          {ep.video_url ? (
                            <a href={ep.video_url} target="_blank" rel="noopener noreferrer" className="text-indigo-400 underline">Voir</a>
                          ) : (
                            <span className="text-gray-500">-</span>
                          )}
                        </td>
                        <td className="px-4 py-2">
                          <Button size="sm" variant="outline" onClick={() => {/* à implémenter : edit episode */}}>
                            <Edit className="h-4 w-4 mr-1" /> Éditer
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}