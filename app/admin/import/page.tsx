"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";

export default function ImportFilmsAdminPage() {
  const [imported, setImported] = useState([]);
  const [validated, setValidated] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any[]>([]);
  const [step, setStep] = useState(1);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const json = JSON.parse(evt.target?.result as string);
        setImported(json);
        setStep(2);
      } catch {
        alert("Fichier JSON invalide !");
      }
    };
    reader.readAsText(file);
  }

  async function handleImport() {
    setLoading(true);
    setResult([]);
    for (const film of imported) {
      if (!validated[film.video_url]) continue;
      const resp = await fetch("/api/admin/add-film", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(film),
      });
      const data = await resp.json();
      setResult((prev) => [...prev, { film, status: resp.status, message: data?.message }]);
    }
    setLoading(false);
    setStep(3);
  }

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h2 className="text-2xl font-bold mb-4">Import de films (JSON)</h2>
      {step === 1 && (
        <div>
          <input
            type="file"
            accept=".json"
            onChange={handleFile}
            className="mb-4"
          />
        </div>
      )}
      {step === 2 && (
        <div>
          <div className="mb-4">
            <b>{imported.length}</b> films détectés.
            <br />
            <span className="text-sm text-gray-500">
              Coche les films à importer, puis clique sur “Importer”.
            </span>
          </div>
          <form
            onSubmit={e => {
              e.preventDefault();
              handleImport();
            }}
          >
            <div className="max-h-96 overflow-y-auto border rounded p-2 mb-4 bg-gray-900">
              {imported.map((film: any, i: number) => (
                <div key={film.video_url} className="flex items-center gap-2 border-b py-2">
                  <input
                    type="checkbox"
                    checked={validated[film.video_url] ?? true}
                    onChange={e =>
                      setValidated((v: any) => ({
                        ...v,
                        [film.video_url]: e.target.checked,
                      }))
                    }
                  />
                  <span className="font-semibold">{film.title}</span>
                  <span className="text-xs text-gray-400">{film.source}</span>
                  <span className="text-xs text-gray-400 truncate">
                    {film.video_url}
                  </span>
                </div>
              ))}
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? "Import en cours..." : "Importer"}
            </Button>
          </form>
        </div>
      )}
      {step === 3 && (
        <div>
          <h3 className="font-bold mb-2">Résultat :</h3>
          <ul className="space-y-2">
            {result.map((r, i) => (
              <li key={i} className={r.status === 200 ? "text-green-600" : "text-red-500"}>
                [{r.status}] {r.film.title} — {r.message || "Ajouté !"}
              </li>
            ))}
          </ul>
          <Button className="mt-4" onClick={() => { setStep(1); setImported([]); setResult([]); }}>
            Recommencer un import
          </Button>
        </div>
      )}
    </div>
  );
}