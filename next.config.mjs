// Configuration Next.js pour StreamFlow avec support PWA
import withPWA from 'next-pwa';

// Configuration PWA
const pwaConfig = {
  dest: 'public',                                 // Destination des fichiers générés
  disable: process.env.NODE_ENV === 'development', // Désactivé en développement
  register: true,                                 // Enregistrement automatique du service worker
  skipWaiting: true,                              // Prise en charge immédiate des mises à jour
  runtimeCaching: [
    {
      // Mise en cache des pages
      urlPattern: /^https?.*/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'offlineCache',
        expiration: {
          maxEntries: 200,
          maxAgeSeconds: 24 * 60 * 60 // 24 heures
        }
      }
    },
    {
      // Mise en cache des images
      urlPattern: /\.(?:jpg|jpeg|gif|png|svg|webp)$/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'staticImageAssets',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 30 * 24 * 60 * 60 // 30 jours
        }
      }
    },
    {
      // Mise en cache des polices
      urlPattern: /\.(?:woff|woff2|ttf|otf|eot)$/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'fontAssets',
        expiration: {
          maxEntries: 20,
          maxAgeSeconds: 365 * 24 * 60 * 60 // 1 an
        }
      }
    }
  ]
};

// Configuration Next.js
const nextConfig = {
  reactStrictMode: true,
  
  // Configuration d'images
  images: {
    domains: [
      'res.cloudinary.com',
      'firebasestorage.googleapis.com',
      'example.com' // Remplacez par vos domaines d'images
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  
  // Compression
  compress: true,
  
  // Configuration d'en-têtes HTTP
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },
  
  // Redirection pour les chemins non existants
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
    ];
  },
  
  // Configuration webpack personnalisée (si nécessaire)
  webpack: (config, { dev, isServer }) => {
    // Vos personnalisations webpack ici si nécessaire
    
    return config;
  },
  
  // Environnement
  env: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  },
  
  // Configuration du compilateur
  compiler: {
    // Supprimer les console.log en production
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // Configuration avancée mise à jour pour Next.js 15.x
  experimental: {
    // Configuration mise à jour pour Next.js 15.x
    serverExternalPackages: [], // Nouveau format remplaçant serverComponentsExternalPackages
  },
  
  // Configuration de l'optimisation
  // Note: optimizeFonts et swcMinify sont maintenant activés par défaut
  // dans Next.js 15.x et n'ont plus besoin d'être spécifiés
};

// Export de la configuration avec PWA
export default withPWA(pwaConfig)(nextConfig);