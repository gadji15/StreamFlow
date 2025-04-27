import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Routes qui nécessitent une authentification
const protectedApiRoutes = [
  '/api/user/',
  '/api/cloudinary/',
  '/api/favorites/',
  '/api/watch-history/'
];

// Routes admin qui nécessitent des droits d'administration
const adminApiRoutes = [
  '/api/admin/'
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Vérifier si c'est une route API protégée
  const isProtectedApi = protectedApiRoutes.some(route => pathname.startsWith(route));
  const isAdminApi = adminApiRoutes.some(route => pathname.startsWith(route));
  
  if (isProtectedApi || isAdminApi) {
    // Récupérer le token d'authentification
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    
    // Si pas de token ou token expiré
    if (!token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }
    
    // Vérifier les droits d'administration si nécessaire
    if (isAdminApi && token.role !== 'admin' && token.role !== 'super_admin') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }
  }
  
  return NextResponse.next();
}

// Configuration du middleware
export const config = {
  matcher: [
    '/api/user/:path*',
    '/api/cloudinary/:path*',
    '/api/favorites/:path*',
    '/api/watch-history/:path*',
    '/api/admin/:path*'
  ],
};