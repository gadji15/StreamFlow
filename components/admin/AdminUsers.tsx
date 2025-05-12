import React, { useEffect, useState } from "react";
import LoadingSpinner from "../ui/LoadingSpinner";
import ErrorBanner from "../ui/ErrorBanner";

type User = {
  id: string;
  email: string;
  full_name?: string;
  roles?: string[];
};

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  // Pagination config
  const PAGE_SIZE = 20;

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`/api/admin/users`)
      .then(async (res) => {
        if (!res.ok) throw new Error("Erreur lors du chargement des utilisateurs");
        return res.json();
      })
      .then((data) => setUsers(data))
      .catch((err) => setError(err.message || "Erreur inconnue"))
      .finally(() => setLoading(false));
  }, []);

  // Filter users by query (client side demo, can be moved to server side for large datasets)
  const filtered = users.filter(
    (u) =>
      !query ||
      u.email?.toLowerCase().includes(query.toLowerCase()) ||
      u.full_name?.toLowerCase().includes(query.toLowerCase())
  );
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const pageCount = Math.ceil(filtered.length / PAGE_SIZE);

  return (
    <div className="p-4 bg-bg text-text min-h-screen">
      <h2 className="text-lg font-bold mb-4 text-primary">Utilisateurs</h2>
      <div className="flex flex-col md:flex-row md:items-center mb-4 gap-2">
        <input
          type="text"
          placeholder="Recherche email ou nom..."
          className="border border-border rounded px-3 py-2 w-full md:w-64 bg-bg-alt text-text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setPage(1); }}
        />
        <span className="text-sm text-text-muted ml-2">
          {filtered.length} résultat{filtered.length > 1 ? "s" : ""}
        </span>
      </div>

      {loading && <LoadingSpinner className="my-6" />}
      {error && <ErrorBanner message={error} onRetry={() => window.location.reload()} />}

      {!loading && !error && (
        <div className="overflow-x-auto rounded border border-border">
          <table className="min-w-full bg-bg-alt text-text">
            <thead>
              <tr className="bg-bg-alt text-text border-b border-border">
                <th className="px-4 py-2">Email</th>
                <th className="px-4 py-2">Nom</th>
                <th className="px-4 py-2">Rôles</th>
                <th className="px-4 py-2 text-right">ID</th>
              </tr>
            </thead>
            <tbody>
              {paged.map((u) => (
                <tr key={u.id} className="border-b border-border last:border-b-0 hover:bg-primary/10">
                  <td className="px-4 py-2">{u.email}</td>
                  <td className="px-4 py-2">{u.full_name || <span className="text-text-muted">—</span>}</td>
                  <td className="px-4 py-2">
                    {Array.isArray(u.roles) ? u.roles.join(", ") : u.roles || <span className="text-text-muted">—</span>}
                  </td>
                  <td className="px-4 py-2 text-xs text-right text-text-muted">{u.id}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {!loading && !error && pageCount > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          <button
            className="px-3 py-1 rounded bg-bg-alt border border-border text-text-muted hover:bg-primary/10 transition disabled:opacity-50"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Précédent
          </button>
          <span className="px-2 py-1 text-sm">
            Page {page} / {pageCount}
          </span>
          <button
            className="px-3 py-1 rounded bg-bg-alt border border-border text-text-muted hover:bg-primary/10 transition disabled:opacity-50"
            onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
            disabled={page === pageCount}
          >
            Suivant
          </button>
        </div>
      )}
    </div>
  );
}