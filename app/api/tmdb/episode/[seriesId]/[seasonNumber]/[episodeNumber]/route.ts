import { NextRequest, NextResponse } from "next/server";

// Récupérer la clé API TMDB depuis les variables d'environnement
const TMDB_API_KEY = process.env.TMDB_API_KEY;

export async function GET(
  req: NextRequest,
  { params }: { params: { seriesId: string; seasonNumber: string; episodeNumber: string } }
) {
  const { seriesId, seasonNumber, episodeNumber } = params;

  if (!TMDB_API_KEY) {
    return NextResponse.json({ error: "TMDB_API_KEY manquante." }, { status: 500 });
  }

  if (!seriesId || !seasonNumber || !episodeNumber) {
    return NextResponse.json({ error: "Paramètres manquants." }, { status: 400 });
  }

  try {
    // 1. Récupérer les détails de l'épisode
    const episodeRes = await fetch(
      `https://api.themoviedb.org/3/tv/${seriesId}/season/${seasonNumber}/episode/${episodeNumber}?api_key=${TMDB_API_KEY}&language=fr-FR`
    );
    if (!episodeRes.ok) {
      return NextResponse.json({ error: "Épisode non trouvé sur TMDB." }, { status: episodeRes.status });
    }
    const episodeData = await episodeRes.json();

    // 2. Récupérer les vidéos de l'épisode (trailers...)
    const videosRes = await fetch(
      `https://api.themoviedb.org/3/tv/${seriesId}/season/${seasonNumber}/episode/${episodeNumber}/videos?api_key=${TMDB_API_KEY}&language=fr-FR`
    );
    let videosData = { results: [] };
    if (videosRes.ok) {
      videosData = await videosRes.json();
    }

    // Fusionner les résultats
    const result = {
      ...episodeData,
      videos: videosData,
    };

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Erreur TMDB ou connexion.", details: String(error) }, { status: 500 });
  }
}