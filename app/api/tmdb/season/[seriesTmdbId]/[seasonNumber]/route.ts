import { NextRequest } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { seriesTmdbId: string; seasonNumber: string } }
) {
  const { seriesTmdbId, seasonNumber } = params;
  const apiKey = process.env.TMDB_API_KEY || process.env.NEXT_PUBLIC_TMDB_API_KEY;

  if (!apiKey) {
    return new Response(JSON.stringify({ error: "TMDB API Key missing" }), { status: 500 });
  }

  try {
    const url = `https://api.themoviedb.org/3/tv/${seriesTmdbId}/season/${seasonNumber}?api_key=${apiKey}&language=fr-FR`;
    const resp = await fetch(url, { headers: { accept: "application/json" } });

    if (!resp.ok) {
      return new Response(JSON.stringify({ error: "TMDB fetch failed", status: resp.status }), { status: resp.status });
    }

    const data = await resp.json();
    return new Response(JSON.stringify(data), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: "Internal error", details: e?.message }), { status: 500 });
  }
}