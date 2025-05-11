'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Badge } from '@/components/ui/badge'; // Assure-toi d'avoir ce composant ou adapte
import LoadingScreen from '@/components/loading-screen';

type ErrorLog = {
  id: string;
  created_at: string;
  user_id: string | null;
  location: string | null;
  error_message: string;
  error_stack: string | null;
  error_type: string | null;
  severity: string | null;
  http_status: number | null;
  url: string | null;
  user_agent: string | null;
  environment: string | null;
  metadata: any;
};

function apiStatusBadge(ok: boolean, label: string) {
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '0.3em 0.8em',
        borderRadius: 7,
        color: 'white',
        background: ok ? '#22c55e' : '#ef4444',
        marginRight: 10,
        fontWeight: 500,
        fontSize: 13,
      }}
      title={ok ? 'Connecté' : 'Erreur'}
    >
      {label} : {ok ? 'OK' : 'Erreur'}
    </span>
  );
}

export default function AdminDiagnosticPage() {
  const [logs, setLogs] = useState<ErrorLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string|undefined>();
  const [search, setSearch] = useState('');
  const [supabaseStatus, setSupabaseStatus] = useState<boolean | null>(null);

  // Récupération des logs d'erreur
  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      setError(undefined);
      try {
        const { data, error } = await supabase
          .from('error_logs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(100);
        if (error) throw error;
        setLogs(data || []);
      } catch (err: any) {
        setError(err.message || 'Erreur lors du chargement des logs');
      }
      setLoading(false);
    };
    fetchLogs();
  }, []);

  // Vérification connectivité Supabase
  useEffect(() => {
    const check = async () => {
      try {
        const { error } = await supabase.from('error_logs').select('id').limit(1);
        setSupabaseStatus(!error);
      } catch {
        setSupabaseStatus(false);
      }
    };
    check();
  }, []);

  // Filtrage dynamique
  const filteredLogs = logs.filter(
    log =>
      log.error_message.toLowerCase().includes(search.toLowerCase()) ||
      (log.location ?? '').toLowerCase().includes(search.toLowerCase()) ||
      (log.user_id ?? '').toLowerCase().includes(search.toLowerCase()) ||
      (log.url ?? '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-3">Diagnostic & Logs</h1>
      <div className="mb-4 flex gap-4 items-center flex-wrap">
        <span>Statut API :</span>
        {apiStatusBadge(supabaseStatus === true, 'Supabase')}
        {/* Ajoute ici d’autres badges pour d’autres APIs si besoin */}
      </div>
      <div className="mb-6">
        <input
          type="text"
          placeholder="Recherche (message, user, url, ...)"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border rounded px-3 py-2 w-full max-w-md"
        />
      </div>
      <div className="overflow-x-auto bg-white rounded shadow-lg">
        {loading ? (
          <LoadingScreen />
        ) : error ? (
          <div className="text-red-600 p-4">{error}</div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-4 text-gray-500">Aucune erreur trouvée.</div>
        ) : (
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-2 px-3 text-left">Date</th>
                <th className="py-2 px-3 text-left">Message</th>
                <th className="py-2 px-3 text-left">Type</th>
                <th className="py-2 px-3 text-left">User</th>
                <th className="py-2 px-3 text-left">Page / URL</th>
                <th className="py-2 px-3 text-left">Localisation</th>
                <th className="py-2 px-3 text-left">Environnement</th>
                <th className="py-2 px-3 text-left">Détails</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map(log => (
                <tr key={log.id} className="border-b">
                  <td className="py-2 px-3 whitespace-nowrap">{new Date(log.created_at).toLocaleString()}</td>
                  <td className="py-2 px-3 max-w-xs truncate" title={log.error_message}>{log.error_message}</td>
                  <td className="py-2 px-3">{log.error_type}</td>
                  <td className="py-2 px-3">{log.user_id ? log.user_id.slice(0, 8) : '-'}</td>
                  <td className="py-2 px-3 max-w-xs truncate" title={log.url || ''}>{log.url || '-'}</td>
                  <td className="py-2 px-3 max-w-xs truncate" title={log.location || ''}>{log.location ? log.location.slice(0, 40) : '-'}</td>
                  <td className="py-2 px-3">{log.environment || '-'}</td>
                  <td className="py-2 px-3">
                    <details>
                      <summary>Détails</summary>
                      <pre className="whitespace-pre-wrap break-all text-xs">
                        {JSON.stringify(log, null, 2)}
                      </pre>
                    </details>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <div className="mt-10 text-xs text-gray-500">
        Version de l’app : <b>{process.env.NEXT_PUBLIC_APP_VERSION || 'dev'}</b> |
        Environnement : <b>{process.env.NODE_ENV}</b>
      </div>
    </div>
  );
}