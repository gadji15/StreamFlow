'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { ImageUpload } from '@/components/admin/image-upload';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { 
  Tv, 
  Info, 
  Image as ImageIcon, 
  Save, 
  ArrowLeft,
  Plus,
  X,
  Loader2
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

type Series = {
  id: string;
  title: string;
  original_title?: string;
  description: string;
  start_year: number;
  end_year?: number | null;
  creator?: string;
  genres?: string[];
  cast?: { name: string; role: string }[];
  trailer_url?: string;
  is_vip?: boolean;
  published?: boolean;
  poster_url?: string;
  backdrop_url?: string;
};

export default function AdminEditSeriesPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const id = params?.id as string;
  
  // États pour la série
  const [series, setSeries] = useState<Series | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // États pour le formulaire
  const [title, setTitle] = useState('');
  const [originalTitle, setOriginalTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startYear, setStartYear] = useState<number>(new Date().getFullYear());
  const [endYear, setEndYear] = useState<number | null>(null);
  const [creator, setCreator] = useState('');
  const [availableGenres, setAvailableGenres] = useState<{id: string, name: string}[]>([]);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [isVIP, setIsVIP] = useState(false);
  const [isPublished, setIsPublished] = useState(false);
  const [trailerUrl, setTrailerUrl] = useState('');
  const [cast, setCast] = useState<{name: string, role: string}[]>([]);
  
  // États pour les médias
  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [backdropFile, setBackdropFile] = useState<File | null>(null);
  
  // État de soumission
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Charger la série
  useEffect(() => {
    const loadSeries = async () => {
      if (!id) return;

      setLoading(true);
      try {
        const { data: seriesData, error: seriesError } = await supabase
          .from('series')
          .select('*')
          .eq('id', id)
          .single();

        if (seriesError || !seriesData) {
          setError('Série non trouvée');
          return;
        }

        setSeries(seriesData);

        // Initialiser les champs du formulaire
        setTitle(seriesData.title);
        setOriginalTitle(seriesData.original_title || '');
        setDescription(seriesData.description);
        setStartYear(seriesData.start_year);
        setEndYear(seriesData.end_year || null);
        setCreator(seriesData.creator || '');
        setSelectedGenres(seriesData.genres || []);
        setIsVIP(seriesData.is_vip || false);
        setIsPublished(seriesData.published || false);
        setTrailerUrl(seriesData.trailer_url || '');
        setCast(seriesData.cast || [{ name: '', role: '' }]);
      } catch (error) {
        console.error('Erreur lors du chargement de la série:', error);
        setError('Impossible de charger les données de la série');
      } finally {
        setLoading(false);
      }
    };

    // Charger les genres
    const loadGenres = async () => {
      try {
        const { data, error } = await supabase.from('genres').select('id, name');
        if (error) throw error;
        setAvailableGenres(data || []);
      } catch (error) {
        console.error('Erreur lors du chargement des genres:', error);
      }
    };

    loadSeries();
    loadGenres();
  }, [id]);
  
  // Gérer les genres
  const handleGenreChange = (genreId: string, checked: boolean) => {
    if (checked) {
      setSelectedGenres([...selectedGenres, genreId]);
    } else {
      setSelectedGenres(selectedGenres.filter(id => id !== genreId));
    }
  };
  
  // Gérer le casting
  const addCastMember = () => {
    setCast([...cast, { name: '', role: '' }]);
  };
  
  const removeCastMember = (index: number) => {
    setCast(cast.filter((_, i) => i !== index));
  };
  
  const updateCastMember = (index: number, field: 'name' | 'role', value: string) => {
    const updatedCast = [...cast];
    updatedCast[index][field] = value;
    setCast(updatedCast);
  };
  
  // Soumettre le formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!id) return;
    
    // Validation de base
    if (!title) {
      toast({
        title: 'Erreur',
        description: 'Le titre de la série est requis.',
        variant: 'destructive',
      });
      return;
    }
    
    if (selectedGenres.length === 0) {
      toast({
        title: 'Erreur',
        description: 'Veuillez sélectionner au moins un genre.',
        variant: 'destructive',
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Préparer les données du casting (ignorer les membres vides)
      const formattedCast = cast
        .filter(member => member.name.trim() !== '')
        .map(member => ({
          name: member.name,
          role: member.role
        }));
      
      // Upload des images si modifiées
      let posterUrl = series?.poster_url || '';
      let backdropUrl = series?.backdrop_url || '';

      if (posterFile) {
        const { data, error } = await supabase.storage
          .from('series-posters')
          .upload(`posters/${Date.now()}-${posterFile.name}`, posterFile, { cacheControl: '3600', upsert: false });
        if (error) throw error;
        const { data: urlData } = supabase.storage.from('series-posters').getPublicUrl(data.path);
        posterUrl = urlData?.publicUrl || '';
      }

      if (backdropFile) {
        const { data, error } = await supabase.storage
          .from('series-backdrops')
          .upload(`backdrops/${Date.now()}-${backdropFile.name}`, backdropFile, { cacheControl: '3600', upsert: false });
        if (error) throw error;
        const { data: urlData } = supabase.storage.from('series-backdrops').getPublicUrl(data.path);
        backdropUrl = urlData?.publicUrl || '';
      }

      // Préparer les données à mettre à jour
      const updates: Partial<Series> = {
        title,
        original_title: originalTitle || undefined,
        description,
        start_year: startYear,
        end_year: endYear || null,
        creator: creator || undefined,
        genres: selectedGenres,
        cast: cast.filter(member => member.name.trim() !== ''),
        trailer_url: trailerUrl || null,
        is_vip: isVIP,
        published: isPublished,
        poster_url: posterUrl || null,
        backdrop_url: backdropUrl || null,
      };

      // Mettre à jour la série
      const { error: updateError } = await supabase
        .from('series')
        .update(updates)
        .eq('id', id);

      if (!updateError) {
        toast({
          title: 'Série mise à jour',
          description: `La série "${title}" a été mise à jour avec succès.`,
        });
        router.push('/admin/series');
      } else {
        throw updateError;
      }
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour de la série:', error);
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de mettre à jour la série.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Afficher le chargement
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader2 className="h-12 w-12 animate-spin text-indigo-500" />
      </div>
    );
  }
  
  // Afficher l'erreur
  if (error || !series) {
    return (
      <div className="bg-red-900/20 border border-red-800 rounded-lg p-6 text-center">
        <h2 className="text-xl font-bold mb-2">Erreur</h2>
        <p className="text-gray-300">{error || 'Série non trouvée'}</p>
        <Button 
          className="mt-4"
          onClick={() => router.push('/admin/series')}
        >
          Retour à la liste des séries
        </Button>
      </div>
    );
  }
  
  return (
    <div>
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/admin/series')}
          className="mr-2"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Retour
        </Button>
        <h1 className="text-3xl font-bold">Modifier une série</h1>
      </div>
      
      <form onSubmit={handleSubmit} className="w-full max-w-full">
        <Tabs defaultValue="general" className="bg-gray-800 rounded-lg shadow-lg">
          <TabsList className="bg-gray-700 rounded-t-lg p-0 border-b border-gray-600">
            <TabsTrigger value="general" className="rounded-tl-lg rounded-bl-none rounded-tr-none px-5 py-3">
              <Info className="h-4 w-4 mr-2" />
              Informations générales
            </TabsTrigger>
            <TabsTrigger value="media" className="rounded-none px-5 py-3">
              <ImageIcon className="h-4 w-4 mr-2" />
              Médias
            </TabsTrigger>
            <TabsTrigger value="details" className="rounded-tr-lg rounded-bl-none rounded-tl-none px-5 py-3">
              <Tv className="h-4 w-4 mr-2" />
              Détails supplémentaires
            </TabsTrigger>
          </TabsList>
          
          {/* Informations générales */}
          <TabsContent value="general" className="p-6">
            <div className="space-y-6">
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
                
                <div className="space-y-2">
                  <Label htmlFor="originalTitle">Titre original</Label>
                  <Input
                    id="originalTitle"
                    value={originalTitle}
                    onChange={(e) => setOriginalTitle(e.target.value)}
                    placeholder="Titre dans la langue d'origine"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description <span className="text-red-500">*</span></Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="startYear">Année de début</Label>
                  <Input
                    id="startYear"
                    type="number"
                    min="1900"
                    max={new Date().getFullYear() + 5}
                    value={startYear}
                    onChange={(e) => setStartYear(parseInt(e.target.value) || new Date().getFullYear())}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="endYear">Année de fin (optionnel)</Label>
                  <Input
                    id="endYear"
                    type="number"
                    min="1900"
                    max={new Date().getFullYear() + 5}
                    value={endYear || ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      setEndYear(value ? parseInt(value) : null);
                    }}
                    placeholder="En cours"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="creator">Créateur</Label>
                  <Input
                    id="creator"
                    value={creator}
                    onChange={(e) => setCreator(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Genres <span className="text-red-500">*</span></Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {availableGenres.map((genre) => (
                    <div key={genre.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`genre-${genre.id}`}
                        checked={selectedGenres.includes(genre.id)}
                        onCheckedChange={(checked) => 
                          handleGenreChange(genre.id, checked === true)
                        }
                      />
                      <Label 
                        htmlFor={`genre-${genre.id}`}
                        className="text-sm cursor-pointer"
                      >
                        {genre.name}
                      </Label>
                    </div>
                  ))}
                </div>
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
                    Activer pour rendre cette série disponible uniquement pour les utilisateurs VIP.
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
                    Activer pour rendre cette série visible sur le site.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
          
          {/* Médias */}
          <TabsContent value="media" className="p-6">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="poster">Affiche de la série</Label>
                  <ImageUpload
                    onImageSelected={(file) => setPosterFile(file)}
                    previewUrl={series.posterUrl}
                    aspectRatio="2:3"
                    label="Modifier l'affiche"
                  />
                  <p className="text-xs text-gray-400">
                    Format recommandé: 600x900 pixels (ratio 2:3), JPG ou PNG.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="backdrop">Image de fond</Label>
                  <ImageUpload
                    onImageSelected={(file) => setBackdropFile(file)}
                    previewUrl={series.backdropUrl}
                    aspectRatio="16:9"
                    label="Modifier l'image de fond"
                  />
                  <p className="text-xs text-gray-400">
                    Format recommandé: 1920x1080 pixels (ratio 16:9), JPG ou PNG.
                  </p>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="trailerUrl">URL de la bande-annonce</Label>
                <Input
                  id="trailerUrl"
                  value={trailerUrl}
                  onChange={(e) => setTrailerUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                />
                <p className="text-xs text-gray-400">
                  URL YouTube de la bande-annonce.
                </p>
              </div>
            </div>
          </TabsContent>
          
          {/* Détails supplémentaires */}
          <TabsContent value="details" className="p-6">
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label>Casting</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addCastMember}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Ajouter
                  </Button>
                </div>
                
                <div className="space-y-3">
                  {cast.map((member, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <div className="flex-1">
                        <Input
                          value={member.name}
                          onChange={(e) => updateCastMember(index, 'name', e.target.value)}
                          placeholder="Nom de l'acteur"
                          className="mb-2"
                        />
                        <Input
                          value={member.role}
                          onChange={(e) => updateCastMember(index, 'role', e.target.value)}
                          placeholder="Rôle (optionnel)"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeCastMember(index)}
                        className="mt-2"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="flex justify-between mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/admin/series')}
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