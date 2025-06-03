"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import FilmModal from "@/components/admin/films/FilmModal";
import SerieModal from "@/components/admin/series/SeriesModal";
import { X, PlusCircle, RefreshCcw, AlertCircle, Search, Loader2, CheckCircle2, Trash2 } from "lucide-react";

// Types robustes
type Suggestion = {
  id: string;
  tmdb_id: number;
  type: string;
  title: string;
  year: string | null;
  description: string | null;
  link: string | null;
  user_id: string | null;
  created_at: string;
  user?: { id: string; full_name?: string; email?: string };
  poster_path?: string | null;
};

type Feedback = { type: "success" | "error"; message: string };

// Hook robuste pour suggestions
function useAdminSuggestions() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Chargement suggestions
  const fetchSuggestions = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from("suggestions")
      .select("*, user:profiles(id, full_name, email)")
      .order("created_at", { ascending: false });
    if (!error && data) {
      setSuggestions(data as Suggestion[]);
    } else {
      setError("Erreur lors du chargement des suggestions.");
    }
    setLoading(false);
  }, []);

  // Suppression optimiste
  const deleteSuggestion = useCallback(async (id: string) => {
    setSuggestions((prev) => prev.filter((s) => s.id !== id));
    await supabase.from("suggestions").delete().eq("id", id);
  }, []);

  // Rafraîchissement manuel
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchSuggestions();
    setRefreshing(false);
  };

  // Auto-refresh 30s
  useEffect(() => {
    fetchSuggestions();
    const interval = setInterval(fetchSuggestions, 30000);
    return () => clearInterval(interval);
  }, [fetchSuggestions]);

  return { suggestions, loading, error, refreshing, handleRefresh, deleteSuggestion, setSuggestions };
}

