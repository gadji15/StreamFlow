"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Upload, X, Plus, Trash2, Save, Eye, Film, Calendar, Star, Users, ListPlus } from "lucide-react"

import AdminHeader from "@/components/admin/admin-header"
import { mockSeries } from "@/lib/mock-data"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CastMemberInput } from "@/components/admin/content-form-components"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export default function SeriesEditPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const isNewSeries = params.id === "new"
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [activeTab, setActiveTab] = useState("general")

  // Find series if editing an existing one
  const existingSeries = isNewSeries ? null : mockSeries.find((series) => series.id === Number.parseInt(params.id))

  // Form state
  const [formData, setFormData] = useState({
    title: existingSeries?.title || "",
    originalTitle: existingSeries?.originalTitle || "",
    description: existingSeries?.description || "",
    releaseDate: existingSeries?.releaseDate || new Date().toISOString().split("T")[0],
    duration: existingSeries?.duration || "",
    rating: existingSeries?.rating || 0,
    genres: existingSeries?.genres || [],
    status: existingSeries?.status || "draft",
    poster: existingSeries?.poster || "",
    backdrop: existingSeries?.backdrop || "",
    trailer: existingSeries?.trailer || "",
    featured: existingSeries?.featured || false,
    cast: existingSeries?.cast || [],
    creator: existingSeries?.creator || "",
    language: existingSeries?.language || "Français",
    subtitles: existingSeries?.subtitles || ["Français", "Anglais"],
    seasons: existingSeries?.seasons || [
      {
        number: 1,
        title: "Saison 1",
        releaseDate: new Date().toISOString().split("T")[0],
        episodes: [
          {
            number: 1,
            title: "Épisode 1",
            description: "",
            duration: "45min",
            thumbnail: "",
            videoFile: "",
          },
        ],
      },
    ],
  })

  // Available genres
  const availableGenres = [
    "Action",
    "Aventure",
    "Animation",
    "Comédie",
    "Crime",
    "Documentaire",
    "Drame",
    "Famille",
    "Fantastique",
    "Histoire",
    "Horreur",
    "Musique",
    "Mystère",
    "Romance",
    "Science-Fiction",
    "Thriller",
    "Guerre",
    "Western",
  ]

  // Available languages
  const availableLanguages = [
    "Français",
    "Anglais",
    "Espagnol",
    "Allemand",
    "Italien",
    "Japonais",
    "Coréen",
    "Chinois",
    "Russe",
    "Arabe",
    "Portugais",
  ]

  // Available subtitle languages
  const availableSubtitles = [
    "Français",
    "Anglais",
    "Espagnol",
    "Allemand",
    "Italien",
    "Japonais",
    "Coréen",
    "Chinois",
    "Russe",
    "Arabe",
    "Portugais",
  ]

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Handle checkbox changes
  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }))
  }

  // Handle genre selection
  const handleGenreToggle = (genre: string) => {
    setFormData((prev) => {
      const genres = [...prev.genres]
      if (genres.includes(genre)) {
        return { ...prev, genres: genres.filter((g) => g !== genre) }
      } else {
        return { ...prev, genres: [...genres, genre] }
      }
    })
  }

  // Handle subtitle selection
  const handleSubtitleToggle = (subtitle: string) => {
    setFormData((prev) => {
      const subtitles = [...prev.subtitles]
      if (subtitles.includes(subtitle)) {
        return { ...prev, subtitles: subtitles.filter((s) => s !== subtitle) }
      } else {
        return { ...prev, subtitles: [...subtitles, subtitle] }
      }
    })
  }

  // Handle cast member changes
  const handleCastChange = (index: number, field: string, value: string) => {
    setFormData((prev) => {
      const cast = [...prev.cast]
      cast[index] = { ...cast[index], [field]: value }
      return { ...prev, cast }
    })
  }

  // Add new cast member
  const handleAddCastMember = () => {
    setFormData((prev) => ({
      ...prev,
      cast: [...prev.cast, { name: "", character: "", photo: "" }],
    }))
  }

  // Remove cast member
  const handleRemoveCastMember = (index: number) => {
    setFormData((prev) => {
      const cast = [...prev.cast]
      cast.splice(index, 1)
      return { ...prev, cast }
    })
  }

  // Handle season changes
  const handleSeasonChange = (seasonIndex: number, field: string, value: any) => {
    setFormData((prev) => {
      const seasons = [...prev.seasons]
      seasons[seasonIndex] = { ...seasons[seasonIndex], [field]: value }
      return { ...prev, seasons }
    })
  }

  // Add new season
  const handleAddSeason = () => {
    setFormData((prev) => {
      const newSeasonNumber = prev.seasons.length > 0 ? Math.max(...prev.seasons.map((s) => s.number)) + 1 : 1

      return {
        ...prev,
        seasons: [
          ...prev.seasons,
          {
            number: newSeasonNumber,
            title: `Saison ${newSeasonNumber}`,
            releaseDate: new Date().toISOString().split("T")[0],
            episodes: [
              {
                number: 1,
                title: "Épisode 1",
                description: "",
                duration: "45min",
                thumbnail: "",
                videoFile: "",
              },
            ],
          },
        ],
      }
    })
  }

  // Remove season
  const handleRemoveSeason = (seasonIndex: number) => {
    setFormData((prev) => {
      const seasons = [...prev.seasons]
      seasons.splice(seasonIndex, 1)
      return { ...prev, seasons }
    })
  }

  // Handle episode changes
  const handleEpisodeChange = (seasonIndex: number, episodeIndex: number, field: string, value: any) => {
    setFormData((prev) => {
      const seasons = [...prev.seasons]
      const episodes = [...seasons[seasonIndex].episodes]
      episodes[episodeIndex] = { ...episodes[episodeIndex], [field]: value }
      seasons[seasonIndex] = { ...seasons[seasonIndex], episodes }
      return { ...prev, seasons }
    })
  }

  // Add new episode
  const handleAddEpisode = (seasonIndex: number) => {
    setFormData((prev) => {
      const seasons = [...prev.seasons]
      const episodes = [...seasons[seasonIndex].episodes]
      const newEpisodeNumber = episodes.length > 0 ? Math.max(...episodes.map((e) => e.number)) + 1 : 1

      episodes.push({
        number: newEpisodeNumber,
        title: `Épisode ${newEpisodeNumber}`,
        description: "",
        duration: "45min",
        thumbnail: "",
        videoFile: "",
      })

      seasons[seasonIndex] = { ...seasons[seasonIndex], episodes }
      return { ...prev, seasons }
    })
  }

  // Remove episode
  const handleRemoveEpisode = (seasonIndex: number, episodeIndex: number) => {
    setFormData((prev) => {
      const seasons = [...prev.seasons]
      const episodes = [...seasons[seasonIndex].episodes]
      episodes.splice(episodeIndex, 1)
      seasons[seasonIndex] = { ...seasons[seasonIndex], episodes }
      return { ...prev, seasons }
    })
  }

  // Handle file upload (mock implementation)
  const handleFileUpload = (fieldName: string, seasonIndex?: number, episodeIndex?: number) => {
    // In a real application, this would handle file uploads to a server
    // For this example, we'll just set a placeholder URL
    const placeholderUrls: Record<string, string> = {
      poster: "/placeholder.svg?height=600&width=400",
      backdrop: "/placeholder.svg?height=1080&width=1920",
      trailer: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      videoFile: "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4",
      thumbnail: "/placeholder.svg?height=300&width=500",
    }

    if (seasonIndex !== undefined && episodeIndex !== undefined) {
      // Handle episode file uploads
      setFormData((prev) => {
        const seasons = [...prev.seasons]
        const episodes = [...seasons[seasonIndex].episodes]
        episodes[episodeIndex] = {
          ...episodes[episodeIndex],
          [fieldName]: placeholderUrls[fieldName],
        }
        seasons[seasonIndex] = { ...seasons[seasonIndex], episodes }
        return { ...prev, seasons }
      })
    } else {
      // Handle series file uploads
      setFormData((prev) => ({ ...prev, [fieldName]: placeholderUrls[fieldName] }))
    }
  }

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Validate form data
    if (!formData.title || !formData.description || formData.genres.length === 0) {
      alert("Veuillez remplir tous les champs obligatoires")
      setIsSubmitting(false)
      return
    }

    // In a real application, this would make an API call to save the series
    setTimeout(() => {
      setIsSubmitting(false)
      setShowSuccessMessage(true)

      // Hide success message after 3 seconds
      setTimeout(() => {
        setShowSuccessMessage(false)
        if (isNewSeries) {
          // Redirect to content management page after creating a new series
          router.push("/admin/content")
        }
      }, 3000)
    }, 1500)
  }

  return (
    <div className="min-h-screen bg-gray-950 flex">
      
      <div className="flex-1 flex flex-col">
        <AdminHeader title={isNewSeries ? "Ajouter une série" : `Modifier: ${formData.title}`} />
        <main className="flex-1 p-6">
          <div className="mb-6 flex items-center justify-between">
            <Button
              variant="outline"
              className="bg-gray-900 border-gray-800 text-gray-300 hover:bg-gray-800"
              onClick={() => router.push("/admin/content")}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
            <div className="flex space-x-3">
              <Button
                variant="outline"
                className="bg-gray-900 border-gray-800 text-gray-300 hover:bg-gray-800"
                onClick={() => window.open(`/series/${params.id}`, "_blank")}
                disabled={isNewSeries}
              >
                <Eye className="h-4 w-4 mr-2" />
                Prévisualiser
              </Button>
              <Button onClick={handleSubmit} className="bg-purple-600 hover:bg-purple-700" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
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
          </div>

          {showSuccessMessage && (
            <Alert className="mb-6 bg-green-900/20 border-green-800 text-green-400">
              <AlertDescription>
                {isNewSeries ? "Série créée avec succès!" : "Série mise à jour avec succès!"}
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Main content */}
            <div className="lg:col-span-3 space-y-6">
              <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
                <Tabs defaultValue="general" onValueChange={setActiveTab}>
                  <TabsList className="bg-gray-950 p-0 border-b border-gray-800 w-full justify-start rounded-none">
                    <TabsTrigger
                      value="general"
                      className="rounded-none border-r border-gray-800 data-[state=active]:bg-gray-900 data-[state=active]:text-purple-400"
                    >
                      Informations générales
                    </TabsTrigger>
                    <TabsTrigger
                      value="media"
                      className="rounded-none border-r border-gray-800 data-[state=active]:bg-gray-900 data-[state=active]:text-purple-400"
                    >
                      Médias
                    </TabsTrigger>
                    <TabsTrigger
                      value="cast"
                      className="rounded-none border-r border-gray-800 data-[state=active]:bg-gray-900 data-[state=active]:text-purple-400"
                    >
                      Distribution
                    </TabsTrigger>
                    <TabsTrigger
                      value="episodes"
                      className="rounded-none border-r border-gray-800 data-[state=active]:bg-gray-900 data-[state=active]:text-purple-400"
                    >
                      Épisodes
                    </TabsTrigger>
                    <TabsTrigger
                      value="advanced"
                      className="rounded-none data-[state=active]:bg-gray-900 data-[state=active]:text-purple-400"
                    >
                      Paramètres avancés
                    </TabsTrigger>
                  </TabsList>

                  <div className="p-6">
                    <TabsContent value="general" className="m-0">
                      <form className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="title" className="text-gray-300">
                                Titre <span className="text-red-500">*</span>
                              </Label>
                              <Input
                                id="title"
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                className="bg-gray-800 border-gray-700 text-white mt-1"
                                placeholder="Titre de la série"
                                required
                              />
                            </div>

                            <div>
                              <Label htmlFor="originalTitle" className="text-gray-300">
                                Titre original
                              </Label>
                              <Input
                                id="originalTitle"
                                name="originalTitle"
                                value={formData.originalTitle}
                                onChange={handleInputChange}
                                className="bg-gray-800 border-gray-700 text-white mt-1"
                                placeholder="Titre original (si différent)"
                              />
                            </div>

                            <div>
                              <Label htmlFor="releaseDate" className="text-gray-300">
                                Date de sortie <span className="text-red-500">*</span>
                              </Label>
                              <Input
                                id="releaseDate"
                                name="releaseDate"
                                type="date"
                                value={formData.releaseDate}
                                onChange={handleInputChange}
                                className="bg-gray-800 border-gray-700 text-white mt-1"
                                required
                              />
                            </div>

                            <div>
                              <Label htmlFor="creator" className="text-gray-300">
                                Créateur
                              </Label>
                              <Input
                                id="creator"
                                name="creator"
                                value={formData.creator}
                                onChange={handleInputChange}
                                className="bg-gray-800 border-gray-700 text-white mt-1"
                                placeholder="Nom du créateur"
                              />
                            </div>

                            <div>
                              <Label htmlFor="rating" className="text-gray-300">
                                Note (0-10)
                              </Label>
                              <Input
                                id="rating"
                                name="rating"
                                type="number"
                                min="0"
                                max="10"
                                step="0.1"
                                value={formData.rating}
                                onChange={handleInputChange}
                                className="bg-gray-800 border-gray-700 text-white mt-1"
                              />
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="description" className="text-gray-300">
                                Description <span className="text-red-500">*</span>
                              </Label>
                              <Textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                className="bg-gray-800 border-gray-700 text-white mt-1 h-40"
                                placeholder="Synopsis de la série"
                                required
                              />
                            </div>

                            <div>
                              <Label className="text-gray-300 mb-2 block">
                                Genres <span className="text-red-500">*</span>
                              </Label>
                              <div className="grid grid-cols-2 gap-2">
                                {availableGenres.map((genre) => (
                                  <div key={genre} className="flex items-center space-x-2">
                                    <Checkbox
                                      id={`genre-${genre}`}
                                      checked={formData.genres.includes(genre)}
                                      onCheckedChange={() => handleGenreToggle(genre)}
                                    />
                                    <label htmlFor={`genre-${genre}`} className="text-sm text-gray-300 cursor-pointer">
                                      {genre}
                                    </label>
                                  </div>
                                ))}
                              </div>
                              {formData.genres.length === 0 && (
                                <p className="text-red-500 text-xs mt-1">Veuillez sélectionner au moins un genre</p>
                              )}
                            </div>

                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="featured"
                                checked={formData.featured}
                                onCheckedChange={(checked) => handleCheckboxChange("featured", checked as boolean)}
                              />
                              <label htmlFor="featured" className="text-gray-300 cursor-pointer">
                                Série à la une (affichée sur la page d'accueil)
                              </label>
                            </div>

                            <div>
                              <Label htmlFor="status" className="text-gray-300">
                                Statut
                              </Label>
                              <Select
                                value={formData.status}
                                onValueChange={(value) => setFormData((prev) => ({ ...prev, status: value }))}
                              >
                                <SelectTrigger className="bg-gray-800 border-gray-700 text-white mt-1">
                                  <SelectValue placeholder="Sélectionner un statut" />
                                </SelectTrigger>
                                <SelectContent className="bg-gray-800 border-gray-700 text-white">
                                  <SelectItem value="draft">Brouillon</SelectItem>
                                  <SelectItem value="published">Publié</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>
                      </form>
                    </TabsContent>

                    <TabsContent value="media" className="m-0 space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Poster Upload */}
                        <div className="space-y-4">
                          <Label className="text-gray-300">Affiche de la série</Label>
                          <div className="border border-dashed border-gray-700 rounded-lg p-4 text-center">
                            {formData.poster ? (
                              <div className="relative">
                                <div className="relative h-[300px] w-[200px] mx-auto">
                                  <Image
                                    src={formData.poster || "/placeholder.svg"}
                                    alt="Poster preview"
                                    fill
                                    className="object-cover rounded-md"
                                  />
                                </div>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="absolute top-2 right-2 h-8 w-8 bg-gray-900/80 border-gray-700 text-gray-300 hover:bg-gray-800"
                                  onClick={() => setFormData((prev) => ({ ...prev, poster: "" }))}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  className="mt-4 bg-gray-800 border-gray-700 text-gray-300"
                                  onClick={() => handleFileUpload("poster")}
                                >
                                  <Upload className="h-4 w-4 mr-2" />
                                  Changer l'affiche
                                </Button>
                              </div>
                            ) : (
                              <div className="py-8">
                                <div className="flex justify-center">
                                  <Upload className="h-12 w-12 text-gray-500 mb-4" />
                                </div>
                                <p className="text-gray-400 mb-4">
                                  Glissez-déposez une image ou cliquez pour parcourir
                                </p>
                                <Button
                                  variant="outline"
                                  className="bg-gray-800 border-gray-700 text-gray-300"
                                  onClick={() => handleFileUpload("poster")}
                                >
                                  <Upload className="h-4 w-4 mr-2" />
                                  Télécharger l'affiche
                                </Button>
                                <p className="text-gray-500 text-xs mt-2">
                                  Format recommandé: JPG, PNG. Taille max: 2MB
                                </p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Backdrop Upload */}
                        <div className="space-y-4">
                          <Label className="text-gray-300">Image de fond</Label>
                          <div className="border border-dashed border-gray-700 rounded-lg p-4 text-center">
                            {formData.backdrop ? (
                              <div className="relative">
                                <div className="relative h-[169px] w-[300px] mx-auto">
                                  <Image
                                    src={formData.backdrop || "/placeholder.svg"}
                                    alt="Backdrop preview"
                                    fill
                                    className="object-cover rounded-md"
                                  />
                                </div>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="absolute top-2 right-2 h-8 w-8 bg-gray-900/80 border-gray-700 text-gray-300 hover:bg-gray-800"
                                  onClick={() => setFormData((prev) => ({ ...prev, backdrop: "" }))}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  className="mt-4 bg-gray-800 border-gray-700 text-gray-300"
                                  onClick={() => handleFileUpload("backdrop")}
                                >
                                  <Upload className="h-4 w-4 mr-2" />
                                  Changer l'image
                                </Button>
                              </div>
                            ) : (
                              <div className="py-8">
                                <div className="flex justify-center">
                                  <Upload className="h-12 w-12 text-gray-500 mb-4" />
                                </div>
                                <p className="text-gray-400 mb-4">
                                  Glissez-déposez une image ou cliquez pour parcourir
                                </p>
                                <Button
                                  variant="outline"
                                  className="bg-gray-800 border-gray-700 text-gray-300"
                                  onClick={() => handleFileUpload("backdrop")}
                                >
                                  <Upload className="h-4 w-4 mr-2" />
                                  Télécharger l'image
                                </Button>
                                <p className="text-gray-500 text-xs mt-2">
                                  Format recommandé: JPG, PNG. Taille max: 5MB
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Trailer URL */}
                      <div className="space-y-4">
                        <Label htmlFor="trailer" className="text-gray-300">
                          URL de la bande-annonce (YouTube, Vimeo)
                        </Label>
                        <div className="flex space-x-2">
                          <Input
                            id="trailer"
                            name="trailer"
                            value={formData.trailer}
                            onChange={handleInputChange}
                            className="bg-gray-800 border-gray-700 text-white flex-1"
                            placeholder="https://www.youtube.com/embed/..."
                          />
                          <Button
                            variant="outline"
                            className="bg-gray-800 border-gray-700 text-gray-300"
                            onClick={() => handleFileUpload("trailer")}
                          >
                            Exemple
                          </Button>
                        </div>
                        {formData.trailer && (
                          <div className="mt-4 relative aspect-video rounded-lg overflow-hidden">
                            <iframe
                              src={formData.trailer}
                              title="Trailer"
                              className="absolute top-0 left-0 w-full h-full"
                              allowFullScreen
                            ></iframe>
                          </div>
                        )}
                      </div>
                    </TabsContent>

                    <TabsContent value="cast" className="m-0 space-y-6">
                      <div className="flex justify-between items-center">
                        <Label className="text-gray-300 text-lg">Distribution</Label>
                        <Button
                          variant="outline"
                          className="bg-gray-800 border-gray-700 text-gray-300"
                          onClick={handleAddCastMember}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Ajouter un acteur
                        </Button>
                      </div>

                      <div className="space-y-4">
                        {formData.cast.length === 0 ? (
                          <div className="text-center py-8 border border-dashed border-gray-700 rounded-lg">
                            <Users className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                            <p className="text-gray-400">
                              Aucun acteur ajouté. Cliquez sur "Ajouter un acteur" pour commencer.
                            </p>
                          </div>
                        ) : (
                          formData.cast.map((castMember, index) => (
                            <CastMemberInput
                              key={index}
                              castMember={castMember}
                              onChange={(field, value) => handleCastChange(index, field, value)}
                              onRemove={() => handleRemoveCastMember(index)}
                              onUploadPhoto={() => {
                                // Mock photo upload
                                handleCastChange(index, "photo", `/placeholder.svg?height=200&width=200`)
                              }}
                            />
                          ))
                        )}
                      </div>
                    </TabsContent>

                    <TabsContent value="episodes" className="m-0 space-y-6">
                      <div className="flex justify-between items-center">
                        <Label className="text-gray-300 text-lg">Saisons et Épisodes</Label>
                        <Button
                          variant="outline"
                          className="bg-gray-800 border-gray-700 text-gray-300"
                          onClick={handleAddSeason}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Ajouter une saison
                        </Button>
                      </div>

                      <div className="space-y-4">
                        {formData.seasons.length === 0 ? (
                          <div className="text-center py-8 border border-dashed border-gray-700 rounded-lg">
                            <ListPlus className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                            <p className="text-gray-400">
                              Aucune saison ajoutée. Cliquez sur "Ajouter une saison" pour commencer.
                            </p>
                          </div>
                        ) : (
                          <Accordion type="single" collapsible className="w-full">
                            {formData.seasons.map((season, seasonIndex) => (
                              <AccordionItem
                                key={seasonIndex}
                                value={`season-${seasonIndex}`}
                                className="border-gray-800"
                              >
                                <AccordionTrigger className="hover:bg-gray-800/50 px-4 py-2 rounded-md">
                                  <div className="flex items-center">
                                    <span className="text-white font-medium">{season.title}</span>
                                    <Badge className="ml-2 bg-gray-800 text-gray-300">
                                      {season.episodes.length} épisode{season.episodes.length > 1 ? "s" : ""}
                                    </Badge>
                                  </div>
                                </AccordionTrigger>
                                <AccordionContent className="px-4 pt-2 pb-4">
                                  <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div>
                                        <Label htmlFor={`season-${seasonIndex}-title`} className="text-gray-300">
                                          Titre de la saison
                                        </Label>
                                        <Input
                                          id={`season-${seasonIndex}-title`}
                                          value={season.title}
                                          onChange={(e) => handleSeasonChange(seasonIndex, "title", e.target.value)}
                                          className="bg-gray-800 border-gray-700 text-white mt-1"
                                        />
                                      </div>
                                      <div>
                                        <Label htmlFor={`season-${seasonIndex}-releaseDate`} className="text-gray-300">
                                          Date de sortie
                                        </Label>
                                        <Input
                                          id={`season-${seasonIndex}-releaseDate`}
                                          type="date"
                                          value={season.releaseDate}
                                          onChange={(e) =>
                                            handleSeasonChange(seasonIndex, "releaseDate", e.target.value)
                                          }
                                          className="bg-gray-800 border-gray-700 text-white mt-1"
                                        />
                                      </div>
                                    </div>

                                    <div className="flex justify-between items-center">
                                      <h4 className="text-white font-medium">Épisodes</h4>
                                      <div className="flex space-x-2">
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          className="bg-gray-800 border-gray-700 text-gray-300"
                                          onClick={() => handleAddEpisode(seasonIndex)}
                                        >
                                          <Plus className="h-3 w-3 mr-1" />
                                          Ajouter un épisode
                                        </Button>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          className="bg-gray-800 border-gray-700 text-red-400 hover:text-red-300"
                                          onClick={() => handleRemoveSeason(seasonIndex)}
                                        >
                                          <Trash2 className="h-3 w-3 mr-1" />
                                          Supprimer la saison
                                        </Button>
                                      </div>
                                    </div>

                                    <div className="space-y-4 mt-2">
                                      {season.episodes.map((episode, episodeIndex) => (
                                        <div
                                          key={episodeIndex}
                                          className="border border-gray-800 rounded-lg p-4 bg-gray-950/50"
                                        >
                                          <div className="flex justify-between items-center mb-4">
                                            <h5 className="text-white font-medium">
                                              Épisode {episode.number}: {episode.title}
                                            </h5>
                                            <Button
                                              variant="ghost"
                                              size="icon"
                                              className="h-8 w-8 text-gray-400 hover:text-red-500 hover:bg-gray-800"
                                              onClick={() => handleRemoveEpisode(seasonIndex, episodeIndex)}
                                            >
                                              <Trash2 className="h-4 w-4" />
                                            </Button>
                                          </div>

                                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-4">
                                              <div>
                                                <Label
                                                  htmlFor={`episode-${seasonIndex}-${episodeIndex}-title`}
                                                  className="text-gray-300"
                                                >
                                                  Titre
                                                </Label>
                                                <Input
                                                  id={`episode-${seasonIndex}-${episodeIndex}-title`}
                                                  value={episode.title}
                                                  onChange={(e) =>
                                                    handleEpisodeChange(
                                                      seasonIndex,
                                                      episodeIndex,
                                                      "title",
                                                      e.target.value,
                                                    )
                                                  }
                                                  className="bg-gray-800 border-gray-700 text-white mt-1"
                                                />
                                              </div>
                                              <div>
                                                <Label
                                                  htmlFor={`episode-${seasonIndex}-${episodeIndex}-duration`}
                                                  className="text-gray-300"
                                                >
                                                  Durée
                                                </Label>
                                                <Input
                                                  id={`episode-${seasonIndex}-${episodeIndex}-duration`}
                                                  value={episode.duration}
                                                  onChange={(e) =>
                                                    handleEpisodeChange(
                                                      seasonIndex,
                                                      episodeIndex,
                                                      "duration",
                                                      e.target.value,
                                                    )
                                                  }
                                                  className="bg-gray-800 border-gray-700 text-white mt-1"
                                                  placeholder="Ex: 45min"
                                                />
                                              </div>
                                              <div>
                                                <Label
                                                  htmlFor={`episode-${seasonIndex}-${episodeIndex}-description`}
                                                  className="text-gray-300"
                                                >
                                                  Description
                                                </Label>
                                                <Textarea
                                                  id={`episode-${seasonIndex}-${episodeIndex}-description`}
                                                  value={episode.description}
                                                  onChange={(e) =>
                                                    handleEpisodeChange(
                                                      seasonIndex,
                                                      episodeIndex,
                                                      "description",
                                                      e.target.value,
                                                    )
                                                  }
                                                  className="bg-gray-800 border-gray-700 text-white mt-1 h-20"
                                                />
                                              </div>
                                            </div>

                                            <div className="space-y-4">
                                              <div>
                                                <Label className="text-gray-300">Miniature</Label>
                                                <div className="border border-dashed border-gray-700 rounded-lg p-2 text-center mt-1">
                                                  {episode.thumbnail ? (
                                                    <div className="relative">
                                                      <div className="relative h-[100px] w-[180px] mx-auto">
                                                        <Image
                                                          src={episode.thumbnail || "/placeholder.svg"}
                                                          alt="Thumbnail preview"
                                                          fill
                                                          className="object-cover rounded-md"
                                                        />
                                                      </div>
                                                      <Button
                                                        variant="outline"
                                                        size="icon"
                                                        className="absolute top-1 right-1 h-6 w-6 bg-gray-900/80 border-gray-700 text-gray-300 hover:bg-gray-800"
                                                        onClick={() =>
                                                          handleEpisodeChange(
                                                            seasonIndex,
                                                            episodeIndex,
                                                            "thumbnail",
                                                            "",
                                                          )
                                                        }
                                                      >
                                                        <X className="h-3 w-3" />
                                                      </Button>
                                                    </div>
                                                  ) : (
                                                    <Button
                                                      variant="outline"
                                                      size="sm"
                                                      className="bg-gray-800 border-gray-700 text-gray-300"
                                                      onClick={() =>
                                                        handleFileUpload("thumbnail", seasonIndex, episodeIndex)
                                                      }
                                                    >
                                                      <Upload className="h-3 w-3 mr-1" />
                                                      Télécharger
                                                    </Button>
                                                  )}
                                                </div>
                                              </div>

                                              <div>
                                                <Label className="text-gray-300">Fichier vidéo</Label>
                                                <div className="border border-dashed border-gray-700 rounded-lg p-2 text-center mt-1">
                                                  {episode.videoFile ? (
                                                    <div className="flex items-center justify-between">
                                                      <span className="text-sm text-gray-300 truncate max-w-[150px]">
                                                        {episode.videoFile.split("/").pop()}
                                                      </span>
                                                      <div className="flex space-x-1">
                                                        <Button
                                                          variant="ghost"
                                                          size="icon"
                                                          className="h-6 w-6 text-gray-400 hover:text-white"
                                                          onClick={() => window.open(episode.videoFile, "_blank")}
                                                        >
                                                          <Eye className="h-3 w-3" />
                                                        </Button>
                                                        <Button
                                                          variant="ghost"
                                                          size="icon"
                                                          className="h-6 w-6 text-gray-400 hover:text-red-500"
                                                          onClick={() =>
                                                            handleEpisodeChange(
                                                              seasonIndex,
                                                              episodeIndex,
                                                              "videoFile",
                                                              "",
                                                            )
                                                          }
                                                        >
                                                          <X className="h-3 w-3" />
                                                        </Button>
                                                      </div>
                                                    </div>
                                                  ) : (
                                                    <Button
                                                      variant="outline"
                                                      size="sm"
                                                      className="bg-gray-800 border-gray-700 text-gray-300"
                                                      onClick={() =>
                                                        handleFileUpload("videoFile", seasonIndex, episodeIndex)
                                                      }
                                                    >
                                                      <Upload className="h-3 w-3 mr-1" />
                                                      Télécharger
                                                    </Button>
                                                  )}
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </AccordionContent>
                              </AccordionItem>
                            ))}
                          </Accordion>
                        )}
                      </div>
                    </TabsContent>

                    <TabsContent value="advanced" className="m-0 space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="language" className="text-gray-300">
                              Langue principale
                            </Label>
                            <Select
                              value={formData.language}
                              onValueChange={(value) => setFormData((prev) => ({ ...prev, language: value }))}
                            >
                              <SelectTrigger className="bg-gray-800 border-gray-700 text-white mt-1">
                                <SelectValue placeholder="Sélectionner une langue" />
                              </SelectTrigger>
                              <SelectContent className="bg-gray-800 border-gray-700 text-white max-h-60">
                                {availableLanguages.map((language) => (
                                  <SelectItem key={language} value={language}>
                                    {language}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <Label className="text-gray-300 mb-2 block">Sous-titres disponibles</Label>
                            <div className="grid grid-cols-2 gap-2">
                              {availableSubtitles.map((subtitle) => (
                                <div key={subtitle} className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`subtitle-${subtitle}`}
                                    checked={formData.subtitles.includes(subtitle)}
                                    onCheckedChange={() => handleSubtitleToggle(subtitle)}
                                  />
                                  <label
                                    htmlFor={`subtitle-${subtitle}`}
                                    className="text-sm text-gray-300 cursor-pointer"
                                  >
                                    {subtitle}
                                  </label>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      <Separator className="bg-gray-800" />

                      <div>
                        <h3 className="text-white font-medium mb-4">Paramètres de publication</h3>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <Label htmlFor="status" className="text-gray-300">
                                Statut de publication
                              </Label>
                              <p className="text-gray-500 text-sm">
                                Définir si la série est visible par les utilisateurs
                              </p>
                            </div>
                            <Select
                              value={formData.status}
                              onValueChange={(value) => setFormData((prev) => ({ ...prev, status: value }))}
                            >
                              <SelectTrigger className="bg-gray-800 border-gray-700 text-white w-40">
                                <SelectValue placeholder="Statut" />
                              </SelectTrigger>
                              <SelectContent className="bg-gray-800 border-gray-700 text-white">
                                <SelectItem value="draft">Brouillon</SelectItem>
                                <SelectItem value="published">Publié</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <Label htmlFor="featured" className="text-gray-300">
                                Série à la une
                              </Label>
                              <p className="text-gray-500 text-sm">
                                Afficher cette série en évidence sur la page d'accueil
                              </p>
                            </div>
                            <Switch
                              id="featured"
                              checked={formData.featured}
                              onCheckedChange={(checked) => handleCheckboxChange("featured", checked)}
                            />
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                  </div>
                </Tabs>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
                <h3 className="text-white font-medium mb-4">Statut</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Statut:</span>
                    <Badge
                      className={
                        formData.status === "published"
                          ? "bg-green-500/20 text-green-400"
                          : "bg-amber-500/20 text-amber-400"
                      }
                    >
                      {formData.status === "published" ? "Publié" : "Brouillon"}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Visibilité:</span>
                    <span className="text-gray-300">{formData.status === "published" ? "Public" : "Privé"}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">À la une:</span>
                    <span className="text-gray-300">{formData.featured ? "Oui" : "Non"}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
                <h3 className="text-white font-medium mb-4">Informations</h3>
                <div className="space-y-4">
                  <div className="flex items-center text-gray-300">
                    <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                    <span>Date: {formData.releaseDate}</span>
                  </div>
                  <div className="flex items-center text-gray-300">
                    <Star className="h-4 w-4 mr-2 text-gray-500" />
                    <span>Note: {formData.rating.toFixed(1)}/10</span>
                  </div>
                  <div className="flex items-start text-gray-300">
                    <Film className="h-4 w-4 mr-2 text-gray-500 mt-0.5" />
                    <div>
                      <span className="block">Genres:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {formData.genres.map((genre) => (
                          <Badge key={genre} variant="outline" className="bg-gray-800 text-gray-300 border-gray-700">
                            {genre}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
                <h3 className="text-white font-medium mb-4">Progression</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-300">Informations de base</span>
                      <span className="text-gray-300">
                        {formData.title && formData.description && formData.genres.length > 0
                          ? "Complété"
                          : "Incomplet"}
                      </span>
                    </div>
                    <Progress
                      value={
                        (formData.title ? 33 : 0) +
                        (formData.description ? 33 : 0) +
                        (formData.genres.length > 0 ? 34 : 0)
                      }
                      className="h-2 bg-gray-800"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-300">Médias</span>
                      <span className="text-gray-300">{formData.poster ? "Complété" : "Incomplet"}</span>
                    </div>
                    <Progress value={formData.poster ? 100 : 0} className="h-2 bg-gray-800" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-300">Épisodes</span>
                      <span className="text-gray-300">
                        {formData.seasons.length > 0 && formData.seasons.some((s) => s.episodes.length > 0)
                          ? "Complété"
                          : "Incomplet"}
                      </span>
                    </div>
                    <Progress
                      value={
                        formData.seasons.length > 0 && formData.seasons.some((s) => s.episodes.length > 0) ? 100 : 0
                      }
                      className="h-2 bg-gray-800"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
