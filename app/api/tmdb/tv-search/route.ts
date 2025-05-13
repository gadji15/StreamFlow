import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const apiKey = process.env.TMDB_API_KEY || process.env.NEXT_PUBLIC_TMDB_API_KEY;
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("query") || "";
  const language = searchParams.get("language") || "fr-FR";

  if (!apiKey) {
    return new Response(JSON.stringify({ error: "TMDB API Key missing" }), { status: 500 });
  }
  if (!query) {
    return new Response(JSON.stringify({ results: [] }), { status: 200 });
  }

  try {
    const url = `https://api.themoviedb.org/3/search/tv?api_key=${apiKey}&query=${encodeURIComponent(
      query
    )}&language=${language}`;
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
