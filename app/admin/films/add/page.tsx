"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  ArrowLeft,
  Upload,
  Plus,
  X,
  Trash2,
  Film
} from "lucide-react"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"

export default function AddFilmPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [film, setFilm] = useState({
    title: "",
    description: "",
    releaseYear: "",
    duration: "",
    genre: "",
    director: "",
    cast: "",
    vipOnly: false,
    isPublished: true
  })
  
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFilm((prev) => ({ ...prev, [name]: value }))
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      // Simuler un appel API
      await new Promise((resolve) => setTimeout(resolve, 1500))
      
      console.log("Film ajouté:", film)
      
      // Dans une application réelle, vous appelleriez ici votre service Firebase
      // exemple:
      // await addMovie(film)
      
      // Rediriger vers la liste des films après l'ajout
      router.push("/admin/films")
    } catch (error) {
      console.error("Erreur lors de l'ajout du film:", error)
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
      
      <form onSubmit={handleSubmit}>
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
                    Genre <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="genre"
                    name="genre"
                    value={film.genre}
                    onChange={handleInputChange}
                    placeholder="ex: Action, Comédie, etc."
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
                      checked={film.isPublished}
                      onCheckedChange={(checked) => setFilm(prev => ({ ...prev, isPublished: checked }))}
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
                <div className="border-2 border-dashed border-gray-700 rounded-lg p-6 flex flex-col items-center justify-center text-center bg-gray-800/50">
                  <div className="mb-4">
                    <Upload className="h-10 w-10 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-400 mb-2">
                    Glisser-déposer une image ou
                  </p>
                  <Button type="button" variant="outline" size="sm">
                    Parcourir
                  </Button>
                  <p className="text-xs text-gray-500 mt-2">
                    PNG, JPG ou WEBP. Max 2MB. Ratio 2:3 recommandé.
                  </p>
                </div>
              </div>
              
              <div className="space-y-4">
                <Label className="text-white">
                  Image de fond <span className="text-red-500">*</span>
                </Label>
                <div className="border-2 border-dashed border-gray-700 rounded-lg p-6 flex flex-col items-center justify-center text-center bg-gray-800/50">
                  <div className="mb-4">
                    <Upload className="h-10 w-10 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-400 mb-2">
                    Glisser-déposer une image ou
                  </p>
                  <Button type="button" variant="outline" size="sm">
                    Parcourir
                  </Button>
                  <p className="text-xs text-gray-500 mt-2">
                    PNG, JPG ou WEBP. Max 5MB. Résolution HD recommandée.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4 mt-6">
              <div className="flex items-center justify-between">
                <Label className="text-white">Bande-annonce</Label>
                <Button type="button" variant="outline" size="sm" className="gap-1">
                  <Plus className="h-4 w-4" /> Ajouter
                </Button>
              </div>
              
              <div className="border border-gray-700 rounded-lg p-4 bg-gray-800/50">
                <p className="text-sm text-gray-400 text-center">
                  Aucune bande-annonce ajoutée. Cliquez sur "Ajouter" pour téléverser une vidéo ou fournir un lien YouTube.
                </p>
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
                  value={film.cast}
                  onChange={handleInputChange}
                  placeholder="Acteurs principaux (un par ligne)"
                  rows={4}
                  className="bg-gray-800 border-gray-700 text-white resize-none"
                />
              </div>
              
              <div className="space-y-4 mt-6">
                <div className="flex items-center justify-between">
                  <Label className="text-white">Tags</Label>
                  <Button type="button" variant="outline" size="sm" className="gap-1">
                    <Plus className="h-4 w-4" /> Ajouter
                  </Button>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <div className="flex items-center bg-gray-800 text-white px-3 py-1 rounded-full text-sm">
                    Action
                    <button type="button" className="ml-2 text-gray-400 hover:text-white">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                  <div className="flex items-center bg-gray-800 text-white px-3 py-1 rounded-full text-sm">
                    Aventure
                    <button type="button" className="ml-2 text-gray-400 hover:text-white">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
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
          >
            Annuler
          </Button>
          
          <div className="flex space-x-2">
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
            >
              Enregistrer comme brouillon
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Enregistrement..." : "Publier le film"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}