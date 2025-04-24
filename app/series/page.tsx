import { Suspense } from "react"
import MovieGrid from "@/components/movie-grid"
import FilterBar from "@/components/filter-bar"
import LoadingSkeleton from "@/components/loading-skeleton"

export default function SeriesPage() {
  return (
    <div className="pt-24 pb-12">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8 font-poppins">Séries</h1>

        <Suspense fallback={<div className="h-12 w-full bg-gray-800 rounded-md animate-pulse mb-8"></div>}>
          <FilterBar />
        </Suspense>

        <Suspense fallback={<LoadingSkeleton type="grid" count={20} />}>
          <MovieGrid type="series" />
        </Suspense>
      </div>
    </div>
  )
}
