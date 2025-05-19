'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Tv,
  Info,
  Image as ImageIcon,
  Save,
  ArrowLeft,
  Plus,
  X,
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

const HOMEPAGE_CATEGORIES = [
  { key: 'featured', label: 'À la une' },
  { key: 'new', label: 'Nouveautés' },
  { key: 'top', label: 'Top' },
  { key: 'vip', label: 'VIP' },
];

export default function AdminAddSeriesPage() {
  const router = useRouter();
  const { toast } = useToast();

  // TMDB search state
  const [tmdbQuery, setTmdbQuery] = useState('');
  const [tmdbResults, setTmdbResults] = useState<any[]>([]);
  const [tmdbLoading, setTmdbLoading] = useState(false);
  const [tmdbError, setTmdbError] = useState<string | null>(null);
  const tmdbInputRef = useRef<HTMLInputElement>(null);

  // Series form state
  const [title, setTitle] = useState('');
  const [originalTitle, setOriginalTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startYear, setStartYear] = useState<number>(new Date().getFullYear());
  const [endYear, setEndYear] = useState<number | null>(null);
  const [creator, setCreator] = useState('');
  const [availableGenres, setAvailableGenres] = useState<{ id: string; name: string }[]>([]);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [duration, setDuration] = useState<number>(0);
  const [isVIP, setIsVIP] = useState(false);
  const [isPublished, setIsPublished] = useState(false);
  const [trailerUrl, setTrailerUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [backdropFile, setBackdropFile] = useState<File | null>(null);
  const [posterPreview, setPosterPreview] = useState<string | null>(null);
  const [backdropPreview, setBackdropPreview] = useState<string | null>(null);
  const [cast, setCast] = useState<
    { name: string; role: string; photo?: string | null; file?: File | null; preview?: string | null }[]
  >([{ name: '', role: '', photo: null, file: null, preview: null }]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Genres fetch
  useEffect(() => {
    const loadGenres = async () => {
      try {
        const { data, error } = await supabase.from('genres').select('id, name');
        if (error) throw error;
        setAvailableGenres(data || []);
      } catch (error) {
        console.error('Erreur lors du chargement des genres:', error);
      }
    };
    loadGenres();
  }, []);

  // TMDB live search with debounce
  useEffect(() => {
    if (!tmdbQuery.trim()) {
      setTmdbResults([]);
      setTmdbError(null);
      setTmdbLoading(false);
      return;
    }
    const timeout = setTimeout(() => {
      handleTmdbSearch();
    }, 400);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line
  }, [tmdbQuery]);

  // TMDB search handler (live and button)
  const handleTmdbSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!tmdbQuery.trim()) return;
    setTmdbLoading(true);
    setTmdbError(null);
    setTmdbResults([]);
    try {
      const res = await fetch(`/api/tmdb/tv-search?query=${encodeURIComponent(tmdbQuery)}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setTmdbResults(data.results || []);
    } catch (err: any) {
      setTmdbError(err.message || 'Erreur lors de la recherche TMDB.');
    } finally {
      setTmdbLoading(false);
    }
  };

  // TMDB auto-fill handler
  const handleSelectTmdbSerie = async (serie: any) => {
    setTitle(serie.name || '');
    setOriginalTitle(serie.original_name || '');
    setDescription(serie.overview || '');
    setStartYear(serie.first_air_date ? parseInt(serie.first_air_date.split('-')[0]) : new Date().getFullYear());
    setEndYear(serie.last_air_date ? parseInt(serie.last_air_date.split('-')[0]) : null);
    setPosterPreview(
      serie.poster_path ? `https://image.tmdb.org/t/p/w500${serie.poster_path}` : null
    );
    setBackdropPreview(
      serie.backdrop_path ? `https://image.tmdb.org/t/p/w780${serie.backdrop_path}` : null
    );
    try {
      const res = await fetch(
        `https://api.themoviedb.org/3/tv/${serie.id}?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}&language=fr-FR&append_to_response=videos,credits`
      );
      const details = await res.json();
      // Créateurs
      if (Array.isArray(details.created_by) && details.created_by.length > 0) {
        setCreator(details.created_by.map((c: any) => c.name).join(', '));
      }
      // Genres (mapping local)
      if (Array.isArray(details.genres)) {
        const genreNames = details.genres.map((g: any) => g.name);
        const localGenreIds = availableGenres
          .filter(g => genreNames.includes(g.name))
          .map(g => g.id);
        setSelectedGenres(localGenreIds);
      }
      // Bande-annonce (YouTube)
      if (details.videos && Array.isArray(details.videos.results)) {
        const trailer = details.videos.results.find(
          (v: any) => v.type === 'Trailer' && v.site === 'YouTube'
        );
        setTrailerUrl(trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : '');
        const mainVideo = details.videos.results.find(
          (v: any) => v.type !== 'Trailer' && v.site === 'YouTube'
        );
        setVideoUrl(mainVideo ? `https://www.youtube.com/watch?v=${mainVideo.key}` : '');
      }
      // Casting (nom, rôle, photo)
      if (
        details.credits &&
        Array.isArray(details.credits.cast) &&
        details.credits.cast.length > 0
      ) {
        const castArr = details.credits.cast.slice(0, 10).map((actor: any) => ({
          name: actor.name,
          role: actor.character || '',
          photo: actor.profile_path
            ? `https://image.tmdb.org/t/p/w185${actor.profile_path}`
            : null,
          file: null,
          preview: actor.profile_path
            ? `https://image.tmdb.org/t/p/w185${actor.profile_path}`
            : null,
        }));
        setCast(castArr);
      }
      // Catégories accueil auto (modifiables)
      const autoCategories: string[] = [];
      const currentYear = new Date().getFullYear();
      if (serie.first_air_date && parseInt(serie.first_air_date.slice(0, 4)) >= currentYear - 1)
        autoCategories.push('new');
      if ((serie.vote_count && serie.vote_count > 1000) || (serie.popularity && serie.popularity > 100))
        autoCategories.push('top');
      if (details.adult) autoCategories.push('vip');
      if (serie.poster_path && serie.backdrop_path) autoCategories.push('featured');
      setSelectedCategories(autoCategories);
    } catch (err) {
      // fallback
    }
    setTmdbResults([]);
    setTmdbQuery('');
    setTimeout(() => {
      tmdbInputRef.current?.focus();
    }, 100);
    toast({
      title: 'Champs remplis automatiquement',
      description: 'Tous les champs peuvent être édités avant l’enregistrement.',
    });
  };

  // Handlers pour genres
  const handleGenreChange = (genreId: string, checked: boolean) => {
    if (checked) setSelectedGenres([...selectedGenres, genreId]);
    else setSelectedGenres(selectedGenres.filter(id => id !== genreId));
  };

  // Casting handlers
  const addCastMember = () => {
    setCast([...cast, { name: '', role: '', photo: null, file: null, preview: null }]);
  };
  const removeCastMember = (index: number) => {
    setCast(cast.filter((_, i) => i !== index));
  };
  const updateCastMember = (index: number, field: 'name' | 'role', value: string) => {
    const updatedCast = [...cast];
    updatedCast[index][field] = value;
    setCast(updatedCast);
  };
  const updateCastPhoto = (index: number, file: File | null, preview: string | null) => {
    const updatedCast = [...cast];
    updatedCast[index].file = file;
    updatedCast[index].preview = preview;
    if (file) updatedCast[index].photo = null;
    setCast(updatedCast);
  };
  const removeCastPhoto = (index: number) => {
    const updatedCast = [...cast];
    updatedCast[index].file = null;
    updatedCast[index].preview = null;
    updatedCast[index].photo = null;
    setCast(updatedCast);
  };

  // Form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Validations
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
    if (selectedCategories.length === 0) {
      toast({
        title: 'Erreur',
        description: 'Veuillez sélectionner au moins une catégorie d’accueil.',
        variant: 'destructive',
      });
      return;
    }
    setIsSubmitting(true);
    try {
      // Upload cast photos if needed
      const formattedCast = await Promise.all(
        cast
          .filter(member => member.name.trim() !== '')
          .map(async (member, idx) => {
            let photoUrl = member.photo || null;
            if (member.file) {
              const { data, error } = await supabase.storage
                .from('actor-photos')
                .upload(
                  `series-actors/${Date.now()}_${idx}_${member.file.name}`,
                  member.file,
                  { cacheControl: '3600', upsert: false }
                );
              if (error) {
                toast({
                  title: 'Erreur upload photo acteur',
                  description: error.message || String(error),
                  variant: 'destructive',
                });
                throw error;
              }
              const { data: urlData } = supabase.storage.from('actor-photos').getPublicUrl(data.path);
              photoUrl = urlData?.publicUrl || null;
            }
            return {
              name: member.name,
              role: member.role,
              photo: photoUrl,
            };
          })
      );
      // Upload images
      let posterUrl = '';
      let backdropUrl = '';
      if (posterFile) {
        const { data, error } = await supabase.storage
          .from('series-posters')
          .upload(`posters/${Date.now()}-${posterFile.name}`, posterFile, { cacheControl: '3600', upsert: false });
        if (error) {
          toast({
            title: 'Erreur upload affiche',
            description: error.message || String(error),
            variant: 'destructive',
          });
          throw error;
        }
        const { data: urlData } = supabase.storage.from('series-posters').getPublicUrl(data.path);
        posterUrl = urlData?.publicUrl || '';
      } else if (posterPreview) {
        posterUrl = posterPreview;
      }
      if (backdropFile) {
        const { data, error } = await supabase.storage
          .from('series-backdrops')
          .upload(`backdrops/${Date.now()}-${backdropFile.name}`, backdropFile, { cacheControl: '3600', upsert: false });
        if (error) {
          toast({
            title: 'Erreur upload image de fond',
            description: error.message || String(error),
            variant: 'destructive',
          });
          throw error;
        }
        const { data: urlData } = supabase.storage.from('series-backdrops').getPublicUrl(data.path);
        backdropUrl = urlData?.publicUrl || '';
      } else if (backdropPreview) {
        backdropUrl = backdropPreview;
      }
      // Upload vidéo si nécessaire
      let finalVideoUrl = videoUrl;
      if (videoFile) {
        const { data, error } = await supabase.storage
          .from('series-videos')
          .upload(
            `videos/${Date.now()}-${videoFile.name}`,
            videoFile,
            { cacheControl: '3600', upsert: false }
          );
        if (error) {
          toast({
            title: 'Erreur upload vidéo',
            description: error.message || String(error),
            variant: 'destructive',
          });
          throw error;
        }
        const { data: urlData } = supabase.storage.from('series-videos').getPublicUrl(data.path);
        finalVideoUrl = urlData?.publicUrl || "";
      }
      // Vérification préalable pour éviter les doublons (titre + année de début)
      const { data: existingSeries, error: checkErr } = await supabase
        .from('series')
        .select('id')
        .eq('title', title)
        .eq('start_year', startYear)
        .maybeSingle();

      if (existingSeries) {
        toast({
          title: "Doublon détecté",
          description: "Une série avec ce titre et cette année de début existe déjà.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      // Insert series
      const { data: insertData, error: insertError } = await supabase
        .from('series')
        .insert([{
          title,
          original_title: originalTitle || null,
          description,
          start_year: startYear,
          end_year: endYear || null,
          creator: creator || null,
          duration: duration || null,
          genre: selectedGenres.map(
            id => availableGenres.find(g => g.id === id)?.name
          ).filter(Boolean).join(',') || null,
          trailer_url: trailerUrl || null,
          video_url: finalVideoUrl || null,
          isvip: isVIP,
          published: isPublished,
          poster: posterUrl || null,
          backdrop: backdropUrl || null,
          cast: formattedCast,
          homepage_categories: selectedCategories,
        }])
        .select()
        .single();
      if (insertError || !insertData) {
        // Gestion des erreurs d'unicité SQL
        if (
          insertError?.code === "23505" ||
          (typeof insertError?.message === "string" && insertError.message.toLowerCase().includes("unique"))
        ) {
          toast({
            title: "Doublon détecté",
            description: "Une série avec ce titre et cette année de début existe déjà.",
            variant: "destructive",
          });
        } else {
          toast({
            title: 'Erreur',
            description: insertError?.message || "Impossible d'ajouter la série.",
            variant: 'destructive',
          });
        }
        setIsSubmitting(false);
        return;
      }
      // Log admin_logs
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from('admin_logs').insert([{
            admin_id: user.id,
            action: 'ADD_SERIES',
            details: { series_id: insertData.id, series_title: title },
          }]);
        }
      } catch {}
      toast({
        title: 'Série ajoutée',
        description: `La série "${title}" a été ajoutée avec succès.`,
      });
      // Redirige vers la gestion des séries pour cohérence UX
      router.push(`/admin/series`);
    } catch (error) {
      let errorMessage: string;
      if (typeof error === "object" && error !== null && "message" in error && typeof (error as any).message === "string") {
        errorMessage = (error as any).message;
      } else {
        errorMessage = String(error) || "Impossible d'ajouter la série.";
      }
      toast({
        title: 'Erreur',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render
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
        <h1 className="text-3xl font-bold">Ajouter une série</h1>
      </div>

      {/* TMDB Search */}
      <form onSubmit={handleTmdbSearch} className="mb-6" role="search" aria-label="Recherche TMDB">
        <div className="flex flex-col sm:flex-row gap-2 items-center">
          <label htmlFor="tmdb-search" className="font-medium text-gray-200 mr-2">Recherche TMDB :</label>
          <Input
            id="tmdb-search"
            ref={tmdbInputRef}
            type="text"
            autoComplete="off"
            placeholder="Titre de la série (TMDB)"
            value={tmdbQuery}
            onChange={e => setTmdbQuery(e.target.value)}
            className="sm:w-80"
            aria-label="Titre de la série à rechercher sur TMDB"
          />
          <Button type="submit" disabled={tmdbLoading || !tmdbQuery.trim()}>
            {tmdbLoading ? "Recherche..." : "Rechercher"}
          </Button>
        </div>
        {tmdbError && <div className="mt-2 text-sm text-red-500">{tmdbError}</div>}
        {(tmdbResults.length > 0 && tmdbQuery.trim()) && (
          <ul
            className="mt-4 bg-gray-800 rounded shadow max-h-80 overflow-y-auto ring-1 ring-gray-700"
            tabIndex={0}
            aria-label="Résultats TMDB"
          >
            {tmdbResults.map((serie, idx) => (
              <li
                key={serie.id}
                tabIndex={0}
                className="flex items-center gap-3 px-4 py-2 cursor-pointer hover:bg-purple-900/20 focus:bg-purple-900/30 outline-none"
                onClick={() => handleSelectTmdbSerie(serie)}
                onKeyDown={e => {
                  if (e.key === "Enter" || e.key === " ") {
                    handleSelectTmdbSerie(serie);
                  }
                }}
                aria-label={`Sélectionner ${serie.name} (${serie.first_air_date ? serie.first_air_date.slice(0, 4) : ''})`}
              >
                {serie.poster_path ? (
                  <img
                    src={`https://image.tmdb.org/t/p/w92${serie.poster_path}`}
                    alt={serie.name}
                    className="h-12 w-8 object-cover rounded"
                  />
                ) : (
                  <div className="h-12 w-8 bg-gray-700 rounded flex items-center justify-center">
                    <Tv className="h-5 w-5 text-gray-500" />
                  </div>
                )}
                <div>
                  <span className="font-medium text-white">{serie.name}</span>
                  <span className="ml-2 text-xs text-gray-400">
                    {serie.first_air_date ? `(${serie.first_air_date.slice(0, 4)})` : ''}
                  </span>
                </div>
                {serie.original_name && serie.original_name !== serie.name && (
                  <span className="ml-2 text-xs text-gray-400 italic">{serie.original_name}</span>
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
              <Tv className="h-4 w-4 mr-2" />
              Détails supplémentaires
            </TabsTrigger>
            <TabsTrigger value="categories" className="rounded-tr-lg rounded-bl-none rounded-tl-none px-5 py-3">
              <Info className="h-4 w-4 mr-2" />
              Catégories d’accueil
            </TabsTrigger>
          </TabsList>
          {/* Tab Informations générales */}
          <TabsContent value="general" className="p-6">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Titre <span className="text-red-500">*</span></Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="originalTitle">Titre original</Label>
                  <Input
                    id="originalTitle"
                    value={originalTitle}
                    onChange={e => setOriginalTitle(e.target.value)}
                    placeholder="Titre dans la langue d'origine"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description <span className="text-red-500">*</span></Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
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
                    onChange={e => setStartYear(parseInt(e.target.value) || new Date().getFullYear())}
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
                    onChange={e => setEndYear(e.target.value ? parseInt(e.target.value) : null)}
                    placeholder="En cours"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="creator">Créateur(s)</Label>
                  <Input
                    id="creator"
                    value={creator}
                    onChange={e => setCreator(e.target.value)}
                    placeholder="Nom(s) du créateur"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Genres <span className="text-red-500">*</span></Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {availableGenres.map(genre => (
                    <div key={genre.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`genre-${genre.id}`}
                        checked={selectedGenres.includes(genre.id)}
                        onCheckedChange={checked =>
                          handleGenreChange(genre.id, checked === true)
                        }
                        aria-checked={selectedGenres.includes(genre.id)}
                        aria-label={genre.name}
                      />
                      <Label htmlFor={`genre-${genre.id}`} className="text-sm cursor-pointer">
                        {genre.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="duration">Durée moyenne d’un épisode (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    min="1"
                    value={duration || ''}
                    onChange={e => setDuration(parseInt(e.target.value) || 0)}
                  />
                </div>
                <div className="flex items-center justify-between space-y-2">
                  <div>
                    <Label htmlFor="isVIP">Contenu VIP</Label>
                    <Switch
                      id="isVIP"
                      checked={isVIP}
                      onCheckedChange={setIsVIP}
                    />
                  </div>
                  <div>
                    <Label htmlFor="isPublished">Publier maintenant</Label>
                    <Switch
                      id="isPublished"
                      checked={isPublished}
                      onCheckedChange={setIsPublished}
                    />
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          {/* Tab Médias */}
          <TabsContent value="media" className="p-6">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="poster">Affiche de la série</Label>
                  <div className="mb-2">
                    {posterPreview && (
                      <img
                        src={posterPreview}
                        alt="Affiche sélectionnée"
                        className="rounded shadow h-40 object-cover mb-2"
                        aria-label="Affiche sélectionnée"
                      />
                    )}
                  </div>
                  <ImageUpload
                    onImageSelected={file => {
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
                    onImageSelected={file => {
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
                <Label htmlFor="videoUrl">Vidéo principale (optionnel)</Label>
                <Input
                  id="videoUrl"
                  value={videoUrl}
                  onChange={e => setVideoUrl(e.target.value)}
                  placeholder="URL vidéo externe (YouTube, mp4, etc.)"
                  disabled={!!videoFile}
                />
                <div className="flex flex-col sm:flex-row gap-2 items-center mt-2">
                  <input
                    type="file"
                    accept="video/mp4,video/mkv,video/webm,video/quicktime,video/x-matroska,video/x-msvideo,video/x-ms-wmv"
                    id="video-upload"
                    style={{ display: 'none' }}
                    onChange={e => {
                      const file = e.target.files && e.target.files[0];
                      if (file) {
                        setVideoFile(file);
                        setVideoUrl('');
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById('video-upload')?.click()}
                  >
                    {videoFile ? "Remplacer la vidéo" : "Uploader une vidéo"}
                  </Button>
                  {videoFile && (
                    <span className="text-sm text-gray-300 ml-2">{videoFile.name}</span>
                  )}
                  {videoFile && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setVideoFile(null)}
                      className="ml-2"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <p className="text-xs text-gray-500">
                  Formats supportés : mp4, mkv, webm, mov, avi, wmv.
                  <br />
                  Si tu uploades une vidéo, l’URL publique sera utilisée dans la fiche de la série.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="trailerUrl">URL de la bande-annonce</Label>
                <Input
                  id="trailerUrl"
                  value={trailerUrl}
                  onChange={e => setTrailerUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                />
                <p className="text-xs text-gray-400">
                  URL YouTube de la bande-annonce.
                </p>
              </div>
            </div>
          </TabsContent>
          {/* Tab Détails supplémentaires */}
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
                          onChange={e => updateCastMember(index, 'name', e.target.value)}
                          placeholder="Nom de l'acteur"
                          className="mb-2"
                        />
                        <Input
                          value={member.role}
                          onChange={e => updateCastMember(index, 'role', e.target.value)}
                          placeholder="Rôle (optionnel)"
                        />
                        <div className="flex items-center mt-2">
                          {member.preview || member.photo ? (
                            <img
                              src={member.preview || member.photo || ""}
                              alt={member.name}
                              className="h-14 w-10 object-cover rounded border mr-3"
                            />
                          ) : (
                            <div className="h-14 w-10 bg-gray-800 rounded border mr-3 flex items-center justify-center">
                              <Tv className="h-5 w-5 text-gray-500" />
                            </div>
                          )}
                          <ImageUpload
                            onImageSelected={file => {
                              if (file) {
                                updateCastPhoto(index, file, URL.createObjectURL(file));
                              }
                            }}
                            aspectRatio="2:3"
                            label={member.preview || member.photo ? "Remplacer la photo" : "Ajouter une photo"}
                          />
                          {(member.preview || member.photo) && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeCastPhoto(index)}
                              className="ml-2"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeCastMember(index)}
                        className="mt-2"
                        aria-label="Supprimer cet acteur"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
          {/* Tab Catégories d’accueil */}
          <TabsContent value="categories" className="p-6">
            <div className="space-y-4">
              <Label>Catégories d’accueil <span className="text-red-500">*</span></Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {HOMEPAGE_CATEGORIES.map(category => (
                  <div key={category.key} className="flex items-center space-x-2">
                    <Checkbox
                      id={`category-${category.key}`}
                      checked={selectedCategories.includes(category.key)}
                      onCheckedChange={checked =>
                        setSelectedCategories(checked
                          ? [...selectedCategories, category.key]
                          : selectedCategories.filter(k => k !== category.key)
                        )
                      }
                      aria-checked={selectedCategories.includes(category.key)}
                      aria-label={category.label}
                    />
                    <Label htmlFor={`category-${category.key}`} className="text-sm cursor-pointer">
                      {category.label}
                    </Label>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-400">
                Cochez au moins une catégorie où cette série apparaîtra sur la page d’accueil.
              </p>
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
          <Button type="submit" disabled={isSubmitting}>
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