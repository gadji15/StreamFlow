"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  ArrowLeft,
  Upload,
  Plus,
  X,
  Trash2,
  Film,
  Loader2
} from "lucide-react"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { addMovie, uploadMovieImage } from "@/lib/firebase"
import { useToast } from "@/components/ui/use-toast"

export default function AddFilmPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [posterFile, setPosterFile] = useState<File | null>(null)
  const [backdropFile, setBackdropFile] = useState<File | null>(null)
  const [posterPreview, setPosterPreview] = useState<string | null>(null)
  const [backdropPreview, setBackdropPreview] = useState<string | null>(null)
  const [posterUploading, setPosterUploading] = useState(false)
  const [backdropUploading, setBackdropUploading] = useState(false)
  const [adminId, setAdminId] = useState<string | null>(null)
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState("")
  
  const [film, setFilm] = useState({
    title: "",
    description: "",
    releaseYear: "",
    duration: "",
    genre: "",
    genres: [] as string[],
    director: "",
    cast: [] as string[],
    vipOnly: false,
    status: "published" as "draft" | "published",
    posterUrl: "",
    backdropUrl: "",
    trailerUrl: ""
  })
  
  // Récupérer l'ID de l'admin connecté
  useEffect(() => {
    const storedAdminId = localStorage.getItem("adminId")
    if (storedAdminId) {
      setAdminId(storedAdminId)
    }
  }, [])
  
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFilm((prev) => ({ ...prev, [name]: value }))
  }
  
  const handlePosterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setPosterFile(file)
      
      // Créer un aperçu
      const reader = new FileReader()
      reader.onload = () => {
        setPosterPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }
  
  const handleBackdropChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setBackdropFile(file)
      
      // Créer un aperçu
      const reader = new FileReader()
      reader.onload = () => {
        setBackdropPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }
  
  const handleCastChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const castText = e.target.value
    // Diviser par ligne et filtrer les lignes vides
    const castArray = castText.split('\n').filter(line => line.trim() !== '')
    setFilm(prev => ({ ...prev, cast: castArray }))
  }
  
  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()])
      setNewTag("")
    }
  }
  
  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag))
  }
  
  const handleGenreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const genreText = e.target.value
    setFilm(prev => ({ 
      ...prev, 
      genre: genreText,
      // Diviser par virgules et filtrer les items vides
      genres: genreText.split(',').map(g => g.trim()).filter(g => g !== '')
    }))
  }
  
  const handleStatusChange = (isPublished: boolean) => {
    setFilm(prev => ({ ...prev, status: isPublished ? "published" : "draft" }))
  }
  
  const uploadImages = async (movieId: string) => {
    let posterUrl = film.posterUrl
    let backdropUrl = film.backdropUrl
    
    if (posterFile) {
      setPosterUploading(true)
      try {
        posterUrl = await uploadMovieImage(posterFile, movieId, "poster")
      } catch (error) {
        console.error("Erreur lors du téléchargement du poster:", error)
        toast({
          title: "Erreur",
          description: "Impossible de télécharger l'image du poster. Le film a été créé sans image.",
          variant: "destructive"
        })
      } finally {
        setPosterUploading(false)
      }
    }
    
    if (backdropFile) {
      setBackdropUploading(true)
      try {
        backdropUrl = await uploadMovieImage(backdropFile, movieId, "backdrop")
      } catch (error) {
        console.error("Erreur lors du téléchargement de l'image de fond:", error)
        toast({
          title: "Erreur",
          description: "Impossible de télécharger l'image de fond. Le film a été créé sans image de fond.",
          variant: "destructive"
        })
      } finally {
        setBackdropUploading(false)
      }
    }
    
    return { posterUrl, backdropUrl }
  }
  
  const handleSubmit = async (e: React.FormEvent, saveAsDraft: boolean = false) => {
    e.preventDefault()
    
    if (!film.title || !film.description || !film.releaseYear || !film.duration || !film.genre) {
      toast({
        title: "Formulaire incomplet",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive"
      })
      return
    }
    
    if (!adminId) {
      toast({
        title: "Non authentifié",
        description: "Vous devez être connecté pour ajouter un film",
        variant: "destructive"
      })
      return
    }
    
    setIsSubmitting(true)
    
    try {
      // Préparer les données du film
      const movieData = {
        ...film,
        releaseYear: parseInt(film.releaseYear, 10),
        duration: parseInt(film.duration, 10),
        status: saveAsDraft ? "draft" : "published",
        tags,
      }
      
      // Créer le film dans Firestore
      const newMovie = await addMovie(movieData, adminId)
      
      if (newMovie.id) {
        // Télécharger les images
        const { posterUrl, backdropUrl } = await uploadImages(newMovie.id)
        
        // Mettre à jour le film avec les URLs des images
        if (posterUrl !== film.posterUrl || backdropUrl !== film.backdropUrl) {
          await updateMovie(newMovie.id, { posterUrl, backdropUrl }, adminId)
        }
        
        toast({
          title: saveAsDraft ? "Brouillon enregistré" : "Film publié",
          description: `${film.title} a été ajouté avec succès`,
          variant: "default"
        })
        
        // Rediriger vers la liste des films
        router.push("/admin/films")
      }
    } catch (error) {
      console.error("Erreur lors de l'ajout du film:", error)
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de l'ajout du film. Veuillez réessayer.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }
  
  return (
    <div>
      <div className="flex items-center mb-6">
        <Link href="/admin/films">
          <Button variant="ghost" size="icon" className="mr-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-2xl font-semibold text-white">Ajouter un nouveau film</h1>
      </div>
      
      <form onSubmit={(e) => handleSubmit(e, false)}>
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="mb-6 bg-gray-800">
            <TabsTrigger value="general">Informations générales</TabsTrigger>
            <TabsTrigger value="media">Médias</TabsTrigger>
            <TabsTrigger value="details">Détails</TabsTrigger>
          </TabsList>
          
          {/* Onglet Informations générales */}
          <TabsContent value="general" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-white">
                    Titre <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="title"
                    name="title"
                    value={film.title}
                    onChange={handleInputChange}
                    placeholder="Titre du film"
                    required
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-white">
                    Description <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={film.description}
                    onChange={handleInputChange}
                    placeholder="Description du film"
                    required
                    rows={6}
                    className="bg-gray-800 border-gray-700 text-white resize-none"
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="releaseYear" className="text-white">
                      Année de sortie <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="releaseYear"
                      name="releaseYear"
                      type="number"
                      value={film.releaseYear}
                      onChange={handleInputChange}
                      placeholder="ex: 2023"
                      required
                      min="1900"
                      max="2099"
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="duration" className="text-white">
                      Durée (minutes) <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="duration"
                      name="duration"
                      type="number"
                      value={film.duration}
                      onChange={handleInputChange}
                      placeholder="ex: 120"
                      required
                      min="1"
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="genre" className="text-white">
                    Genres <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="genre"
                    name="genre"
                    value={film.genre}
                    onChange={handleGenreChange}
                    placeholder="ex: Action, Comédie, etc. (séparés par des virgules)"
                    required
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
                
                <div className="flex flex-col gap-4 mt-6">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="vipOnly" className="text-white cursor-pointer">
                      Exclusif VIP
                    </Label>
                    <Switch
                      id="vipOnly"
                      checked={film.vipOnly}
                      onCheckedChange={(checked) => setFilm(prev => ({ ...prev, vipOnly: checked }))}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="isPublished" className="text-white cursor-pointer">
                      Publier immédiatement
                    </Label>
                    <Switch
                      id="isPublished"
                      checked={film.status === "published"}
                      onCheckedChange={handleStatusChange}
                    />
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          {/* Onglet Médias */}
          <TabsContent value="media" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <Label className="text-white">
                  Affiche du film <span className="text-red-500">*</span>
                </Label>
                {posterPreview ? (
                  <div className="relative w-full aspect-[2/3] rounded-lg overflow-hidden">
                    <img 
                      src={posterPreview} 
                      alt="Aperçu de l'affiche" 
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setPosterFile(null);
                        setPosterPreview(null);
                      }}
                      className="absolute top-2 right-2 bg-black/60 text-white p-1 rounded-full hover:bg-black/80"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-700 rounded-lg p-6 flex flex-col items-center justify-center text-center bg-gray-800/50">
                    <div className="mb-4">
                      <Upload className="h-10 w-10 text-gray-400" />
                    </div>
                    <p className="text-sm text-gray-400 mb-2">
                      Glisser-déposer une image ou
                    </p>
                    <label className="cursor-pointer">
                      <span className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 text-sm">
                        Parcourir
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handlePosterChange}
                      />
                    </label>
                    <p className="text-xs text-gray-500 mt-2">
                      PNG, JPG ou WEBP. Max 2MB. Ratio 2:3 recommandé.
                    </p>
                  </div>
                )}
              </div>
              
              <div className="space-y-4">
                <Label className="text-white">
                  Image de fond <span className="text-red-500">*</span>
                </Label>
                {backdropPreview ? (
                  <div className="relative w-full aspect-video rounded-lg overflow-hidden">
                    <img 
                      src={backdropPreview} 
                      alt="Aperçu de l'image de fond" 
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setBackdropFile(null);
                        setBackdropPreview(null);
                      }}
                      className="absolute top-2 right-2 bg-black/60 text-white p-1 rounded-full hover:bg-black/80"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-700 rounded-lg p-6 flex flex-col items-center justify-center text-center bg-gray-800/50">
                    <div className="mb-4">
                      <Upload className="h-10 w-10 text-gray-400" />
                    </div>
                    <p className="text-sm text-gray-400 mb-2">
                      Glisser-déposer une image ou
                    </p>
                    <label className="cursor-pointer">
                      <span className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 text-sm">
                        Parcourir
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleBackdropChange}
                      />
                    </label>
                    <p className="text-xs text-gray-500 mt-2">
                      PNG, JPG ou WEBP. Max 5MB. Résolution HD recommandée.
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="space-y-4 mt-6">
              <div className="space-y-2">
                <Label htmlFor="trailerUrl" className="text-white">
                  URL de la bande-annonce (YouTube, Vimeo, etc.)
                </Label>
                <Input
                  id="trailerUrl"
                  name="trailerUrl"
                  value={film.trailerUrl}
                  onChange={handleInputChange}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
            </div>
          </TabsContent>
          
          {/* Onglet Détails */}
          <TabsContent value="details" className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="director" className="text-white">
                  Réalisateur
                </Label>
                <Input
                  id="director"
                  name="director"
                  value={film.director}
                  onChange={handleInputChange}
                  placeholder="Nom du réalisateur"
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="cast" className="text-white">
                  Casting
                </Label>
                <Textarea
                  id="cast"
                  name="cast"
                  value={film.cast.join('\n')}
                  onChange={handleCastChange}
                  placeholder="Acteurs principaux (un par ligne)"
                  rows={4}
                  className="bg-gray-800 border-gray-700 text-white resize-none"
                />
              </div>
              
              <div className="space-y-4 mt-6">
                <div className="flex items-center justify-between">
                  <Label className="text-white">Tags</Label>
                  <div className="flex space-x-2">
                    <Input
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="Ajouter un tag"
                      className="w-40 bg-gray-800 border-gray-700 text-white"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddTag();
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="gap-1"
                      onClick={handleAddTag}
                    >
                      <Plus className="h-4 w-4" /> Ajouter
                    </Button>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {tags.length > 0 ? (
                    tags.map((tag) => (
                      <div 
                        key={tag} 
                        className="flex items-center bg-gray-800 text-white px-3 py-1 rounded-full text-sm"
                      >
                        {tag}
                        <button 
                          type="button" 
                          className="ml-2 text-gray-400 hover:text-white"
                          onClick={() => handleRemoveTag(tag)}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-400">
                      Aucun tag ajouté. Les tags aident à catégoriser et à rechercher les films.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="flex justify-between items-center border-t border-gray-800 mt-8 pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/admin/films")}
            disabled={isSubmitting || posterUploading || backdropUploading}
          >
            Annuler
          </Button>
          
          <div className="flex space-x-2">
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting || posterUploading || backdropUploading}
              onClick={(e) => handleSubmit(e, true)}
            >
              {isSubmitting && film.status === "draft" ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                "Enregistrer comme brouillon"
              )}
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || posterUploading || backdropUploading}
            >
              {isSubmitting && film.status === "published" ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Publication...
                </>
              ) : (
                "Publier le film"
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}