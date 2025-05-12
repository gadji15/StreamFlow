import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get('query');
  if (!query) {
    return NextResponse.json({ error: 'Missing query' }, { status: 400 });
  }

  const tmdbApiKey = process.env.TMDB_API_KEY;
  if (!tmdbApiKey) {
    return NextResponse.json({ error: 'TMDB API key not set' }, { status: 500 });
  }

  // Recherche séries TMDB (langue française en priorité)
  const url = `https://api.themoviedb.org/3/search/tv?api_key=${tmdbApiKey}&query=${encodeURIComponent(query)}&language=fr-FR&include_adult=false`;

  const res = await fetch(url);
  if (!res.ok) {
    return NextResponse.json({ error: 'TMDB fetch error' }, { status: 500 });
  }

  const data = await res.json();
  // On retourne les principaux champs utiles (id, titre, année, poster, overview, genres)
  return NextResponse.json({
    results: (data.results || []).map((serie: any) => ({
      id: serie.id,
      name: serie.name,
      original_name: serie.original_name,
      overview: serie.overview,
      first_air_date: serie.first_air_date,
      last_air_date: serie.last_air_date,
      poster_path: serie.poster_path,
      backdrop_path: serie.backdrop_path,
      genre_ids: serie.genre_ids,
      vote_average: serie.vote_average,
      vote_count: serie.vote_count,
      popularity: serie.popularity,
    })),
  });
}