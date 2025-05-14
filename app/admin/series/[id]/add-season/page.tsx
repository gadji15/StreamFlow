'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Save, Download, Loader2, CheckCircle2, Image as ImageIcon } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { useToast } from '@/components/ui/use-toast';

type Series = {
  id: string;
  title: string;
  tmdb_id?: number | null;
};

type Season = {
  id: string;
  season_number: number;
  title?: string;
  poster?: string | null;
  description?: string | null;
};

export default function AddSeasonPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const { toast } = useToast();

  const [series, setSeries] = useState<Series | null>(null);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);

  // Saisons locales déjà ajoutées
  const [existingSeasons, setExistingSeasons] = useState<Season[]>([]);
  // Saisons TMDb disponibles
  const [tmdbSeasons, setTmdbSeasons] = useState<any[]>([]);
  const [fetchingTmdb, setFetchingTmdb] = useState(false);

  // State du formulaire (manuel ou import TMDb)
  const [season_number, setSeasonNumber] = useState<number>(1);
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [poster, setPoster] = useState<string>('');
  const [importing, setImporting] = useState<boolean>(false);

  // Eviter import multiple rapide
  const importRef = useRef(false);

  // Charger la série et ses saisons locales
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { data: s, error: sErr } = await supabase
          .from('series')
          .select('id, title, tmdb_id')
          .eq('id', id)
          .single();
        if (sErr || !s) {
          toast({
            title: "Erreur",
            description: "Série introuvable.",
            variant: "destructive"
          });
          setSeries(null);
          setExistingSeasons([]);
        } else {
          setSeries(s);
          // Charger les saisons locales
          const { data: seasons, error: seaErr } = await supabase
            .from('seasons')
            .select('id, season_number, title, poster, description')
            .eq('series_id', id)
            .order('season_number', { ascending: true });
          setExistingSeasons(seasons || []);
        }
      } catch (e: any) {
        toast({
          title: "Erreur",
          description: e?.message || "Erreur inattendue.",
          variant: "destructive"
        });
        setSeries(null);
        setExistingSeasons([]);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchData();
  }, [id, toast]);

  // Charger les saisons TMDb de la série si tmdb_id dispo
  useEffect(() => {
    const fetchTmdbSeasons = async () => {
      if (!series?.tmdb_id) return;
      setFetchingTmdb(true);
      try {
        const res = await fetch(
          `https://api.themoviedb.org/3/tv/${series.tmdb_id}?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}&language=fr-FR`
        );
        const data = await res.json();
        if (data.status_code) throw new Error(data.status_message || "Erreur TMDb.");
        setTmdbSeasons(Array.isArray(data.seasons) ? data.seasons : []);
      } catch (e: any) {
        toast({
          title: "Erreur TMDb",
          description: e?.message || "Erreur lors du fetch TMDb.",
          variant: "destructive"
        });
        setTmdbSeasons([]);
      } finally {
        setFetchingTmdb(false);
      }
    };
    if (series?.tmdb_id) fetchTmdbSeasons();
  }, [series, toast]);

  // Importer une saison TMDb en pré-remplissant le form
  const handleImportTmdbSeason = async (seasonNumber: number) => {
    if (!series?.tmdb_id || !seasonNumber || importRef.current) return;
    setImporting(true);
    importRef.current = true;
    try {
      const res = await fetch(
        `https://api.themoviedb.org/3/tv/${series.tmdb_id}/season/${seasonNumber}?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}&language=fr-FR`
      );
      const tmdb = await res.json();
      if (tmdb.status_code) throw new Error(tmdb.status_message || "Erreur TMDb.");
      setSeasonNumber(seasonNumber);
      setTitle(tmdb.name || '');
      setDescription(tmdb.overview || '');
      setPoster(tmdb.poster_path ? `https://image.tmdb.org/t/p/w500${tmdb.poster_path}` : '');
      toast({
        title: "Import TMDb réussi",
        description: "Vérifie et complète les champs si besoin.",
        variant: "default"
      });
    } catch (e: any) {
      toast({
        title: "Erreur import TMDb",
        description: e?.message || "Erreur lors de l'import TMDb.",
        variant: "destructive"
      });
    } finally {
      setImporting(false);
      importRef.current = false;
    }
  };

  // Validation anti-doublon et enregistrement
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      // Double sécurité anti-doublon
      const { data: existing, error: checkErr } = await supabase
        .from('seasons')
        .select('id')
        .eq('series_id', id)
        .eq('season_number', season_number)
        .maybeSingle();
      if (existing) {
        toast({
          title: "Erreur",
          description: "Une saison avec ce numéro existe déjà pour cette série.",
          variant: "destructive"
        });
        setFormLoading(false);
        return;
      }
      // Insertion
      const { data, error: insertErr } = await supabase
        .from('seasons')
        .insert([{
          series_id: id,
          season_number,
          title,
          description,
          poster,
        }])
        .select()
        .single();
      if (insertErr || !data) {
        toast({
          title: "Erreur",
          description: insertErr?.message || "Erreur lors de l'ajout.",
          variant: "destructive"
        });
        setFormLoading(false);
        return;
      }
      toast({
        title: "Saison ajoutée",
        description: "La saison a bien été ajoutée.",
        variant: "default"
      });
      setTimeout(() => router.push(`/admin/series/${id}`), 900);
    } catch (e: any) {
      toast({
        title: "Erreur inattendue",
        description: e?.message || "Erreur inconnue.",
        variant: "destructive"
      });
    } finally {
      setFormLoading(false);
    }
  };

  // Saisons déjà ajoutées (numéro)
  const existingNumbers = new Set(existingSeasons.map(s => s.season_number));

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Button asChild variant="ghost" size="sm" className="mb-6">
        <Link href={`/admin/series/${id}`}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Retour fiche série
        </Link>
      </Button>

      <h1 className="text-2xl font-bold mb-2">
        Ajouter une saison {series?.title ? <>à <span className="text-indigo-300">{series.title}</span></> : null}
      </h1>

      {loading && (
        <div className="flex items-center justify-center min-h-[20vh]">
          <Loader2 className="animate-spin h-8 w-8 text-indigo-500" />
        </div>
      )}

      {!loading && series && (
        <>
          {/* Saisons déjà ajoutées */}
          <div className="mb-6">
            <h2 className="text-base font-semibold text-gray-200 mb-2">Saisons déjà ajoutées :</h2>
            <div className="flex flex-wrap gap-2">
              {existingSeasons.length === 0 ? (
                <span className="text-gray-400 italic">Aucune saison enregistrée pour cette série.</span>
              ) : (
                existingSeasons.map(s =>
                  <span key={s.season_number} className="inline-flex items-center bg-gray-700 text-white rounded px-2 py-1 text-xs">
                    <CheckCircle2 className="h-4 w-4 mr-1 text-green-400" />
                    Saison {s.season_number}{s.title ? ` — ${s.title}` : ""}
                  </span>
                )
              )}
            </div>
          </div>

          {/* Saisons TMDb à importer */}
          {series.tmdb_id && (
            <div className="mb-8">
              <h2 className="text-base font-semibold text-gray-200 mb-2">Importer une saison depuis TMDb :</h2>
              {fetchingTmdb ? (
                <div className="flex items-center gap-2 text-indigo-400">
                  <Loader2 className="animate-spin h-4 w-4" />
                  Chargement des saisons TMDb...
                </div>
              ) : tmdbSeasons.length === 0 ? (
                <span className="text-gray-400 italic">Aucune saison TMDb trouvée pour cette série.</span>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {tmdbSeasons.map(season => {
                    const alreadyAdded = existingNumbers.has(season.season_number);
                    return (
                      <Button
                        key={season.season_number}
                        type="button"
                        size="sm"
                        variant={alreadyAdded ? "outline" : "default"}
                        disabled={alreadyAdded || importing}
                        className="flex items-center gap-2 px-3"
                        onClick={() => handleImportTmdbSeason(season.season_number)}
                        title={alreadyAdded ? "Déjà ajoutée" : "Importer"}
                      >
                        {alreadyAdded ? (
                          <>
                            <CheckCircle2 className="h-4 w-4 text-green-400" />
                            Saison {season.season_number}
                          </>
                        ) : (
                          <>
                            <Download className="h-4 w-4" />
                            Importer Saison {season.season_number}
                          </>
                        )}
                        {season.name && (
                          <span className="ml-1 text-xs text-gray-300 font-normal truncate max-w-[80px]">{season.name}</span>
                        )}
                      </Button>
                    )
                  })}
                </div>
              )}
              <div className="mt-2 text-xs text-gray-400 italic">
                Clique sur "Importer" pour pré-remplir le formulaire ci-dessous.
              </div>
            </div>
          )}

          {/* Formulaire d'ajout de saison (manuel ou importé) */}
          <form onSubmit={handleSubmit} className="space-y-6 bg-gray-800 p-6 rounded-lg shadow-lg">
            <div>
              <Label htmlFor="season_number">Numéro de saison <span className="text-red-500">*</span></Label>
              <Input
                id="season_number"
                type="number"
                min={1}
                value={season_number}
                onChange={e => setSeasonNumber(parseInt(e.target.value) || 1)}
                required
                className="mt-1"
                disabled={formLoading}
              />
            </div>
            <div>
              <Label htmlFor="title">Titre de la saison</Label>
              <Input
                id="title"
                value={title}
                onChange={e => setTitle(e.target.value)}
                disabled={formLoading}
                placeholder="Titre (ex: Saison 1, Première saison...)"
              />
            </div>
            <div>
              <Label htmlFor="description">Synopsis</Label>
              <Textarea
                id="description"
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={3}
                disabled={formLoading}
                placeholder="Résumé de la saison"
              />
            </div>
            <div>
              <Label htmlFor="poster">URL poster (optionnel)</Label>
              <Input
                id="poster"
                value={poster}
                onChange={e => setPoster(e.target.value)}
                disabled={formLoading}
                placeholder="Lien image TMDb ou upload personnalisé"
              />
              {poster && (
                <img src={poster} alt="Poster saison" className="mt-2 w-28 h-40 object-cover rounded shadow" />
              )}
            </div>
            <div className="flex justify-end mt-6">
              <Button type="submit" disabled={formLoading}>
                {formLoading ? (
                  <>
                    <Loader2 className="animate-spin h-4 w-4 mr-2" />
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Enregistrer la saison
                  </>
                )}
              </Button>
            </div>
          </form>
        </>
      )}
    </div>
  );
}