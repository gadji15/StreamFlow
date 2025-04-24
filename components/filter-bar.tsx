"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChevronDown, SlidersHorizontal } from "lucide-react"

// Mock data for filters
const genres = [
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

const years = [
  "2023",
  "2022",
  "2021",
  "2020",
  "2019",
  "2018",
  "2017",
  "2016",
  "2015",
  "2010-2014",
  "2000-2009",
  "1990-1999",
  "Avant 1990",
]

const languages = ["Français", "Anglais", "Espagnol", "Allemand", "Italien", "Japonais", "Coréen", "Chinois", "Russe"]

const sortOptions = [
  { value: "popularity", label: "Popularité" },
  { value: "date", label: "Date de sortie" },
  { value: "rating", label: "Note" },
  { value: "title", label: "Titre" },
]

export default function FilterBar() {
  const [selectedGenre, setSelectedGenre] = useState<string>("")
  const [selectedYear, setSelectedYear] = useState<string>("")
  const [selectedLanguage, setSelectedLanguage] = useState<string>("")
  const [sortBy, setSortBy] = useState<string>("popularity")

  const handleReset = () => {
    setSelectedGenre("")
    setSelectedYear("")
    setSelectedLanguage("")
    setSortBy("popularity")
  }

  return (
    <div className="flex flex-wrap gap-3 mb-8">
      {/* Genre Filter */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="bg-gray-800 border-gray-700 hover:bg-gray-700">
            {selectedGenre || "Genre"}
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56 max-h-80 overflow-y-auto">
          <DropdownMenuRadioGroup value={selectedGenre} onValueChange={setSelectedGenre}>
            <DropdownMenuRadioItem value="">Tous les genres</DropdownMenuRadioItem>
            {genres.map((genre) => (
              <DropdownMenuRadioItem key={genre} value={genre}>
                {genre}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Year Filter */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="bg-gray-800 border-gray-700 hover:bg-gray-700">
            {selectedYear || "Année"}
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <DropdownMenuRadioGroup value={selectedYear} onValueChange={setSelectedYear}>
            <DropdownMenuRadioItem value="">Toutes les années</DropdownMenuRadioItem>
            {years.map((year) => (
              <DropdownMenuRadioItem key={year} value={year}>
                {year}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Language Filter */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="bg-gray-800 border-gray-700 hover:bg-gray-700">
            {selectedLanguage || "Langue"}
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <DropdownMenuRadioGroup value={selectedLanguage} onValueChange={setSelectedLanguage}>
            <DropdownMenuRadioItem value="">Toutes les langues</DropdownMenuRadioItem>
            {languages.map((language) => (
              <DropdownMenuRadioItem key={language} value={language}>
                {language}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Sort By */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="bg-gray-800 border-gray-700 hover:bg-gray-700">
            <SlidersHorizontal className="mr-2 h-4 w-4" />
            Trier par: {sortOptions.find((opt) => opt.value === sortBy)?.label}
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <DropdownMenuRadioGroup value={sortBy} onValueChange={setSortBy}>
            {sortOptions.map((option) => (
              <DropdownMenuRadioItem key={option.value} value={option.value}>
                {option.label}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Reset Button */}
      <Button variant="ghost" onClick={handleReset} className="text-gray-300 hover:text-white hover:bg-gray-700">
        Réinitialiser
      </Button>
    </div>
  )
}
