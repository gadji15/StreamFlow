"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import LoadingScreen from "@/components/loading-screen";
import { getSeriesByGenre, Series } from "@/lib/supabaseSeries";
import { supabase } from "@/lib/supabaseClient";
import { ArrowLeft } from "lucide-react";

function normalizeBackdropUrl(raw: string | undefined) {
  if (typeof raw === "string" && raw.trim().length > 0) {
    if (/^https?:\/\//.test(raw)) return raw.trim();
    return raw; // You could adapt with TMDB if needed
  }
  return "/placeholder-backdrop.jpg";
}

export default function WatchSeriesPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [series, setSeries] = useState<Series | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [similarSeries, setSimilarSeries] = useState<Series[]>([]);
  const [loadingSimilar, setLoadingSimilar] = useState(true);

  useEffect(() => {
    async function fetchSeriesAndSimilar() {
      setLoading(true);
      setError(null);
      try {
        const { data, error: seriesError } = await supabase
          .from("series")
          .select("*")
          .eq("id", id)
          .single();
        if (seriesError || !data) {
          setError("Série non trouvée.");
        } else {
          const currentSeries: Series = {
            ...data,
            backdropUrl: normalizeBackdropUrl(data.backdrop),
            posterUrl: data.poster
              ? /^https?:\/\//.test(data.poster)
                ? data.poster
                : data.poster // You may adapt if you use TMDB image utils
              : "/placeholder-poster.png",
          };
          setSeries(currentSeries);

          // Fetch similar series by genre (fallback: no genre = popular)
          setLoadingSimilar(true);
          let similar: Series[] = [];
          try {
            if (currentSeries.genre) {
              const genreList = typeof currentSeries.genre === "string"
                ? currentSeries.genre.split(",").map(g => g.trim())
                : Array.isArray(currentSeries.genre)
                  ? currentSeries.genre
                  : [];
              const mainGenre = genreList[0] || "";
              if (mainGenre) {
                similar = await getSeriesByGenre(mainGenre, 12);
                similar = similar.filter((s) => s.id !== currentSeries.id);
              }
            }
            // Si pas de genre ou pas de résultat, fallback sur populaires hors série en cours
            if (!similar.length) {
              const { data: popular } = await supabase
                .from("series")
                .select("*")
                .order("popularity", { ascending: false })
                .limit(12);
              if (popular) {
                similar = popular.filter((s: Series) => s.id !== currentSeries.id);
              }
            }
          } catch (err) {
            similar = [];
          }
          setSimilarSeries(similar);
          setLoadingSimilar(false);
        }
      } catch {
        setError("Impossible de charger la série.");
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchSeriesAndSimilar();
  }, [id]);

  if (loading) return <LoadingScreen />;
  if (error || !series) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black/90 px-4">
        <div className="bg-red-900/50 border border-red-700 rounded-lg p-6 max-w-md w-full text-center">
          <h2 className="text-2xl font-bold mb-2">Erreur</h2>
          <p className="text-gray-300">{error || "Série non trouvée"}</p>
          <button
            onClick={() => router.push(`/series/${id}`)}
            className="mt-4 rounded-2xl text-lg px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white"
          >
            <ArrowLeft className="h-5 w-5 mr-2 inline" /> Retour à la fiche série
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-black text-white flex flex-col justify-center items-center overflow-x-hidden">
      {/* Backdrop */}
      {series.backdropUrl && (
        <div className="fixed inset-0 z-0 w-full h-full">
          <img
            src={series.backdropUrl}
            alt={`Backdrop de ${series.title}`}
            className="w-full h-full object-cover object-center blur-md brightness-50 scale-105 transition-all duration-500"
            draggable={false}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-black/90" />
        </div>
      )}

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-4xl mx-auto pt-24 pb-10 px-2 sm:px-6 flex flex-col items-center">
        {/* Retour bouton flottant */}
        <button
          className="absolute top-6 left-2 sm:left-6 rounded-full shadow-lg bg-black/70 text-lg px-5 py-3 hover:scale-105 hover:bg-black/90 transition-all text-white flex items-center"
          onClick={() => router.push(`/series/${id}`)}
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Retour à la fiche série
        </button>

        {/* Player Placeholder */}
        <div className="w-full max-w-3xl aspect-video rounded-2xl shadow-2xl overflow-hidden bg-black mt-8 animate-fadeInUp flex items-center justify-center">
          <span className="text-gray-400 text-lg">Lecteur vidéo série ici</span>
        </div>

        {/* Metadata */}
        <section className="w-full max-w-3xl mx-auto mt-8 bg-gray-900/80 backdrop-blur-lg rounded-2xl shadow-lg px-6 py-6 flex flex-col gap-2 animate-fadeInUp">
          <div className="flex flex-wrap items-center gap-3 mb-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mr-3">
              {series.title}
            </h1>
            {series.year && (
              <span className="text-base px-3 py-1 rounded-xl bg-gray-800/50 text-gray-200 font-medium">
                {series.year}
              </span>
            )}
            {series.genre && (
              <span className="text-base px-3 py-1 rounded-xl bg-primary/20 text-primary font-medium">
                {series.genre}
              </span>
            )}
            {series.is_vip && (
              <Badge
                variant="secondary"
                className="text-amber-400 bg-amber-900/60 border-amber-800/80 px-4 py-1 text-lg ml-1"
              >
                VIP
              </Badge>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-4 text-gray-300 text-sm mb-2">
            {series.seasons && (
              <span>
                <b>Saisons :</b> {series.seasons}
              </span>
            )}
            {series.rating && (
              <span>
                <b>Note :</b> <span className="text-yellow-400">★ {series.rating.toFixed(1)}</span>
              </span>
            )}
          </div>
          <p className="text-gray-200 text-base whitespace-pre-line mt-1">{series.description}</p>
        </section>

        {/* Séries similaires */}
        <section className="w-full max-w-6xl mx-auto mt-10 animate-fadeInUp">
          <h3 className="font-bold text-xl mb-3 text-primary">Séries similaires</h3>
          {loadingSimilar ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-64 bg-gray-800 rounded-xl animate-pulse"
                  aria-hidden="true"
                ></div>
              ))}
            </div>
          ) : similarSeries.length === 0 ? (
            <div className="text-center p-8 text-gray-400">
              Aucune série similaire trouvée.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {similarSeries.map((s, idx) => (
                <Link
                  key={s.id}
                  href={`/series/${s.id}`}
                  className="group flex flex-col items-center bg-gray-800 rounded-xl p-3 shadow transition-transform duration-300 hover:scale-[1.045] hover:shadow-xl outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  style={{
                    opacity: 0,
                    animation: `fadeInUp 0.54s cubic-bezier(.23,1.02,.25,1) forwards`,
                    animationDelay: `${idx * 0.06}s`
                  }}
                  tabIndex={0}
                >
                  <img
                    src={s.poster || s.posterUrl || "/placeholder-poster.png"}
                    alt={s.title}
                    className="w-full h-48 rounded-lg object-cover mb-2 border-2 border-gray-700 bg-gray-900 transition-transform duration-200 group-hover:scale-105"
                    onError={e => {
                      (e.currentTarget as HTMLImageElement).src = "/placeholder-poster.png";
                    }}
                  />
                  <span className="font-medium text-gray-100 text-sm text-center line-clamp-2">
                    {s.title}
                  </span>
                  {s.rating !== undefined && s.rating !== null && (
                    <span className="text-xs text-yellow-400 mt-1">
                      ★ {s.rating.toFixed(1)}
                    </span>
                  )}
                  {s.is_vip && (
                    <span className="absolute top-2 right-2 bg-gradient-to-r from-amber-400 to-yellow-600 text-black px-2 py-0.5 rounded-full text-xs font-bold">
                      VIP
                    </span>
                  )}
                </Link>
              ))}
              <style>{`
                @keyframes fadeInUp {
                  0% {
                    opacity: 0;
                    transform: translateY(24px);
                  }
                  100% {
                    opacity: 1;
                    transform: translateY(0);
                  }
                }
              `}</style>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}