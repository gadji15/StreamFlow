'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { ImageUpload } from '@/components/admin/image-upload';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

export default function AdminEditEpisodePage() {
  const router = useRouter();
  const params = useParams();
  const seriesId = params?.id as string;
  const episodeId = params?.episodeId as string;
  
  const { toast } = useToast();
  
  // États pour la série
  const [seriesTitle, setSeriesTitle] = useState('');
  
  // États pour le formulaire
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [season, setSeason] = useState<number>(1);
  const [episodeNumber, setEpisodeNumber] = useState<number>(1);
  const [duration, setDuration] = useState<number>(45);
  const [videoUrl, setVideoUrl] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState<string | undefined>();
  const [isVIP, setIsVIP] = useState(false);
  const [isPublished, setIsPublished] = useState(false);
  
  // État pour l'image de miniature
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  
  // État de chargement et soumission
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Charger les informations de la série et de l'épisode
  useEffect(() => {
    const loadData = async () => {
      if (!seriesId || !episodeId) return;
      
      setLoading(true);
      try {
        // Charger la série
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

        // Charger l'épisode
        const { data: episodeData, error: episodeError } = await supabase
          .from('episodes')
          .select('*')
          .eq('id', episodeId)
          .single();

        if (episodeError || !episodeData) {
          setError('Épisode non trouvé');
          return;
        }

        // Remplir le formulaire avec les données de l'épisode
        setTitle(episodeData.title);
        setDescription(episodeData.description);
        setSeason(episodeData.season);
        setEpisodeNumber(episodeData.episode_number);
        setDuration(episodeData.duration);
        setVideoUrl(episodeData.video_url || '');
        setThumbnailUrl(episodeData.thumbnail_url);
        setIsVIP(episodeData.is_vip);
        setIsPublished(episodeData.published);
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        setError('Impossible de charger les données de l\'épisode');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [seriesId, episodeId]);
  
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
    
    setIsSubmitting(true);
    
    try {
      // Upload de la miniature si modifiée
      let publicThumbnailUrl = thumbnailUrl || '';
      if (thumbnailFile) {
        const { data, error } = await supabase.storage
          .from('episode-thumbnails')
          .upload(`thumbnails/${Date.now()}-${thumbnailFile.name}`, thumbnailFile, { cacheControl: '3600', upsert: false });
        if (error) throw error;
        const { data: urlData } = supabase.storage.from('episode-thumbnails').getPublicUrl(data.path);
        publicThumbnailUrl = urlData?.publicUrl || '';
      }

      // Préparer les données de l'épisode
      const updateFields = {
        title,
        description,
        season,
        episode_number: episodeNumber,
        duration,
        video_url: videoUrl || null,
        is_vip: isVIP,
        published: isPublished,
        thumbnail_url: publicThumbnailUrl || null,
      };

      // Mettre à jour l'épisode
      const { error: updateError } = await supabase
        .from('episodes')
        .update(updateFields)
        .eq('id', episodeId);

      if (updateError) {
        throw updateError;
      }

      toast({
        title: 'Épisode mis à jour',
        description: `L'épisode "${title}" a été mis à jour avec succès.`,
      });

      // Rediriger vers la liste des épisodes
      router.push(`/admin/series/${seriesId}/episodes`);
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'épisode:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour l\'épisode. Veuillez réessayer.',
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
        <Loader2 className="h-12 w-12 animate-spin text-indigo-500" />
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
          onClick={() => router.push(`/admin/series/${seriesId}/episodes`)}
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Retour aux épisodes
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
          <h1 className="text-3xl font-bold">Modifier un épisode</h1>
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
                <Label htmlFor="season">Saison</Label>
                <Input
                  id="season"
                  type="number"
                  min="1"
                  value={season}
                  onChange={(e) => setSeason(parseInt(e.target.value) || 1)}
                />
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
              previewUrl={thumbnailUrl}
              aspectRatio="16:9"
              label="Modifier la miniature"
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
                <Label htmlFor="isPublished">Publier</Label>
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