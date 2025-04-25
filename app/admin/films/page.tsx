"use client"

import { useState } from "react"
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
  ChevronRight
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

// Données de films simulées
const mockFilms = [
  {
    id: "1",
    title: "Inception",
    releaseYear: 2010,
    genre: "Science-Fiction",
    duration: "2h 28min",
    vipOnly: false,
    status: "publié"
  },
  {
    id: "2",
    title: "The Dark Knight",
    releaseYear: 2008,
    genre: "Action",
    duration: "2h 32min",
    vipOnly: false,
    status: "publié"
  },
  {
    id: "3",
    title: "Interstellar",
    releaseYear: 2014,
    genre: "Science-Fiction",
    duration: "2h 49min",
    vipOnly: true,
    status: "publié"
  },
  {
    id: "4",
    title: "Pulp Fiction",
    releaseYear: 1994,
    genre: "Crime",
    duration: "2h 34min",
    vipOnly: false,
    status: "publié"
  },
  {
    id: "5",
    title: "The Godfather",
    releaseYear: 1972,
    genre: "Crime",
    duration: "2h 55min",
    vipOnly: false,
    status: "publié"
  },
  {
    id: "6",
    title: "Fight Club",
    releaseYear: 1999,
    genre: "Drame",
    duration: "2h 19min",
    vipOnly: true,
    status: "brouillon"
  },
  {
    id: "7",
    title: "The Matrix",
    releaseYear: 1999,
    genre: "Science-Fiction",
    duration: "2h 16min",
    vipOnly: false,
    status: "publié"
  }
]

export default function FilmsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("tous")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedFilm, setSelectedFilm] = useState<typeof mockFilms[0] | null>(null)
  
  // Filtrer les films en fonction de la recherche et du filtre de statut
  const filteredFilms = mockFilms.filter(film => {
    const matchesSearch = film.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         film.genre.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         film.releaseYear.toString().includes(searchQuery)
    
    const matchesStatus = statusFilter === "tous" || film.status === statusFilter
    
    return matchesSearch && matchesStatus
  })
  
  const handleDeleteClick = (film: typeof mockFilms[0]) => {
    setSelectedFilm(film)
    setDeleteDialogOpen(true)
  }
  
  const handleDeleteConfirm = () => {
    // Ici, vous implémenteriez la logique de suppression réelle
    console.log(`Suppression du film: ${selectedFilm?.title}`)
    setDeleteDialogOpen(false)
    setSelectedFilm(null)
    // Dans une application réelle, vous appelleriez une API ou un service Firebase ici
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
          />
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant={statusFilter === "tous" ? "default" : "outline"} 
            size="sm"
            onClick={() => setStatusFilter("tous")}
            className="whitespace-nowrap"
          >
            Tous
          </Button>
          <Button 
            variant={statusFilter === "publié" ? "default" : "outline"} 
            size="sm"
            onClick={() => setStatusFilter("publié")}
            className="whitespace-nowrap"
          >
            Publiés
          </Button>
          <Button 
            variant={statusFilter === "brouillon" ? "default" : "outline"} 
            size="sm"
            onClick={() => setStatusFilter("brouillon")}
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
            {filteredFilms.map((film) => (
              <TableRow key={film.id} className="border-gray-800">
                <TableCell className="font-medium text-white">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded bg-gray-700 flex items-center justify-center mr-3">
                      <Film className="h-4 w-4 text-gray-400" />
                    </div>
                    {film.title}
                  </div>
                </TableCell>
                <TableCell>{film.releaseYear}</TableCell>
                <TableCell className="hidden md:table-cell">{film.genre}</TableCell>
                <TableCell className="hidden md:table-cell">{film.duration}</TableCell>
                <TableCell className="hidden md:table-cell">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    film.status === "publié" 
                      ? "bg-green-500/20 text-green-500" 
                      : "bg-orange-500/20 text-orange-500"
                  }`}>
                    {film.status}
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
            ))}
            
            {filteredFilms.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-400">
                  Aucun film trouvé pour cette recherche.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Pagination */}
      <div className="flex items-center justify-between mt-4">
        <p className="text-sm text-gray-400">
          Affichage de {filteredFilms.length} films sur {mockFilms.length}
        </p>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" disabled>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" disabled>
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
            >
              Annuler
            </Button>
            <Button 
              variant="destructive"
              onClick={handleDeleteConfirm}
            >
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}