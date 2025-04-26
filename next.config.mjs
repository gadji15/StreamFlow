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
  
  // Internationalisation (si nécessaire)
  i18n: {
    locales: ['fr'],
    defaultLocale: 'fr',
  },
  
  // Support expérimental des fonctionnalités
  experimental: {
    // Activer/désactiver les fonctionnalités expérimentales selon vos besoins
    appDir: true,
    serverComponentsExternalPackages: [],
  },
  
  // Configuration du compilateur
  compiler: {
    // Supprimer les console.log en production
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // Gestion des erreurs 404 et 500
  onDemandEntries: {
    // période en ms pendant laquelle la page sera conservée en mémoire
    maxInactiveAge: 25 * 1000,
    // nombre de pages à conserver en mémoire
    pagesBufferLength: 2,
  },
  
  // Configuration de l'optimisation
  optimizeFonts: true,
  swcMinify: true,
};

// Export de la configuration avec PWA
export default withPWA(pwaConfig)(nextConfig);