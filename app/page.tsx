import { Suspense } from "react"
import { TrendingUp, Clock } from "lucide-react"
import MovieCarousel from "@/components/movie-carousel"
import HeroSection from "@/components/hero-section"
import LoadingSkeleton from "@/components/loading-skeleton"
import { VIPContentSection } from "@/components/vip-content-section"

export default function Home() {
  // Simuler un utilisateur VIP (dans une application réelle, cela viendrait d'une vérification d'authentification)
  const userIsVIP = true

  return (
    <div className="pt-16">
      {/* Hero Section */}
      <Suspense fallback={<LoadingSkeleton type="hero" />}>
        <HeroSection />
      </Suspense>

      {/* VIP Content Section */}
      <Suspense fallback={<LoadingSkeleton type="carousel" />}>
        <div className="container mx-auto px-4">
          <VIPContentSection userIsVIP={userIsVIP} />
        </div>
      </Suspense>

      {/* Nouveautés Section */}
      <section className="container mx-auto px-4 py-8">
        <h2 className="section-title">Nouveautés</h2>
        <Suspense fallback={<LoadingSkeleton type="carousel" />}>
          <MovieCarousel category="new" />
        </Suspense>
      </section>

      {/* Tendances Section */}
      <section className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-4">
          <h2 className="section-title">Tendances</h2>
          <TrendingUp className="ml-2 h-5 w-5 text-red-500" />
        </div>
        <Suspense fallback={<LoadingSkeleton type="carousel" />}>
          <MovieCarousel category="trending" />
        </Suspense>
      </section>

      {/* Recommandés pour vous Section */}
      <section className="container mx-auto px-4 py-8">
        <h2 className="section-title">Recommandés pour vous</h2>
        <Suspense fallback={<LoadingSkeleton type="carousel" />}>
          <MovieCarousel category="recommended" />
        </Suspense>
      </section>

      {/* Continuer à regarder Section */}
      <section className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-4">
          <h2 className="section-title">Continuer à regarder</h2>
          <Clock className="ml-2 h-5 w-5 text-blue-500" />
        </div>
        <Suspense fallback={<LoadingSkeleton type="carousel" />}>
          <MovieCarousel category="continue-watching" />
        </Suspense>
      </section>
    </div>
  )
}
