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

// Routes qui nécessitent une authentification VIP
const vipApiRoutes = [
  '/api/vip/'
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Vérifier si c'est une route API protégée
  const isProtectedApi = protectedApiRoutes.some(route => pathname.startsWith(route));
  const isAdminApi = adminApiRoutes.some(route => pathname.startsWith(route));
  const isVipApi = vipApiRoutes.some(route => pathname.startsWith(route));
  
  // Pour toutes les routes protégées
  if (isProtectedApi || isAdminApi || isVipApi) {
    // Vérifier l'origine pour CORS
    const origin = request.headers.get('origin');
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'];
    
    if (origin && !allowedOrigins.includes(origin)) {
      return new NextResponse(
        JSON.stringify({ error: 'Origine non autorisée' }),
        { 
          status: 403,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }
    
    // Récupérer le token d'authentification
    const token = await getToken({ 
      req: request, 
      secret: process.env.NEXTAUTH_SECRET,
      secureCookie: process.env.NODE_ENV === 'production'
    });
    
    // Si pas de token ou token expiré
    if (!token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }
    
    // Vérifier les droits d'administration si nécessaire
    if (isAdminApi && token.role !== 'admin' && token.role !== 'super_admin') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }
    
    // Vérifier les droits VIP si nécessaire
    if (isVipApi && !token.isVIP) {
      return NextResponse.json({ error: 'Abonnement VIP requis' }, { status: 403 });
    }
    
    // Ajouter des en-têtes de sécurité
    const response = NextResponse.next();
    
    // Ajouter des en-têtes de sécurité supplémentaires
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    
    return response;
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
    '/api/admin/:path*',
    '/api/vip/:path*'
  ],
};