import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get('query');
  if (!query) {
    return NextResponse.json({ error: 'Missing query' }, { status: 400 });
  }

  const tmdbApiKey = process.env.TMDB_API_KEY; // Stocke ta clé ici (env local + vercel)
  if (!tmdbApiKey) {
    return NextResponse.json({ error: 'TMDB API key not set' }, { status: 500 });
  }

  // Recherche film TMDB (langue française en priorité)
  const url = `https://api.themoviedb.org/3/search/movie?api_key=${tmdbApiKey}&query=${encodeURIComponent(query)}&language=fr-FR&include_adult=false`;

  const res = await fetch(url);
  if (!res.ok) {
    return NextResponse.json({ error: 'TMDB fetch error' }, { status: 500 });
  }

  const data = await res.json();
  // On retourne les principaux champs utiles (id, titre, année, poster, overview, genres)
  return NextResponse.json({
    results: (data.results || []).map((movie: any) => ({
      id: movie.id,
      title: movie.title,
      original_title: movie.original_title,
      overview: movie.overview,
      release_date: movie.release_date,
      poster_path: movie.poster_path,
      backdrop_path: movie.backdrop_path,
      genre_ids: movie.genre_ids,
      vote_average: movie.vote_average,
      vote_count: movie.vote_count,
      popularity: movie.popularity,
    })),
  });
}