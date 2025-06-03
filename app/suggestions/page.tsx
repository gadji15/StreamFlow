"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabaseClient";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { Loader2, CheckCircle2, AlertTriangle } from "lucide-react";

const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY!;

type TMDBResult = {
  id: number;
  media_type: "movie" | "tv";
  title?: string;
  name?: string;
  release_date?: string;
  first_air_date?: string;
  poster_path?: string;
  overview?: string;
};

type SuggestionFeedback = {
  type: "success" | "error";
  message: string;
};

function useTmdbSearch(query: string, mediaType: "all" | "movie" | "tv") {
  const [results, setResults] = useState<TMDBResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setError("");
      return;
    }
    setError("");
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      searchTmdb();
    }, 500);

    async function searchTmdb() {
      setLoading(true);
      try {
        const url = `https://api.themoviedb.org/3/search/multi?api_key=${TMDB_API_KEY}&language=fr-FR&query=${encodeURIComponent(
          query
        )}&include_adult=false`;
        const res = await fetch(url);
        const data = await res.json();
        if (!data.results || !Array.isArray(data.results)) throw new Error();
        setResults(
          data.results.filter(
            (r: any) =>
              (r.media_type === "movie" || r.media_type === "tv") &&
              (mediaType === "all" || r.media_type === mediaType)
          )
        );
      } catch {
        setError("Erreur lors de la recherche TMDB.");
      } finally {
        setLoading(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, mediaType]);

  return { results, loading, error };
}

// Hook ultra-robuste pour la suggestion et la vérification existence
function useSuggestion(user: any) {
  const [suggestingId, setSuggestingId] = useState<number | null>(null);
  const [suggestedIds, setSuggestedIds] = useState<number[]>([]);
  const [existingIds, setExistingIds] = useState<number[]>([]);
  const [feedback, setFeedback] = useState<SuggestionFeedback | null>(null);

  // Reset feedback après affichage
  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => setFeedback(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  // Vérifie si déjà existant sur le site (films ou séries) avec fallback sans vue
  const checkExisting = useCallback(async (tmdbIds: number[]) => {
    if (tmdbIds.length === 0) {
      setExistingIds([]);
      return;
    }

    // 1. On tente la vue all_content (si elle existe)
    let allContentData: any[] = [];
    try {
      const { data, error } = await supabase
        .from("all_content")
        .select("tmdb_id")
        .in("tmdb_id", tmdbIds);
      if (!error && Array.isArray(data) && data.length > 0) {
        allContentData = data;
      }
    } catch {}

    // 2. Si la vue est absente ou vide, fallback sur films + series
    if (!allContentData.length) {
      const [filmsRes, seriesRes] = await Promise.all([
        supabase.from("films").select("tmdb_id").in("tmdb_id", tmdbIds),
        supabase.from("series").select("tmdb_id").in("tmdb_id", tmdbIds),
      ]);
      const filmsIds = Array.isArray(filmsRes.data) ? filmsRes.data.map((f: any) => f.tmdb_id) : [];
      const seriesIds = Array.isArray(seriesRes.data) ? seriesRes.data.map((s: any) => s.tmdb_id) : [];
      setExistingIds([...filmsIds, ...seriesIds]);
    } else {
      setExistingIds(allContentData.map((d: any) => d.tmdb_id));
    }
  }, []);

  // Suggérer un contenu
  const suggest = useCallback(
    async (item: TMDBResult) => {
      setFeedback(null);
      setSuggestingId(item.id);
      try {
        // Vérifier si déjà suggéré
        const { data: exist } = await supabase
          .from("suggestions")
          .select("tmdb_id")
          .eq("tmdb_id", item.id)
          .maybeSingle();
        if (exist) {
          setFeedback({
            type: "error",
            message: "Ce contenu a déjà été suggéré.",
          });
          setSuggestedIds((ids) => [...ids, item.id]);
          setSuggestingId(null);
          return;
        }

        // Vérifier le user
        let userIdToInsert = null;
        if (user?.id) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("id")
            .eq("id", user.id)
            .maybeSingle();
          if (profile) userIdToInsert = user.id;
        }

        // Insérer la suggestion
        const { error } = await supabase.from("suggestions").insert({
          tmdb_id: item.id,
          type: item.media_type === "movie" ? "film" : "serie",
          title: item.title || item.name,
          year:
            (item.release_date || item.first_air_date || "").slice(0, 4) ||
            null,
          description: item.overview || "",
          user_id: userIdToInsert,
          poster_path: item.poster_path || null, // Correction pour l'affichage admin
        });
        if (error) throw error;
        setFeedback({
          type: "success",
          message: "Suggestion envoyée avec succès !",
        });
        setSuggestedIds((ids) => [...ids, item.id]);
      } catch (err: any) {
        if (
          err?.code === "23503" ||
          (err?.message && err.message.includes("foreign key constraint"))
        ) {
          setFeedback({
            type: "error",
            message:
              "Votre profil utilisateur n'est pas encore prêt. Veuillez vous reconnecter ou réessayer plus tard.",
          });
        } else if (err?.code === "23505" || err?.status === 409) {
          setFeedback({
            type: "error",
            message: "Ce contenu a déjà été suggéré.",
          });
        } else {
          setFeedback({
            type: "error",
            message: "Erreur lors de la suggestion.",
          });
        }
      } finally {
        setSuggestingId(null);
      }
    },
    [user]
  );

  return {
    suggestingId,
    suggestedIds,
    existingIds,
    feedback,
    checkExisting,
    suggest,
  };
}

