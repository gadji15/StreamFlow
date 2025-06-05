import { VIPContentCard } from "./vip-content-card"
import { mockMovies, mockSeries } from "@/lib/mock-data"
import { Crown } from "lucide-react"
import FilmCard from "./FilmCard"
import SeriesCard from "./SeriesCard"

interface ContentItem {
  id: number
  title: string
  description: string
  poster: string
  releaseDate: string
  genres: string[]
  vipOnly: boolean
  type: "movie" | "series"
}

interface VIPContentSectionProps {
  title?: string
  items?: ContentItem[]
  featuredItem?: ContentItem
  userIsVIP?: boolean
}

export function VIPContentSection({
  title = "Contenu Exclusif VIP",
  items,
  featuredItem,
  userIsVIP = false,
}: VIPContentSectionProps) {
  // Si items n'est pas fourni, créer un tableau à partir des données mockées
  const vipItems = items || [
    ...mockMovies
      .filter((movie) => movie.vipOnly)
      .map((movie) => ({
        id: movie.id,
        title: movie.title,
        description: movie.description,
        poster: movie.poster,
        releaseDate: movie.releaseDate,
        genres: movie.genres,
        vipOnly: movie.vipOnly,
        type: "movie" as const,
      })),
    ...mockSeries
      .filter((series) => series.vipOnly)
      .map((series) => ({
        id: series.id,
        title: series.title,
        description: series.description,
        poster: series.poster,
        releaseDate: series.releaseDate,
        genres: series.genres,
        vipOnly: series.vipOnly,
        type: "series" as const,
      })),
  ]

  // Si featuredItem n'est pas fourni, utiliser le premier élément du tableau
  const featured = featuredItem || (vipItems.length > 0 ? vipItems[0] : undefined)
  const remainingItems = featured ? vipItems.filter((item) => item.id !== featured.id) : vipItems

  if (vipItems.length === 0) {
    return null
  }

  return (
    <section className="py-8">
      <h2 className="text-2xl font-bold mb-6 flex items-center">
        {title}
        <Crown className="ml-2 h-5 w-5 text-amber-500" />
      </h2>
      <div
        className="grid gap-3"
        style={{
          gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))"
        }}
      >
        {vipItems.map((item) =>
          item.type === "movie" ? (
            <FilmCard
              key={item.id}
              movie={{
                id: String(item.id),
                title: item.title,
                poster: item.poster,
                year: item.releaseDate ? item.releaseDate.slice(0, 4) : "",
                isVIP: item.vipOnly
              }}
            />
          ) : (
            <SeriesCard
              key={item.id}
              series={{
                id: String(item.id),
                title: item.title,
                poster: item.poster,
                year: item.releaseDate ? item.releaseDate.slice(0, 4) : "",
                isVIP: item.vipOnly
              }}
            />
          )
        )}
      </div>
    </section>
  )
}
