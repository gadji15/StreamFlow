"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Film,
  Tv,
  Search,
  Plus,
  Filter,
  SlidersHorizontal,
  Calendar,
  Clock,
  Star,
  Eye,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import AdminSidebar from "@/components/admin/admin-sidebar"
import AdminHeader from "@/components/admin/admin-header"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { mockMovies, mockSeries } from "@/lib/mock-data"
import { supabase } from "@/lib/supabaseClient"
import Image from "next/image"

export default function ContentManagementPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<"movies" | "series">("movies")
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [sortBy, setSortBy] = useState("date")
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterGenre, setFilterGenre] = useState("all")

  const itemsPerPage = 10
  const content = activeTab === "movies" ? mockMovies : mockSeries

  // Filter content based on search query and filters
  const filteredContent = content.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = filterStatus === "all" || item.status === filterStatus
    const matchesGenre = filterGenre === "all" || item.genres.includes(filterGenre)
    return matchesSearch && matchesStatus && matchesGenre
  })

  // Sort content
  const sortedContent = [...filteredContent].sort((a, b) => {
    if (sortBy === "title") return a.title.localeCompare(b.title)
    if (sortBy === "date") return new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime()
    if (sortBy === "views") return b.views - a.views
    if (sortBy === "rating") return b.rating - a.rating
    return 0
  })

  // Paginate content
  const totalPages = Math.ceil(sortedContent.length / itemsPerPage)
  const paginatedContent = sortedContent.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  // Get unique genres from all content
  const allGenres = Array.from(new Set([...mockMovies, ...mockSeries].flatMap((item) => item.genres))).sort()

  const handleAddContent = () => {
    router.push(`/admin/content/${activeTab === "movies" ? "movie" : "series"}/new`)
  }

  const handleEditContent = (id: number) => {
    router.push(`/admin/content/${activeTab === "movies" ? "movie" : "series"}/${id}`)
  }

  const handleDeleteContent = (id: number) => {
    // In a real application, this would make an API call to delete the content
    alert(`Deleting ${activeTab === "movies" ? "movie" : "series"} with ID: ${id}`)
  }

  return (
    <div className="min-h-screen bg-gray-950 flex">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <AdminHeader title="Gestion du contenu" />
        <main className="flex-1 p-6 pt-24">
          <div className="mb-6 flex justify-between items-center">
            <Tabs
              defaultValue="movies"
              className="w-full"
              onValueChange={(value) => setActiveTab(value as "movies" | "series")}
            >
              <div className="flex justify-between items-center mb-4">
                <TabsList className="bg-gray-900">
                  <TabsTrigger value="movies" className="data-[state=active]:bg-purple-600">
                    <Film className="h-4 w-4 mr-2" />
                    Films
                  </TabsTrigger>
                  <TabsTrigger value="series" className="data-[state=active]:bg-purple-600">
                    <Tv className="h-4 w-4 mr-2" />
                    Séries
                  </TabsTrigger>
                </TabsList>
                <Button onClick={handleAddContent} className="bg-purple-600 hover:bg-purple-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter {activeTab === "movies" ? "un film" : "une série"}
                </Button>
              </div>

              <div className="flex flex-col space-y-4">
                <div className="flex flex-wrap gap-4">
                  {/* Search */}
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      type="text"
                      placeholder={`Rechercher des ${activeTab === "movies" ? "films" : "séries"}...`}
                      className="pl-10 bg-gray-900 border-gray-800 text-white"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>

                  {/* Status Filter */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="bg-gray-900 border-gray-800 text-gray-300">
                        <Filter className="h-4 w-4 mr-2" />
                        Statut:{" "}
                        {filterStatus === "all" ? "Tous" : filterStatus === "published" ? "Publié" : "Brouillon"}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-gray-900 border-gray-800 text-white">
                      <DropdownMenuRadioGroup value={filterStatus} onValueChange={setFilterStatus}>
                        <DropdownMenuRadioItem value="all">Tous</DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="published">Publié</DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="draft">Brouillon</DropdownMenuRadioItem>
                      </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {/* Genre Filter */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="bg-gray-900 border-gray-800 text-gray-300">
                        <Filter className="h-4 w-4 mr-2" />
                        Genre: {filterGenre === "all" ? "Tous" : filterGenre}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-gray-900 border-gray-800 text-white max-h-60 overflow-y-auto">
                      <DropdownMenuRadioGroup value={filterGenre} onValueChange={setFilterGenre}>
                        <DropdownMenuRadioItem value="all">Tous les genres</DropdownMenuRadioItem>
                        {allGenres.map((genre) => (
                          <DropdownMenuRadioItem key={genre} value={genre}>
                            {genre}
                          </DropdownMenuRadioItem>
                        ))}
                      </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {/* Sort By */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="bg-gray-900 border-gray-800 text-gray-300">
                        <SlidersHorizontal className="h-4 w-4 mr-2" />
                        Trier par:{" "}
                        {sortBy === "title"
                          ? "Titre"
                          : sortBy === "date"
                            ? "Date"
                            : sortBy === "views"
                              ? "Vues"
                              : "Note"}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-gray-900 border-gray-800 text-white">
                      <DropdownMenuRadioGroup value={sortBy} onValueChange={setSortBy}>
                        <DropdownMenuRadioItem value="title">Titre</DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="date">Date</DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="views">Vues</DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="rating">Note</DropdownMenuRadioItem>
                      </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <TabsContent value="movies" className="mt-0">
                  <ContentTable
                    content={paginatedContent}
                    contentType="movie"
                    onEdit={handleEditContent}
                    onDelete={handleDeleteContent}
                  />
                </TabsContent>

                <TabsContent value="series" className="mt-0">
                  <ContentTable
                    content={paginatedContent}
                    contentType="series"
                    onEdit={handleEditContent}
                    onDelete={handleDeleteContent}
                  />
                </TabsContent>
              </div>
            </Tabs>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-6">
              <div className="text-sm text-gray-400">
                Affichage de {(currentPage - 1) * itemsPerPage + 1} à{" "}
                {Math.min(currentPage * itemsPerPage, filteredContent.length)} sur {filteredContent.length} résultats
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="bg-gray-900 border-gray-800 text-gray-300 hover:bg-gray-800"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    className={
                      currentPage === page
                        ? "bg-purple-600 hover:bg-purple-700"
                        : "bg-gray-900 border-gray-800 text-gray-300 hover:bg-gray-800"
                    }
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="bg-gray-900 border-gray-800 text-gray-300 hover:bg-gray-800"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

interface ContentTableProps {
  content: any[]
  contentType: "movie" | "series"
  onEdit: (id: number) => void
  onDelete: (id: number) => void
}

function ContentTable({ content, contentType, onEdit, onDelete }: ContentTableProps) {
  return (
    <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-800 bg-gray-950/50">
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Titre</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Date</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Durée</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Genres</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Note</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Vues</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Statut</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {content.length > 0 ? (
              content.map((item) => (
                <tr key={item.id} className="hover:bg-gray-800/50 transition-colors">
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-7 relative">
                        <Image
                          src={item.poster || "/placeholder.svg"}
                          alt={item.title}
                          fill
                          className="rounded object-cover"
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-white">{item.title}</div>
                        <div className="text-sm text-gray-400">ID: {item.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-300">
                      <Calendar className="h-4 w-4 mr-1 text-gray-500" />
                      {new Date(item.releaseDate).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-300">
                      <Clock className="h-4 w-4 mr-1 text-gray-500" />
                      {item.duration}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex flex-wrap gap-1">
                      {item.genres.slice(0, 2).map((genre: string) => (
                        <Badge key={genre} variant="outline" className="bg-gray-800 text-gray-300 border-gray-700">
                          {genre}
                        </Badge>
                      ))}
                      {item.genres.length > 2 && (
                        <Badge variant="outline" className="bg-gray-800 text-gray-300 border-gray-700">
                          +{item.genres.length - 2}
                        </Badge>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-yellow-500">
                      <Star className="h-4 w-4 mr-1 fill-yellow-500" />
                      {item.rating.toFixed(1)}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-300">
                      <Eye className="h-4 w-4 mr-1 text-gray-500" />
                      {item.views.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <Badge
                      className={
                        item.status === "published"
                          ? "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                          : "bg-amber-500/20 text-amber-400 hover:bg-amber-500/30"
                      }
                    >
                      {item.status === "published" ? "Publié" : "Brouillon"}
                    </Badge>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(item.id)}
                        className="h-8 w-8 text-gray-400 hover:text-white hover:bg-gray-800"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(item.id)}
                        className="h-8 w-8 text-gray-400 hover:text-red-500 hover:bg-gray-800"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-gray-400">
                  Aucun contenu trouvé
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}