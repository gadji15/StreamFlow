import { VIPContentCard } from "./vip-content-card"
import { mockMovies, mockSeries } from "@/lib/mock-data"
import { Crown } from "lucide-react"

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

      {featured && remainingItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
          <div className="md:col-span-2 lg:col-span-2">
            <VIPContentCard item={featured} featured={true} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 gap-6">
            {remainingItems.slice(0, 4).map((item) => (
              <VIPContentCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {vipItems.map((item) => (
            <VIPContentCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </section>
  )
}
