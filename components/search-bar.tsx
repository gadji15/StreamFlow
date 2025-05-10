"use client";

import { useState, useRef, useEffect } from "react";
import { Search, X, Film, Tv, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { supabase } from "@/lib/supabaseClient";

// Type unifié pour les résultats
type ResultType = {
  id: string;
  title: string;
  type: "film" | "série";
  year?: number;
  image?: string;
};

export default function SearchBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<ResultType[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Recherche Supabase (debounced)
  useEffect(() => {
    if (!isOpen) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (searchTerm.trim() === "") {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    debounceRef.current = setTimeout(async () => {
      try {
        const [filmsRes, seriesRes] = await Promise.all([
          supabase
            .from("films")
            .select("id,title,poster,year")
            .ilike("title", `%${searchTerm.trim()}%`)
            .limit(5),
          supabase
            .from("series")
            .select("id,title,poster,startYear,endYear")
            .ilike("title", `%${searchTerm.trim()}%`)
            .limit(5),
        ]);
        const films: ResultType[] =
          filmsRes.data?.map((f) => ({
            id: f.id,
            title: f.title,
            type: "film",
            year: f.year,
            image: f.poster,
          })) || [];
        const series: ResultType[] =
          seriesRes.data?.map((s) => ({
            id: s.id,
            title: s.title,
            type: "série",
            year: s.startYear,
            image: s.poster,
          })) || [];
        setResults([...films, ...series]);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchTerm, isOpen]);

  // Gestion ouverture/fermeture et raccourci Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeSearch();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line
  }, [isOpen]);

  const openSearch = () => {
    setIsOpen(true);
  };

  const closeSearch = () => {
    setIsOpen(false);
    setSearchTerm("");
    setResults([]);
    setLoading(false);
  };

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="text-white/70 hover:text-white relative"
        onClick={openSearch}
        aria-label="Ouvrir la recherche"
      >
        <Search className="h-5 w-5" />
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[550px] p-0 bg-gray-900 border-gray-800">
          <div className="relative">
            <div className="flex items-center border-b border-gray-800">
              <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un film, une série..."
                className="w-full py-3 pl-12 pr-10 bg-transparent text-white focus:outline-none"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                autoFocus
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-2 text-gray-400 hover:text-white"
                onClick={closeSearch}
                aria-label="Fermer la recherche"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="max-h-[400px] overflow-y-auto p-2">
              {loading ? (
                <div className="p-4 text-center text-gray-400 flex items-center justify-center gap-2">
                  <Loader2 className="animate-spin h-5 w-5" />
                  Recherche...
                </div>
              ) : searchTerm.length > 0 && results.length === 0 ? (
                <div className="p-4 text-center text-gray-400">
                  Aucun résultat trouvé pour "{searchTerm}"
                </div>
              ) : (
                <div className="space-y-1">
                  {results.map(result => (
                    <Link
                      key={result.id + result.type}
                      href={result.type === "film" ? `/films/${result.id}` : `/series/${result.id}`}
                      className="flex items-center p-2 rounded-md hover:bg-gray-800 cursor-pointer transition"
                      onClick={closeSearch}
                    >
                      <div className="w-10 h-14 rounded overflow-hidden bg-gray-800 flex-shrink-0 flex items-center justify-center">
                        {result.image ? (
                          <img src={result.image} alt={result.title} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-xs text-gray-500">
                            {result.type === "film" ? (
                              <Film className="w-5 h-5" />
                            ) : (
                              <Tv className="w-5 h-5" />
                            )}
                          </span>
                        )}
                      </div>
                      <div className="ml-3">
                        <p className="text-white font-medium">{result.title}</p>
                        <p className="text-xs text-gray-400">
                          {result.type} • {result.year}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {searchTerm.length > 0 && !loading && (
                <div className="mt-2 p-2 border-t border-gray-800">
                  <Button
                    variant="ghost"
                    className="w-full justify-center text-purple-400 hover:text-purple-300 hover:bg-gray-800"
                    onClick={closeSearch}
                  >
                    Voir tous les résultats pour "{searchTerm}"
                  </Button>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}