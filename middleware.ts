import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes qui nécessitent une authentification
const protectedApiRoutes = [
  '/api/user/',
  '/api/favorites/:path*',
  '/api/watch-history/:path*',
  '/api/admin/:path*',
  '/api/vip/:path*'
];

// Middleware de base (personnalise la logique selon tes besoins)
export function middleware(request: NextRequest) {
  // Exemple : tu pourrais ici vérifier le token/cookie d'auth pour protéger les routes
  // Ici, on laisse passer toutes les requêtes
  return NextResponse.next();
}

// Configuration du middleware : matcher sur les routes protégées
export const config = {
  matcher: protectedApiRoutes,
};