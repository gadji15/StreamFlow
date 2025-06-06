'use client';

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import FilmCard from "@/components/FilmCard";
import SeriesCard from "@/components/SeriesCard";
import { Loader2, Film, Tv, Sparkles } from "lucide-react";

type ResultType = {
  id: string;
  title: string;
  type: "film" | "série";
  year?: number;
  image?: string;
};

import { Suspense } from "react";

export default function RecherchePage() {
  return (
    <Suspense fallback={
      <div className="flex items-center gap-2 text-gray-400 justify-center py-10">
        <Loader2 className="animate-spin h-5 w-5" />
        Chargement de la recherche...
      </div>
    }>
      <RechercheInner />
    </Suspense>
  );
}

// Separate the logic into an inner component to use hooks safely inside Suspense
function RechercheInner() {
  const searchParams = useSearchParams();
  const q = searchParams?.get("q")?.trim() || "";
  const [results, setResults] = useState<ResultType[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'tout' | 'film' | 'série'>('tout');

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

  // Filtrage selon le tab
  const filteredResults =
    activeTab === 'tout'
      ? results
      : results.filter(r => r.type === activeTab);

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-4">Résultats de recherche {q && <span className="text-primary">pour "{q}"</span>}</h1>

      {/* Tabs filtres */}
      <div className="flex justify-center mb-6 gap-2">
        <button
          className={`px-6 py-2 rounded-t-lg font-semibold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'tout'
              ? 'bg-gray-900 border-primary text-primary shadow'
              : 'bg-gray-800 border-transparent text-gray-400 hover:text-primary'
          }`}
          onClick={() => setActiveTab('tout')}
          aria-selected={activeTab === 'tout'}
        >
          <Sparkles className={`inline-block h-5 w-5 transition-colors duration-200 ${
            activeTab === 'tout' ? 'text-yellow-400' : 'text-gray-400'
          }`} />
          Tout
        </button>
        <button
          className={`px-6 py-2 rounded-t-lg font-semibold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'film'
              ? 'bg-gray-900 border-blue-400 text-blue-400 shadow'
              : 'bg-gray-800 border-transparent text-gray-400 hover:text-blue-400'
          }`}
          onClick={() => setActiveTab('film')}
          aria-selected={activeTab === 'film'}
        >
          <Film className={`inline-block h-5 w-5 transition-colors duration-200 ${
            activeTab === 'film' ? 'text-primary' : 'text-gray-400'
          }`} />
          Films
        </button>
        <button
          className={`px-6 py-2 rounded-t-lg font-semibold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'série'
              ? 'bg-gray-900 border-purple-400 text-purple-400 shadow'
              : 'bg-gray-800 border-transparent text-gray-400 hover:text-purple-400'
          }`}
          onClick={() => setActiveTab('série')}
          aria-selected={activeTab === 'série'}
        >
          <Tv className={`inline-block h-5 w-5 transition-colors duration-200 ${
            activeTab === 'série' ? 'text-purple-400' : 'text-gray-400'
          }`} />
          Séries
        </button>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-gray-400">
          <Loader2 className="animate-spin h-5 w-5" />
          Recherche...
        </div>
      ) : !q ? (
        <div className="text-gray-400 text-center">Saisissez un terme de recherche ci-dessus.</div>
      ) : filteredResults.length === 0 ? (
        <div className="text-gray-400 text-center">Aucun résultat trouvé pour "{q}".</div>
      ) : (
        <div
          className="grid gap-3"
          style={{
            gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))"
          }}
        >
          {filteredResults.map((result) => (
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