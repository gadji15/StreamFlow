'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Edit, Tv, ArrowLeft } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';

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
        <Button asChild>
          <Link href="/admin/series">
            <Plus className="h-4 w-4 mr-2" />
            Ajouter une saison
          </Link>
        </Button>
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