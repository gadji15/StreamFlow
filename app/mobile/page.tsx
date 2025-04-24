import { Suspense } from "react"
import MobileHero from "@/components/mobile/mobile-hero"
import MobileCarousel from "@/components/mobile/mobile-carousel"
import MobileNavigation from "@/components/mobile/mobile-navigation"
import LoadingSkeleton from "@/components/loading-skeleton"
import { TrendingUp, Clock, Download } from "lucide-react"

export default function MobilePage() {
  return (
    <div className="pb-20">
      {/* Mobile Navigation */}
      <MobileNavigation />

      {/* Hero Section */}
      <Suspense fallback={<LoadingSkeleton type="hero" />}>
        <MobileHero />
      </Suspense>

      {/* Téléchargements Section */}
      <section className="px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Téléchargements</h2>
          <Download className="h-5 w-5 text-purple-500" />
        </div>
        <Suspense fallback={<LoadingSkeleton type="carousel" />}>
          <MobileCarousel category="downloads" />
        </Suspense>
      </section>

      {/* Nouveautés Section */}
      <section className="px-4 py-6">
        <h2 className="text-xl font-bold text-white mb-4">Nouveautés</h2>
        <Suspense fallback={<LoadingSkeleton type="carousel" />}>
          <MobileCarousel category="new" />
        </Suspense>
      </section>

      {/* Tendances Section */}
      <section className="px-4 py-6">
        <div className="flex items-center mb-4">
          <h2 className="text-xl font-bold text-white">Tendances</h2>
          <TrendingUp className="ml-2 h-5 w-5 text-red-500" />
        </div>
        <Suspense fallback={<LoadingSkeleton type="carousel" />}>
          <MobileCarousel category="trending" />
        </Suspense>
      </section>

      {/* Continuer à regarder Section */}
      <section className="px-4 py-6">
        <div className="flex items-center mb-4">
          <h2 className="text-xl font-bold text-white">Continuer à regarder</h2>
          <Clock className="ml-2 h-5 w-5 text-blue-500" />
        </div>
        <Suspense fallback={<LoadingSkeleton type="carousel" />}>
          <MobileCarousel category="continue-watching" />
        </Suspense>
      </section>
    </div>
  )
}
