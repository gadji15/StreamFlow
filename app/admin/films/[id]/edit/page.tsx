'use client';

import { useState, useEffect, useRef } from 'react';
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
import { supabase } from '@/lib/supabaseClient';

type Movie = {
  id: string;
  title: string;
  original_title?: string;
  description: string;
  year: number;
  duration: number;
  director?: string;
  genres?: string[];
  cast?: { name: string; role: string }[];
  trailer_url?: string;
  is_vip?: boolean;
  published?: boolean;
  poster_url?: string;
  backdrop_url?: string;
};

export default function AdminEditFilmPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const id = params?.id as string;

  // TMDB Search State
  const [tmdbQuery, setTmdbQuery] = useState('');
  const [tmdbResults, setTmdbResults] = useState<any[]>([]);
  const [tmdbLoading, setTmdbLoading] = useState(false);
  const [tmdbError, setTmdbError] = useState<string | null>(null);
  const tmdbInputRef = useRef<HTMLInputElement>(null);

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
  const [posterPreview, setPosterPreview] = useState<string | null>(null);
  const [backdropPreview, setBackdropPreview] = useState<string | null>(null);

  // État de soumission
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Charger le film
  useEffect(() => {
    const loadMovie = async () => {
      if (!id) return;

      setLoading(true);
      try {
        const { data: movieData, error: movieError } = await supabase
          .from('films')
          .select('*')
          .eq('id', id)
          .single();

        if (movieError || !movieData) {
          setError('Film non trouvé');
          return;
        }

        setMovie(movieData);

        // Initialiser les champs du formulaire
        setTitle(movieData.title);
        setOriginalTitle(movieData.original_title || '');
        setDescription(movieData.description);
        setYear(movieData.year);
        setDuration(movieData.duration);
        setDirector(movieData.director || '');
        setSelectedGenres(movieData.genres || []);
        setIsVIP(movieData.is_vip || false);
        setIsPublished(movieData.published || false);
        setTrailerUrl(movieData.trailer_url || '');
        setCast(movieData.cast || [{ name: '', role: '' }]);
        setPosterPreview(movieData.poster_url || null);
        setBackdropPreview(movieData.backdrop_url || null);
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
        const { data, error } = await supabase.from('genres').select('id, name');
        if (error) throw error;
        setAvailableGenres(data || []);
      } catch (error) {
        console.error('Erreur lors du chargement des genres:', error);
      }
    };

    loadMovie();
    loadGenres();
  }, [id]);

  // TMDB: Lancer la recherche
  const handleTmdbSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!tmdbQuery.trim()) return;
    setTmdbLoading(true);
    setTmdbError(null);
    setTmdbResults([]);
    try {
      const res = await fetch(`/api/tmdb/movie-search?query=${encodeURIComponent(tmdbQuery)}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setTmdbResults(data.results || []);
    } catch (err: any) {
      setTmdbError(err.message || "Erreur lors de la recherche TMDB.");
    } finally {
      setTmdbLoading(false);
    }
  };

  // TMDB: Sélectionner un film et remplir le formulaire
  const handleSelectTmdbMovie = async (movie: any) => {
    setTitle(movie.title || '');
    setOriginalTitle(movie.original_title || '');
    setDescription(movie.overview || '');
    setYear(movie.release_date ? parseInt(movie.release_date.split('-')[0]) : new Date().getFullYear());
    setPosterPreview(
      movie.poster_path
        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
        : null
    );
    setBackdropPreview(
      movie.backdrop_path
        ? `https://image.tmdb.org/t/p/w780${movie.backdrop_path}`
        : null
    );
    // Genres TMDB → genres du projet
    if (Array.isArray(movie.genre_ids) && availableGenres.length > 0) {
      setSelectedGenres([]);
      try {
        if (movie.id) {
          const res = await fetch(`https://api.themoviedb.org/3/movie/${movie.id}?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}&language=fr-FR`);
          const details = await res.json();
          if (details.runtime) setDuration(details.runtime);
          // Mappe genres TMDB → genres locaux si même nom
          if (Array.isArray(details.genres)) {
            const genreNames = details.genres.map((g: any) => g.name);
            const localGenreIds = availableGenres
              .filter(g => genreNames.includes(g.name))
              .map(g => g.id);
            setSelectedGenres(localGenreIds);
          }
        }
      } catch {}
    }
    setTmdbResults([]);
    setTmdbQuery('');
    setTimeout(() => {
      tmdbInputRef.current?.focus();
    }, 100);
    toast({
      title: "Champs remplis automatiquement",
      description: "Tous les champs peuvent être édités avant l’enregistrement.",
    });
  };
  
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
      
      // Upload des images si modifiées
      let posterUrl = movie?.poster_url || '';
      let backdropUrl = movie?.backdrop_url || '';

      if (posterFile) {
        const { data, error } = await supabase.storage
          .from('film-posters')
          .upload(`posters/${Date.now()}-${posterFile.name}`, posterFile, { cacheControl: '3600', upsert: false });
        if (error) throw error;
        const { data: urlData } = supabase.storage.from('film-posters').getPublicUrl(data.path);
        posterUrl = urlData?.publicUrl || '';
      }

      if (backdropFile) {
        const { data, error } = await supabase.storage
          .from('film-backdrops')
          .upload(`backdrops/${Date.now()}-${backdropFile.name}`, backdropFile, { cacheControl: '3600', upsert: false });
        if (error) throw error;
        const { data: urlData } = supabase.storage.from('film-backdrops').getPublicUrl(data.path);
        backdropUrl = urlData?.publicUrl || '';
      }

      // Préparer les données à mettre à jour
      const updates: Partial<Movie> = {
        title,
        original_title: originalTitle || undefined,
        description,
        year,
        duration,
        director: director || undefined,
        genres: selectedGenres,
        cast: formattedCast.length > 0 ? formattedCast : [],
        trailer_url: trailerUrl || undefined,
        is_vip: isVIP,
        published: isPublished,
        poster_url: posterUrl || undefined,
        backdrop_url: backdropUrl || undefined,
      };

      // Mettre à jour le film
      const { error: updateError } = await supabase
        .from('films')
        .update(updates)
        .eq('id', id);

      if (!updateError) {
        toast({
          title: 'Film mis à jour',
          description: `Le film "${title}" a été mis à jour avec succès.`,
        });
        router.push('/admin/films');
      } else {
        throw updateError;
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

      {/* TMDB Search */}
      <form className="mb-6" onSubmit={handleTmdbSearch} role="search" aria-label="Recherche TMDB">
        <div className="flex flex-col sm:flex-row gap-2 items-center">
          <label htmlFor="tmdb-search" className="font-medium text-gray-200 mr-2">Recherche TMDB :</label>
          <Input
            id="tmdb-search"
            ref={tmdbInputRef}
            type="text"
            autoComplete="off"
            placeholder="Titre du film (TMDB)"
            value={tmdbQuery}
            onChange={e => setTmdbQuery(e.target.value)}
            className="sm:w-80"
            aria-label="Titre du film à rechercher sur TMDB"
          />
          <Button type="submit" disabled={tmdbLoading || !tmdbQuery.trim()}>
            {tmdbLoading ? "Recherche..." : "Rechercher"}
          </Button>
        </div>
        {tmdbError && <div className="mt-2 text-sm text-red-500">{tmdbError}</div>}
        {tmdbResults.length > 0 && (
          <ul
            className="mt-4 bg-gray-800 rounded shadow max-h-80 overflow-y-auto ring-1 ring-gray-700"
            tabIndex={0}
            aria-label="Résultats TMDB"
          >
            {tmdbResults.map((movie, idx) => (
              <li
                key={movie.id}
                tabIndex={0}
                className="flex items-center gap-3 px-4 py-2 cursor-pointer hover:bg-purple-900/20 focus:bg-purple-900/30 outline-none"
                onClick={() => handleSelectTmdbMovie(movie)}
                onKeyDown={e => {
                  if (e.key === "Enter" || e.key === " ") {
                    handleSelectTmdbMovie(movie);
                  }
                }}
                aria-label={`Sélectionner ${movie.title} (${movie.release_date ? movie.release_date.slice(0, 4) : ''})`}
              >
                {movie.poster_path ? (
                  <img
                    src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`}
                    alt={movie.title}
                    className="h-12 w-8 object-cover rounded"
                  />
                ) : (
                  <div className="h-12 w-8 bg-gray-700 rounded flex items-center justify-center">
                    <Film className="h-5 w-5 text-gray-500" />
                  </div>
                )}
                <div>
                  <span className="font-medium text-white">{movie.title}</span>
                  <span className="ml-2 text-xs text-gray-400">
                    {movie.release_date ? `(${movie.release_date.slice(0, 4)})` : ''}
                  </span>
                </div>
                {movie.original_title && movie.original_title !== movie.title && (
                  <span className="ml-2 text-xs text-gray-400 italic">{movie.original_title}</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </form>

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
                  <div className="mb-2">
                    {posterPreview && (
                      <img
                        src={posterPreview}
                        alt="Affiche du film sélectionnée"
                        className="rounded shadow h-40 object-cover mb-2"
                        aria-label="Affiche sélectionnée"
                      />
                    )}
                  </div>
                  <ImageUpload
                    onImageSelected={(file) => {
                      setPosterFile(file);
                      setPosterPreview(URL.createObjectURL(file));
                    }}
                    aspectRatio="2:3"
                    label={posterPreview ? "Remplacer l'affiche" : "Ajouter une affiche"}
                  />
                  {posterPreview && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setPosterFile(null);
                        setPosterPreview(null);
                      }}
                      className="mt-2"
                    >
                      Supprimer l’affiche
                    </Button>
                  )}
                  <p className="text-xs text-gray-400">
                    Format recommandé: 600x900 pixels (ratio 2:3), JPG ou PNG.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="backdrop">Image de fond</Label>
                  <div className="mb-2">
                    {backdropPreview && (
                      <img
                        src={backdropPreview}
                        alt="Image de fond sélectionnée"
                        className="rounded shadow h-32 object-cover mb-2"
                        aria-label="Image de fond sélectionnée"
                      />
                    )}
                  </div>
                  <ImageUpload
                    onImageSelected={(file) => {
                      setBackdropFile(file);
                      setBackdropPreview(URL.createObjectURL(file));
                    }}
                    aspectRatio="16:9"
                    label={backdropPreview ? "Remplacer l'image de fond" : "Ajouter une image de fond"}
                  />
                  {backdropPreview && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setBackdropFile(null);
                        setBackdropPreview(null);
                      }}
                      className="mt-2"
                    >
                      Supprimer l’image de fond
                    </Button>
                  )}
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