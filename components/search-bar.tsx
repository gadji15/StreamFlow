"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Film, Tv, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";
import SeriesCard from "@/components/SeriesCard";
import FilmCard from "@/components/FilmCard";

// Type pour les résultats de recherche
type ResultType = {
  id: string;
  title: string;
  type: "film" | "série";
  year?: number;
  image?: string;
};

export default function SearchBar() {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<ResultType[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();

  // Recherche Supabase (debounced)
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    if (debounceRef.current) clearTimeout(debounceRef.current);

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
            .select("id,title,poster,start_year,end_year") // Correction: start_year/end_year (snake_case)
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
            year: s.start_year, // Correction: start_year
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
  }, [searchTerm]);

  return (
    <div>
      <div className="flex items-center border-b border-gray-800 relative">
        <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Rechercher un film, une série..."
          className="w-full py-3 pl-12 pr-10 bg-transparent text-white focus:outline-none"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          autoFocus
        />
      </div>

      <div className="flex-1 min-h-0 max-h-[50vh] overflow-y-auto p-2">
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
          <div
            className="grid gap-2"
            style={{
              gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))"
            }}
          >
            {results.map(result =>
              <div key={result.id} className="w-[110px] mx-auto">
                {result.type === "film" ? (
                  <FilmCard
                    movie={{
                      id: result.id,
                      title: result.title,
                      poster: result.image,
                      year: result.year,
                      isVIP: false,
                    }}
                  />
                ) : (
                  <SeriesCard
                    series={{
                      id: result.id,
                      title: result.title,
                      poster: result.image,
                      year: result.year,
                      isVIP: false,
                    }}
                  />
                )}
              </div>
            )}
          </div>
        )}

        {searchTerm.length > 0 && !loading && (
          <div className="mt-2 p-2 border-t border-gray-800">
            <Button
              variant="ghost"
              className="w-full justify-center text-purple-400 hover:text-purple-300 hover:bg-gray-800"
              onClick={() => {
                // Navigation vers la page films (ou une page /recherche si elle existe)
                router.push(`/films?q=${encodeURIComponent(searchTerm)}`);
                // Ferme la modal (en la forçant via un event custom)
                setTimeout(() => {
                  const evt = new CustomEvent("closeSearchModal");
                  window.dispatchEvent(evt);
                }, 100);
              }}
            >
              Voir tous les résultats pour "{searchTerm}"
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}