"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import FilmModal from "@/components/admin/films/FilmModal";
import SerieModal from "@/components/admin/series/SeriesModal";
import { X, PlusCircle, RefreshCcw, AlertCircle } from "lucide-react";

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
  // Ajoutez poster_path pour l'affichage dynamique
  poster_path?: string | null;
};

export default function AdminSuggestionsPage() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState<null | { type: "film" | "serie"; title: string; tmdb_id: number }>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Fonction pour charger les suggestions
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

  // Rafraîchissement manuel
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchSuggestions();
    setRefreshing(false);
  };

  // Rafraîchissement auto toutes les 30s
  useEffect(() => {
    fetchSuggestions();
    const interval = setInterval(fetchSuggestions, 30000);
    return () => clearInterval(interval);
  }, [fetchSuggestions]);

  // Animation loader
  const Loader = () => (
    <div className="flex flex-col items-center justify-center py-12 animate-fade-in">
      <svg className="animate-spin h-8 w-8 text-primary mb-2" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8z"
        />
      </svg>
      <span className="text-gray-400">Chargement des suggestions...</span>
    </div>
  );

  // Animation empty state
  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-12 animate-fade-in">
      <AlertCircle className="h-10 w-10 text-gray-500 mb-2" />
      <span className="text-gray-400">Aucune suggestion pour le moment.</span>
    </div>
  );

  // Animation erreur
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
    <div className="max-w-6xl mx-auto py-10 px-2 sm:px-6 animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-extrabold text-center bg-gradient-to-r from-fuchsia-400 via-blue-400 to-violet-500 bg-clip-text text-transparent drop-shadow">
          Suggestions des utilisateurs
        </h1>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Rafraîchir"
          className={`ml-2 border border-primary/30 hover:bg-primary/10 transition ${
            refreshing ? "animate-spin-slow" : ""
          }`}
          onClick={handleRefresh}
          disabled={refreshing || loading}
        >
          <RefreshCcw className="w-5 h-5 text-primary" />
        </Button>
      </div>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="text-gray-400 text-sm">
          Total :{" "}
          <span className="font-bold text-primary">{suggestions.length}</span> suggestions
        </div>
        <div className="flex gap-2 flex-wrap">
          <Badge className="bg-blue-700/60 text-white animate-bounce-in">Films</Badge>
          <Badge className="bg-fuchsia-700/60 text-white animate-bounce-in">Séries</Badge>
        </div>
      </div>
      <div className="overflow-x-auto rounded-xl border border-gray-800 bg-gray-900/80 shadow-lg shadow-primary/10 transition-all duration-300">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-gradient-to-r from-gray-800 via-gray-900 to-gray-800 text-gray-200">
              <th className="px-4 py-3 text-left">Poster</th>
              <th className="px-4 py-3 text-left">Titre</th>
              <th className="px-2 py-3">Type</th>
              <th className="px-2 py-3">Année</th>
              <th className="px-2 py-3">Utilisateur</th>
              <th className="px-2 py-3">Date</th>
              <th className="px-2 py-3">Lien</th>
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
            ) : suggestions.length === 0 ? (
              <tr>
                <td colSpan={9}>
                  <EmptyState />
                </td>
              </tr>
            ) : (
              suggestions.map((s, idx) => (
                <tr
                  key={s.id}
                  className={`border-t border-gray-800 group hover:bg-gradient-to-r hover:from-fuchsia-900/30 hover:to-blue-900/30 transition-all duration-200 ${
                    idx % 2 === 0 ? "bg-gray-900/60" : "bg-gray-900/80"
                  }`}
                  style={{ animation: `fadeInUp 0.4s ease ${idx * 0.04}s both` }}
                >
                  {/* Poster dynamique */}
                  <td className="px-4 py-2">
                    <div className="w-16 h-24 rounded-xl overflow-hidden shadow-lg border border-gray-800 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center transition-transform group-hover:scale-105">
                      {s.poster_path ? (
                        <img
                          src={`https://image.tmdb.org/t/p/w185${s.poster_path}`}
                          alt={s.title}
                          className="object-cover w-full h-full transition-opacity duration-300"
                          style={{ background: "#18181b" }}
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
                  </td>
                  {/* Titre */}
                  <td className="px-4 py-2 font-semibold max-w-[220px] truncate text-primary group-hover:text-fuchsia-400 transition-colors">
                    {s.title}
                  </td>
                  {/* Type */}
                  <td className="px-2 py-2">
                    <Badge
                      variant="secondary"
                      className={`transition-all duration-200 ${
                        s.type === "film"
                          ? "bg-gradient-to-r from-blue-700/80 to-blue-400/60"
                          : "bg-gradient-to-r from-fuchsia-700/80 to-fuchsia-400/60"
                      }`}
                    >
                      {s.type === "film" ? "Film" : "Série"}
                    </Badge>
                  </td>
                  {/* Année */}
                  <td className="px-2 py-2">{s.year || "-"}</td>
                  {/* Utilisateur */}
                  <td className="px-2 py-2 max-w-[180px] truncate">
                    {s.user?.full_name || s.user?.email || s.user_id?.slice(0, 8) || "-"}
                  </td>
                  {/* Date */}
                  <td className="px-2 py-2 whitespace-nowrap">{new Date(s.created_at).toLocaleString("fr-FR")}</td>
                  {/* Lien */}
                  <td className="px-2 py-2">
                    {s.link ? (
                      <a
                        href={s.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 underline break-all hover:text-blue-300 transition"
                      >
                        Lien
                      </a>
                    ) : (
                      "-"
                    )}
                  </td>
                  {/* TMDB */}
                  <td className="px-2 py-2">
                    <a
                      href={`https://www.themoviedb.org/${s.type === "film" ? "movie" : "tv"}/${s.tmdb_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary underline hover:text-fuchsia-400 transition"
                    >
                      TMDB
                    </a>
                  </td>
                  {/* Action */}
                  <td className="px-2 py-2 flex gap-2 items-center">
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
                        if (window.confirm("Supprimer cette suggestion ?")) {
                          await supabase.from("suggestions").delete().eq("id", s.id);
                          fetchSuggestions();
                        }
                      }}
                    >
                      <X className="w-5 h-5 text-red-500" />
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal dynamique pour ajout */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in-fast">
          <div className="relative w-full max-w-lg mx-auto animate-pop-in">
            <Button
              size="icon"
              variant="ghost"
              className="absolute top-2 right-2 z-10"
              aria-label="Fermer"
              onClick={() => setModalOpen(null)}
            >
              <X className="w-6 h-6" />
            </Button>
            {modalOpen.type === "film" ? (
              <FilmModal
                open
                initialTmdbId={modalOpen.tmdb_id}
                onClose={() => setModalOpen(null)}
                onSave={async (payload) => {
                  // Ajoutez ici la logique à exécuter lors de la sauvegarde, par exemple fermer la modal et rafraîchir la liste
                  setModalOpen(null);
                  await fetchSuggestions();
                }}
              />
            ) : (
              <SerieModal
                open
                onClose={() => setModalOpen(null)}
                onSave={async (payload) => {
                  setModalOpen(null);
                  await fetchSuggestions();
                }}
              />
            )}
          </div>
        </div>
      )}

      {/* Animations CSS */}
      <style jsx global>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fadeInUp 0.5s both;
        }
        .animate-fade-in-fast {
          animation: fadeInUp 0.2s both;
        }
        .animate-pop-in {
          animation: popIn 0.25s cubic-bezier(0.4, 2, 0.6, 1) both;
        }
        @keyframes popIn {
          0% {
            opacity: 0;
            transform: scale(0.95);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-bounce-in {
          animation: bounceIn 0.7s;
        }
        @keyframes bounceIn {
          0% {
            transform: scale(0.7);
            opacity: 0.3;
          }
          60% {
            transform: scale(1.1);
          }
          80% {
            transform: scale(0.95);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        .animate-spin-slow {
          animation: spin 1.2s linear infinite;
        }
        /* Ultra moderne : effet glass, responsive, hover */
        table {
          border-collapse: separate;
          border-spacing: 0;
        }
        tr, td, th {
          transition: background 0.25s, color 0.2s;
        }
        @media (max-width: 900px) {
          table, thead, tbody, tr, th, td {
            display: block;
          }
          thead tr {
            display: none;
          }
          tr {
            margin-bottom: 1.5rem;
            border-radius: 1.2rem;
            box-shadow: 0 4px 24px 0 #0002;
            background: linear-gradient(120deg, #18181b 80%, #312e81 100%);
          }
          td {
            padding: 0.7rem 1rem;
            border: none;
            position: relative;
          }
          td:before {
            content: attr(data-label);
            font-weight: bold;
            color: #818cf8;
            display: block;
            margin-bottom: 0.2rem;
          }
        }
      `}</style>
    </div>
  );
}
