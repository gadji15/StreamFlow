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
    const creditsRes = await fetch(
      `https://api.themoviedb.org/3/tv/${tmdbId}/credits?api_key=${TMDB_API_KEY}&language=fr-FR`
    );

    if (!creditsRes.ok) {
      return NextResponse.json(
        { error: "TMDB fetch error" },
        { status: creditsRes.status }
      );
    }

    const data = await creditsRes.json();

    // On ne retourne que le cast (10 premiers rôles principaux)
    return NextResponse.json({
      cast: (data.cast || []).slice(0, 10).map((actor: any) => ({
        id: actor.id,
        name: actor.name,
        character: actor.character,
        profile_path: actor.profile_path,
      })),
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Erreur lors de l'interrogation de l'API TMDB", details: String(err) },
      { status: 500 }
    );
  }
}