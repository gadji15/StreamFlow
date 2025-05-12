'use client';

import { useState, useEffect } from 'react';
import type { ChangeEvent } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { ImageUpload } from '@/components/admin/image-upload';
import { ArrowLeft, Save, Film } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

export default function AdminAddEpisodePage() {
  const router = useRouter();
  const params = useParams();
  const seriesId = params?.id as string;
  
  const { toast } = useToast();
  
  // États pour la série et ses saisons
  const [seriesTitle, setSeriesTitle] = useState('');
  const [seasons, setSeasons] = useState<number>(0);
  const [seasonList, setSeasonList] = useState<{ id: string, number: number, title?: string | null }[]>([]);
  const [latestEpisodeNumbers, setLatestEpisodeNumbers] = useState<Record<string, number>>({});
  
  // États pour le formulaire
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [seasonId, setSeasonId] = useState<string>(''); // UUID de la saison sélectionnée
  const [episodeNumber, setEpisodeNumber] = useState<number>(1);
  const [duration, setDuration] = useState<number>(45);
  const [videoUrl, setVideoUrl] = useState('');
  const [isVIP, setIsVIP] = useState(false);
  const [isPublished, setIsPublished] = useState(false);
  
  // État pour l'image de miniature
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  
  // État de chargement et soumission
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Charger les informations de la série
  useEffect(() => {
    const loadSeriesAndSeasons = async () => {
      if (!seriesId) return;

      setLoading(true);
      try {
        // Charger la série (titre)
        const { data: seriesData, error: seriesError } = await supabase
          .from('series')
          .select('title')
          .eq('id', seriesId)
          .single();
        if (seriesError || !seriesData) {
          setError('Série non trouvée');
          return;
        }
        setSeriesTitle(seriesData.title);

        // Charger les saisons de la série
        const { data: seasonsData, error: seasonsError } = await supabase
          .from('seasons')
          .select('id, number, title')
          .eq('series_id', seriesId)
          .order('number', { ascending: true });
        if (seasonsError || !seasonsData || seasonsData.length === 0) {
          setError('Aucune saison trouvée pour cette série.');
          setSeasonList([]);
          return;
        }
        setSeasonList(seasonsData);

        // Par défaut, sélectionner la dernière saison (ou la première)
        const defaultSeason = seasonsData[seasonsData.length - 1]?.id || seasonsData[0].id;
        setSeasonId(defaultSeason);

        // Charger les épisodes pour déterminer le prochain numéro d'épisode par saison
        const { data: episodes } = await supabase
          .from('episodes')
          .select('season_id, episode_number')
          .eq('series_id', seriesId);

        const episodeNumbersBySeason: Record<string, number> = {};
        (episodes || []).forEach(episode => {
          const sId = episode.season_id;
          const num = episode.episode_number;
          if (!episodeNumbersBySeason[sId] || num > episodeNumbersBySeason[sId]) {
            episodeNumbersBySeason[sId] = num;
          }
        });
        setLatestEpisodeNumbers(episodeNumbersBySeason);

        // Définir le numéro d'épisode par défaut (pour la saison sélectionnée)
        const lastNum = episodeNumbersBySeason[defaultSeason] || 0;
        setEpisodeNumber(lastNum + 1);
      } catch (error) {
        console.error('Erreur lors du chargement des infos de la série/saisons:', error);
        setError('Impossible de charger les informations de la série');
      } finally {
        setLoading(false);
      }
    };

    loadSeriesAndSeasons();
  }, [seriesId]);

  // Mettre à jour le numéro d'épisode quand la saison change
  useEffect(() => {
    if (!seasonId) return;
    const lastNum = latestEpisodeNumbers[seasonId] || 0;
    setEpisodeNumber(lastNum + 1);
  }, [seasonId, latestEpisodeNumbers]);
  
  // Gérer la soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation de base
    if (!title) {
      toast({
        title: 'Erreur',
        description: 'Le titre de l\'épisode est requis.',
        variant: 'destructive',
      });
      return;
    }
    if (!seasonId) {
      toast({
        title: 'Erreur',
        description: 'Veuillez sélectionner une saison.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload de la miniature si présente
      let thumbnailUrl = '';
      if (thumbnailFile) {
        const { data, error } = await supabase.storage
          .from('episode-thumbnails')
          .upload(`thumbnails/${Date.now()}-${thumbnailFile.name}`, thumbnailFile, { cacheControl: '3600', upsert: false });
        if (error) throw error;
        const { data: urlData } = supabase.storage.from('episode-thumbnails').getPublicUrl(data.path);
        thumbnailUrl = urlData?.publicUrl || '';
      }

      // Saison sélectionnée (pour numéro de saison aussi)
      const selectedSeason = seasonList.find(s => s.id === seasonId);
      const seasonNumber = selectedSeason?.number || 1;

      // Préparer les données de l'épisode
      const episodeData = {
        series_id: seriesId,
        title,
        description,
        season: seasonNumber,
        season_id: seasonId,
        episode_number: episodeNumber,
        duration,
        video_url: videoUrl || null,
        is_vip: isVIP,
        published: isPublished,
        thumbnail_url: thumbnailUrl || null,
      };

      // Ajouter l'épisode
      const { data: insertData, error: insertError } = await supabase
        .from('episodes')
        .insert([episodeData])
        .select()
        .single();

      if (insertError || !insertData) {
        throw insertError || new Error("Impossible d'ajouter l'épisode.");
      }

      toast({
        title: 'Épisode ajouté',
        description: `L'épisode "${title}" a été ajouté avec succès.`,
      });

      // Rediriger vers la liste des épisodes
      router.push(`/admin/series/${seriesId}/episodes`);
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'épisode:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible d\'ajouter l\'épisode. Veuillez réessayer.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Afficher un message de chargement
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }
  
  // Afficher un message d'erreur
  if (error) {
    return (
      <div className="space-y-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/admin/series')}
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Retour à la liste des séries
        </Button>
        
        <div className="bg-red-900/20 border border-red-800 rounded-lg p-6 text-center">
          <h2 className="text-xl font-bold mb-2">Erreur</h2>
          <p className="text-gray-300">{error}</p>
        </div>
      </div>
    );
  }
  
  return (
    <div>
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(`/admin/series/${seriesId}/episodes`)}
          className="mr-2"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Retour
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Ajouter un épisode</h1>
          <p className="text-gray-400">
            Série : {seriesTitle}
          </p>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-gray-800 rounded-lg p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="title">Titre <span className="text-red-500">*</span></Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="season">Saison <span className="text-red-500">*</span></Label>
                <select
                  id="season"
                  value={seasonId}
                  onChange={(e: ChangeEvent<HTMLSelectElement>) => setSeasonId(e.target.value)}
                  className="bg-gray-900 border-gray-700 rounded px-2 py-2 w-full text-white"
                  required
                  aria-label="Saison"
                >
                  <option value="" disabled>Choisir une saison</option>
                  {seasonList.map(season => (
                    <option key={season.id} value={season.id}>
                      Saison {season.number}{season.title ? ` - ${season.title}` : ''}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="episodeNumber">Numéro d'épisode</Label>
                <Input
                  id="episodeNumber"
                  type="number"
                  min="1"
                  value={episodeNumber}
                  onChange={(e) => setEpisodeNumber(parseInt(e.target.value) || 1)}
                />
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="duration">Durée (minutes)</Label>
              <Input
                id="duration"
                type="number"
                min="1"
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value) || 45)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="videoUrl">URL de la vidéo</Label>
              <Input
                id="videoUrl"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://example.com/video.mp4"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="thumbnail">Miniature de l'épisode</Label>
            <ImageUpload
              onImageSelected={(file) => setThumbnailFile(file)}
              aspectRatio="16:9"
              label="Ajouter une miniature"
            />
            <p className="text-xs text-gray-400">
              Format recommandé: 1280x720 pixels (ratio 16:9), JPG ou PNG.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="isVIP">Contenu VIP</Label>
                <Switch
                  id="isVIP"
                  checked={isVIP}
                  onCheckedChange={setIsVIP}
                />
              </div>
              <p className="text-xs text-gray-400">
                Activer pour rendre cet épisode disponible uniquement pour les utilisateurs VIP.
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="isPublished">Publier maintenant</Label>
                <Switch
                  id="isPublished"
                  checked={isPublished}
                  onCheckedChange={setIsPublished}
                />
              </div>
              <p className="text-xs text-gray-400">
                Activer pour rendre cet épisode visible sur le site.
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(`/admin/series/${seriesId}/episodes`)}
            disabled={isSubmitting}
          >
            Annuler
          </Button>
          
          <Button
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                Enregistrement...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Enregistrer
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}