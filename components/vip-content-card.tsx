import Link from "next/link"
import { Play } from "lucide-react"
import { VIPBadge } from "./vip-badge"
import { Button } from "@/components/ui/button"

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

interface VIPContentCardProps {
  item: ContentItem
  featured?: boolean
}

export function VIPContentCard({ item, featured = false }: VIPContentCardProps) {
  const year = item.releaseDate.split("-")[0]
  const genresText = item.genres.slice(0, 2).join(" • ")

  return (
    <div className={`group relative overflow-hidden rounded-lg ${featured ? "col-span-2 row-span-2" : ""}`}>
      <div className={`${featured ? "aspect-video" : "aspect-[2/3]"} bg-gray-900`}>
        <img
          src={item.poster || "/placeholder.svg?height=450&width=300"}
          alt={item.title}
          className="w-full h-full object-cover transition-transform group-hover:scale-105"
        />
      </div>

      <div className="absolute top-2 right-2">
        <VIPBadge size={featured ? "lg" : "md"} />
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-4">
        <h3 className={`font-bold text-white ${featured ? "text-2xl" : "text-lg"} mb-1`}>{item.title}</h3>

        <div className="flex items-center text-sm text-gray-300 mb-2">
          <span>{year}</span>
          <span className="mx-2">•</span>
          <span>{genresText}</span>
        </div>

        {featured && <p className="text-gray-300 mb-4 line-clamp-2">{item.description}</p>}

        <div className="flex space-x-2">
          <Link href={`/${item.type === "movie" ? "films" : "series"}/${item.id}`} className="w-full">
            <Button className="w-full bg-gradient-to-r from-amber-400 to-yellow-600 text-black hover:from-amber-500 hover:to-yellow-700">
              <Play className="h-4 w-4 mr-2" />
              {featured ? "Regarder maintenant" : "Regarder"}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
export function VipBadge() {
  return (
    <span className="ml-1 text-xs bg-gradient-to-r from-amber-400 to-yellow-600 text-black px-1.5 py-0.5 rounded-full font-bold">
      VIP
    </span>
  );
}