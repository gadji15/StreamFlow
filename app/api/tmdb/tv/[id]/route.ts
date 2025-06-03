import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  if (!id || isNaN(Number(id))) {
    return NextResponse.json(
      { error: "Missing or invalid TMDB ID" },
      { status: 400 }
    );
  }

  const tmdbApiKey = process.env.TMDB_API_KEY;
  if (!tmdbApiKey) {
    return NextResponse.json(
      { error: "TMDB API key not set" },
      { status: 500 }
    );
  }

  // Fetch TV show details from TMDB
  const url = `https://api.themoviedb.org/3/tv/${id}?api_key=${tmdbApiKey}&language=fr-FR`;
  const res = await fetch(url);
  if (!res.ok) {
    return NextResponse.json(
      { error: "TMDB fetch error", status: res.status },
      { status: res.status }
    );
  }

  const data = await res.json();

  // Retourner seulement les champs principaux utiles pour le front
  return NextResponse.json({
    id: data.id,
    name: data.name,
    original_name: data.original_name,
    overview: data.overview,
    first_air_date: data.first_air_date,
    last_air_date: data.last_air_date,
    poster_path: data.poster_path,
    backdrop_path: data.backdrop_path,
    genres: data.genres,
    vote_average: data.vote_average,
    vote_count: data.vote_count,
    popularity: data.popularity,
    created_by: data.created_by,
    status: data.status,
    number_of_seasons: data.number_of_seasons,
    number_of_episodes: data.number_of_episodes,
    homepage: data.homepage,
    in_production: data.in_production,
    tagline: data.tagline,
    original_language: data.original_language,
  });
}