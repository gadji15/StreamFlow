'use client';

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import FilmCard from "@/components/FilmCard";
import SeriesCard from "@/components/SeriesCard";
import { Loader2, Film, Tv } from "lucide-react";

type ResultType = {
  id: string;
  title: string;
  type: "film" | "série";
  year?: number;
  image?: string;
};

export default function RecherchePage() {
  const searchParams = useSearchParams();
  const q = searchParams?.get("q")?.trim() || "";
  const [results, setResults] = useState<ResultType[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let canceled = false;
    async function search() {
      if (!q) {
        setResults([]);
        return;
      }
      setLoading(true);
      try {
        const [filmsRes, seriesRes] = await Promise.all([
          supabase
            .from("films")
            .select("id,title,poster,year")
            .ilike("title", `%${q}%`)
            .limit(50),
          supabase
            .from("series")
            .select("id,title,poster,start_year,end_year")
            .ilike("title", `%${q}%`)
            .limit(50),
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
            year: s.start_year,
            image: s.poster,
          })) || [];
        if (!canceled) setResults([...films, ...series]);
      } finally {
        if (!canceled) setLoading(false);
      }
    }
    search();
    return () => { canceled = true; };
  }, [q]);

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-4">Résultats de recherche {q && <span className="text-primary">pour "{q}"</span>}</h1>
      {loading ? (
        <div className="flex items-center gap-2 text-gray-400">
          <Loader2 className="animate-spin h-5 w-5" />
          Recherche...
        </div>
      ) : !q ? (
        <div className="text-gray-400 text-center">Saisissez un terme de recherche ci-dessus.</div>
      ) : results.length === 0 ? (
        <div className="text-gray-400 text-center">Aucun résultat trouvé pour "{q}".</div>
      ) : (
        <div
          className="grid gap-3"
          style={{
            gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))"
          }}
        >
          {results.map((result) => (
            <div key={result.type + "_" + result.id} className="w-[140px] mx-auto">
              {result.type === "film" ? (
                <FilmCard movie={{
                  id: result.id,
                  title: result.title,
                  poster: result.image,
                  year: result.year,
                  isVIP: false,
                }} isUserVIP={false} />
              ) : (
                <SeriesCard series={{
                  id: result.id,
                  title: result.title,
                  poster: result.image,
                  year: result.year,
                  isVIP: false,
                }} />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}