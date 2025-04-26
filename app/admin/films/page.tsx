"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Film,
  ChevronLeft,
  ChevronRight,
  Loader2
} from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { getMovies, deleteMovie, Movie } from "@/lib/firebase"
import { QueryDocumentSnapshot, DocumentData } from "firebase/firestore"

export default function FilmsPage() {
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<"published" | "draft" | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedFilm, setSelectedFilm] = useState<Movie | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)
  const [films, setFilms] = useState<Movie[]>([])
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null)
  const [adminId, setAdminId] = useState<string | null>(null)
  
  useEffect(() => {
    // Récupérer l'ID de l'admin connecté
    const storedAdminId = localStorage.getItem("adminId")
    if (storedAdminId) {
      setAdminId(storedAdminId)
    }
    
    loadFilms()
  }, [statusFilter])
  
  const loadFilms = async () => {
    setIsLoading(true)
    try {
      const result = await getMovies({
        status: statusFilter || undefined,
        searchQuery: searchQuery || undefined,
        sortBy: "updatedAt",
        sortDirection: "desc",
        limit: 20
      })
      
      setFilms(result.movies)
      setLastDoc(result.lastDoc)
    } catch (error) {
      console.error("Erreur lors du chargement des films:", error)
      toast({
        title: "Erreur",
        description: "Impossible de charger la liste des films",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleSearch = () => {
    loadFilms()
  }
  
  const handleDeleteClick = (film: Movie) => {
    if (!film.id) return
    
    setSelectedFilm(film)
    setDeleteDialogOpen(true)
  }
  
  const handleDeleteConfirm = async () => {
    if (!selectedFilm?.id || !adminId) return
    
    setIsDeleting(true)
    
    try {
      await deleteMovie(selectedFilm.id, adminId)
      
      // Mettre à jour la liste des films
      setFilms(films.filter(film => film.id !== selectedFilm.id))
      
      toast({
        title: "Film supprimé",
        description: `${selectedFilm.title} a été supprimé avec succès`,
        variant: "default"
      })
    } catch (error) {
      console.error("Erreur lors de la suppression du film:", error)
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le film",
        variant: "destructive"
      })
    } finally {
      setIsDeleting(false)
      setDeleteDialogOpen(false)
      setSelectedFilm(null)
    }
  }
  
  const getFormattedDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins.toString().padStart(2, '0')}min`
  }
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-white">Gestion des films</h1>
        <Link href="/admin/films/add">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Ajouter un film
          </Button>
        </Link>
      </div>
      
      {/* Filtres et recherche */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
          <Input
            type="text"
            placeholder="Rechercher un film..."
            className="pl-10 w-full bg-gray-800 border-gray-700 text-white"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant={statusFilter === null ? "default" : "outline"} 
            size="sm"
            onClick={() => setStatusFilter(null)}
            className="whitespace-nowrap"
          >
            Tous
          </Button>
          <Button 
            variant={statusFilter === "published" ? "default" : "outline"} 
            size="sm"
            onClick={() => setStatusFilter("published")}
            className="whitespace-nowrap"
          >
            Publiés
          </Button>
          <Button 
            variant={statusFilter === "draft" ? "default" : "outline"} 
            size="sm"
            onClick={() => setStatusFilter("draft")}
            className="whitespace-nowrap"
          >
            Brouillons
          </Button>
          <Button 
            variant="outline" 
            size="icon"
            className="hidden sm:flex"
          >
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Table des films */}
      <div className="border border-gray-800 rounded-lg overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-800/50">
            <TableRow>
              <TableHead className="text-white">Titre</TableHead>
              <TableHead className="text-white">Année</TableHead>
              <TableHead className="text-white hidden md:table-cell">Genre</TableHead>
              <TableHead className="text-white hidden md:table-cell">Durée</TableHead>
              <TableHead className="text-white hidden md:table-cell">Statut</TableHead>
              <TableHead className="text-white hidden md:table-cell">Accès</TableHead>
              <TableHead className="text-white">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-40 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                    <p className="text-gray-400">Chargement des films...</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : films.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-400">
                  {searchQuery ? (
                    <p>Aucun film trouvé pour cette recherche.</p>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8">
                      <Film className="h-10 w-10 text-gray-600 mb-2" />
                      <p className="mb-1">Aucun film n'a été ajouté.</p>
                      <Link href="/admin/films/add">
                        <Button size="sm" className="mt-2">
                          <Plus className="mr-1 h-4 w-4" /> Ajouter un film
                        </Button>
                      </Link>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ) : (
              films.map((film) => (
                <TableRow key={film.id} className="border-gray-800">
                  <TableCell className="font-medium text-white">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded overflow-hidden bg-gray-700 flex items-center justify-center mr-3">
                        {film.posterUrl ? (
                          <img 
                            src={film.posterUrl}
                            alt={film.title}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <Film className="h-4 w-4 text-gray-400" />
                        )}
                      </div>
                      {film.title}
                    </div>
                  </TableCell>
                  <TableCell>{film.releaseYear}</TableCell>
                  <TableCell className="hidden md:table-cell">{film.genre}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    {film.duration ? getFormattedDuration(film.duration) : "--"}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      film.status === "published" 
                        ? "bg-green-500/20 text-green-500" 
                        : "bg-orange-500/20 text-orange-500"
                    }`}>
                      {film.status === "published" ? "publié" : "brouillon"}
                    </span>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {film.vipOnly ? (
                      <span className="bg-amber-500/20 text-amber-500 px-2 py-1 rounded-full text-xs font-medium">
                        VIP
                      </span>
                    ) : (
                      <span className="bg-blue-500/20 text-blue-500 px-2 py-1 rounded-full text-xs font-medium">
                        Tous
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Link href={`/admin/films/edit/${film.id}`}>
                        <Button size="icon" variant="ghost" className="text-gray-400 hover:text-white">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="text-gray-400 hover:text-red-500"
                        onClick={() => handleDeleteClick(film)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Pagination */}
      <div className="flex items-center justify-between mt-4">
        <p className="text-sm text-gray-400">
          {films.length} films affichés
        </p>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" disabled>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" disabled={!lastDoc}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Dialog de confirmation de suppression */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="bg-gray-900 border border-gray-800">
          <DialogHeader>
            <DialogTitle className="text-white">Confirmer la suppression</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer le film "{selectedFilm?.title}" ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button 
              variant="outline" 
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Annuler
            </Button>
            <Button 
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Suppression...
                </>
              ) : (
                "Supprimer"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}