'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Save, Download, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

type Series = {
  id: string;
  title: string;
  tmdb_id?: number | null;
};

export default function AddSeasonPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const { toast } = useToast();

  const [series, setSeries] = useState<Series | null>(null);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  // On supprime setError/setSuccess (remplacés par toast)
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // (notif supprimé : tout passe par useToast)

  // Season form state
const [season_number, setSeasonNumber] = useState<number>(1);
const [title, setTitle] = useState<string>('');
const [description, setDescription] = useState<string>('');
const [poster, setPoster] = useState<string>('');
const [importing, setImporting] = useState<boolean>(false);

  // Pour éviter l'import multiple rapide
  const importRef = useRef(false);

  // Charger la série courante
  useEffect(() => {
    const fetchSeries = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase
          .from('series')
          .select('id, title, tmdb_id')
          .eq('id', id)
          .single();
        if (error || !data) {
          toast({
        title: "Erreur",
        description: "Série introuvable.",
        variant: "destructive"
      });
      setSeries(null);
    } else {
      setSeries(data);
    }
  } catch (e: any) {
    toast({
      title: "Erreur",
      description: e?.message || "Erreur inattendue.",
      variant: "destructive"
    });
    setSeries(null);
  } finally {
    setLoading(false);
  }
};
    if (id) fetchSeries();
  }, [id]);

  // Importer depuis TMDb
  const handleImportTmdb = async () => {
    if (!series?.tmdb_id || !season_number || importRef.current) return;
    setImporting(true);
    importRef.current = true;
    try {
      const res = await fetch(
        `https://api.themoviedb.org/3/tv/${series.tmdb_id}/season/${season_number}?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}&language=fr-FR`
      );
      const tmdb = await res.json();
      if (tmdb.status_code) throw new Error(tmdb.status_message || "Erreur TMDb.");
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

  // Validation et enregistrement
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      // Vérifier doublon
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

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      {/* Retour */}
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

      {/* Les messages inline sont gérés via toast, donc on les retire */}

      {!loading && series && (
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
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleImportTmdb}
              disabled={importing || !series.tmdb_id || !season_number}
              title={series.tmdb_id ? "Importer depuis TMDb" : "Aucun tmdb_id disponible"}
            >
              {importing ? <Loader2 className="animate-spin h-4 w-4 mr-1" /> : <Download className="h-4 w-4 mr-1" />}
              Import TMDb
            </Button>
            <span className="text-xs text-gray-400">Pré-remplit les champs si trouvés sur TMDb</span>
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
      )}
    </div>
  );
}