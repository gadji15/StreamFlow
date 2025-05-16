import { NextRequest, NextResponse } from "next/server";

const TMDB_API_KEY = process.env.TMDB_API_KEY;

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const tmdbId = params.id;

  if (!tmdbId || isNaN(Number(tmdbId))) {
    return NextResponse.json(
      { error: "Invalid or missing TMDB series id" },
      { status: 400 }
    );
  }

  if (!TMDB_API_KEY) {
    return NextResponse.json(
      { error: "TMDB API key not configured on server" },
      { status: 500 }
    );
  }

  try {
    const tmdbRes = await fetch(
      `https://api.themoviedb.org/3/tv/${tmdbId}?api_key=${TMDB_API_KEY}&language=fr-FR`
    );

    if (!tmdbRes.ok) {
      return NextResponse.json(
        { error: `TMDB fetch error: ${tmdbRes.status} ${tmdbRes.statusText}` },
        { status: tmdbRes.status }
      );
    }

    const data = await tmdbRes.json();

    // Optionally, check if we have the seasons array and massage data if needed
    if (!data || !data.id) {
      return NextResponse.json(
        { error: "Série introuvable sur TMDB" },
        { status: 404 }
      );
    }

    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json(
      { error: "Erreur lors de l'interrogation de l'API TMDB", details: String(err) },
      { status: 500 }
    );
  }
}