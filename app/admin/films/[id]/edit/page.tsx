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
  Film, 
  Info, 
  Image as ImageIcon, 
  Save, 
  ArrowLeft,
  Plus,
  X,
  Loader2
} from 'lucide-react';
import { 
  getMovie, 
  updateMovie, 
  getMovieGenres,
  Movie
} from '@/lib/firebase/firestore/movies';

export default function AdminEditFilmPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const id = params?.id as string;
  
  // États pour le film
  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // États pour le formulaire
  const [title, setTitle] = useState('');
  const [originalTitle, setOriginalTitle] = useState('');
  const [description, setDescription] = useState('');
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [duration, setDuration] = useState<number>(90);
  const [director, setDirector] = useState('');
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
  
  // Charger le film
  useEffect(() => {
    const loadMovie = async () => {
      if (!id) return;
      
      setLoading(true);
      try {
        const movieData = await getMovie(id);
        
        if (!movieData) {
          setError('Film non trouvé');
          return;
        }
        
        setMovie(movieData);
        
        // Initialiser les champs du formulaire
        setTitle(movieData.title);
        setOriginalTitle(movieData.originalTitle || '');
        setDescription(movieData.description);
        setYear(movieData.year);
        setDuration(movieData.duration);
        setDirector(movieData.director || '');
        setSelectedGenres(movieData.genres || []);
        setIsVIP(movieData.isVIP);
        setIsPublished(movieData.isPublished);
        setTrailerUrl(movieData.trailerUrl || '');
        setCast(movieData.cast || [{ name: '', role: '' }]);
      } catch (error) {
        console.error('Erreur lors du chargement du film:', error);
        setError('Impossible de charger les données du film');
      } finally {
        setLoading(false);
      }
    };
    
    // Charger les genres
    const loadGenres = async () => {
      try {
        const genres = await getMovieGenres();
        setAvailableGenres(genres);
      } catch (error) {
        console.error('Erreur lors du chargement des genres:', error);
      }
    };
    
    loadMovie();
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
        description: 'Le titre du film est requis.',
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
      
      // Préparer les données à mettre à jour
      const updates: Partial<Movie> = {
        title,
        originalTitle: originalTitle || null,
        description,
        year,
        duration,
        director: director || null,
        genres: selectedGenres,
        cast: formattedCast.length > 0 ? formattedCast : [],
        trailerUrl: trailerUrl || null,
        isVIP,
        isPublished
      };
      
      // Mettre à jour le film
      const result = await updateMovie(id, updates, posterFile, backdropFile);
      
      if (result.success) {
        toast({
          title: 'Film mis à jour',
          description: `Le film "${title}" a été mis à jour avec succès.`,
        });
        
        // Rediriger vers la liste des films
        router.push('/admin/films');
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour du film:', error);
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de mettre à jour le film.',
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
  if (error || !movie) {
    return (
      <div className="bg-red-900/20 border border-red-800 rounded-lg p-6 text-center">
        <h2 className="text-xl font-bold mb-2">Erreur</h2>
        <p className="text-gray-300">{error || 'Film non trouvé'}</p>
        <Button 
          className="mt-4"
          onClick={() => router.push('/admin/films')}
        >
          Retour à la liste des films
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
          onClick={() => router.push('/admin/films')}
          className="mr-2"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Retour
        </Button>
        <h1 className="text-3xl font-bold">Modifier un film</h1>
      </div>
      
      <form onSubmit={handleSubmit}>
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
              <Film className="h-4 w-4 mr-2" />
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
                  <Label htmlFor="year">Année de sortie</Label>
                  <Input
                    id="year"
                    type="number"
                    min="1900"
                    max={new Date().getFullYear() + 5}
                    value={year}
                    onChange={(e) => setYear(parseInt(e.target.value) || new Date().getFullYear())}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="duration">Durée (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    min="1"
                    value={duration}
                    onChange={(e) => setDuration(parseInt(e.target.value) || 90)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="director">Réalisateur</Label>
                  <Input
                    id="director"
                    value={director}
                    onChange={(e) => setDirector(e.target.value)}
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
                    Activer pour rendre ce film disponible uniquement pour les utilisateurs VIP.
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
                    Activer pour rendre ce film visible sur le site.
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
                  <Label htmlFor="poster">Affiche du film</Label>
                  <ImageUpload
                    onImageSelected={(file) => setPosterFile(file)}
                    previewUrl={movie.posterUrl}
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
                    previewUrl={movie.backdropUrl}
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
            onClick={() => router.push('/admin/films')}
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