import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// Charge le secret JWT Supabase (attention à bien le renseigner)
const SUPABASE_JWT_SECRET = process.env.NEXT_PUBLIC_SUPABASE_JWT_SECRET;
if (!SUPABASE_JWT_SECRET) throw new Error('JWT secret manquant pour la validation des tokens.');

// Liste des routes à protéger (ajoute/retire selon ton besoin)
const protectedApiRoutes = [
  '/api/admin',
  '/api/user',
  '/api/favorites',
  '/api/watch-history',
  '/api/vip'
];

function isRouteProtected(pathname: string) {
  return protectedApiRoutes.some(route => pathname.startsWith(route));
}

function extractToken(request: NextRequest): string | undefined {
  const authHeader = request.headers.get('authorization');
  if (authHeader?.toLowerCase().startsWith('bearer ')) {
    return authHeader.slice(7).trim();
  }
  const cookieToken = request.cookies.get('sb-access-token')?.value;
  return cookieToken;
}

function getUserRole(payload: any): string | undefined {
  // Hasura convention
  if (payload['https://hasura.io/jwt/claims']?.['x-hasura-role']) {
    return payload['https://hasura.io/jwt/claims']['x-hasura-role'];
  }
  // Supabase user_metadata or direct
  if (payload.role) return payload.role;
  if (payload.user_metadata?.role) return payload.user_metadata.role;
  return undefined;
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // --- REDIRECT /watch/:id => /films/:id/watch ---
  const watchMatch = pathname.match(/^\/watch\/([^\/]+)$/);
  if (watchMatch) {
    const id = watchMatch[1];
    return NextResponse.redirect(new URL(`/films/${id}/watch`, request.url), 308);
  }

  if (!isRouteProtected(pathname)) return NextResponse.next();

  const token = extractToken(request);

  if (!token) {
    return new NextResponse(JSON.stringify({ message: "Non authentifié. Token requis." }), { status: 401, headers: { 'Content-Type': 'application/json' } });
  }

  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(SUPABASE_JWT_SECRET));

    // Vérification expiration
    if (payload.exp && Date.now() / 1000 > payload.exp) {
      return new NextResponse(JSON.stringify({ message: "Session expirée." }), { status: 401 });
    }

    const role = getUserRole(payload);

    // Rôles autorisés (tu peux en ajouter)
    const allowedRoles = ['admin', 'super_admin'];

    if (role && allowedRoles.includes(role)) {
      return NextResponse.next();
    }

    return new NextResponse(JSON.stringify({ message: "Accès interdit : rôle admin requis." }), { status: 403, headers: { 'Content-Type': 'application/json' } });

  } catch (err) {
    // Log optionnel pour debug en dev
    // console.error("Erreur middleware JWT:", err);
    return new NextResponse(JSON.stringify({ message: "Token invalide ou mal formé." }), { status: 401, headers: { 'Content-Type': 'application/json' } });
  }
}

export const config = {
  matcher: [
    '/api/admin/:path*',
    '/api/user/:path*',
    '/api/favorites/:path*',
    '/api/watch-history/:path*',
    '/api/vip/:path*'
  ],
};