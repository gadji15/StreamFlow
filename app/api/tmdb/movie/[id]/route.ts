import { NextRequest, NextResponse } from "next/server";

// Remplacer par votre clé TMDB dans les variables d’environnement ou le .env
const TMDB_API_KEY = process.env.TMDB_API_KEY;

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const movieId = params.id;
  const searchParams = req.nextUrl.searchParams;
  // Pour supporter ?append_to_response=credits,videos
  let append = searchParams.get("append_to_response");
  if (!append) append = "credits,videos";

  const url = `https://api.themoviedb.org/3/movie/${movieId}?api_key=${TMDB_API_KEY}&language=fr-FR&append_to_response=${encodeURIComponent(
    append
  )}`;
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) {
      return NextResponse.json(
        { error: "TMDB error", status: res.status },
        { status: res.status }
      );
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json(
      { error: "TMDB fetch failed", details: String(e) },
      { status: 500 }
    );
  }
}