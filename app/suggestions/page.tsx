"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabaseClient";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";

const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;

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

export default function SuggestionsPage() {
  const { isLoggedIn, userData, user } = useSupabaseAuth(); // Ajoutez user
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<TMDBResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [suggestingId, setSuggestingId] = useState<number | null>(null);
  const [suggestedIds, setSuggestedIds] = useState<number[]>([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [mediaType, setMediaType] = useState<"all" | "movie" | "tv">("all");
  const [existingIds, setExistingIds] = useState<number[]>([]);

  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Recherche TMDB à chaque modification du titre (avec debounce)
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setErrorMsg("");
      return;
    }
    setErrorMsg("");
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      handleSearch();
    }, 500);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, mediaType]);

  // Recherche TMDB
  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) {
      setResults([]);
      setErrorMsg("");
      return;
    }
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
      setErrorMsg("Erreur lors de la recherche TMDB.");
    } finally {
      setLoading(false);
    }
  };

  // Suggérer un résultat
  const handleSuggest = async (item: TMDBResult) => {
    setErrorMsg("");
    setSuccessMsg("");
    setSuggestingId(item.id);
    try {
      // Vérifier si déjà suggéré
      const { data: exist } = await supabase
        .from("suggestions")
        .select("tmdb_id")
        .eq("tmdb_id", item.id)
        .maybeSingle();
      if (exist) {
        setErrorMsg("Ce contenu a déjà été suggéré.");
        setSuggestedIds((ids) => [...ids, item.id]);
        setSuggestingId(null);
        return;
      }

      // Vérifier que le user_id existe dans profiles
      let userIdToInsert = null;
      if (user?.id) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("id")
          .eq("id", user.id)
          .maybeSingle();
        if (profile) {
          userIdToInsert = user.id;
        }
      }

      // Insérer la suggestion (user_id ou null)
      const { error } = await supabase.from("suggestions").insert({
        tmdb_id: item.id,
        type: item.media_type === "movie" ? "film" : "serie",
        title: item.title || item.name,
        year:
          (item.release_date || item.first_air_date || "").slice(0, 4) || null,
        description: item.overview || "",
        user_id: userIdToInsert, // null si pas de profil
      });
      if (error) throw error;
      setSuccessMsg("Suggestion envoyée avec succès !");
      setSuggestedIds((ids) => [...ids, item.id]);
    } catch (err: any) {
      if (
        err?.code === "23503" ||
        (err?.message && err.message.includes("foreign key constraint"))
      ) {
        setErrorMsg(
          "Votre profil utilisateur n'est pas encore prêt. Veuillez vous reconnecter ou réessayer plus tard."
        );
      } else if (err?.code === "23505" || err?.status === 409) {
        setErrorMsg("Ce contenu a déjà été suggéré.");
      } else {
        setErrorMsg("Erreur lors de la suggestion.");
      }
    } finally {
      setSuggestingId(null);
    }
  };

  // Vérifie si les résultats TMDB existent déjà dans la base (films ou séries du site)
  useEffect(() => {
    const checkExisting = async () => {
      if (results.length === 0) {
        setExistingIds([]);
        return;
      }
      // Récupère tous les tmdb_id présents dans films et séries
      const tmdbIds = results.map((r) => r.id);
      const { data: films } = await supabase
        .from("films")
        .select("tmdb_id")
        .in("tmdb_id", tmdbIds);
      const { data: series } = await supabase
        .from("series")
        .select("tmdb_id")
        .in("tmdb_id", tmdbIds);
      const ids: number[] = [
        ...(films?.map((f) => Number(f.tmdb_id)) || []),
        ...(series?.map((s) => Number(s.tmdb_id)) || []),
      ];
      setExistingIds(ids);
    };
    if (results.length > 0) checkExisting();
  }, [results]);

  return (
    <div className="relative min-h-screen flex flex-col bg-gradient-to-b from-black/95 via-black/90 to-gray-950">
      {/* Backdrop animation */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-900/20 via-blue-900/10 to-black/80 animate-gradientMove" />
        <style>{`
          @keyframes gradientMove {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          .animate-gradientMove {
            background-size: 200% 200%;
            animation: gradientMove 12s ease-in-out infinite;
          }
        `}</style>
      </div>
      <main className="relative z-10 flex flex-col items-center w-full flex-1 pt-28 pb-12 px-2 sm:px-6">
        <div
          className="w-full max-w-3xl rounded-3xl shadow-2xl p-0 border-0 animate-fadeInUp"
          style={{
            background:
              "linear-gradient(135deg, rgba(236,72,153,0.10) 0%, rgba(59,130,246,0.10) 50%, rgba(139,92,246,0.10) 100%)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
          }}
        >
          <div className="p-8">
            <h1 className="text-3xl sm:text-4xl font-extrabold mb-7 text-center bg-gradient-to-r from-fuchsia-400 via-blue-400 to-violet-500 bg-clip-text text-transparent drop-shadow">
              Suggérer un film ou une série
            </h1>
            <form
              onSubmit={handleSearch}
              className="flex flex-col sm:flex-row gap-3 mb-8"
            >
              <select
                className="rounded-xl bg-gray-800 text-white border border-gray-700 px-4 py-2 focus:ring-2 focus:ring-primary/60 transition"
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
                className="flex-1 text-lg px-4 py-2 rounded-xl border border-gray-700 bg-gray-800 focus:ring-2 focus:ring-primary/60 transition"
              />
              <Button
                type="submit"
                disabled={loading}
                className="rounded-xl px-6 py-2 text-lg font-bold bg-gradient-to-r from-fuchsia-500 to-blue-500 hover:from-fuchsia-600 hover:to-blue-600 transition"
              >
                {loading ? "Recherche..." : "Rechercher"}
              </Button>
            </form>
            {errorMsg && (
              <div className="text-red-400 font-semibold text-center mb-3 animate-fadeInUp">
                {errorMsg}
              </div>
            )}
            {successMsg && (
              <div className="text-green-400 font-semibold text-center mb-3 animate-fadeInUp">
                {successMsg}
              </div>
            )}
            <div className="grid gap-6 sm:grid-cols-2">
              {results.map((item, idx) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 bg-gray-800/80 rounded-2xl p-4 border border-gray-700 shadow-lg group hover:scale-[1.025] transition-transform duration-200"
                  style={{
                    opacity: 0,
                    animation: `fadeInUp 0.54s cubic-bezier(.23,1.02,.25,1) forwards`,
                    animationDelay: `${idx * 0.06}s`,
                  }}
                >
                  <img
                    src={
                      item.poster_path
                        ? `https://image.tmdb.org/t/p/w154${item.poster_path}`
                        : "/placeholder-poster.png"
                    }
                    alt={item.title || item.name}
                    className="w-20 h-28 object-cover rounded-xl bg-gray-900 shadow"
                    loading="lazy"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-lg text-primary truncate flex items-center gap-2">
                      {item.title || item.name}
                      {existingIds.includes(item.id) && (
                        <span className="ml-1 px-2 py-0.5 rounded bg-green-700/80 text-green-200 text-xs font-semibold animate-fadeInUp">
                          Déjà sur le site
                        </span>
                      )}
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
                  <Button
                    variant="outline"
                    className="ml-2 rounded-xl font-semibold border-primary/40 hover:bg-primary/10 transition"
                    disabled={
                      suggestingId === item.id ||
                      suggestedIds.includes(item.id) ||
                      !isLoggedIn ||
                      existingIds.includes(item.id)
                    }
                    onClick={() => handleSuggest(item)}
                  >
                    {existingIds.includes(item.id)
                      ? "Déjà sur le site"
                      : suggestedIds.includes(item.id)
                      ? "Déjà suggéré"
                      : suggestingId === item.id
                      ? "Envoi..."
                      : "Suggérer"}
                  </Button>
                </div>
              ))}
            </div>
            {results.length === 0 && query.trim() && !loading && (
              <div className="text-gray-400 text-center py-12 animate-fadeInUp">
                Aucun résultat trouvé pour cette recherche.
              </div>
            )}
            <div className="mt-10 text-gray-400 text-xs text-center">
              Toutes les suggestions sont vérifiées avant ajout sur le site.
              <br />
              Merci de contribuer à la communauté StreamFlow !
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
      `}</style>
    </div>
  );
}
