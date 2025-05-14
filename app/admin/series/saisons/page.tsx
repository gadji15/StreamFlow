'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Edit, Tv, ArrowLeft, Search } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useRef, FormEvent } from 'react';

function AddSeasonSelector() {
  const [show, setShow] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  // Recherche sur Supabase en temps réel
  useEffect(() => {
    if (!show) return;
    if (query.trim().length < 2) {
      setResults([]);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    const fetchSeries = async () => {
      const { data, error } = await supabase
        .from('series')
        .select('id, title')
        .ilike('title', `%${query.trim()}%`)
        .order('title', { ascending: true })
        .limit(10);
      if (error) setError("Erreur lors de la recherche.");
      setResults(data || []);
      setLoading(false);
    };
    const delay = setTimeout(fetchSeries, 300);
    return () => clearTimeout(delay);
  }, [query, show]);

  const handleSelect = (serieId: string) => {
    setShow(false);
    setQuery('');
    setResults([]);
    router.push(`/admin/series/${serieId}/seasons`);
  };

  return (
    <>
      <Button
        variant="default"
        onClick={() => setShow(true)}
        className="flex items-center"
      >
        <Plus className="h-4 w-4 mr-2" />
        Ajouter une saison
      </Button>
      {show && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50">
          <div className="bg-gray-900 rounded-lg shadow-2xl p-6 max-w-md w-full relative">
            <button
              className="absolute top-2 right-3 text-gray-400 hover:text-red-500"
              onClick={() => setShow(false)}
              aria-label="Fermer"
              tabIndex={0}
            >✕</button>
            <h2 className="text-lg font-bold mb-4 flex items-center">
              <Search className="h-5 w-5 mr-2" /> Sélectionner une série
            </h2>
            <form
              onSubmit={(e: FormEvent) => {
                e.preventDefault();
                if (results.length === 1) handleSelect(results[0].id);
              }}
            >
              <input
                ref={inputRef}
                autoFocus
                type="text"
                className="input input-bordered w-full mb-3 px-4 py-2 rounded"
                placeholder="Rechercher une série (min. 2 lettres)"
                value={query}
                onChange={e => setQuery(e.target.value)}
              />
            </form>
            {loading && <div className="text-xs text-gray-400 my-2">Recherche...</div>}
            {error && <div className="text-xs text-red-400 my-2">{error}</div>}
            {!loading && results.length > 0 && (
              <ul className="max-h-60 overflow-y-auto">
                {results.map(serie => (
                  <li
                    key={serie.id}
                    className="p-2 hover:bg-blue-800/60 rounded cursor-pointer transition"
                    onClick={() => handleSelect(serie.id)}
                    tabIndex={0}
                    onKeyDown={e => { if (e.key === 'Enter') handleSelect(serie.id); }}
                  >
                    {serie.title}
                  </li>
                ))}
              </ul>
            )}
            {!loading && query.trim().length >= 2 && results.length === 0 && (
              <div className="text-xs text-gray-400">Aucune série trouvée.</div>
            )}
            <div className="mt-4 flex justify-end">
              <Button variant="outline" onClick={() => setShow(false)}>
                Annuler
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function AdminSeasonsPage() {
  const [seasons, setSeasons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSeasons = async () => {
      setLoading(true);
      // Jointure avec les séries pour afficher le titre de la série
      const { data, error } = await supabase
        .from('seasons')
        .select('id, number, title, series_id, series:title_series_id(title)')
        .order('created_at', { ascending: false });
      setSeasons(data || []);
      setLoading(false);
    };
    fetchSeasons();
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Button asChild variant="ghost" size="sm" className="mr-2">
            <Link href="/admin/series">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Retour séries
            </Link>
          </Button>
          <h1 className="text-2xl font-bold flex items-center">
            <Tv className="h-6 w-6 mr-2" />
            Gestion des saisons
          </h1>
        </div>
        {/* Nouveau bouton : ouvre le sélecteur de série */}
        <AddSeasonSelector />
      </div>

      {loading ? (
        <div className="text-gray-400">Chargement...</div>
      ) : (
        <>
          <div className="mb-4 text-sm text-blue-300">
            Pour ajouter une saison, sélectionnez d'abord une série dans la page <Link href="/admin/series" className="underline text-blue-200">gestion des séries</Link>, puis cliquez sur "Gérer les saisons" de la série concernée.
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700 bg-gray-900 rounded-lg">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-400">Série</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-400">N° Saison</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-400">Titre</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {seasons.map((saison) => (
                  <tr key={saison.id} className="hover:bg-gray-800 transition">
                    <td className="px-4 py-2">{saison.series?.title || <span className="text-gray-500">-</span>}</td>
                    <td className="px-4 py-2">{saison.number}</td>
                    <td className="px-4 py-2">{saison.title || <span className="text-gray-500">-</span>}</td>
                    <td className="px-4 py-2">
                      <Link href={`/admin/series/${saison.series_id}/seasons/${saison.id}/edit`}>
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4 mr-1" /> Modifier
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
                {seasons.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center text-gray-500 py-8">
                      Aucune saison trouvée.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}