export default function SuggestionsPage() {
  const { isLoggedIn, user } = useSupabaseAuth();
  const [query, setQuery] = useState("");
  const [mediaType, setMediaType] = useState<"all" | "movie" | "tv">("all");
  const { results, loading, error } = useTmdbSearch(query, mediaType);

  const {
    suggestingId,
    suggestedIds,
    existingIds,
    feedback,
    checkExisting,
    suggest,
  } = useSuggestion(user);

  // Vérification existence à chaque update résultats
  useEffect(() => {
    if (results.length > 0) checkExisting(results.map((r) => r.id));
  }, [results, checkExisting]);

  // Gestion du focus sur le feedback (accessibilité)
  const feedbackRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (feedback && feedbackRef.current) {
      feedbackRef.current.focus();
    }
  }, [feedback]);

  return (
    <div className="relative min-h-screen flex flex-col bg-gradient-to-br from-[#1e0028] via-[#04001a] to-[#00040c] overflow-x-hidden">
      {/* Background animation premium */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-900/30 via-blue-900/20 to-black/90 animate-gradientMove" />
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full opacity-30 bg-fuchsia-500 blur-3xl animate-bokehPulse" />
        <style>{`
          @keyframes gradientMove {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          @keyframes bokehPulse {
            0%,100% { opacity: 0.3; transform: scale(1);}
            50% { opacity: 0.6; transform: scale(1.08);}
          }
          .animate-gradientMove {
            background-size: 200% 200%;
            animation: gradientMove 14s ease-in-out infinite;
          }
          .animate-bokehPulse {
            animation: bokehPulse 6s ease-in-out infinite;
          }
        `}</style>
      </div>
      <main className="relative z-10 flex flex-col items-center w-full flex-1 pt-28 pb-12 px-2 sm:px-6">
        <div
          className="w-full max-w-3xl rounded-[2.5rem] shadow-[0_8px_32px_0_rgba(31,38,135,0.25)] border-0 animate-fadeInUp backdrop-blur-[18px] p-0"
          style={{
            background:
              "linear-gradient(120deg, rgba(250, 78, 177, 0.10) 0%, rgba(59,130,246,0.12) 50%, rgba(139,92,246,0.13) 100%)",
            boxShadow:
              "0 8px 32px 0 rgba(31,38,135,0.25), 0 1.5px 6px 0 rgba(236,72,153,0.12)",
          }}
        >
          <div className="p-8">
            <h1 className="text-4xl sm:text-5xl font-extrabold mb-8 text-center bg-gradient-to-r from-fuchsia-400 via-blue-400 to-violet-500 bg-clip-text text-transparent drop-shadow animate-slideInDown">
              Suggérer un film ou une série
            </h1>
            <form
              onSubmit={(e) => {
                e.preventDefault();
              }}
              className="flex flex-col sm:flex-row gap-3 mb-8"
              aria-label="Formulaire de recherche TMDB"
            >
              <select
                className="rounded-2xl bg-gray-800 text-white border border-gray-700 px-4 py-2 focus:ring-2 focus:ring-primary/60 transition text-lg shadow-inner"
                value={mediaType}
                onChange={(e) =>
                  setMediaType(e.target.value as "all" | "movie" | "tv")
                }
                disabled={loading}
                aria-label="Filtrer par type"
              >
                <option value="all">Tout</option>
                <option value="movie">Films</option>
                <option value="tv">Séries</option>
              </select>
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Rechercher un film ou une série (TMDB)"
                className="flex-1 text-lg px-4 py-2 rounded-2xl border border-gray-700 bg-gray-800 focus:ring-2 focus:ring-primary/60 shadow-inner"
                aria-label="Champ de recherche"
                autoFocus
              />
              <Button
                type="button"
                disabled={loading}
                className="rounded-2xl px-7 py-2 text-lg font-bold bg-gradient-to-r from-fuchsia-500 to-blue-500 hover:from-fuchsia-600 hover:to-blue-600 shadow-lg transition"
                aria-label="Lancer la recherche"
                tabIndex={0}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="animate-spin" size={20} />
                    Recherche...
                  </span>
                ) : (
                  "Rechercher"
                )}
              </Button>
            </form>
            {/* Feedback animé */}
            {((error && !loading) || feedback) && (
              <div
                ref={feedbackRef}
                tabIndex={-1}
                role={feedback?.type === "success" ? "status" : "alert"}
                aria-live="polite"
                className={`flex items-center justify-center gap-2 font-semibold text-center mb-4 px-4 py-2 rounded-xl shadow transition-all duration-500
                  ${
                    feedback?.type === "success"
                      ? "bg-green-900/80 text-green-300"
                      : "bg-red-900/80 text-red-300"
                  }
                  animate-feedbackPop
                `}
                style={{ outline: "none" }}
              >
                {feedback?.type === "success" ? (
                  <CheckCircle2 className="text-green-400 w-5 h-5" />
                ) : (
                  <AlertTriangle className="text-red-400 w-5 h-5" />
                )}
                {feedback?.message || error}
                <style>{`
                  @keyframes feedbackPop {
                    0% { opacity: 0; transform: translateY(16px) scale(0.96);}
                    100% { opacity: 1; transform: translateY(0) scale(1);}
                  }
                  .animate-feedbackPop {
                    animation: feedbackPop 0.45s cubic-bezier(.23,1.02,.25,1) both;
                  }
                `}</style>
              </div>
            )}
            {/* Légende statuts */}
            <div className="flex gap-5 items-center mb-3 mt-2 text-sm text-gray-400 justify-center flex-wrap">
              <span className="flex items-center gap-2">
                <span className="inline-block w-3 h-3 rounded-full bg-green-700 border border-white/10" aria-label="Déjà sur le site"></span>
                <span>Déjà sur le site</span>
              </span>
              <span className="flex items-center gap-2">
                <span className="inline-block w-3 h-3 rounded-full bg-fuchsia-700 border border-white/10" aria-label="Déjà suggéré"></span>
                <span>Déjà suggéré</span>
              </span>
            </div>
            {/* DEBUG affichage */}
            {/* Résultats */}
            <div className="grid gap-7 sm:grid-cols-2">
              {results.map((item, idx) => {
                const isOnSite = existingIds.some(id => String(id).trim() === String(item.id).trim());
                const isSuggested = suggestedIds.includes(item.id);

                return (
                  <div
                    key={item.id}
                    className={`relative flex items-center gap-4 bg-gray-800/80 rounded-3xl p-4 border border-gray-700 shadow-xl group hover:scale-[1.035] hover:shadow-2xl hover:z-20 transition-transform duration-250
                      outline-none focus-within:ring-2 focus-within:ring-fuchsia-400/60`}
                    style={{
                      opacity: 0,
                      animation: `fadeInUp 0.52s cubic-bezier(.23,1.02,.25,1) forwards`,
                      animationDelay: `${idx * 0.075}s`,
                    }}
                    tabIndex={0}
                  >
                    {/* Poster */}
                    <div className="relative shrink-0">
                      <img
                        src={
                          item.poster_path
                            ? `https://image.tmdb.org/t/p/w154${item.poster_path}`
                            : "/placeholder-poster.png"
                        }
                        alt={item.title || item.name}
                        className="w-20 h-28 object-cover rounded-2xl bg-gray-900 shadow-inner border-2 border-fuchsia-950/20 group-hover:border-fuchsia-600/30 transition"
                        loading="lazy"
                      />
                      {/* Badges (toujours visibles sur mobile, sur le poster) */}
                      {isOnSite && (
                        <span
                          className="absolute -top-3 -right-3 bg-green-700 text-green-100 font-bold text-xs px-3 py-1.5 rounded-full shadow animate-badgePop border-2 border-white/10 z-10"
                          aria-label="Disponible sur le site"
                        >
                          Sur le site
                        </span>
                      )}
                      {!isOnSite && isSuggested && (
                        <span
                          className="absolute -top-3 -right-3 bg-fuchsia-700 text-fuchsia-100 font-bold text-xs px-3 py-1.5 rounded-full shadow animate-badgePop border-2 border-white/10 z-10"
                          aria-label="Déjà suggéré"
                        >
                          Suggéré
                        </span>
                      )}
                    </div>
                    {/* Bloc infos desktop/tablette */}
                    <div className="flex-1 min-w-0 hidden sm:block">
                      <div
                        className="font-extrabold text-lg text-primary truncate flex items-center gap-2"
                        style={{
                          maxWidth: "60vw",
                          minWidth: 0,
                        }}
                      >
                        {item.title || item.name}
                      </div>
                      <div className="text-gray-400 text-sm mb-1">
                        {item.media_type === "movie" ? "Film" : "Série"}{" "}
                        {item.release_date || item.first_air_date
                          ? `• ${(item.release_date || item.first_air_date)?.slice(0, 4)}`
                          : ""}
                      </div>
                      <div className="text-gray-300 text-xs line-clamp-2">
                        {item.overview}
                      </div>
                    </div>
                    {/* Bloc infos mobile only */}
                    <div className="flex-1 min-w-0 sm:hidden">
                      <div
                        className="font-extrabold text-base text-primary truncate flex items-center gap-2"
                        style={{
                          maxWidth: "48vw",
                          minWidth: 0,
                        }}
                      >
                        {item.title || item.name}
                      </div>
                    </div>
                    {/* Bouton Suggérer (toujours visible, logique inchangée) */}
                    <Button
                      variant={
                        isOnSite
                          ? "secondary"
                          : isSuggested
                          ? "outline"
                          : "default"
                      }
                      className={`ml-2 rounded-xl font-semibold border-primary/40 hover:bg-primary/10 transition
                        focus-visible:ring-2 focus-visible:ring-fuchsia-400/80`}
                      disabled={
                        isOnSite ||
                        isSuggested ||
                        suggestingId === item.id ||
                        !isLoggedIn
                      }
                      aria-label={
                        isOnSite
                          ? "Déjà sur le site"
                          : isSuggested
                          ? "Déjà suggéré"
                          : suggestingId === item.id
                          ? "Envoi en cours"
                          : "Suggérer ce contenu"
                      }
                      onClick={() => {
                        if (!isOnSite && !isSuggested && isLoggedIn) {
                          suggest(item);
                        }
                      }}
                    >
                      {isOnSite
                        ? "Déjà sur le site"
                        : isSuggested
                        ? "Déjà suggéré"
                        : suggestingId === item.id
                        ? (
                          <span className="flex items-center gap-2">
                            <Loader2 className="animate-spin" size={18} />
                            Envoi...
                          </span>
                        )
                        : "Suggérer"}
                    </Button>
                    <style>{`
                      @keyframes badgePop {
                        0% { transform: scale(0.7); opacity: 0;}
                        100% { transform: scale(1); opacity: 1;}
                      }
                      .animate-badgePop {
                        animation: badgePop 0.45s cubic-bezier(.23,1.02,.25,1) both;
                      }
                    `}</style>
                  </div>
                );
              })}
            </div>
            {results.length === 0 && query.trim() && !loading && (
              <div className="text-gray-400 text-center py-12 animate-fadeInUp text-lg">
                Aucun résultat trouvé pour cette recherche.
              </div>
            )}
            <div className="mt-10 text-gray-400 text-xs text-center">
              Toutes les suggestions sont vérifiées avant ajout sur le site.
              <br />
              Merci de contribuer à la communauté StreamFlow&nbsp;!
            </div>
          </div>
        </div>
      </main>
      <style>{`
        @keyframes fadeInUp {
          0% { opacity: 0; transform: translateY(24px);}
          100% { opacity: 1; transform: translateY(0);}
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.6s cubic-bezier(.23,1.02,.25,1) both;
        }
        @keyframes slideInDown {
          0% { opacity: 0; transform: translateY(-32px);}
          100% { opacity: 1; transform: translateY(0);}
        }
        .animate-slideInDown {
          animation: slideInDown 0.55s cubic-bezier(.23,1.02,.25,1) both;
        }
      `}</style>
    </div>
  );
}