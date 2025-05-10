import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes qui nécessitent une authentification
const protectedApiRoutes = [
  '/api/user/',
  
    '/api/favorites/:path*',
    '/api/watch-history/:path*',
    '/api/admin/:path*',
    '/api/vip/:path*'
  ],
};