export default function AdminSuggestionsPage() {
  const {
    suggestions,
    loading,
    error,
    refreshing,
    handleRefresh,
    deleteSuggestion,
    setSuggestions,
  } = useAdminSuggestions();

  const [modalOpen, setModalOpen] = useState<null | { type: "film" | "serie"; title: string; tmdb_id: number }>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const feedbackRef = useRef<HTMLDivElement>(null);

  // Recherche/filtrage
  const [filter, setFilter] = useState<"all" | "film" | "serie">("all");
  const [search, setSearch] = useState("");
  const filtered = suggestions.filter(
    (s) =>
      (filter === "all" || s.type === filter) &&
      (!search ||
        s.title?.toLowerCase().includes(search.toLowerCase()) ||
        s.user?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
        s.user?.email?.toLowerCase().includes(search.toLowerCase()))
  );

  // Feedback auto-hide et focus
  useEffect(() => {
    if (feedback && feedbackRef.current) {
      feedbackRef.current.focus();
      const timer = setTimeout(() => setFeedback(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  // Loader premium
  const Loader = () => (
    <div className="flex flex-col items-center justify-center py-12 animate-fade-in">
      <Loader2 className="animate-spin h-8 w-8 text-fuchsia-400 mb-2" />
      <span className="text-fuchsia-200">Chargement des suggestions...</span>
    </div>
  );
  // Empty state ultra clean
  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-12 animate-fade-in">
      <AlertCircle className="h-10 w-10 text-gray-500 mb-2" />
      <span className="text-gray-400">Aucune suggestion trouvée.</span>
    </div>
  );
  // Erreur animée
  const ErrorState = ({ message }: { message: string }) => (
    <div className="flex flex-col items-center justify-center py-12 animate-fade-in">
      <AlertCircle className="h-10 w-10 text-red-500 mb-2" />
      <span className="text-red-400">{message}</span>
      <Button variant="outline" className="mt-4" onClick={handleRefresh}>
        <RefreshCcw className="mr-2 h-4 w-4 animate-spin" /> Réessayer
      </Button>
    </div>
  );

  return (
    <div className="w-full max-w-7xl mx-auto py-10 px-2 sm:px-6 animate-fade-in relative overflow-x-hidden bg-gray-950">
      {/* Fond sobre – pas d'animation ni de bokeh */}
      {/* Entête */}
      <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-5 z-10 relative">
        <div className="flex gap-2 items-center">
          <Button
            variant={filter === "all" ? "default" : "ghost"}
            className="rounded-xl px-4"
            onClick={() => setFilter("all")}
            aria-pressed={filter === "all"}
          >
            Tous
          </Button>
          <Button
            variant={filter === "film" ? "default" : "ghost"}
            className="rounded-xl px-4"
            onClick={() => setFilter("film")}
            aria-pressed={filter === "film"}
          >
            Films
          </Button>
          <Button
            variant={filter === "serie" ? "default" : "ghost"}
            className="rounded-xl px-4"
            onClick={() => setFilter("serie")}
            aria-pressed={filter === "serie"}
          >
            Séries
          </Button>
          <div className="ml-4 relative">
            <input
              type="text"
              placeholder="Recherche titre ou utilisateur..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="rounded-xl border border-gray-700 bg-gray-900/70 text-white px-2 py-2 focus:ring-2 focus:ring-fuchsia-400/50 transition w-full max-w-[180px] sm:w-auto sm:min-w-[200px] pl-10"
              aria-label="Recherche"
            />
            <Search className="absolute left-2 top-2.5 text-fuchsia-400 w-4 h-4 pointer-events-none" />
          </div>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Rafraîchir"
            className={`ml-2 border border-primary/30 hover:bg-primary/10 transition ${refreshing ? "animate-spin-slow" : ""}`}
            onClick={handleRefresh}
            disabled={refreshing || loading}
          >
            <RefreshCcw className="w-5 h-5 text-primary" />
          </Button>
        </div>
      </div>
      {/* Feedback admin animé */}
      {feedback && (
        <div
          ref={feedbackRef}
          tabIndex={-1}
          role={feedback.type === "success" ? "status" : "alert"}
          aria-live="polite"
          className={`
            flex items-center justify-center gap-2 font-semibold text-center mb-5 px-4 py-2 rounded-xl shadow-lg transition-all duration-500
            ${feedback.type === "success"
              ? "bg-green-900/90 text-green-300"
              : "bg-red-900/90 text-red-300"}
            animate-feedbackPop
          `}
          style={{ outline: "none" }}
        >
          {feedback.type === "success"
            ? <CheckCircle2 className="text-green-400 w-5 h-5" />
            : <AlertCircle className="text-red-400 w-5 h-5" />}
          {feedback.message}
        </div>
      )}
      {/* Responsive suggestions list */}
      <div className="w-full max-w-full min-w-0 overflow-x-hidden">
        {/* Desktop/tablette : tableau - rendu DOM uniquement pour md+ */}
        {typeof window === "undefined" || (typeof window !== "undefined" && window.innerWidth >= 768) ? (
          <div className="w-full max-w-full min-w-0 overflow-x-auto rounded-3xl border border-gray-800 bg-gray-900/80 shadow-xl shadow-primary/10 transition-all duration-300">
            <table className="min-w-full text-sm w-full max-w-full">
              <thead>
                <tr className="bg-gradient-to-r from-gray-800/80 via-gray-900/90 to-gray-800/80 text-gray-200">
                  <th className="px-4 py-3 text-left">Poster</th>
                  <th className="px-4 py-3 text-left">Titre</th>
                  <th className="px-2 py-3">Type</th>
                  <th className="px-2 py-3 hidden md:table-cell">Année</th>
                  <th className="px-2 py-3 hidden md:table-cell">Utilisateur</th>
                  <th className="px-2 py-3 hidden md:table-cell">Date</th>
                  <th className="px-2 py-3 hidden md:table-cell">Lien</th>
                  <th className="px-2 py-3">TMDB</th>
                  <th className="px-2 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={9}>
                      <Loader />
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={9}>
                      <ErrorState message={error} />
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={9}>
                      <EmptyState />
                    </td>
                  </tr>
                ) : (
                  filtered.map((s, idx) => (
                    <tr
                      key={s.id}
                      className={`border-t border-gray-800 group hover:bg-gradient-to-r hover:from-fuchsia-900/30 hover:to-blue-900/20 transition-all duration-200
                        ${idx % 2 === 0 ? "bg-gray-900/60" : "bg-gray-900/80"}`}
                      style={{
                        animation: `fadeInUp 0.45s cubic-bezier(.23,1.02,.25,1) forwards`,
                        animationDelay: `${idx * 0.045}s`,
                      }}
                      tabIndex={0}
                    >
                      <td className="px-4 py-2 max-w-[68px] w-[68px] min-w-[40px]">
                        <div className="w-16 h-24 rounded-2xl overflow-hidden shadow-lg border border-gray-800 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center transition-transform group-hover:scale-105">
                          {s.poster_path ? (
                            <img
                              src={`https://image.tmdb.org/t/p/w185${s.poster_path}`}
                              alt={s.title}
                              className="object-cover w-full h-full transition-opacity duration-300 max-w-full"
                              style={{ background: "#18181b" }}
                              onError={e => {
                                (e.currentTarget as HTMLImageElement).src = "/placeholder-poster.png";
                              }}
                            />
                          ) : (
                            <img
                              src="/placeholder-poster.png"
                              alt="Aucun poster"
                              className="object-cover w-full h-full opacity-60 max-w-full"
                            />
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-2 font-semibold max-w-[120px] truncate text-primary group-hover:text-fuchsia-400 transition-colors">
                        <span className="block w-full truncate break-all">{s.title}</span>
                      </td>
                      <td className="px-2 py-2 max-w-[64px]">
                        <Badge
                          variant="secondary"
                          className={`transition-all duration-200 ${
                            s.type === "film"
                              ? "bg-gradient-to-r from-blue-700/80 to-blue-400/60"
                              : "bg-gradient-to-r from-fuchsia-700/80 to-fuchsia-400/60"
                          } animate-bounce-in max-w-full`}
                        >
                          {s.type === "film" ? "Film" : "Série"}
                        </Badge>
                      </td>
                      <td className="px-2 py-2 max-w-[60px] truncate hidden md:table-cell">{s.year || "-"}</td>
                      <td className="px-2 py-2 max-w-[110px] truncate hidden md:table-cell">
                        {s.user?.full_name || s.user?.email || s.user_id?.slice(0, 8) || "-"}
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap max-w-[110px] truncate hidden md:table-cell">{new Date(s.created_at).toLocaleString("fr-FR")}</td>
                      <td className="px-2 py-2 max-w-[80px] hidden md:table-cell">
                        {s.link ? (
                          <a
                            href={s.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 underline break-all hover:text-blue-300 transition max-w-full"
                          >
                            Lien
                          </a>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="px-2 py-2 max-w-[70px]">
                        <a
                          href={`https://www.themoviedb.org/${s.type === "film" ? "movie" : "tv"}/${s.tmdb_id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary underline hover:text-fuchsia-400 transition max-w-full"
                        >
                          TMDB
                        </a>
                      </td>
                      <td className="px-2 py-2 flex gap-2 items-center max-w-[80px]">
                        <Button
                          size="icon"
                          variant="outline"
                          aria-label={`Ajouter ${s.type === "film" ? "film" : "série"}`}
                          className="rounded-full border-primary/40 hover:bg-primary/10 hover:scale-110 transition-transform duration-150"
                          onClick={() =>
                            setModalOpen({ type: s.type === "film" ? "film" : "serie", title: s.title, tmdb_id: s.tmdb_id })
                          }
                        >
                          <PlusCircle className="w-5 h-5 text-primary" />
                        </Button>
                        <Button
                          size="icon"
                          variant="destructive"
                          aria-label="Supprimer la suggestion"
                          className="rounded-full border-red-400/40 hover:bg-red-900/20 hover:scale-110 transition-transform duration-150"
                          onClick={async () => {
                            if (
                              window.confirm("Supprimer cette suggestion ?")
                            ) {
                              await deleteSuggestion(s.id);
                              setFeedback({ type: "success", message: "Suggestion supprimée !" });
                            }
                          }}
                        >
                          <Trash2 className="w-5 h-5 text-red-500" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col gap-4 w-full max-w-full">
            {loading ? (
              <Loader />
            ) : error ? (
              <ErrorState message={error} />
            ) : filtered.length === 0 ? (
              <EmptyState />
            ) : (
              filtered.map((s, idx) => (
                <div
                  key={s.id}
                  className="rounded-2xl bg-gray-900/80 border border-gray-800 shadow-lg p-3 flex flex-col gap-2 animate-fade-in w-full max-w-full"
                  style={{
                    animationDelay: `${idx * 0.045}s`,
                  }}
                >
                  <div className="flex gap-3 items-center flex-wrap w-full max-w-full">
                    <div className="w-14 h-20 rounded-xl overflow-hidden shadow border border-gray-800 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex-shrink-0">
                      {s.poster_path ? (
                        <img
                          src={`https://image.tmdb.org/t/p/w185${s.poster_path}`}
                          alt={s.title}
                          className="object-cover w-full h-full"
                          onError={e => {
                            (e.currentTarget as HTMLImageElement).src = "/placeholder-poster.png";
                          }}
                        />
                      ) : (
                        <img
                          src="/placeholder-poster.png"
                          alt="Aucun poster"
                          className="object-cover w-full h-full opacity-60"
                        />
                      )}
                    </div>
                    <div className="flex flex-col min-w-0 w-2/3 flex-1 max-w-full">
                      <div className="font-bold text-primary truncate">{s.title}</div>
                      <div className="flex items-center gap-1 mt-1 mb-1 flex-wrap">
                        <Badge
                          variant="secondary"
                          className={`text-xs px-2 py-0.5 flex items-center gap-1 ${
                            s.type === "film"
                              ? "bg-gradient-to-r from-blue-700/80 to-blue-400/60"
                              : "bg-gradient-to-r from-fuchsia-700/80 to-fuchsia-400/60"
                          }`}
                        >
                          {/* Icône mobile, texte desktop */}
                          {s.type === "film" ? (
                            <>
                              <span className="sm:hidden"><svg width="1em" height="1em" viewBox="0 0 24 24" fill="none"><rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="2"/><path d="M7 5v14M17 5v14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg></span>
                              <span className="hidden sm:inline">Film</span>
                            </>
                          ) : (
                            <>
                              <span className="sm:hidden"><svg width="1em" height="1em" viewBox="0 0 24 24" fill="none"><rect x="2" y="7" width="20" height="15" rx="2" stroke="currentColor" strokeWidth="2"/><rect x="8" y="3" width="8" height="4" rx="1" stroke="currentColor" strokeWidth="2"/></svg></span>
                              <span className="hidden sm:inline">Série</span>
                            </>
                          )}
                        </Badge>
                        <span className="text-xs text-gray-400 ml-2">{s.year || "-"}</span>
                      </div>
                      <div className="text-xs text-gray-400 truncate">
                        {s.user?.full_name || s.user?.email || s.user_id?.slice(0, 8) || "-"}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(s.created_at).toLocaleString("fr-FR")}
                      </div>
                      <div className="flex gap-2 mt-2 flex-wrap">
                        <a
                          href={`https://www.themoviedb.org/${s.type === "film" ? "movie" : "tv"}/${s.tmdb_id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary underline hover:text-fuchsia-400 transition"
                        >
                          TMDB
                        </a>
                        {s.link && (
                          <a
                            href={s.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-400 underline hover:text-blue-300 transition ml-2"
                          >
                            Lien
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-2 w-full max-w-full">
                    <Button
                      size="icon"
                      variant="outline"
                      aria-label={`Ajouter ${s.type === "film" ? "film" : "série"}`}
                      className="rounded-full border-primary/40 hover:bg-primary/10 hover:scale-110 transition-transform duration-150"
                      onClick={() =>
                        setModalOpen({ type: s.type === "film" ? "film" : "serie", title: s.title, tmdb_id: s.tmdb_id })
                      }
                    >
                      <PlusCircle className="w-5 h-5 text-primary" />
                    </Button>
                    <Button
                      size="icon"
                      variant="destructive"
                      aria-label="Supprimer la suggestion"
                      className="rounded-full border-red-400/40 hover:bg-red-900/20 hover:scale-110 transition-transform duration-150"
                      onClick={async () => {
                        if (
                          window.confirm("Supprimer cette suggestion ?")
                        ) {
                          await deleteSuggestion(s.id);
                          setFeedback({ type: "success", message: "Suggestion supprimée !" });
                        }
                      }}
                    >
                      <Trash2 className="w-5 h-5 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
      {/* Modal Film */}
      <FilmModal
        open={!!modalOpen && modalOpen.type === "film"}
        onClose={() => setModalOpen(null)}
        onSave={async () => {
          setModalOpen(null);
          await handleRefresh();
          setFeedback({ type: "success", message: "Film ajouté !" });
        }}
        initialData={modalOpen && modalOpen.type === "film" ? { tmdb_id: modalOpen.tmdb_id } : {}}
      />
      {/* Modal Série */}
      <SerieModal
        open={!!modalOpen && modalOpen.type === "serie"}
        onClose={() => setModalOpen(null)}
        onSave={async () => {
          setModalOpen(null);
          await handleRefresh();
          setFeedback({ type: "success", message: "Série ajoutée !" });
        }}
        initialData={modalOpen && modalOpen.type === "serie" ? { tmdb_id: modalOpen.tmdb_id } : {}}
      />
      {/* Animations CSS */}
      <style jsx global>{`
        html, body, #__next, #root {
          width: 100vw !important;
          max-width: 100vw !important;
          overflow-x: hidden !important;
          box-sizing: border-box;
        }
        * {
          min-width: 0;
          box-sizing: border-box;
        }
        @keyframes fadeInUp {
          0% { opacity: 0; transform: translateY(20px);}
          100% { opacity: 1; transform: translateY(0);}
        }
        .animate-fade-in {
          animation: fadeInUp 0.52s both;
        }
        .animate-fade-in-fast {
          animation: fadeInUp 0.23s both;
        }
        .animate-pop-in {
          animation: popIn 0.2s cubic-bezier(0.4, 2, 0.6, 1) both;
        }
        @keyframes popIn {
          0% { opacity: 0; transform: scale(0.95);}
          100% { opacity: 1; transform: scale(1);}
        }
        .animate-bounce-in {
          animation: bounceIn 0.74s;
        }
        @keyframes bounceIn {
          0% { transform: scale(0.7); opacity: 0.3;}
          60% { transform: scale(1.1);}
          80% { transform: scale(0.95);}
          100% { transform: scale(1); opacity: 1;}
        }
        .animate-spin-slow {
          animation: spin 1.2s linear infinite;
        }
        @keyframes gradientMove {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes slideInDown {
          0% { opacity: 0; transform: translateY(-32px);}
          100% { opacity: 1; transform: translateY(0);}
        }
        .animate-slideInDown {
          animation: slideInDown 0.54s cubic-bezier(.23,1.02,.25,1) both;
        }
      `}</style>
    </div>
  );
}