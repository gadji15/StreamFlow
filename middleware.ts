import { NextRequest, NextResponse } from 'next/server';

// Listes des routes protégées
const adminRoutes = ['/admin', '/admin/films', '/admin/series', '/admin/users'];
const authRoutes = ['/mon-compte', '/favoris', '/historique', '/vip'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Vérifier si c'est une route admin
  if (adminRoutes.some(route => pathname.startsWith(route))) {
    // Exclure la page de connexion admin
    if (pathname.startsWith('/admin/auth')) {
      return NextResponse.next();
    }
    
    // Vérifier si l'utilisateur est un admin (via cookie)
    const isAdmin = request.cookies.get('isAdmin')?.value === 'true';
    
    if (!isAdmin) {
      // Rediriger vers la page de connexion admin
      const redirectUrl = new URL('/admin/auth/login', request.url);
      redirectUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(redirectUrl);
    }
  }
  
  // Vérifier si c'est une route nécessitant l'authentification
  if (authRoutes.some(route => pathname.startsWith(route))) {
    // Vérifier si l'utilisateur est connecté (via cookie)
    const isLoggedIn = request.cookies.get('isLoggedIn')?.value === 'true';
    
    if (!isLoggedIn) {
      // Rediriger vers la page de connexion
      const redirectUrl = new URL('/login', request.url);
      redirectUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(redirectUrl);
    }
  }
  
  // Vérifier si c'est une route VIP
  if (pathname.startsWith('/exclusif')) {
    // Vérifier si l'utilisateur est connecté et VIP
    const isLoggedIn = request.cookies.get('isLoggedIn')?.value === 'true';
    const isVIP = request.cookies.get('isVIP')?.value === 'true';
    
    if (!isLoggedIn) {
      // Rediriger vers la page de connexion
      const redirectUrl = new URL('/login', request.url);
      redirectUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(redirectUrl);
    } else if (!isVIP) {
      // Rediriger vers la page d'abonnement VIP
      return NextResponse.redirect(new URL('/vip', request.url));
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/mon-compte/:path*',
    '/favoris/:path*',
    '/historique/:path*',
    '/vip/:path*',
    '/exclusif/:path*',
  ],
};
